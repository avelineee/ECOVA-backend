import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHadiahDto } from './dto/create-hadiah.dto';
import { UpdateHadiahDto } from './dto/update-hadiah.dto';

@Injectable()
export class HadiahService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
  dto: CreateHadiahDto,
  foto?: Express.Multer.File,
) {
  const hadiah = await this.prisma.hadiah.create({
    data: {
      nama_hadiah: dto.nama_hadiah,
      poin_dibutuhkan: dto.poin_dibutuhkan,
      stok: dto.stok,

      foto: foto
        ? `/uploads/hadiah/${foto.filename}`
        : null,
    },
  });

  return {
    statusCode: 201,
    success: true,
    message: 'Hadiah baru berhasil ditambahkan',
    data: hadiah,
  };
}

  async findAll() {
  const hadiah = await this.prisma.hadiah.findMany({
    orderBy: {
      id: 'asc',
    },
  });

  return {
    statusCode: 200,
    success: true,
    message: 'Katalog hadiah berhasil ditampilkan',
    data: hadiah,
  };
}

async findOne(id: number) {
  const hadiah = await this.prisma.hadiah.findUnique({
    where: {
      id,
    },
  });

  if (!hadiah) {
    throw new NotFoundException(
      `Hadiah dengan ID ${id} tidak ditemukan`,
    );
  }

  return {
    statusCode: 200,
    success: true,
    message: 'Detail hadiah berhasil ditampilkan',
    data: hadiah,
  };
}

async update(
  id: number,
  dto: UpdateHadiahDto,
  foto?: Express.Multer.File,
) {
  const hadiahLama = await this.prisma.hadiah.findUnique({
    where: { id },
  });

  if (!hadiahLama) {
    throw new NotFoundException(
      `Hadiah dengan ID ${id} tidak ditemukan`,
    );
  }

  const hadiah = await this.prisma.hadiah.update({
    where: { id },

    data: {
      nama_hadiah: dto.nama_hadiah,
      poin_dibutuhkan: dto.poin_dibutuhkan,
      stok: dto.stok,

      // Kalau tidak upload foto baru,
      // foto lama tetap digunakan.
      foto: foto
        ? `/uploads/hadiah/${foto.filename}`
        : hadiahLama.foto,
    },
  });

  return {
    statusCode: 200,
    success: true,
    message: 'Hadiah berhasil diperbarui',
    data: hadiah,
  };
}

async remove(id: number) {
  const hadiah = await this.prisma.hadiah.findUnique({
    where: { id },
    include: {
      penukaranPoin: true,
    },
  });

  if (!hadiah) {
    throw new NotFoundException(
      `Hadiah dengan ID ${id} tidak ditemukan`,
    );
  }

  if (hadiah.penukaranPoin.length > 0) {
    throw new BadRequestException(
      'Hadiah tidak dapat dihapus karena sudah digunakan dalam transaksi penukaran poin',
    );
  }

  await this.prisma.hadiah.delete({
    where: { id },
  });

  return {
    statusCode: 200,
    success: true,
    message: 'Hadiah berhasil dihapus',
    data: {
      id: hadiah.id,
      nama_hadiah: hadiah.nama_hadiah,
    },
  };
}
}