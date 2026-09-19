import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}

  async generate() {
    const kategoriCount = await this.prisma.kategoriSampah.count();
    const hadiahCount = await this.prisma.hadiah.count();

    const dataDibuat: string[] = [];

    // Tambahkan kategori dummy hanya jika tabel kategori masih kosong
    if (kategoriCount === 0) {
      await this.prisma.kategoriSampah.createMany({
        data: [
          {
            nama_kategori: 'Botol Plastik PET',
            harga_per_kg: 3500,
            poin_per_kg: 10,
            jenis: 'plastik',
          },
          {
            nama_kategori: 'Kertas Koran',
            harga_per_kg: 2000,
            poin_per_kg: 5,
            jenis: 'kertas',
          },
          {
            nama_kategori: 'Kaleng Aluminium',
            harga_per_kg: 8000,
            poin_per_kg: 20,
            jenis: 'logam',
          },
          {
            nama_kategori: 'Botol Kaca',
            harga_per_kg: 1500,
            poin_per_kg: 5,
            jenis: 'kaca',
          },
        ],
      });

      dataDibuat.push('kategori_sampah');
    }

    // Tambahkan hadiah dummy hanya jika tabel hadiah masih kosong
    if (hadiahCount === 0) {
      await this.prisma.hadiah.createMany({
        data: [
          {
            nama_hadiah: 'Voucher Belanja Rp10.000',
            poin_dibutuhkan: 50,
            stok: 20,
          },
          {
            nama_hadiah: 'Minyak Goreng 1 Liter',
            poin_dibutuhkan: 100,
            stok: 15,
          },
          {
            nama_hadiah: 'Tumbler ECOVA',
            poin_dibutuhkan: 150,
            stok: 10,
          },
        ],
      });

      dataDibuat.push('hadiah');
    }

    return {
      statusCode: 201,
      success: true,
      message:
        dataDibuat.length > 0
          ? 'Sample dummy data berhasil dibuat'
          : 'Data sudah tersedia, tidak ada dummy data baru yang dibuat',
      data: {
        data_dibuat: dataDibuat,
      },
    };
  }
}