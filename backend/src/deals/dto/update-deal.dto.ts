import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MarkDeliveredDto {
  @ApiPropertyOptional({ example: 'Here is the link to the completed work: ...' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  deliveryNote?: string;
}
