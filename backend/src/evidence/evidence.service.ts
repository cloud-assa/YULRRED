import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cuid: () => string = require('cuid');

interface DbEvidence {
  id: string;
  deal_id: string;
  uploaded_by_id: string;
  url: string;
  description: string;
  created_at: string;
}

interface DbDeal {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
}

@Injectable()
export class EvidenceService {
  constructor(private db: SupabaseService) {}

  private toEvidence(e: DbEvidence) {
    return {
      id: e.id,
      dealId: e.deal_id,
      uploadedById: e.uploaded_by_id,
      url: e.url,
      description: e.description,
      createdAt: new Date(Number(e.created_at)),
    };
  }

  async create(dealId: string, uploadedById: string, dto: CreateEvidenceDto, userRole: string) {
    const deal = await this.db.queryOne<DbDeal>(
      `SELECT id, buyer_id, seller_id, status FROM deal WHERE id = $1`,
      [dealId],
    );
    if (!deal) throw new NotFoundException('Deal not found');

    const isParticipant = deal.buyer_id === uploadedById || deal.seller_id === uploadedById;
    if (!isParticipant && userRole !== 'ADMIN') {
      throw new ForbiddenException('Solo los participantes del trato o admins pueden subir evidencias');
    }

    const id = cuid();
    const now = Date.now();
    await this.db.execute(
      `INSERT INTO evidence (id, deal_id, uploaded_by_id, url, description, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, dealId, uploadedById, dto.url, dto.description, now],
    );
    return { id, dealId, uploadedById, url: dto.url, description: dto.description, createdAt: new Date() };
  }

  // Use ORDER BY in SQL instead of sorting in JS
  async findForDeal(dealId: string) {
    try {
      const rows = await this.db.query<DbEvidence>(
        `SELECT * FROM evidence WHERE deal_id = $1 ORDER BY created_at DESC`,
        [dealId],
      );
      return rows.map(this.toEvidence);
    } catch {
      return [];
    }
  }
}
