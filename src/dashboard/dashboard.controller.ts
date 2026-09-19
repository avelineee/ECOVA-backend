import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../generated/prisma/client';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  // =========================================
  // PUBLIC - TIDAK PERLU LOGIN
  // =========================================
  @Get('public-stats')
  publicStats() {
    return this.dashboardService.publicStats();
  }

  // =========================================
  // NASABAH - WAJIB LOGIN
  // =========================================
  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.nasabah)
  @ApiBearerAuth()
  summary(@Req() req: any) {
    return this.dashboardService.summaryNasabah(
      req.user.userId,
    );
  }

  // =========================================
  // ADMIN - WAJIB LOGIN
  // =========================================
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin_bank)
  @ApiBearerAuth()
  stats() {
    return this.dashboardService.statsAdmin();
  }
}