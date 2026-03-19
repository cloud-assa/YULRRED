import { Controller, Post, Get, Param, Body, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto, ResolveDisputeDto } from './dto/create-dispute.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role, DisputeStatus } from '../common/enums';

@ApiTags('Disputes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('disputes')
export class DisputesController {
  constructor(private disputesService: DisputesService) {}

  @Post('deals/:dealId')
  @ApiOperation({ summary: 'Raise a dispute for a deal' })
  raise(
    @Param('dealId') dealId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDisputeDto,
  ) {
    return this.disputesService.raise(dealId, userId, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: List all disputes' })
  findAll() {
    return this.disputesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute details' })
  findOne(@Param('id') id: string) {
    return this.disputesService.findOne(id);
  }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: Mark dispute as under review' })
  markUnderReview(@Param('id') id: string): Promise<any> {
    return this.disputesService.updateStatus(id, DisputeStatus.UNDER_REVIEW);
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin: Resolve a dispute' })
  resolve(@Param('id') id: string, @Body() dto: ResolveDisputeDto) {
    return this.disputesService.resolve(id, dto);
  }
}
