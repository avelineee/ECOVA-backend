import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHadiahDto {
  @ApiProperty({
    example: 'Tumbler ECOVA',
    description: 'Nama hadiah atau voucher',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nama_hadiah: string;

  @ApiProperty({
    example: 150,
    description: 'Jumlah poin yang dibutuhkan untuk menukar hadiah',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  poin_dibutuhkan: number;

  @ApiProperty({
    example: 10,
    description: 'Jumlah stok hadiah yang tersedia',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stok: number;
}