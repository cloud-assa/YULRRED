import {
  Controller, Post, Get, Param, Headers,
  Body, RawBodyRequest, Req, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint (no auth)' })
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(req.rawBody, signature);
  }

  @Post('deals/:dealId/intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment intent for a deal' })
  createIntent(
    @Param('dealId') dealId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.createPaymentIntent(dealId, userId);
  }

  @Post('deals/:dealId/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually confirm funding (dev/test)' })
  confirmFunding(
    @Param('dealId') dealId: string,
    @CurrentUser('id') userId: string,
  ): Promise<any> {
    return this.paymentsService.manualConfirmFunding(dealId, userId);
  }

  @Post('deals/:dealId/release')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buyer releases funds to seller after delivery confirmation' })
  releaseFunds(
    @Param('dealId') dealId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.releaseFunds(dealId, userId);
  }

  @Get('deals/:dealId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment status for a deal' })
  getStatus(
    @Param('dealId') dealId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentsService.getPaymentStatus(dealId, userId);
  }
}
