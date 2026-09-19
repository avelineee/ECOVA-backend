import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class UpdateProfileDto {
  // ================= NASABAH =================

  @ApiPropertyOptional({
    example: 'Nasabah ECOVA',
    description: 'Nama nasabah, digunakan untuk role nasabah',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nama_nasabah?: string;

  // ================= ADMIN =================

  @ApiPropertyOptional({
    example: 'Bank Sampah ECOVA',
    description: 'Nama unit bank sampah, digunakan untuk role admin_bank',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nama_unit?: string;

  @ApiPropertyOptional({
    example: 'Admin ECOVA',
    description: 'Nama pengelola bank sampah, digunakan untuk role admin_bank',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nama_pengelola?: string;

  // ================= KEDUANYA =================

  @ApiPropertyOptional({
    example: 'Jl. Danau Ranau No. 1, Malang',
    description:
      'Alamat nasabah atau alamat kantor/unit bank sampah untuk admin',
  })
  @IsOptional()
  @IsString()
  alamat?: string;

  @ApiPropertyOptional({
    example: '081234567890',
    description: 'Nomor telepon',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telp?: string;
}