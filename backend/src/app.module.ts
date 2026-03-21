import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DealsModule } from './deals/deals.module';
import { PaymentsModule } from './payments/payments.module';
import { DisputesModule } from './disputes/disputes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EmailModule } from './email/email.module';
import { EvidenceModule } from './evidence/evidence.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    UsersModule,
    DealsModule,
    PaymentsModule,
    DisputesModule,
    NotificationsModule,
    EmailModule,
    EvidenceModule,
  ],
})
export class AppModule {}
