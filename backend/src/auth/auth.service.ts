import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SpacetimeService } from '../spacetime/spacetime.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cuid: () => string = require('cuid');

const unwrap = (v: any) =>
  v && typeof v === 'object' && 'some' in v
    ? v.some
    : v === null || (v && typeof v === 'object' && 'none' in v)
    ? null
    : v;

interface DbUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  created_at: number;
  updated_at: number;
}

@Injectable()
export class AuthService {
  constructor(
    private spacetime: SpacetimeService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.spacetime.sqlOne<DbUser>(
      `SELECT * FROM user WHERE email = '${dto.email.replace(/'/g, "''")}'`,
    );
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const id = cuid();

    await this.spacetime.call('create_user', [id, dto.email, dto.name, hashed, 'USER']);

    // Build response directly — avoid read-after-write race with SpacetimeDB
    const safeUser = { id, email: dto.email, name: dto.name, role: 'USER', createdAt: new Date() };
    const token = this.sign(id, dto.email, 'USER');
    return { user: safeUser, token };
  }

  async login(dto: LoginDto) {
    const user = await this.spacetime.sqlOne<DbUser>(
      `SELECT * FROM user WHERE email = '${dto.email.replace(/'/g, "''")}'`,
    );
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, unwrap(user.password));
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const safeUser = this.toSafeUser(user);
    const token = this.sign(user.id, user.email, user.role);
    return { user: safeUser, token };
  }

  async me(userId: string) {
    const user = await this.spacetime.sqlOne<DbUser>(
      `SELECT * FROM user WHERE id = '${userId}'`,
    );
    if (!user) return null;
    return this.toSafeUser(user);
  }

  private toSafeUser(user: DbUser) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: new Date(user.created_at),
    };
  }

  private sign(userId: string, email: string, role = 'USER') {
    return this.jwtService.sign({ sub: userId, email, role });
  }
}
