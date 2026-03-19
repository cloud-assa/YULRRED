import { Module } from '@nestjs/common';
import { DisputesController } from './disputes.controller';
import { DisputesService } from './disputes.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [NotificationsModule, EmailModule, PaymentsModule],
  controllers: [DisputesController],
  providers: [DisputesService],
})
export class DisputesModule {}
