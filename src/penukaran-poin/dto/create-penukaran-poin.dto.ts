import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePenukaranPoinDto {
  @ApiProperty({
    example: 1,
    description: 'ID hadiah yang ingin ditukarkan oleh nasabah',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_hadiah: number;
}