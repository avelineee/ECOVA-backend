import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Post,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

import { Roles } from './roles/roles.decorator';
import { RolesGuard } from './roles/roles.guard';
import { Role } from '../generated/prisma/enums';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

@Post('register')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
      role: {
        type: 'string',
        enum: ['nasabah', 'admin_bank'],
      },
      nama_nasabah: {
        type: 'string',
      },
      alamat: {
        type: 'string',
      },
      telp: {
        type: 'string',
      },
      foto: {
        type: 'string',
      },
      nama_unit: {
        type: 'string',
      },
      nama_pengelola: {
        type: 'string',
      },
    },
  },
  examples: {
    nasabah: {
      summary: 'Register Nasabah',
      value: {
        username: 'nasabah_satu',
        password: 'nasabah123',
        role: 'nasabah',
        nama_nasabah: 'Nasabah1',
        alamat: 'Malang',
        telp: '081234567890',
        foto: 'https://i.pinimg.com/736x/d3/7d/d3/d37dd3828b9ce402342b6083863248b5.jpg',
      },
    },
    admin: {
      summary: 'Register Admin Bank',
      value: {
        username: 'admin_ecova',
        password: 'admin123',
        role: 'admin_bank',
        nama_unit: 'Bank Sampah ECOVA',
        nama_pengelola: 'Admin ECOVA',
        alamat: 'Jl. Danau Ranau No. 1, Malang',
        telp: '081234567891',
        foto: 'https://i.pinimg.com/736x/d3/7d/d3/d37dd3828b9ce402342b6083863248b5.jpg',
      },
    },
  },
})
async register(@Body() dto: RegisterDto) {
  return this.authService.register(dto);
}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin_bank)
  @ApiBearerAuth()
  @Get('admin-only')
  adminOnly(@Req() req: any) {
    return {
      statusCode: 200,
      success: true,
      message: 'Berhasil mengakses halaman khusus admin',
      data: req.user,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.nasabah)
  @ApiBearerAuth()
  @Get('nasabah-only')
  nasabahOnly(@Req() req: any) {
    return {
      statusCode: 200,
      success: true,
      message: 'Berhasil mengakses halaman khusus nasabah',
      data: req.user,
    };
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.nasabah, Role.admin_bank)

  @Patch('profile')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
  schema: {
    type: 'object',
    properties: {
      nama_nasabah: {
        type: 'string',
        description: 'Khusus untuk profile nasabah',
        example: 'Nasabah ECOVA',
      },
      nama_unit: {
        type: 'string',
        description: 'Khusus untuk profile admin bank',
        example: 'Bank Sampah ECOVA',
      },
      nama_pengelola: {
        type: 'string',
        description: 'Khusus untuk profile admin bank',
        example: 'Admin ECOVA',
      },
      alamat: {
        type: 'string',
        description:
          'Alamat nasabah atau alamat kantor/unit bank sampah',
        example: 'Jl. Danau Ranau No. 1, Malang',
      },
      telp: {
        type: 'string',
        description: 'Nomor telepon nasabah atau admin bank',
        example: '081234567890',
      },
      foto: {
        type: 'string',
        format: 'binary',
        description: 'Foto profile',
      },
    },
  },
})

  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/profile',

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
  updateProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    return this.authService.updateProfile(
      req.user.userId,
      dto,
      foto,
    );
  }

}
