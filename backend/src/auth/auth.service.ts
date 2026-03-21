import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cuid: () => string = require('cuid');

interface DbUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  created_at: string; // pg returns BIGINT as string
  updated_at: string;
}

@Injectable()
export class AuthService {
  constructor(
    private db: SupabaseService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.db.queryOne<DbUser>(
      `SELECT * FROM "user" WHERE email = $1`,
      [dto.email],
    );
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const id = cuid();
    const now = Date.now();

    await this.db.execute(
      `INSERT INTO "user" (id, email, name, password, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, dto.email, dto.name, hashed, 'USER', now, now],
    );

    const safeUser = { id, email: dto.email, name: dto.name, role: 'USER', createdAt: new Date() };
    const token = this.sign(id, dto.email, 'USER');
    return { user: safeUser, token };
  }

  async login(dto: LoginDto) {
    const user = await this.db.queryOne<DbUser>(
      `SELECT * FROM "user" WHERE email = $1`,
      [dto.email],
    );
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // pg returns password as plain string — no BSATN unwrapping needed
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const safeUser = this.toSafeUser(user);
    const token = this.sign(user.id, user.email, user.role);
    return { user: safeUser, token };
  }

  async me(userId: string) {
    const user = await this.db.queryOne<DbUser>(
      `SELECT * FROM "user" WHERE id = $1`,
      [userId],
    );
    if (!user) return null;
    return this.toSafeUser(user);
  }

  private toSafeUser(user: DbUser) {
    // pg returns BIGINT as string — convert to number for Date
    const ms = Number(user.created_at);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: ms ? new Date(ms) : new Date(0),
    };
  }

  private sign(userId: string, email: string, role = 'USER') {
    return this.jwtService.sign({ sub: userId, email, role });
  }
}
