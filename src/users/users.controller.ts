import {
  Controller,
  Get,
  UseGuards,
  ParseIntPipe,
  Param,
  Patch,
  Body,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { UpdateUserDto } from './dto/update-user.dto';

import {
  ApiBearerAuth,
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // =========================
  // GET ALL USERS - ADMIN
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin_bank)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // =========================
  // PUBLIC BANK INFO
  // =========================
  @Get('bank-info')
  @ApiOperation({
    summary: 'Melihat informasi bank sampah',
  })
  getBankInfo() {
    return this.usersService.getBankInfo();
  }

  // =========================
  // GET USER BY ID - ADMIN
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin_bank)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // =========================
  // UPDATE USER - ADMIN
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin_bank)
  @Patch(':id')
  @ApiOperation({
    summary: 'Admin memperbarui data user/nasabah',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/profile',

        filename: (req, file, callback) => {
          const uniqueName =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1e9);

          callback(
            null,
            `${uniqueName}${extname(file.originalname)}`,
          );
        },
      }),

      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Foto harus berformat JPG, JPEG, PNG, atau WEBP',
            ),
            false,
          );
        }

        callback(null, true);
      },

      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'nasabah1',
        },

        password: {
          type: 'string',
          example: 'passwordBaru123',
        },

        nama_nasabah: {
          type: 'string',
          example: 'Nasabah ECOVA',
        },

        alamat: {
          type: 'string',
          example: 'Jl. Danau Ranau No. 1, Malang',
        },

        telp: {
          type: 'string',
          example: '081234567890',
        },

        foto: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    if (foto) {
      dto.foto = `/uploads/profile/${foto.filename}`;
    }

    return this.usersService.update(id, dto);
  }

  // =========================
  // DELETE USER - ADMIN
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin_bank)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.remove(id);
  }
}