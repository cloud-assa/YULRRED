import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SpacetimeModule } from './spacetime/spacetime.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DealsModule } from './deals/deals.module';
import { PaymentsModule } from './payments/payments.module';
import { DisputesModule } from './disputes/disputes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SpacetimeModule,
    AuthModule,
    UsersModule,
    DealsModule,
    PaymentsModule,
    DisputesModule,
    NotificationsModule,
    EmailModule,
  ],
})
export class AppModule {}
