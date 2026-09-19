import { IsEnum } from 'class-validator';
import { StatusPenukaran } from '../../generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStatusPenukaranDto {
  @ApiProperty({
    enum: StatusPenukaran,
    example: StatusPenukaran.selesai,
    description: 'Status penukaran poin',
  })
  @IsEnum(StatusPenukaran)
  status: StatusPenukaran;
}