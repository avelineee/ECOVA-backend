import { Module } from '@nestjs/common';
import { PenukaranPoinController } from './penukaran-poin.controller';
import { PenukaranPoinService } from './penukaran-poin.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PenukaranPoinController],
  providers: [PenukaranPoinService],
})
export class PenukaranPoinModule {}