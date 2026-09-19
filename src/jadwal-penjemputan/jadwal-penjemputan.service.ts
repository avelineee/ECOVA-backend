import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateJadwalPenjemputanDto } from './dto/create-jadwal-penjemputan.dto';
import { UpdateJadwalPenjemputanDto } from './dto/update-jadwal-penjemputan.dto';

@Injectable()
export class JadwalPenjemputanService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // CREATE JADWAL
  // =========================

  async create(dto: CreateJadwalPenjemputanDto) {
    this.validateJam(dto.jam_mulai, dto.jam_selesai);

    const jadwal = await this.prisma.jadwalPenjemputan.create({
      data: {
        tanggal: new Date(dto.tanggal),
        jam_mulai: dto.jam_mulai,
        jam_selesai: dto.jam_selesai,
        is_active: dto.is_active ?? true,
      },
    });

    return {
      message: 'Jadwal penjemputan berhasil dibuat',
      data: jadwal,
    };
  }

  // =========================
  // GET ALL JADWAL
  // =========================

  async findAll() {
    const jadwal = await this.prisma.jadwalPenjemputan.findMany({
      orderBy: [
        {
          tanggal: 'asc',
        },
        {
          jam_mulai: 'asc',
        },
      ],
    });

    return {
      message: 'Data jadwal penjemputan berhasil diambil',
      data: jadwal,
    };
  }

  // =========================
  // GET JADWAL BY ID
  // =========================

  async findOne(id: number) {
    const jadwal = await this.prisma.jadwalPenjemputan.findUnique({
      where: {
        id,
      },
    });

    if (!jadwal) {
      throw new NotFoundException(
        `Jadwal penjemputan dengan ID ${id} tidak ditemukan`,
      );
    }

    return {
      message: 'Detail jadwal penjemputan berhasil diambil',
      data: jadwal,
    };
  }

  // =========================
  // UPDATE JADWAL
  // =========================

  async update(
    id: number,
    dto: UpdateJadwalPenjemputanDto,
  ) {
    const existing = await this.prisma.jadwalPenjemputan.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Jadwal penjemputan dengan ID ${id} tidak ditemukan`,
      );
    }

    const jamMulai = dto.jam_mulai ?? existing.jam_mulai;
    const jamSelesai = dto.jam_selesai ?? existing.jam_selesai;

    this.validateJam(jamMulai, jamSelesai);

    const jadwal = await this.prisma.jadwalPenjemputan.update({
      where: {
        id,
      },
      data: {
        ...(dto.tanggal !== undefined && {
          tanggal: new Date(dto.tanggal),
        }),

        ...(dto.jam_mulai !== undefined && {
          jam_mulai: dto.jam_mulai,
        }),

        ...(dto.jam_selesai !== undefined && {
          jam_selesai: dto.jam_selesai,
        }),

        ...(dto.is_active !== undefined && {
          is_active: dto.is_active,
        }),
      },
    });

    return {
      message: 'Jadwal penjemputan berhasil diperbarui',
      data: jadwal,
    };
  }

  // =========================
  // DELETE JADWAL
  // =========================

  async remove(id: number) {
    const existing = await this.prisma.jadwalPenjemputan.findUnique({
      where: {
        id,
      },
      include: {
        penjemputan: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Jadwal penjemputan dengan ID ${id} tidak ditemukan`,
      );
    }

    if (existing.penjemputan.length > 0) {
      throw new BadRequestException(
        'Jadwal tidak dapat dihapus karena sudah digunakan pada penjemputan',
      );
    }

    await this.prisma.jadwalPenjemputan.delete({
      where: {
        id,
      },
    });

    return {
      message: `Jadwal penjemputan dengan ID ${id} berhasil dihapus`,
    };
  }

  // =========================
  // VALIDASI JAM
  // =========================

  private validateJam(
    jamMulai: string,
    jamSelesai: string,
  ) {
    if (jamSelesai <= jamMulai) {
      throw new BadRequestException(
        'jam_selesai harus lebih besar dari jam_mulai',
      );
    }
  }
}