import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { JenisSampah } from '../../generated/prisma/enums';

export class CreateKategoriSampahDto {
  @ApiProperty({
    example: 'Botol Plastik PET',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nama_kategori: string;

  @ApiProperty({
    example: 3500,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  harga_per_kg: number;

  @ApiProperty({
    example: 15,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  poin_per_kg: number;

  @ApiProperty({
    enum: JenisSampah,
    example: JenisSampah.plastik,
  })
  @IsEnum(JenisSampah)
  jenis: JenisSampah;

  @ApiPropertyOptional({
    example: '/uploads/kategori/botol-plastik.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  foto?: string;
}