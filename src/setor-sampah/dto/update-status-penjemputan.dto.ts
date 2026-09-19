import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { StatusPenjemputan } from '../../generated/prisma/enums';

export class UpdateStatusPenjemputanDto {
  @ApiProperty({
    enum: StatusPenjemputan,
    example: StatusPenjemputan.menuju_lokasi,
  })
  @IsEnum(StatusPenjemputan)
  status: StatusPenjemputan;
}