import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { MetodeSetor } from '../../generated/prisma/enums';

export class CreateDetailSetorDto {
  @ApiProperty({
    example: 1,
    description: 'ID kategori sampah yang disetorkan',
  })
  @IsInt()
  id_kategori_sampah: number;

  @ApiProperty({
    example: 5,
    description: 'Estimasi berat sampah dalam kilogram',
    minimum: 0.1,
  })
  @IsNumber()
  @Min(0.1)
  berat_kg: number;
}

export class CreateSetorSampahDto {
  // =========================
  // METODE SETOR
  // =========================

  @ApiPropertyOptional({
    enum: MetodeSetor,
    example: MetodeSetor.antar,
    default: MetodeSetor.antar,
    description:
      'Metode penyetoran sampah. Pilih "antar" untuk mengantar langsung ke bank sampah atau "jemput" untuk meminta penjemputan.',
  })
  @IsOptional()
  @IsEnum(MetodeSetor, {
    message: 'metode_setor harus berupa antar atau jemput',
  })
  metode_setor?: MetodeSetor;

  // =========================
  // KHUSUS METODE JEMPUT
  // =========================

  @ApiPropertyOptional({
    example: 1,
    description:
      'ID jadwal penjemputan. Wajib diisi jika metode_setor adalah jemput.',
  })
  @ValidateIf(
    (object: CreateSetorSampahDto) =>
      object.metode_setor === MetodeSetor.jemput,
  )
  @IsInt({
    message: 'id_jadwal harus berupa angka',
  })
  id_jadwal?: number;

  @ApiPropertyOptional({
    example: 'Jl. Soekarno Hatta No. 10, Malang',
    description:
      'Alamat penjemputan sampah. Wajib diisi jika metode_setor adalah jemput.',
  })
  @ValidateIf(
    (object: CreateSetorSampahDto) =>
      object.metode_setor === MetodeSetor.jemput,
  )
  @IsString()
  @IsNotEmpty({
    message:
      'alamat_penjemputan wajib diisi jika menggunakan metode jemput',
  })
  alamat_penjemputan?: string;

  // =========================
  // DETAIL SAMPAH
  // =========================

  @ApiProperty({
    type: [CreateDetailSetorDto],
    description: 'Daftar sampah yang ingin disetorkan',
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
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateDetailSetorDto)
  items: CreateDetailSetorDto[];
}