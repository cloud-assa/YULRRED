import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SpacetimeService } from '../../spacetime/spacetime.service';

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
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private spacetime: SpacetimeService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.spacetime.sqlOne<DbUser>(
      `SELECT * FROM user WHERE id = '${payload.sub.replace(/'/g, "''")}'`,
    );
    if (!user) throw new UnauthorizedException();
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}
