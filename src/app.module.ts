import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { KategoriSampahModule } from './kategori-sampah/kategori-sampah.module';
import { SetorSampahModule } from './setor-sampah/setor-sampah.module';
import { HadiahModule } from './hadiah/hadiah.module';
import { PenukaranPoinModule } from './penukaran-poin/penukaran-poin.module';
import {PenukaranPoinService} from "./penukaran-poin/penukaran-poin.service";
import { RekapitulasiModule } from './rekapitulasi/rekapitulasi.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SeedModule } from './seed/seed.module';
import { JadwalPenjemputanModule } from './jadwal-penjemputan/jadwal-penjemputan.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    KategoriSampahModule,
    SetorSampahModule,
    HadiahModule,
    PenukaranPoinModule,
    RekapitulasiModule,
    DashboardModule,
    SeedModule,
    JadwalPenjemputanModule,
  ],
  controllers: [AppController],
  providers: [AppService, PenukaranPoinService],
})
export class AppModule {}