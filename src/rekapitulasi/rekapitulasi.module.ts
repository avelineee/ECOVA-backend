import { Module } from '@nestjs/common';
import { RekapitulasiController } from './rekapitulasi.controller';
import { RekapitulasiService } from './rekapitulasi.service';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [AuthModule],
  controllers: [RekapitulasiController],
  providers: [RekapitulasiService]
})
export class RekapitulasiModule {}
