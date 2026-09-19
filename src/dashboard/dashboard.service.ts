import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

 async summaryNasabah(userId: number) {
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

  // =========================
  // SETORAN SELESAI NASABAH
  // =========================
  const setorSelesai =
    await this.prisma.setorSampah.findMany({
      where: {
        id_nasabah: nasabah.id,
        status: 'selesai',
      },
      include: {
        detailSetor: true,
      },
    });

  // =========================
  // TOTAL POIN DIDAPAT
  // =========================
  const totalPemasukan = setorSelesai.reduce(
    (totalSetor, setor) =>
      totalSetor +
      setor.detailSetor.reduce(
        (totalDetail, detail) =>
          totalDetail + detail.subtotal_poin,
        0,
      ),
    0,
  );

  // =========================
  // TOTAL SAMPAH DISETOR
  // =========================
  const totalSampahDisetorKg = setorSelesai.reduce(
    (totalSetor, setor) =>
      totalSetor +
      setor.detailSetor.reduce(
        (totalDetail, detail) =>
          totalDetail + detail.berat_kg,
        0,
      ),
    0,
  );

  // =========================
  // PENUKARAN NASABAH
  // =========================
  const penukaran =
    await this.prisma.penukaranPoin.findMany({
      where: {
        setor: {
          id_nasabah: nasabah.id,
        },
      },
      include: {
        hadiah: true,
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

  // =========================
  // TOTAL POIN DIGUNAKAN
  // =========================
  const totalPengeluaran = penukaran.reduce(
    (total, item) =>
      total + item.poin_terpakai,
    0,
  );

  // =========================
  // SETORAN TERAKHIR
  // =========================
  const setorTerakhir =
    await this.prisma.setorSampah.findFirst({
      where: {
        id_nasabah: nasabah.id,
      },
      include: {
        detailSetor: true,
      },
      orderBy: {
        tanggal: 'desc',
      },
    });

  let beratSetorTerakhir = 0;
  let poinSetorTerakhir = 0;

  if (setorTerakhir) {
    beratSetorTerakhir =
      setorTerakhir.detailSetor.reduce(
        (total, detail) =>
          total + detail.berat_kg,
        0,
      );

    poinSetorTerakhir =
      setorTerakhir.detailSetor.reduce(
        (total, detail) =>
          total + detail.subtotal_poin,
        0,
      );
  }

  // =========================
  // PENUKARAN TERAKHIR
  // =========================
  const penukaranTerakhir =
    penukaran[0] ?? null;

  // =========================
  // RESPONSE
  // =========================
  return {
    statusCode: 200,
    success: true,
    message:
      'Summary dashboard nasabah berhasil diambil',

    data: {
      saldo_poin: Number(
        nasabah.saldo_poin.toFixed(2),
      ),

      total_sampah_disetor_kg: Number(
        totalSampahDisetorKg.toFixed(2),
      ),

      pemasukan_poin: Number(
        totalPemasukan.toFixed(2),
      ),

      pengeluaran_poin: Number(
        totalPengeluaran.toFixed(2),
      ),

      transaksi_terakhir: {
        setor: setorTerakhir
          ? {
              id: setorTerakhir.id,
              tanggal: setorTerakhir.tanggal,
              berat_kg: Number(
                beratSetorTerakhir.toFixed(2),
              ),
              poin: Number(
                poinSetorTerakhir.toFixed(2),
              ),
              status: setorTerakhir.status,
            }
          : null,

        penukaran: penukaranTerakhir
          ? {
              id: penukaranTerakhir.id,
              tanggal:
                penukaranTerakhir.tanggal,
              nama_hadiah:
                penukaranTerakhir.hadiah
                  .nama_hadiah,
              poin_terpakai:
                penukaranTerakhir.poin_terpakai,
              status:
                penukaranTerakhir.status,
            }
          : null,
      },
    },
  };
}


  async statsAdmin() {
  // =========================
  // TOTAL NASABAH
  // =========================
  const totalNasabah = await this.prisma.nasabah.count();

  // =========================
  // TOTAL KATEGORI SAMPAH
  // =========================
  const totalKategoriSampah =
    await this.prisma.kategoriSampah.count();

  // =========================
  // TOTAL HADIAH
  // =========================
  const totalHadiah = await this.prisma.hadiah.count();

  // =========================
  // TOTAL SALDO POIN SAAT INI
  // =========================
  const nasabahList = await this.prisma.nasabah.findMany({
    select: {
      saldo_poin: true,
    },
  });

  const totalSaldoPoin = nasabahList.reduce(
    (total, item) => total + item.saldo_poin,
    0,
  );

  // =========================
  // SETORAN SELESAI
  // =========================
  const setorSelesai = await this.prisma.setorSampah.findMany({
    where: {
      status: 'selesai',
    },
    include: {
      detailSetor: true,
    },
  });

  // =========================
  // TOTAL BERAT SAMPAH
  // =========================
  const totalBeratKg = setorSelesai.reduce(
    (totalSetor, setor) =>
      totalSetor +
      setor.detailSetor.reduce(
        (totalDetail, detail) =>
          totalDetail + detail.berat_kg,
        0,
      ),
    0,
  );

  // =========================
  // TOTAL POIN DITERBITKAN
  // =========================
  const totalPoinTersalurkan = setorSelesai.reduce(
    (totalSetor, setor) =>
      totalSetor +
      setor.detailSetor.reduce(
        (totalDetail, detail) =>
          totalDetail + detail.subtotal_poin,
        0,
      ),
    0,
  );

  // =========================
  // TOTAL TRANSAKSI
  // =========================
  const totalTransaksiSetor =
    await this.prisma.setorSampah.count();

  const totalTransaksiPenukaran =
    await this.prisma.penukaranPoin.count();

  // =========================
  // RESPONSE
  // =========================
  return {
    statusCode: 200,
    success: true,
    message: 'Statistik dashboard admin berhasil diambil',
    data: {
      total_nasabah: totalNasabah,

      total_kategori_sampah: totalKategoriSampah,

      total_hadiah: totalHadiah,

      total_transaksi_setor: totalTransaksiSetor,

      total_transaksi_penukaran:
        totalTransaksiPenukaran,

      total_sampah_kg: Number(
        totalBeratKg.toFixed(2),
      ),

      total_sampah_ton: Number(
        (totalBeratKg / 1000).toFixed(4),
      ),

      total_saldo_poin: Number(
        totalSaldoPoin.toFixed(2),
      ),

      total_poin_tersalurkan: Number(
        totalPoinTersalurkan.toFixed(2),
      ),
    },
  };
}

async publicStats() {
  const [
    totalNasabah,
    totalKategoriSampah,
    totalTransaksiSetor,
    setorSelesai,
  ] = await Promise.all([
    this.prisma.nasabah.count(),

    this.prisma.kategoriSampah.count(),

    this.prisma.setorSampah.count({
      where: {
        status: 'selesai',
      },
    }),

    this.prisma.setorSampah.findMany({
      where: {
        status: 'selesai',
      },
      include: {
        detailSetor: true,
      },
    }),
  ]);

  const totalSampahKg = setorSelesai.reduce(
    (total, setor) =>
      total +
      setor.detailSetor.reduce(
        (subtotal, detail) => subtotal + detail.berat_kg,
        0,
      ),
    0,
  );

  return {
    statusCode: 200,
    success: true,
    message: 'Statistik publik ECOVA berhasil diambil',
    data: {
      total_nasabah: totalNasabah,
      total_sampah_kg: totalSampahKg,
      total_transaksi_setor: totalTransaksiSetor,
      total_kategori_sampah: totalKategoriSampah,
    },
  };
}
}