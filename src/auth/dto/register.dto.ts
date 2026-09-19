import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Role } from '../../generated/prisma/enums';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class RegisterDto {
  // ================= USERS =================

  @ApiProperty({
    example: 'nasabah1',
    description: 'Username pengguna',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password pengguna',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    enum: Role,
    example: Role.nasabah,
    description: 'Role pengguna: nasabah atau admin_bank',
  })
  @IsEnum(Role)
  role: Role;

  // ================= NASABAH =================

  @ApiPropertyOptional({
    example: 'Nasabah ECOVA',
    description: 'Nama nasabah, diisi jika role nasabah',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nama_nasabah?: string;

  @ApiPropertyOptional({
    example: 'Malang',
    description: 'Alamat nasabah atau alamat kantor untuk admin',
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

  @ApiPropertyOptional({
    example: '/uploads/profile/foto.jpg',
    description: 'Foto profil pengguna',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  foto?: string;

  // ================= ADMIN BANK =================

  @ApiPropertyOptional({
    example: 'Bank Sampah ECOVA',
    description: 'Nama unit bank sampah, diisi jika role admin_bank',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nama_unit?: string;

  @ApiPropertyOptional({
    example: 'Admin ECOVA',
    description: 'Nama pengelola, diisi jika role admin_bank',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nama_pengelola?: string;
}