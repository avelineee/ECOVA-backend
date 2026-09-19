import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { StatusSetor } from '../../generated/prisma/enums';

export class VerifyDetailSetorDto {
  @ApiProperty({
    example: 1,
    description: 'ID kategori sampah yang diverifikasi',
  })
  @Type(() => Number)
  @IsInt()
  id_kategori_sampah: number;

  @ApiProperty({
    example: 5,
    description: 'Berat hasil timbang ulang dalam kilogram',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  berat_kg: number;
}

export class VerifySetorSampahDto {
  @ApiProperty({
    enum: StatusSetor,
    example: StatusSetor.selesai,
    description: 'Status baru pengajuan penyetoran',
  })
  @IsEnum(StatusSetor)
  status: StatusSetor;

  @ApiPropertyOptional({
    type: [VerifyDetailSetorDto],
    description:
      'Data hasil timbang ulang. Biasanya diisi saat setoran diselesaikan.',
    example: [
      {
        id_kategori_sampah: 1,
        berat_kg: 5,
      },
      {
        id_kategori_sampah: 2,
        berat_kg: 7,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VerifyDetailSetorDto)
  items?: VerifyDetailSetorDto[];
}