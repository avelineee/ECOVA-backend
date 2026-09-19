import { Module } from '@nestjs/common';
import { KategoriSampahController } from './kategori-sampah.controller';
import { KategoriSampahService } from './kategori-sampah.service';
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [KategoriSampahController],
  providers: [KategoriSampahService]
})
export class KategoriSampahModule {}
