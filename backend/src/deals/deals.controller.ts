import {
  Controller, Get, Post, Body, Param, Patch,
  UseGuards, Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DealsService } from './deals.service';
import { EvidenceService } from '../evidence/evidence.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { MarkDeliveredDto } from './dto/update-deal.dto';
import { CreateEvidenceDto } from '../evidence/dto/create-evidence.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/enums';

@ApiTags('Deals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deals')
export class DealsController {
  constructor(
    private dealsService: DealsService,
    private evidenceService: EvidenceService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new deal (buyer initiates)' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateDealDto) {
    return this.dealsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all deals for current user' })
  findAll(@CurrentUser('id') userId: string) {
    return this.dealsService.findAll(userId);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: List all deals' })
  getAllAdmin() {
    return this.dealsService.getAllAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deal details' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role === Role.ADMIN) return this.dealsService.findOneAdmin(id);
    return this.dealsService.findOne(id, user.id);
  }

  @Patch(':id/deliver')
  @ApiOperation({ summary: 'Seller marks deal as delivered' })
  markDelivered(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: MarkDeliveredDto,
  ) {
    return this.dealsService.markDelivered(id, userId, dto);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Buyer confirms receipt and releases payment (requires evidence)' })
  confirmReceipt(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.dealsService.confirmReceipt(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a pending deal' })
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string): Promise<any> {
    return this.dealsService.cancel(id, userId);
  }

  // ─── Evidencias ──────────────────────────────────────────────────────────

  @Post(':id/evidence')
  @ApiOperation({ summary: 'Upload evidence for a deal (required before completion)' })
  addEvidence(
    @Param('id') dealId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateEvidenceDto,
  ) {
    return this.evidenceService.create(dealId, user.id, dto, user.role);
  }

  @Get(':id/evidence')
  @ApiOperation({ summary: 'List all evidence for a deal' })
  getEvidence(@Param('id') dealId: string) {
    return this.evidenceService.findForDeal(dealId);
  }

  // ─── Flujo de Compra Gestionada ──────────────────────────────────────────

  @Patch(':id/awaiting-approval')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: move deal to AWAITING_APPROVAL after uploading evidence' })
  setAwaitingApproval(@Param('id') id: string) {
    return this.dealsService.setAwaitingApproval(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Buyer approves platform evidence to unblock the deal' })
  approveService(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.dealsService.approveService(id, userId);
  }
}
