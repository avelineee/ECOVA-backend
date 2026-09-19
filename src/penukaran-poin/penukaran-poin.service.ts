import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePenukaranPoinDto } from './dto/create-penukaran-poin.dto';
import { UpdateStatusPenukaranDto } from './dto/update-status-penukaran.dto';

@Injectable()
export class PenukaranPoinService {
  constructor(private readonly prisma: PrismaService) {}

  async tukar(userId: number, dto: CreatePenukaranPoinDto) {
    // 1. Cari nasabah berdasarkan user yang sedang login
    const nasabah = await this.prisma.nasabah.findUnique({
      where: {
        id_user: userId,
      },
    });

    if (!nasabah) {
      throw new NotFoundException('Data nasabah tidak ditemukan');
    }

    // 2. Cari hadiah
    const hadiah = await this.prisma.hadiah.findUnique({
      where: {
        id: dto.id_hadiah,
      },
    });

    if (!hadiah) {
      throw new NotFoundException('Hadiah tidak ditemukan');
    }

    // 3. Cek stok hadiah
    if (hadiah.stok <= 0) {
      throw new BadRequestException('Stok hadiah sudah habis');
    }

    // 4. Cek saldo poin
    if (nasabah.saldo_poin < hadiah.poin_dibutuhkan) {
      throw new BadRequestException(
        `Saldo poin tidak cukup. Dibutuhkan ${hadiah.poin_dibutuhkan} poin, saldo Anda ${nasabah.saldo_poin} poin`,
      );
    }

    // 5. Cari setoran SELESAI terbaru milik nasabah
    const setorTerakhir = await this.prisma.setorSampah.findFirst({
      where: {
        id_nasabah: nasabah.id,
        status: 'selesai',
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    if (!setorTerakhir) {
      throw new BadRequestException(
        'Penukaran tidak dapat dilakukan karena belum ada setoran yang selesai',
      );
    }

    // 6. Jalankan transaksi
    const hasil = await this.prisma.$transaction(async (tx) => {
      const penukaran = await tx.penukaranPoin.create({
        data: {
          tanggal: new Date(),
          id_setor: setorTerakhir.id,
          id_hadiah: hadiah.id,
          poin_terpakai: hadiah.poin_dibutuhkan,
          status: 'diproses',
        },
        include: {
          hadiah: true,
        },
      });

      const nasabahUpdate = await tx.nasabah.update({
        where: {
          id: nasabah.id,
        },
        data: {
          saldo_poin: {
            decrement: hadiah.poin_dibutuhkan,
          },
        },
      });

      await tx.hadiah.update({
        where: {
          id: hadiah.id,
        },
        data: {
          stok: {
            decrement: 1,
          },
        },
      });

      return {
        penukaran,
        sisa_saldo_poin: nasabahUpdate.saldo_poin,
      };
    });

    return {
      statusCode: 201,
      success: true,
      message: 'Penukaran poin berhasil diajukan',
      data: {
        id: hasil.penukaran.id,
        tanggal: hasil.penukaran.tanggal,
        id_hadiah: hasil.penukaran.id_hadiah,
        nama_hadiah: hasil.penukaran.hadiah.nama_hadiah,
        poin_terpakai: hasil.penukaran.poin_terpakai,
        sisa_saldo_poin: hasil.sisa_saldo_poin,
        status: hasil.penukaran.status,
      },
    };
  }

  async myPenukaran(userId: number) {
  const nasabah = await this.prisma.nasabah.findUnique({
    where: {
      id_user: userId,
    },
  });

  if (!nasabah) {
    throw new NotFoundException('Data nasabah tidak ditemukan');
  }

  const penukaran = await this.prisma.penukaranPoin.findMany({
    where: {
      setor: {
        id_nasabah: nasabah.id,
      },
    },
    include: {
      hadiah: true,
      setor: true,
    },
    orderBy: {
      tanggal: 'desc',
    },
  });

  return {
    statusCode: 200,
    success: true,
    message: 'Riwayat penukaran poin berhasil diambil',
    data: penukaran.map((item) => ({
      id: item.id,
      tanggal: item.tanggal,
      id_setor: item.id_setor,

      hadiah: {
        id: item.hadiah.id,
        nama_hadiah: item.hadiah.nama_hadiah,
        poin_dibutuhkan: item.hadiah.poin_dibutuhkan,
        foto: item.hadiah.foto,
      },

      poin_terpakai: item.poin_terpakai,
      status: item.status,
    })),
  };
}

async findAll(bulan?: string) {
  let tanggalFilter = {};

  if (bulan) {
    // Format wajib YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(bulan)) {
      throw new BadRequestException(
        'Format bulan harus YYYY-MM, contoh: 2026-09',
      );
    }

    const [tahun, bulanAngka] = bulan.split('-').map(Number);

    if (bulanAngka < 1 || bulanAngka > 12) {
      throw new BadRequestException(
        'Bulan harus antara 01 sampai 12',
      );
    }

    const tanggalAwal = new Date(
      Date.UTC(tahun, bulanAngka - 1, 1),
    );

    const tanggalAkhir = new Date(
      Date.UTC(tahun, bulanAngka, 1),
    );

    tanggalFilter = {
      gte: tanggalAwal,
      lt: tanggalAkhir,
    };
  }

  const penukaran = await this.prisma.penukaranPoin.findMany({
    where: bulan
      ? {
          tanggal: tanggalFilter,
        }
      : undefined,

    include: {
      hadiah: true,
      setor: {
        include: {
          nasabah: true,
        },
      },
    },

    orderBy: {
      tanggal: 'desc',
    },
  });

  return {
    statusCode: 200,
    success: true,
    message: 'Data penukaran poin berhasil diambil',
    data: penukaran.map((item) => ({
      id: item.id,
      tanggal: item.tanggal,

      nasabah: {
        id: item.setor.nasabah.id,
        nama_nasabah: item.setor.nasabah.nama_nasabah,
        telp: item.setor.nasabah.telp,
      },

      id_setor: item.id_setor,

      hadiah: {
        id: item.hadiah.id,
        nama_hadiah: item.hadiah.nama_hadiah,
        poin_dibutuhkan: item.hadiah.poin_dibutuhkan,
        foto: item.hadiah.foto,
      },

      poin_terpakai: item.poin_terpakai,
      status: item.status,
    })),
  };
}

async updateStatus(
  id: number,
  dto: UpdateStatusPenukaranDto,
) {
  const penukaran = await this.prisma.penukaranPoin.findUnique({
    where: {
      id,
    },
    include: {
      hadiah: true,
      setor: {
        include: {
          nasabah: true,
        },
      },
    },
  });

  if (!penukaran) {
    throw new NotFoundException(
      `Penukaran poin dengan ID ${id} tidak ditemukan`,
    );
  }

  // Transaksi yang sudah selesai tidak boleh diubah lagi
  if (penukaran.status === 'selesai') {
    throw new BadRequestException(
      'Penukaran poin sudah selesai dan tidak dapat diubah lagi',
    );
  }

  // Dari status diproses hanya boleh menjadi selesai
  if (dto.status !== 'selesai') {
    throw new BadRequestException(
      'Status penukaran hanya dapat diubah dari diproses menjadi selesai',
    );
  }

  const updated = await this.prisma.penukaranPoin.update({
    where: {
      id,
    },
    data: {
      status: dto.status,
    },
    include: {
      hadiah: true,
      setor: {
        include: {
          nasabah: true,
        },
      },
    },
  });

  return {
    statusCode: 200,
    success: true,
    message: 'Status penukaran poin berhasil diperbarui',
    data: {
      id: updated.id,
      tanggal: updated.tanggal,

      nasabah: {
        id: updated.setor.nasabah.id,
        nama_nasabah: updated.setor.nasabah.nama_nasabah,
      },

      hadiah: {
        id: updated.hadiah.id,
        nama_hadiah: updated.hadiah.nama_hadiah,
      },

      poin_terpakai: updated.poin_terpakai,
      status: updated.status,
    },
  };
}

async nota(id: number, userId: number, role: string) {
  const penukaran = await this.prisma.penukaranPoin.findUnique({
    where: {
      id,
    },
    include: {
      hadiah: true,
      setor: {
        include: {
          nasabah: true,
          admin: true,
        },
      },
    },
  });

  if (!penukaran) {
    throw new NotFoundException(
      `Penukaran poin dengan ID ${id} tidak ditemukan`,
    );
  }

  // Jika yang mengakses NASABAH,
  // pastikan transaksi tersebut memang miliknya
  if (
    role === 'nasabah' &&
    penukaran.setor.nasabah.id_user !== userId
  ) {
    throw new BadRequestException(
      'Anda tidak memiliki akses ke nota penukaran ini',
    );
  }

  return {
    statusCode: 200,
    success: true,
    message: 'Nota penukaran poin berhasil diambil',
    data: {
      id_penukaran: penukaran.id,
      tanggal: penukaran.tanggal,
      status: penukaran.status,

      nasabah: {
        id: penukaran.setor.nasabah.id,
        nama_nasabah:
          penukaran.setor.nasabah.nama_nasabah,
        telp: penukaran.setor.nasabah.telp,
        alamat: penukaran.setor.nasabah.alamat,
      },

      hadiah: {
        id: penukaran.hadiah.id,
        nama_hadiah: penukaran.hadiah.nama_hadiah,
        poin_dibutuhkan:
          penukaran.hadiah.poin_dibutuhkan,
        foto: penukaran.hadiah.foto,
      },

      poin_terpakai: penukaran.poin_terpakai,

      bank_sampah: penukaran.setor.admin
        ? {
            nama_unit:
              penukaran.setor.admin.nama_unit,
            nama_pengelola:
              penukaran.setor.admin.nama_pengelola,
            telp: penukaran.setor.admin.telp,
            alamat: penukaran.setor.admin.alamat,
          }
        : null,
    },
  };
}
}