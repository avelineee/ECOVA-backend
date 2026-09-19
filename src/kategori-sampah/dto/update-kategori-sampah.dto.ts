import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';
import { JenisSampah } from '../../generated/prisma/enums';
import { Type } from 'class-transformer';

export class UpdateKategoriSampahDto {
  @ApiPropertyOptional({
    example: 'Botol Plastik PET',
    description: 'Nama kategori sampah',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nama_kategori?: string;

  @ApiPropertyOptional({
    example: 4000,
    description: 'Harga sampah per kilogram',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  harga_per_kg?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Jumlah poin yang didapat per kilogram',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  poin_per_kg?: number;

  @ApiPropertyOptional({
    enum: JenisSampah,
    example: JenisSampah.plastik,
    description: 'Jenis sampah',
  })
  @IsOptional()
  @IsEnum(JenisSampah)
  jenis?: JenisSampah;

  @ApiPropertyOptional({
    example: '/uploads/kategori/botol-plastik.jpg',
    description: 'Foto kategori sampah',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  foto?: string;
}