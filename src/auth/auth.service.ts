import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { Role } from '../generated/prisma/enums';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly jwtService: JwtService,
) {}

  async register(dto: RegisterDto) {
    // 1. Cek apakah username sudah digunakan
    const existingUser = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });

    if (existingUser) {
      throw new ConflictException('Username sudah digunakan');
    }

    // 2. Validasi berdasarkan role
    if (dto.role === Role.nasabah) {
      if (!dto.nama_nasabah || !dto.alamat || !dto.telp) {
        throw new BadRequestException(
          'nama_nasabah, alamat, dan telp wajib diisi untuk nasabah',
        );
      }
    }

    if (dto.role === Role.admin_bank) {
      if (!dto.nama_unit || !dto.nama_pengelola || !dto.telp) {
        throw new BadRequestException(
          'nama_unit, nama_pengelola, dan telp wajib diisi untuk admin bank',
        );
      }
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 4. Simpan user + profil
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: dto.username,
          password: hashedPassword,
          role: dto.role,
        },
      });

      // NASABAH
      if (dto.role === Role.nasabah) {
        const nasabah = await tx.nasabah.create({
          data: {
            nama_nasabah: dto.nama_nasabah!,
            alamat: dto.alamat!,
            telp: dto.telp!,
            foto: dto.foto,
            id_user: user.id,
          },
        });

        return {
          user,
          profile: nasabah,
        };
      }

      // ADMIN BANK
      if (dto.role === Role.admin_bank) {
        const adminBank = await tx.adminBank.create({
          data: {
            nama_unit: dto.nama_unit!,
            nama_pengelola: dto.nama_pengelola!,
            telp: dto.telp!,
            foto: dto.foto,
            id_user: user.id,
          },
        });

        return {
          user,
          profile: adminBank,
        };
      }

      throw new BadRequestException('Role tidak valid');
    });

    // 5. Response NASABAH
    if (result.user.role === Role.nasabah) {
      const profile = result.profile as {
        id: number;
        nama_nasabah: string;
        alamat: string;
        telp: string;
        saldo_poin: number;
        foto: string | null;
      };

      return {
        statusCode: 201,
        success: true,
        message: 'Registrasi nasabah berhasil',
        data: {
          id: result.user.id,
          username: result.user.username,
          role: result.user.role,
          nama_nasabah: profile.nama_nasabah,
          alamat: profile.alamat,
          telp: profile.telp,
          saldo_poin: profile.saldo_poin,
          foto: profile.foto,
          created_at: result.user.created_at,
        },
      };
    }

    // 6. Response ADMIN BANK
    const profile = result.profile as {
      id: number;
      nama_unit: string;
      nama_pengelola: string;
      telp: string;
      foto: string | null;
    };

    return {
      statusCode: 201,
      success: true,
      message: 'Registrasi admin bank berhasil',
      data: {
        id: result.user.id,
        username: result.user.username,
        role: result.user.role,
        nama_unit: profile.nama_unit,
        nama_pengelola: profile.nama_pengelola,
        telp: profile.telp,
        foto: profile.foto,
        created_at: result.user.created_at,
      },
    };
  }

  //LOGIN
  async login(dto: LoginDto) {
  // 1. Cari user berdasarkan username
  const user = await this.prisma.user.findUnique({
    where: {
      username: dto.username,
    },
  });

  if (!user) {
    throw new UnauthorizedException('Username atau password salah');
  }

  // 2. Cek password
  const passwordValid = await bcrypt.compare(
    dto.password,
    user.password,
  );

  if (!passwordValid) {
    throw new UnauthorizedException('Username atau password salah');
  }

  // 3. Buat payload JWT
  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role,
  };

  // 4. Generate token
  const accessToken = await this.jwtService.signAsync(payload);

  // 5. Response
  return {
    statusCode: 200,
    success: true,
    message: 'Login berhasil',
    data: {
      access_token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    },
  };
}

async getProfile(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      nasabah: true,
      adminBank: true,
    },
  });

  if (!user) {
    throw new BadRequestException('User tidak ditemukan');
  }

  // PROFILE NASABAH
  if (user.role === Role.nasabah) {
    return {
      statusCode: 200,
      success: true,
      message: 'Profile nasabah berhasil diambil',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        nama_nasabah: user.nasabah?.nama_nasabah,
        alamat: user.nasabah?.alamat,
        telp: user.nasabah?.telp,
        saldo_poin: user.nasabah?.saldo_poin,
        foto: user.nasabah?.foto,
        created_at: user.created_at,
      },
    };
  }

  // PROFILE ADMIN BANK
  return {
    statusCode: 200,
    success: true,
    message: 'Profile admin bank berhasil diambil',
    data: {
      id: user.id,
      username: user.username,
      role: user.role,
      nama_unit: user.adminBank?.nama_unit,
      nama_pengelola: user.adminBank?.nama_pengelola,
      telp: user.adminBank?.telp,
      foto: user.adminBank?.foto,
      created_at: user.created_at,
    },
  };
}

async updateProfile(
  userId: number,
  dto: UpdateProfileDto,
  foto?: Express.Multer.File,
) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new NotFoundException('User tidak ditemukan');
  }

  // ================= NASABAH =================

  if (user.role === Role.nasabah) {
    const nasabah = await this.prisma.nasabah.findUnique({
      where: {
        id_user: userId,
      },
    });

    if (!nasabah) {
      throw new NotFoundException(
        'Data nasabah tidak ditemukan',
      );
    }

    const updatedNasabah = await this.prisma.nasabah.update({
      where: {
        id_user: userId,
      },
      data: {
        nama_nasabah: dto.nama_nasabah,
        alamat: dto.alamat,
        telp: dto.telp,

        foto: foto
          ? `/uploads/profile/${foto.filename}`
          : nasabah.foto,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Profile nasabah berhasil diperbarui',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        nama_nasabah: updatedNasabah.nama_nasabah,
        alamat: updatedNasabah.alamat,
        telp: updatedNasabah.telp,
        saldo_poin: updatedNasabah.saldo_poin,
        foto: updatedNasabah.foto,
        created_at: user.created_at,
      },
    };
  }

  // ================= ADMIN BANK =================

  if (user.role === Role.admin_bank) {
    const admin = await this.prisma.adminBank.findUnique({
      where: {
        id_user: userId,
      },
    });

    if (!admin) {
      throw new NotFoundException(
        'Data admin bank tidak ditemukan',
      );
    }

    const updatedAdmin = await this.prisma.adminBank.update({
      where: {
        id_user: userId,
      },
      data: {
        nama_unit: dto.nama_unit,
        nama_pengelola: dto.nama_pengelola,
        alamat: dto.alamat,
        telp: dto.telp,

        foto: foto
          ? `/uploads/profile/${foto.filename}`
          : admin.foto,
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Profile admin bank berhasil diperbarui',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        nama_unit: updatedAdmin.nama_unit,
        nama_pengelola: updatedAdmin.nama_pengelola,
        alamat: updatedAdmin.alamat,
        telp: updatedAdmin.telp,
        foto: updatedAdmin.foto,
        created_at: user.created_at,
      },
    };
  }

  throw new BadRequestException(
    'Role user tidak dikenali',
  );
}


}