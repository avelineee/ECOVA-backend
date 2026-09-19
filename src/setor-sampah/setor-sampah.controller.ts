import {
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
    Get,
    Patch,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { SetorSampahService } from './setor-sampah.service';
import { CreateSetorSampahDto } from './dto/create-setor-sampah.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { VerifySetorSampahDto } from './dto/verify-setor-sampah.dto';
import { Query, } from '@nestjs/common';
import { FilterSetorSampahDto } from './dto/filter-setor-sampah.dto';
import { UpdateStatusPenjemputanDto } from './dto/update-status-penjemputan.dto';

import {
    ApiBearerAuth,
    ApiTags,
} from '@nestjs/swagger';

@ApiTags('Setor Sampah')
@ApiBearerAuth()
@Controller('setor-sampah')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SetorSampahController {
    constructor(
        private readonly setorSampahService: SetorSampahService,
    ) { }

    @Post()
    @Roles(Role.nasabah)
    create(
        @Req() req: any,
        @Body() dto: CreateSetorSampahDto,
    ) {
        return this.setorSampahService.create(
            req.user.userId,
            dto,
        );
    }

    @Get('my-setor')
    @Roles(Role.nasabah)
    findMySetor(
        @Req() req: any,
        @Query() query: FilterSetorSampahDto,
    ) {
        return this.setorSampahService.findMySetor(
            req.user.userId,
            query,
        );
    }

    @Get()
    @Roles(Role.admin_bank)

    findAll(
        @Query() query: FilterSetorSampahDto,
    ) {
        return this.setorSampahService.findAll(query);
    }

    @Patch(':id/status')
    @Roles(Role.admin_bank)
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any,
        @Body() dto: VerifySetorSampahDto,
    ) {
        return this.setorSampahService.updateStatus(
            id,
            req.user.userId,
            dto,
        );
    }

    @Get('nota/:id')
    @Roles(Role.nasabah, Role.admin_bank)
    nota(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any,
    ) {
        return this.setorSampahService.nota(
            id,
            req.user.userId,
            req.user.role,
        );
    }

    @Get(':id')
    @Roles(Role.admin_bank, Role.nasabah)
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any,
    ) {
        return this.setorSampahService.findOne(
            id,
            req.user.userId,
            req.user.role,
        );
    }

    @Patch(':id/penjemputan/status')
    @Roles(Role.admin_bank)
    updateStatusPenjemputan(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateStatusPenjemputanDto,
    ) {
        return this.setorSampahService.updateStatusPenjemputan(
            id,
            dto,
        );
    }
}