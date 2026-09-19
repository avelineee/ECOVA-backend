import { Module } from '@nestjs/common';
import { JadwalPenjemputanController } from './jadwal-penjemputan.controller';
import { JadwalPenjemputanService } from './jadwal-penjemputan.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [JadwalPenjemputanController],
  providers: [JadwalPenjemputanService]
})
export class JadwalPenjemputanModule {}
