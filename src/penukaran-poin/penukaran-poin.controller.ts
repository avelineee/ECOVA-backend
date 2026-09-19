import {
    Body,
    Controller,
    Post,
    Req,
    UseGuards,
    Get,
    Query,
    ParseIntPipe,
    Param,
    Put,
} from '@nestjs/common';
import { PenukaranPoinService } from './penukaran-poin.service';
import { CreatePenukaranPoinDto } from './dto/create-penukaran-poin.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { UpdateStatusPenukaranDto } from './dto/update-status-penukaran.dto';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Penukaran Poin')
@ApiBearerAuth()
@Controller('penukaran-poin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PenukaranPoinController {
    constructor(
        private readonly penukaranPoinService: PenukaranPoinService,
    ) { }

    @Post('tukar')
    @Roles(Role.nasabah)
    tukar(
        @Req() req: any,
        @Body() dto: CreatePenukaranPoinDto,
    ) {
        return this.penukaranPoinService.tukar(
            req.user.userId,
            dto,
        );
    }

    @Get('my-penukaran')
    @Roles(Role.nasabah)
    myPenukaran(@Req() req: any) {
        return this.penukaranPoinService.myPenukaran(
            req.user.userId,
        );
    }

    @Get()
    @Roles(Role.admin_bank)
    findAll(@Query('bulan') bulan?: string) {
        return this.penukaranPoinService.findAll(bulan);
    }

    @Put(':id/status')
    @Roles(Role.admin_bank)
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateStatusPenukaranDto,
    ) {
        return this.penukaranPoinService.updateStatus(id, dto);
    }

    @Get('nota/:id')
    @Roles(Role.nasabah, Role.admin_bank)
    nota(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any,
    ) {
        return this.penukaranPoinService.nota(
            id,
            req.user.userId,
            req.user.role,
        );
    }
}