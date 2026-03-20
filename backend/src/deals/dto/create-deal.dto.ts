import { IsString, IsNumber, IsDateString, IsEmail, IsOptional, IsUrl, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDealDto {
  @ApiProperty({ example: 'Website Redesign' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Full redesign of company website with 5 pages' })
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'seller@example.com', description: 'Email of the seller/service provider' })
  @IsEmail()
  sellerEmail: string;

  @ApiProperty({ example: '2024-12-31T00:00:00.000Z' })
  @IsDateString()
  deadline: string;

  // URL del producto para "Compra Gestionada" — la plataforma gestiona la compra por el cliente
  @ApiProperty({ required: false, example: 'https://tienda.com/producto-123' })
  @IsOptional()
  @IsUrl()
  @MaxLength(2000)
  productUrl?: string;
}
