import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private from: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private config: ConfigService) {
    this.from = config.get('SMTP_FROM', 'noreply@securedeal.com');
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: parseInt(config.get('SMTP_PORT', '587')),
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }

  private baseTemplate(title: string, content: string) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header .logo { font-size: 32px; margin-bottom: 8px; }
    .body { padding: 32px; color: #333; line-height: 1.6; }
    .body h2 { color: #1a1a2e; margin-top: 0; }
    .deal-box { background: #f8f9fa; border-left: 4px solid #6c63ff; padding: 16px; border-radius: 4px; margin: 20px 0; }
    .deal-box .amount { font-size: 24px; font-weight: bold; color: #6c63ff; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .footer { background: #f8f9fa; padding: 20px 32px; color: #888; font-size: 12px; text-align: center; }
    .btn { display: inline-block; padding: 12px 24px; background: #6c63ff; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🔒</div>
      <h1>SecureDeal</h1>
      <p style="margin:4px 0;opacity:0.8">Secure Escrow Platform</p>
    </div>
    <div class="body">
      <h2>${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>SecureDeal — Trusted Escrow for Every Transaction</p>
      <p>This is an automated message. Please do not reply.</p>
    </div>
  </div>
</body>
</html>`;
  }

  async sendDealCreated(buyer: any, seller: any, deal: any) {
    const content = `
      <p>A new escrow deal has been created.</p>
      <div class="deal-box">
        <strong>${deal.title}</strong><br/>
        <div class="amount">$${deal.amount.toFixed(2)}</div>
        <p>${deal.description}</p>
        <p><strong>Deadline:</strong> ${new Date(deal.deadline).toLocaleDateString()}</p>
        <p><strong>Platform Fee (5%):</strong> $${deal.feeAmount.toFixed(2)}</p>
        <p><strong>Seller Receives:</strong> $${deal.netAmount.toFixed(2)}</p>
      </div>
      <p><strong>Buyer:</strong> ${buyer.name} (${buyer.email})<br/>
      <strong>Seller:</strong> ${seller.name} (${seller.email})</p>
      <p>The buyer will now fund the deal via secure payment.</p>
      <a href="${process.env.FRONTEND_URL}/deals/${deal.id}" class="btn">View Deal</a>
    `;
    await Promise.all([
      this.send(buyer.email, `Deal Created: ${deal.title}`, this.baseTemplate('New Deal Created', content)),
      this.send(seller.email, `You've been invited to a deal: ${deal.title}`, this.baseTemplate('Deal Invitation', content)),
    ]);
  }

  async sendDeliveryConfirmation(buyer: any, seller: any, deal: any) {
    const content = `
      <p>The seller has marked the following deal as <strong>delivered</strong>:</p>
      <div class="deal-box">
        <strong>${deal.title}</strong><br/>
        <div class="amount">$${deal.amount.toFixed(2)}</div>
        ${deal.deliveryNote ? `<p><strong>Delivery Note:</strong> ${deal.deliveryNote}</p>` : ''}
      </div>
      <p>Please review the delivery. If satisfied, confirm receipt to release payment. If there's an issue, raise a dispute.</p>
      <a href="${process.env.FRONTEND_URL}/deals/${deal.id}" class="btn">Review & Confirm</a>
    `;
    await this.send(buyer.email, `Action Required: Review delivery for "${deal.title}"`, this.baseTemplate('Delivery Pending Review', content));
  }

  async sendDealCompleted(buyer: any, seller: any, deal: any) {
    const buyerContent = `
      <p>Your deal has been <strong>completed successfully</strong>.</p>
      <div class="deal-box">
        <strong>${deal.title}</strong><br/>
        <div class="amount">$${deal.amount.toFixed(2)}</div>
        <p>Thank you for using SecureDeal!</p>
      </div>
    `;
    const sellerContent = `
      <p>Great news! Your deal has been completed and <strong>payment is being released</strong>.</p>
      <div class="deal-box">
        <strong>${deal.title}</strong><br/>
        <div class="amount" style="color: #22c55e;">$${deal.netAmount.toFixed(2)}</div>
        <p><em>After $${deal.feeAmount.toFixed(2)} platform fee</em></p>
      </div>
    `;
    await Promise.all([
      this.send(buyer.email, `Deal Completed: ${deal.title}`, this.baseTemplate('Deal Completed', buyerContent)),
      this.send(seller.email, `Payment Released: ${deal.title}`, this.baseTemplate('Payment Released!', sellerContent)),
    ]);
  }

  async sendDisputeRaised(buyer: any, seller: any, deal: any, reason: string) {
    const content = `
      <p>A dispute has been raised on the following deal:</p>
      <div class="deal-box">
        <strong>${deal.title}</strong><br/>
        <div class="amount">$${deal.amount.toFixed(2)}</div>
        <p><strong>Reason:</strong> ${reason}</p>
      </div>
      <p>Our admin team will review the dispute and make a decision. Funds are held securely while under review.</p>
      <a href="${process.env.FRONTEND_URL}/deals/${deal.id}" class="btn">View Deal</a>
    `;
    await Promise.all([
      this.send(buyer.email, `Dispute Raised: ${deal.title}`, this.baseTemplate('Dispute Under Review', content)),
      this.send(seller.email, `Dispute Raised: ${deal.title}`, this.baseTemplate('Dispute Under Review', content)),
    ]);
  }

  async sendDisputeResolved(buyer: any, seller: any, deal: any, resolution: string, note: string) {
    const inFavorOf = resolution === 'RESOLVED_BUYER' ? buyer.name : seller.name;
    const content = `
      <p>The dispute for the following deal has been <strong>resolved</strong>:</p>
      <div class="deal-box">
        <strong>${deal.title}</strong><br/>
        <div class="amount">$${deal.amount.toFixed(2)}</div>
        <p><strong>Decision:</strong> In favor of <strong>${inFavorOf}</strong></p>
        <p><strong>Admin Note:</strong> ${note}</p>
      </div>
      ${resolution === 'RESOLVED_BUYER' ? '<p>A full refund has been issued to the buyer.</p>' : '<p>Funds have been released to the seller.</p>'}
    `;
    await Promise.all([
      this.send(buyer.email, `Dispute Resolved: ${deal.title}`, this.baseTemplate('Dispute Resolved', content)),
      this.send(seller.email, `Dispute Resolved: ${deal.title}`, this.baseTemplate('Dispute Resolved', content)),
    ]);
  }
}
