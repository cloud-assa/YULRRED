import { IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDisputeDto {
  @ApiProperty({ example: 'The delivered work does not match the agreed specifications.' })
  @IsString()
  @MaxLength(2000)
  reason: string;

  @ApiPropertyOptional({ example: 'See attached screenshots at...' })
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  evidence?: string;
}

export class ResolveDisputeDto {
  @ApiProperty({ enum: ['RESOLVED_BUYER', 'RESOLVED_SELLER'] })
  @IsString()
  resolution: 'RESOLVED_BUYER' | 'RESOLVED_SELLER';

  @ApiProperty({ example: 'After reviewing evidence, we find in favor of the buyer.' })
  @IsString()
  @MaxLength(2000)
  resolutionNote: string;
}
