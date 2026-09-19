import { PartialType } from '@nestjs/swagger';
import { CreateJadwalPenjemputanDto } from './create-jadwal-penjemputan.dto';

export class UpdateJadwalPenjemputanDto extends PartialType(
  CreateJadwalPenjemputanDto,
) {}