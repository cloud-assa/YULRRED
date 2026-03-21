import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';

interface DbUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private db: SupabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; role?: string; name?: string }) {
    try {
      const user = await this.db.queryOne<DbUser>(
        `SELECT id, email, name, role FROM "user" WHERE id = $1`,
        [payload.sub],
      );
      if (!user) throw new UnauthorizedException();
      return { id: user.id, email: user.email, name: user.name, role: user.role };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      // DB unavailable — fall back to JWT payload claims (still cryptographically verified)
      if (!payload.sub) throw new UnauthorizedException();
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name ?? '',
        role: payload.role ?? 'USER',
      };
    }
  }
}
