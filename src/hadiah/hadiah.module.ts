import { Module } from '@nestjs/common';
import { HadiahController } from './hadiah.controller';
import { HadiahService } from './hadiah.service';
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [HadiahController],
  providers: [HadiahService]
})
export class HadiahModule {}
