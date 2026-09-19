import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateHadiahDto {
  @ApiPropertyOptional({
    example: 'Tumbler ECOVA',
    description: 'Nama hadiah atau voucher',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nama_hadiah?: string;

  @ApiPropertyOptional({
    example: 150,
    description: 'Jumlah poin yang dibutuhkan untuk menukar hadiah',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  poin_dibutuhkan?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Jumlah stok hadiah yang tersedia',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stok?: number;
}