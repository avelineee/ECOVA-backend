import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RekapitulasiService {
  constructor(private readonly prisma: PrismaService) {}

  async bulanan(bulan: string) {
    // =========================
    // VALIDASI BULAN
    // =========================
    if (!bulan || !/^\d{4}-\d{2}$/.test(bulan)) {
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

    // =========================
    // AMBIL SETORAN SELESAI
    // =========================
    const transaksi = await this.prisma.setorSampah.findMany({
      where: {
        status: 'selesai',
        tanggal: {
          gte: tanggalAwal,
          lt: tanggalAkhir,
        },
      },
      include: {
        detailSetor: {
          include: {
            kategoriSampah: true,
          },
        },
      },
    });

    // =========================
    // AMBIL PENUKARAN POIN
    // =========================
    const penukaran = await this.prisma.penukaranPoin.findMany({
      where: {
        tanggal: {
          gte: tanggalAwal,
          lt: tanggalAkhir,
        },
      },
    });

    // =========================
    // TOTAL REKAP
    // =========================
    let totalKg = 0;
    let totalPoinDiterbitkan = 0;
    let totalEstimasiPembayaranRupiah = 0;

    // =========================
    // BREAKDOWN JENIS SAMPAH
    // =========================
    const breakdownJenisSampah = {
      plastik: {
        tonaseKg: 0,
        rupiah: 0,
        poin: 0,
      },
      kertas: {
        tonaseKg: 0,
        rupiah: 0,
        poin: 0,
      },
      logam: {
        tonaseKg: 0,
        rupiah: 0,
        poin: 0,
      },
      kaca: {
        tonaseKg: 0,
        rupiah: 0,
        poin: 0,
      },
    };

    // =========================
    // HITUNG SETORAN
    // =========================
    for (const setor of transaksi) {
      for (const detail of setor.detailSetor) {
        const berat = detail.berat_kg;
        const poin = detail.subtotal_poin;

        const rupiah =
          berat * detail.kategoriSampah.harga_per_kg;

        totalKg += berat;
        totalPoinDiterbitkan += poin;
        totalEstimasiPembayaranRupiah += rupiah;

        const jenis = detail.kategoriSampah.jenis;

        breakdownJenisSampah[jenis].tonaseKg += berat;
        breakdownJenisSampah[jenis].rupiah += rupiah;
        breakdownJenisSampah[jenis].poin += poin;
      }
    }

    // =========================
    // HITUNG PENUKARAN POIN
    // =========================
    let totalPoinTerpakai = 0;

    for (const item of penukaran) {
      totalPoinTerpakai += item.poin_terpakai;
    }

    // =========================
    // RAPIIKAN ANGKA BREAKDOWN
    // =========================
    for (const jenis of Object.keys(
      breakdownJenisSampah,
    ) as Array<keyof typeof breakdownJenisSampah>) {
      breakdownJenisSampah[jenis].tonaseKg = Number(
        breakdownJenisSampah[jenis].tonaseKg.toFixed(2),
      );

      breakdownJenisSampah[jenis].rupiah = Number(
        breakdownJenisSampah[jenis].rupiah.toFixed(2),
      );

      breakdownJenisSampah[jenis].poin = Number(
        breakdownJenisSampah[jenis].poin.toFixed(2),
      );
    }

    // =========================
    // RESPONSE
    // =========================
    return {
      statusCode: 200,
      success: true,
      message: `Rekapitulasi Bank Sampah Bulan ${bulanAngka}/${tahun} berhasil diambil`,
      data: {
        periode: bulan,

        rekapitulasiTonase: {
          totalKg: Number(totalKg.toFixed(2)),

          totalTon: Number(
            (totalKg / 1000).toFixed(4),
          ),

          totalEstimasiPembayaranRupiah: Number(
            totalEstimasiPembayaranRupiah.toFixed(2),
          ),

          totalPoinDiterbitkan: Number(
            totalPoinDiterbitkan.toFixed(2),
          ),
        },

        breakdownJenisSampah,

        rekapitulasiPenukaranPoin: {
          totalTransaksiPenukaran: penukaran.length,

          totalPoinTerpakai: Number(
            totalPoinTerpakai.toFixed(2),
          ),
        },
      },
    };
  }
}