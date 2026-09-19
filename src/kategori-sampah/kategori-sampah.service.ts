import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKategoriSampahDto } from './dto/create-kategori-sampah.dto';
import { UpdateKategoriSampahDto } from './dto/update-kategori-sampah.dto';

@Injectable()
export class KategoriSampahService {
  constructor(private readonly prisma: PrismaService) { }

  async create(
    dto: CreateKategoriSampahDto,
    foto?: Express.Multer.File,
  ) {
    const kategori = await this.prisma.kategoriSampah.create({
      data: {
        nama_kategori: dto.nama_kategori,
        harga_per_kg: dto.harga_per_kg,
        poin_per_kg: dto.poin_per_kg,
        jenis: dto.jenis,
        foto: foto
          ? `/uploads/kategori/${foto.filename}`
          : dto.foto,
      }
    });
    return {
      statusCode: 201,
      success: true,
      message: 'Kategori sampah berhasil dibuat',
      data: kategori,
    };
  }

  async findAll() {
    const kategori = await this.prisma.kategoriSampah.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Data kategori sampah berhasil diambil',
      data: kategori,
    };
  }

  async findOne(id: number) {
    const kategori = await this.prisma.kategoriSampah.findUnique({
      where: { id },
    });

    if (!kategori) {
      throw new NotFoundException(
        `Kategori sampah dengan id ${id} tidak ditemukan`,
      );
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Detail kategori sampah berhasil diambil',
      data: kategori,
    };
  }

  async update(
    id: number,
    dto: UpdateKategoriSampahDto,
    foto?: Express.Multer.File,
  ) {
    const kategori = await this.prisma.kategoriSampah.findUnique({
      where: { id },
    });

    if (!kategori) {
      throw new NotFoundException(
        `Kategori sampah dengan id ${id} tidak ditemukan`,
      );
    }

    const updatedKategori = await this.prisma.kategoriSampah.update({
      where: { id },
      data: {
        ...(dto.nama_kategori !== undefined && {
          nama_kategori: dto.nama_kategori,
        }),
        ...(dto.harga_per_kg !== undefined && {
          harga_per_kg: dto.harga_per_kg,
        }),
        ...(dto.poin_per_kg !== undefined && {
          poin_per_kg: dto.poin_per_kg,
        }),
        ...(dto.jenis !== undefined && {
          jenis: dto.jenis,
        }),
        ...dto,
        ...(foto && {
          foto: `/uploads/kategori/${foto.filename}`,
        }),
      },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Kategori sampah berhasil diperbarui',
      data: updatedKategori,
    };
  }

  async remove(id: number) {
    const kategori = await this.prisma.kategoriSampah.findUnique({
      where: { id },
    });

    if (!kategori) {
      throw new NotFoundException(
        `Kategori sampah dengan id ${id} tidak ditemukan`,
      );
    }

    // Cek apakah kategori sudah digunakan dalam detail setoran
    const totalDetailSetor = await this.prisma.detailSetor.count({
      where: {
        id_kategori_sampah: id,
      },
    });

    if (totalDetailSetor > 0) {
      throw new BadRequestException(
        'Kategori sampah tidak dapat dihapus karena sudah digunakan dalam transaksi setoran',
      );
    }

    await this.prisma.kategoriSampah.delete({
      where: { id },
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Kategori sampah berhasil dihapus',
      data: {
        id: kategori.id,
        nama_kategori: kategori.nama_kategori,
      },
    };
  }
}

