import {
  Controller,
  Body,
  Post,
  UseGuards,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { KategoriSampahService } from './kategori-sampah.service';
import { CreateKategoriSampahDto } from './dto/create-kategori-sampah.dto';
import { UpdateKategoriSampahDto } from './dto/update-kategori-sampah.dto';

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

@ApiTags('Kategori Sampah')
@Controller('kategori-sampah')
export class KategoriSampahController {
  constructor(
    private readonly kategoriSampahService: KategoriSampahService,
  ) {}

  // =========================
  // PUBLIC
  // =========================

  @Get()
  findAll() {
    return this.kategoriSampahService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.kategoriSampahService.findOne(id);
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
        nama_kategori: {
          type: 'string',
          example: 'Botol Plastik PET',
        },
        harga_per_kg: {
          type: 'number',
          example: 3500,
        },
        poin_per_kg: {
          type: 'number',
          example: 15,
        },
        jenis: {
          type: 'string',
          enum: ['plastik', 'kertas', 'logam', 'kaca'],
          example: 'plastik',
        },
        foto: {
          type: 'string',
          format: 'binary',
        },
      },
      required: [
        'nama_kategori',
        'harga_per_kg',
        'poin_per_kg',
        'jenis',
      ],
    },
  })
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/kategori',

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
    @Body() dto: CreateKategoriSampahDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    return this.kategoriSampahService.create(dto, foto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin_bank)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nama_kategori: {
          type: 'string',
          example: 'Botol Plastik PET',
        },
        harga_per_kg: {
          type: 'number',
          example: 4000,
        },
        poin_per_kg: {
          type: 'number',
          example: 20,
        },
        jenis: {
          type: 'string',
          enum: ['plastik', 'kertas', 'logam', 'kaca'],
          example: 'plastik',
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
        destination: './uploads/kategori',

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
    @Body() dto: UpdateKategoriSampahDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    return this.kategoriSampahService.update(
      id,
      dto,
      foto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin_bank)
  @ApiBearerAuth()
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.kategoriSampahService.remove(id);
  }
}