import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RekapitulasiService } from './rekapitulasi.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../generated/prisma/client';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Rekapitulasi')
@ApiBearerAuth()
@Controller('rekapitulasi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RekapitulasiController {
  constructor(
    private readonly rekapitulasiService: RekapitulasiService,
  ) {}

  @Get('bulanan')
  @Roles(Role.admin_bank)
  bulanan(@Query('bulan') bulan: string) {
    return this.rekapitulasiService.bulanan(bulan);
  }
}