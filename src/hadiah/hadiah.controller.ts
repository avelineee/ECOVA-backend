import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  ParseIntPipe,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { HadiahService } from './hadiah.service';
import { CreateHadiahDto } from './dto/create-hadiah.dto';
import { UpdateHadiahDto } from './dto/update-hadiah.dto';

import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../generated/prisma/enums';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Hadiah')
@Controller('hadiah')
export class HadiahController {
  constructor(private readonly hadiahService: HadiahService) {}

  // =========================
  // PUBLIC
  // =========================

  @Get()
  findAll() {
    return this.hadiahService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hadiahService.findOne(id);
  }

  // =========================
  // ADMIN ONLY
  // =========================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin_bank)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nama_hadiah: {
          type: 'string',
          example: 'Tumbler ECOVA',
        },
        poin_dibutuhkan: {
          type: 'number',
          example: 150,
        },
        stok: {
          type: 'integer',
          example: 10,
        },
        foto: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/hadiah',

        filename: (req, file, callback) => {
          const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9);

          const extension = extname(file.originalname);

          callback(null, `${uniqueName}${extension}`);
        },
      }),

      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new Error(
              'File harus berupa gambar JPG, JPEG, PNG, atau WEBP',
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
  create(
    @Body() dto: CreateHadiahDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    return this.hadiahService.create(dto, foto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin_bank)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nama_hadiah: {
          type: 'string',
          example: 'Tumbler ECOVA',
        },
        poin_dibutuhkan: {
          type: 'number',
          example: 150,
        },
        stok: {
          type: 'integer',
          example: 10,
        },
        foto: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/hadiah',

        filename: (req, file, callback) => {
          const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9);

          const extension = extname(file.originalname);

          callback(null, `${uniqueName}${extension}`);
        },
      }),

      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new Error(
              'File harus berupa gambar JPG, JPEG, PNG, atau WEBP',
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHadiahDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    return this.hadiahService.update(id, dto, foto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin_bank)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.hadiahService.remove(id);
  }
}