import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateJadwalPenjemputanDto {
  @ApiProperty({
    example: '2026-09-15',
    description: 'Tanggal jadwal penjemputan',
  })
  @IsDateString()
  tanggal: string;

  @ApiProperty({
    example: '08:00',
    description: 'Jam mulai penjemputan dengan format HH:mm',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'jam_mulai harus berformat HH:mm',
  })
  jam_mulai: string;

  @ApiProperty({
    example: '10:00',
    description: 'Jam selesai penjemputan dengan format HH:mm',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'jam_selesai harus berformat HH:mm',
  })
  jam_selesai: string;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Status aktif atau tidaknya jadwal penjemputan',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}