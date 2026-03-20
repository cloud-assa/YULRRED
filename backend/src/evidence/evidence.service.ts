import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SpacetimeService } from '../spacetime/spacetime.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cuid: () => string = require('cuid');

interface DbEvidence {
  id: string;
  deal_id: string;
  uploaded_by_id: string;
  url: string;
  description: string;
  created_at: number;
}

interface DbDeal {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
}

@Injectable()
export class EvidenceService {
  constructor(private spacetime: SpacetimeService) {}

  private toEvidence(e: DbEvidence) {
    return {
      id: e.id,
      dealId: e.deal_id,
      uploadedById: e.uploaded_by_id,
      url: e.url,
      description: e.description,
      createdAt: new Date(e.created_at),
    };
  }

  // Sube evidencia para un deal; participantes del deal o admins pueden subir
  async create(dealId: string, uploadedById: string, dto: CreateEvidenceDto, userRole: string) {
    const deal = await this.spacetime.sqlOne<DbDeal>(
      `SELECT * FROM deal WHERE id = '${dealId.replace(/'/g, "''")}'`,
    );
    if (!deal) throw new NotFoundException('Deal not found');

    const isParticipant = deal.buyer_id === uploadedById || deal.seller_id === uploadedById;
    if (!isParticipant && userRole !== 'ADMIN') {
      throw new ForbiddenException('Solo los participantes del trato o admins pueden subir evidencias');
    }

    const id = cuid();
    await this.spacetime.call('create_evidence', [id, dealId, uploadedById, dto.url, dto.description]);
    return { id, dealId, uploadedById, url: dto.url, description: dto.description, createdAt: new Date() };
  }

  // Lista todas las evidencias de un deal ordenadas por fecha descendente
  async findForDeal(dealId: string) {
    try {
      const rows = await this.spacetime.sql<DbEvidence>(
        `SELECT * FROM evidence WHERE deal_id = '${dealId.replace(/'/g, "''")}'`,
      );
      return rows.sort((a, b) => b.created_at - a.created_at).map(this.toEvidence);
    } catch {
      return [];
    }
  }
}
