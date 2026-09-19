import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'nasabah1',
    description: 'Username pengguna',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @ApiPropertyOptional({
    example: 'passwordBaru123',
    description: 'Password baru pengguna',
  })
  @IsOptional()
  @IsString()
  password?: string;

  // ================= NASABAH =================

  @ApiPropertyOptional({
    example: 'Nasabah ECOVA',
    description: 'Nama nasabah, khusus untuk user dengan role nasabah',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nama_nasabah?: string;

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
    description: 'Nomor telepon pengguna',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telp?: string;

  @ApiPropertyOptional({
    example: '/uploads/profile/foto.jpg',
    description:
      'Path/URL foto profil. Upload file foto dilakukan melalui PATCH /auth/profile',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  foto?: string;

  // ================= ADMIN =================

  @ApiPropertyOptional({
    example: 'Bank Sampah ECOVA',
    description: 'Nama unit bank sampah, khusus untuk role admin_bank',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nama_unit?: string;

  @ApiPropertyOptional({
    example: 'Admin ECOVA',
    description: 'Nama pengelola bank sampah, khusus untuk role admin_bank',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nama_pengelola?: string;

  @ApiPropertyOptional({
  example: 'Senin - Sabtu',
  description:
    'Hari operasional bank sampah, khusus untuk role admin_bank',
})
@IsOptional()
@IsString()
@MaxLength(100)
hari_operasional?: string;

@ApiPropertyOptional({
  example: '08:00',
  description:
    'Jam buka bank sampah dengan format HH:mm, khusus untuk role admin_bank',
})
@IsOptional()
@IsString()
@MaxLength(5)
jam_buka?: string;

@ApiPropertyOptional({
  example: '15:00',
  description:
    'Jam tutup bank sampah dengan format HH:mm, khusus untuk role admin_bank',
})
@IsOptional()
@IsString()
@MaxLength(5)
jam_tutup?: string;
}
