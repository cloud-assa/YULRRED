import { IsString, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEvidenceDto {
  @ApiProperty({ example: 'https://drive.google.com/file/abc', description: 'URL de la evidencia (foto, video, documento)' })
  @IsUrl()
  @MaxLength(2000)
  url: string;

  @ApiProperty({ example: 'Foto del producto empacado listo para envío' })
  @IsString()
  @MaxLength(1000)
  description: string;
}
