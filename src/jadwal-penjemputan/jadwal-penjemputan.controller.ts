import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JadwalPenjemputanService } from './jadwal-penjemputan.service';
import { CreateJadwalPenjemputanDto } from './dto/create-jadwal-penjemputan.dto';
import { UpdateJadwalPenjemputanDto } from './dto/update-jadwal-penjemputan.dto';

import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';

import { Role } from '../generated/prisma/enums';

@ApiTags('Jadwal Penjemputan')
@ApiBearerAuth()
@Controller('jadwal-penjemputan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class JadwalPenjemputanController {
  constructor(
    private readonly jadwalPenjemputanService: JadwalPenjemputanService,
  ) {}

  // =========================
  // CREATE - ADMIN
  // =========================

  @Post()
  @Roles(Role.admin_bank)
  @ApiOperation({
    summary: 'Membuat jadwal penjemputan baru',
  })
  create(
    @Body() dto: CreateJadwalPenjemputanDto,
  ) {
    return this.jadwalPenjemputanService.create(dto);
  }

  // =========================
  // GET ALL - ADMIN & NASABAH
  // =========================

  @Get()
  @Roles(Role.admin_bank, Role.nasabah)
  @ApiOperation({
    summary: 'Melihat seluruh jadwal penjemputan',
  })
  findAll() {
    return this.jadwalPenjemputanService.findAll();
  }

  // =========================
  // GET BY ID - ADMIN & NASABAH
  // =========================

  @Get(':id')
  @Roles(Role.admin_bank, Role.nasabah)
  @ApiOperation({
    summary: 'Melihat detail jadwal penjemputan',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.jadwalPenjemputanService.findOne(id);
  }

  // =========================
  // UPDATE - ADMIN
  // =========================

  @Patch(':id')
  @Roles(Role.admin_bank)
  @ApiOperation({
    summary: 'Memperbarui jadwal penjemputan',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateJadwalPenjemputanDto,
  ) {
    return this.jadwalPenjemputanService.update(
      id,
      dto,
    );
  }

  // =========================
  // DELETE - ADMIN
  // =========================

  @Delete(':id')
  @Roles(Role.admin_bank)
  @ApiOperation({
    summary: 'Menghapus jadwal penjemputan',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.jadwalPenjemputanService.remove(id);
  }
}