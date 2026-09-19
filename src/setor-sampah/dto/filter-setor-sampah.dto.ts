import {
  IsEnum,
  IsOptional,
  Matches,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { StatusSetor } from '../../generated/prisma/enums';

export class FilterSetorSampahDto {
  @ApiPropertyOptional({
    example: '2026-09',
    description: 'Filter penyetoran berdasarkan bulan dengan format YYYY-MM',
  })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'Format bulan harus YYYY-MM, contoh: 2026-09',
  })
  bulan?: string;

  @ApiPropertyOptional({
    enum: StatusSetor,
    example: StatusSetor.selesai,
    description: 'Filter penyetoran berdasarkan status',
  })
  @IsOptional()
  @IsEnum(StatusSetor)
  status?: StatusSetor;
}