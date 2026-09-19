import { Module } from '@nestjs/common';
import { SetorSampahController } from './setor-sampah.controller';
import { SetorSampahService } from './setor-sampah.service';
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [SetorSampahController],
  providers: [SetorSampahService]
})
export class SetorSampahModule {}
