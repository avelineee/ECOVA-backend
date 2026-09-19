import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSetorSampahDto } from './dto/create-setor-sampah.dto';
import {
  StatusSetor,
  Role,
  MetodeSetor,
  StatusPenjemputan,
} from '../generated/prisma/enums';
import { VerifySetorSampahDto } from './dto/verify-setor-sampah.dto';
import { FilterSetorSampahDto } from './dto/filter-setor-sampah.dto';
import { UpdateStatusPenjemputanDto } from './dto/update-status-penjemputan.dto';


@Injectable()
export class SetorSampahService {
  constructor(private readonly prisma: PrismaService) { }

  async create(userId: number, dto: CreateSetorSampahDto) {
    // =========================
    // 1. CARI NASABAH
    // =========================

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

    // Jika tidak dikirim, default ke antar
    const metodeSetor =
      dto.metode_setor ?? MetodeSetor.antar;

    // =========================
    // 2. VALIDASI METODE JEMPUT
    // =========================

    let jadwalPenjemputan: any = null;

    if (metodeSetor === MetodeSetor.jemput) {
      if (!dto.id_jadwal) {
        throw new BadRequestException(
          'Jadwal penjemputan wajib dipilih untuk metode jemput',
        );
      }

      if (
        !dto.alamat_penjemputan ||
        dto.alamat_penjemputan.trim() === ''
      ) {
        throw new BadRequestException(
          'Alamat penjemputan wajib diisi untuk metode jemput',
        );
      }

      jadwalPenjemputan =
        await this.prisma.jadwalPenjemputan.findUnique({
          where: {
            id: dto.id_jadwal,
          },
        });

      if (!jadwalPenjemputan) {
        throw new NotFoundException(
          `Jadwal penjemputan dengan ID ${dto.id_jadwal} tidak ditemukan`,
        );
      }

      if (!jadwalPenjemputan.is_active) {
        throw new BadRequestException(
          'Jadwal penjemputan yang dipilih sudah tidak aktif',
        );
      }

      // Cegah memilih jadwal tanggal lampau
      const tanggalJadwal = new Date(
        jadwalPenjemputan.tanggal,
      );

      const hariIni = new Date();

      tanggalJadwal.setHours(0, 0, 0, 0);
      hariIni.setHours(0, 0, 0, 0);

      if (tanggalJadwal < hariIni) {
        throw new BadRequestException(
          'Jadwal penjemputan yang dipilih sudah lewat',
        );
      }
    }

    // =========================
    // 3. CEGAH KATEGORI DUPLIKAT
    // =========================

    const kategoriIds = dto.items.map(
      (item) => item.id_kategori_sampah,
    );

    const uniqueKategoriIds = [
      ...new Set(kategoriIds),
    ];

    if (
      uniqueKategoriIds.length !==
      kategoriIds.length
    ) {
      throw new BadRequestException(
        'Kategori sampah tidak boleh duplikat dalam satu pengajuan',
      );
    }

    // =========================
    // 4. AMBIL KATEGORI
    // =========================

    const kategoriSampah =
      await this.prisma.kategoriSampah.findMany({
        where: {
          id: {
            in: uniqueKategoriIds,
          },
        },
      });

    if (
      kategoriSampah.length !==
      uniqueKategoriIds.length
    ) {
      throw new BadRequestException(
        'Terdapat kategori sampah yang tidak ditemukan',
      );
    }

    // =========================
    // 5. BUAT DETAIL SETOR
    // =========================

    const details = dto.items.map((item) => {
      const kategori = kategoriSampah.find(
        (data) =>
          data.id === item.id_kategori_sampah,
      );

      if (!kategori) {
        throw new BadRequestException(
          `Kategori sampah dengan ID ${item.id_kategori_sampah} tidak ditemukan`,
        );
      }

      const subtotalPoin =
        item.berat_kg * kategori.poin_per_kg;

      return {
        id_kategori_sampah:
          item.id_kategori_sampah,

        berat_kg: item.berat_kg,

        subtotal_poin: subtotalPoin,
      };
    });

    // =========================
    // 6. SIMPAN TRANSAKSI
    // =========================

    const setor = await this.prisma.$transaction(
      async (tx) => {
        // Buat setor sampah
        const createdSetor =
          await tx.setorSampah.create({
            data: {
              tanggal: new Date(),

              id_admin: null,

              id_nasabah: nasabah.id,

              status:
                StatusSetor.belum_dikonfirmasi,

              metode_setor: metodeSetor,

              detailSetor: {
                create: details,
              },
            },
          });

        // Kalau JEMPUT, buat data penjemputan
        if (
          metodeSetor === MetodeSetor.jemput
        ) {
          await tx.penjemputan.create({
            data: {
              id_setor: createdSetor.id,

              id_jadwal: dto.id_jadwal!,

              alamat_penjemputan:
                dto.alamat_penjemputan!.trim(),

              status:
                StatusPenjemputan.menunggu,
            },
          });
        }

        // Ambil kembali data lengkap
        return tx.setorSampah.findUnique({
          where: {
            id: createdSetor.id,
          },

          include: {
            detailSetor: {
              include: {
                kategoriSampah: true,
              },
            },

            penjemputan: {
              include: {
                jadwal: true,
              },
            },
          },
        });
      },
    );

    if (!setor) {
      throw new NotFoundException(
        'Data setoran gagal dibuat',
      );
    }

    // =========================
    // 7. HITUNG ESTIMASI POIN
    // =========================

    const totalPoin =
      setor.detailSetor.reduce(
        (total, detail) =>
          total + detail.subtotal_poin,
        0,
      );

    // =========================
    // 8. RESPONSE
    // =========================

    return {
      statusCode: 201,
      success: true,
      message:
        metodeSetor === MetodeSetor.jemput
          ? 'Pengajuan setor sampah dengan penjemputan berhasil dibuat'
          : 'Pengajuan setor sampah berhasil dibuat',

      data: {
        id: setor.id,
        tanggal: setor.tanggal,
        id_nasabah: setor.id_nasabah,
        status: setor.status,

        metode_setor: setor.metode_setor,

        total_poin: totalPoin,

        penjemputan: setor.penjemputan
          ? {
            id: setor.penjemputan.id,

            alamat_penjemputan:
              setor.penjemputan
                .alamat_penjemputan,

            status:
              setor.penjemputan.status,

            jadwal: {
              id:
                setor.penjemputan.jadwal.id,

              tanggal:
                setor.penjemputan.jadwal
                  .tanggal,

              jam_mulai:
                setor.penjemputan.jadwal
                  .jam_mulai,

              jam_selesai:
                setor.penjemputan.jadwal
                  .jam_selesai,
            },
          }
          : null,

        detail_setor:
          setor.detailSetor.map(
            (detail) => ({
              id: detail.id,

              id_kategori_sampah:
                detail.id_kategori_sampah,

              nama_kategori:
                detail.kategoriSampah
                  .nama_kategori,

              jenis:
                detail.kategoriSampah.jenis,

              berat_kg:
                detail.berat_kg,

              poin_per_kg:
                detail.kategoriSampah
                  .poin_per_kg,

              subtotal_poin:
                detail.subtotal_poin,
            }),
          ),
      },
    };
  }


  async findMySetor(
    userId: number,
    query: FilterSetorSampahDto,
  ) {
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

    const where: any = {
      id_nasabah: nasabah.id,
    };

    // Filter status
    if (query.status) {
      where.status = query.status;
    }

    // Filter bulan
    if (query.bulan) {
      const [tahun, bulan] = query.bulan
        .split('-')
        .map(Number);

      const startDate = new Date(
        Date.UTC(tahun, bulan - 1, 1),
      );

      const endDate = new Date(
        Date.UTC(tahun, bulan, 1),
      );

      where.tanggal = {
        gte: startDate,
        lt: endDate,
      };
    }

    const setoran = await this.prisma.setorSampah.findMany({
      where,
      include: {
        detailSetor: {
          include: {
            kategoriSampah: true,
          },
        },
        penjemputan: {
          include: {
            jadwal: true,
          },
        },

      },
      orderBy: {
        tanggal: 'desc',
      },
    });

    const data = setoran.map((setor) => {
      const totalPoin = setor.detailSetor.reduce(
        (total, detail) =>
          total + detail.subtotal_poin,
        0,
      );

      const totalBerat = setor.detailSetor.reduce(
        (total, detail) =>
          total + detail.berat_kg,
        0,
      );

      return {
        id: setor.id,
        tanggal: setor.tanggal,
        status: setor.status,

        metode_setor: setor.metode_setor,

        total_berat_kg: totalBerat,
        total_poin: totalPoin,

        penjemputan: setor.penjemputan
          ? {
            id: setor.penjemputan.id,

            alamat_penjemputan:
              setor.penjemputan.alamat_penjemputan,

            status: setor.penjemputan.status,

            jadwal: {
              id: setor.penjemputan.jadwal.id,
              tanggal: setor.penjemputan.jadwal.tanggal,
              jam_mulai: setor.penjemputan.jadwal.jam_mulai,
              jam_selesai: setor.penjemputan.jadwal.jam_selesai,
            },
          }
          : null,

        detail_setor: setor.detailSetor.map(
          (detail) => ({
            id: detail.id,
            id_kategori_sampah:
              detail.id_kategori_sampah,
            nama_kategori:
              detail.kategoriSampah.nama_kategori,
            jenis:
              detail.kategoriSampah.jenis,
            berat_kg: detail.berat_kg,
            poin_per_kg:
              detail.kategoriSampah.poin_per_kg,
            subtotal_poin:
              detail.subtotal_poin,
          }),
        ),
      };
    });

    return {
      statusCode: 200,
      success: true,
      message:
        'Riwayat setor sampah berhasil diambil',
      data,
    };
  }
  async findAll(query: FilterSetorSampahDto) {
    // Membuat filter berdasarkan query
    const where: any = {};

    // Filter berdasarkan status
    if (query.status) {
      where.status = query.status;
    }

    // Filter berdasarkan bulan
    if (query.bulan) {
      const [tahun, bulan] = query.bulan
        .split('-')
        .map(Number);

      const startDate = new Date(
        Date.UTC(tahun, bulan - 1, 1),
      );

      const endDate = new Date(
        Date.UTC(tahun, bulan, 1),
      );

      where.tanggal = {
        gte: startDate,
        lt: endDate,
      };
    }

    // Ambil data setoran sesuai filter
    const setoran = await this.prisma.setorSampah.findMany({
      where,

      include: {
        nasabah: true,

        detailSetor: {
          include: {
            kategoriSampah: true,
          },
        },

        penjemputan: {
          include: {
            jadwal: true,
          },
        },
      },

      orderBy: {
        tanggal: 'desc',
      },
    });

    // Hitung total berat dan total poin
    const data = setoran.map((setor) => {
      const totalBerat = setor.detailSetor.reduce(
        (total, detail) => total + detail.berat_kg,
        0,
      );

      const totalPoin = setor.detailSetor.reduce(
        (total, detail) => total + detail.subtotal_poin,
        0,
      );

      return {
        id: setor.id,
        tanggal: setor.tanggal,
        status: setor.status,

        metode_setor: setor.metode_setor,

        nasabah: {
          id: setor.nasabah.id,
          nama_nasabah: setor.nasabah.nama_nasabah,
          alamat: setor.nasabah.alamat,
          telp: setor.nasabah.telp,
        },

        total_berat_kg: totalBerat,
        total_poin: totalPoin,

        penjemputan: setor.penjemputan
          ? {
            id: setor.penjemputan.id,
            alamat_penjemputan:
              setor.penjemputan.alamat_penjemputan,
            status: setor.penjemputan.status,

            jadwal: {
              id: setor.penjemputan.jadwal.id,
              tanggal: setor.penjemputan.jadwal.tanggal,
              jam_mulai: setor.penjemputan.jadwal.jam_mulai,
              jam_selesai: setor.penjemputan.jadwal.jam_selesai,
            },
          }
          : null,

        detail_setor: setor.detailSetor.map((detail) => ({
          id: detail.id,
          id_kategori_sampah:
            detail.id_kategori_sampah,
          nama_kategori:
            detail.kategoriSampah.nama_kategori,
          jenis:
            detail.kategoriSampah.jenis,
          berat_kg:
            detail.berat_kg,
          poin_per_kg:
            detail.kategoriSampah.poin_per_kg,
          subtotal_poin:
            detail.subtotal_poin,
        })),
      };
    });

    return {
      statusCode: 200,
      success: true,
      message: 'Data pengajuan setor sampah berhasil diambil',
      data,
    };
  }

  async updateStatus(
    id: number,
    userId: number,
    dto: VerifySetorSampahDto,
  ) {
    // Status yang boleh dipilih admin
    const allowedStatus: StatusSetor[] = [
      StatusSetor.diproses,
      StatusSetor.selesai,
      StatusSetor.ditolak,
    ];

    if (!allowedStatus.includes(dto.status)) {
      throw new BadRequestException(
        'Status hanya boleh diproses, selesai, atau ditolak',
      );
    }

    // Cari admin berdasarkan JWT
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

    // Cari setoran
    const setor = await this.prisma.setorSampah.findUnique({
      where: {
        id,
      },
      include: {
        detailSetor: true,
      },
    });

    if (!setor) {
      throw new NotFoundException(
        `Setoran dengan ID ${id} tidak ditemukan`,
      );
    }

    // Kalau sudah final, tidak boleh diproses ulang
    if (
      setor.status === StatusSetor.selesai ||
      setor.status === StatusSetor.ditolak
    ) {
      throw new BadRequestException(
        'Setoran ini sudah selesai atau ditolak dan tidak dapat diubah lagi',
      );
    }

    // =========================
    // STATUS DIPROSES
    // =========================

    if (dto.status === StatusSetor.diproses) {
      const updated = await this.prisma.setorSampah.update({
        where: {
          id,
        },
        data: {
          status: StatusSetor.diproses,
          id_admin: admin.id,
        },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Setoran sedang diproses',
        data: {
          id: updated.id,
          tanggal: updated.tanggal,
          id_nasabah: updated.id_nasabah,
          status: updated.status,
        },
      };
    }

    // =========================
    // STATUS DITOLAK
    // =========================

    if (dto.status === StatusSetor.ditolak) {
      const updated = await this.prisma.setorSampah.update({
        where: {
          id,
        },
        data: {
          status: StatusSetor.ditolak,
          id_admin: admin.id,
        },
      });

      return {
        statusCode: 200,
        success: true,
        message: 'Setoran berhasil ditolak',
        data: {
          id: updated.id,
          tanggal: updated.tanggal,
          id_nasabah: updated.id_nasabah,
          status: updated.status,
        },
      };
    }

    // =========================
    // STATUS SELESAI
    // =========================

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException(
        'Data hasil timbang wajib diisi untuk menyelesaikan setoran',
      );
    }

    const kategoriIds = dto.items.map(
      (item) => item.id_kategori_sampah,
    );

    // Cegah kategori duplikat
    if (new Set(kategoriIds).size !== kategoriIds.length) {
      throw new BadRequestException(
        'Kategori sampah tidak boleh duplikat',
      );
    }

    // Items harus sesuai dengan kategori pada pengajuan
    const detailKategoriIds = setor.detailSetor.map(
      (detail) => detail.id_kategori_sampah,
    );

    if (
      dto.items.length !== detailKategoriIds.length ||
      dto.items.some(
        (item) =>
          !detailKategoriIds.includes(
            item.id_kategori_sampah,
          ),
      )
    ) {
      throw new BadRequestException(
        'Data hasil timbang harus sesuai dengan kategori pada pengajuan',
      );
    }

    // Jalankan semua proses selesai dalam transaction
    return this.prisma.$transaction(async (tx) => {
      const kategori = await tx.kategoriSampah.findMany({
        where: {
          id: {
            in: kategoriIds,
          },
        },
      });

      if (kategori.length !== kategoriIds.length) {
        throw new BadRequestException(
          'Terdapat kategori sampah yang tidak ditemukan',
        );
      }

      let totalPoin = 0;

      for (const item of dto.items!) {
        const dataKategori = kategori.find(
          (k) => k.id === item.id_kategori_sampah,
        );

        if (!dataKategori) {
          throw new BadRequestException(
            `Kategori dengan ID ${item.id_kategori_sampah} tidak ditemukan`,
          );
        }

        const subtotalPoin =
          item.berat_kg * dataKategori.poin_per_kg;

        totalPoin += subtotalPoin;

        await tx.detailSetor.updateMany({
          where: {
            id_setor: setor.id,
            id_kategori_sampah:
              item.id_kategori_sampah,
          },
          data: {
            berat_kg: item.berat_kg,
            subtotal_poin: subtotalPoin,
          },
        });
      }

      // Tambahkan saldo poin nasabah
      const updatedNasabah = await tx.nasabah.update({
        where: {
          id: setor.id_nasabah,
        },
        data: {
          saldo_poin: {
            increment: totalPoin,
          },
        },
      });

      // Update status dan admin yang memverifikasi
      const updatedSetor = await tx.setorSampah.update({
        where: {
          id: setor.id,
        },
        data: {
          status: StatusSetor.selesai,
          id_admin: admin.id,
        },
        include: {
          detailSetor: {
            include: {
              kategoriSampah: true,
            },
          },
        },
      });

      return {
        statusCode: 200,
        success: true,
        message:
          'Setoran berhasil diselesaikan dan poin telah ditambahkan',
        data: {
          id: updatedSetor.id,
          tanggal: updatedSetor.tanggal,
          id_nasabah: updatedSetor.id_nasabah,
          status: updatedSetor.status,
          total_poin: totalPoin,
          saldo_poin: updatedNasabah.saldo_poin,

          detail_setor: updatedSetor.detailSetor.map(
            (detail) => ({
              id: detail.id,
              id_kategori_sampah:
                detail.id_kategori_sampah,
              nama_kategori:
                detail.kategoriSampah.nama_kategori,
              berat_kg: detail.berat_kg,
              poin_per_kg:
                detail.kategoriSampah.poin_per_kg,
              subtotal_poin: detail.subtotal_poin,
            }),
          ),
        },
      };
    });
  }

  async updateStatusPenjemputan(
  id: number,
  dto: UpdateStatusPenjemputanDto,
) {
  // 1. Cari setoran beserta data penjemputannya
  const setor = await this.prisma.setorSampah.findUnique({
    where: {
      id,
    },
    include: {
      penjemputan: true,
    },
  });

  if (!setor) {
    throw new NotFoundException(
      `Setoran dengan ID ${id} tidak ditemukan`,
    );
  }

  // 2. Pastikan metode setoran memang jemput
  if (setor.metode_setor !== MetodeSetor.jemput) {
    throw new BadRequestException(
      'Status penjemputan hanya dapat diubah untuk setoran dengan metode jemput',
    );
  }

  // 3. Pastikan data penjemputan tersedia
  if (!setor.penjemputan) {
    throw new NotFoundException(
      'Data penjemputan untuk setoran ini tidak ditemukan',
    );
  }

  // 4. Validasi urutan perubahan status
  const urutanStatus: StatusPenjemputan[] = [
    StatusPenjemputan.menunggu,
    StatusPenjemputan.menuju_lokasi,
    StatusPenjemputan.sudah_diambil,
    StatusPenjemputan.selesai,
  ];

  const statusSekarangIndex = urutanStatus.indexOf(
    setor.penjemputan.status,
  );

  const statusBaruIndex = urutanStatus.indexOf(
    dto.status,
  );

  if (statusBaruIndex === -1) {
    throw new BadRequestException(
      'Status penjemputan tidak valid',
    );
  }

  // Tidak boleh mundur status
  if (statusBaruIndex < statusSekarangIndex) {
    throw new BadRequestException(
      'Status penjemputan tidak dapat dikembalikan ke tahap sebelumnya',
    );
  }

  // Tidak boleh melompati tahap
  if (statusBaruIndex > statusSekarangIndex + 1) {
    throw new BadRequestException(
      'Status penjemputan harus diperbarui secara berurutan',
    );
  }

  // Kalau status sama, tidak perlu update
  if (statusBaruIndex === statusSekarangIndex) {
    throw new BadRequestException(
      `Status penjemputan sudah ${dto.status}`,
    );
  }

  // 5. Update status penjemputan
  const updated = await this.prisma.penjemputan.update({
    where: {
      id: setor.penjemputan.id,
    },
    data: {
      status: dto.status,
    },
    include: {
      jadwal: true,
      setor: true,
    },
  });

  return {
    statusCode: 200,
    success: true,
    message: `Status penjemputan berhasil diubah menjadi ${updated.status}`,
    data: {
      id: updated.id,
      id_setor: updated.id_setor,
      alamat_penjemputan:
        updated.alamat_penjemputan,
      status: updated.status,

      jadwal: {
        id: updated.jadwal.id,
        tanggal: updated.jadwal.tanggal,
        jam_mulai: updated.jadwal.jam_mulai,
        jam_selesai: updated.jadwal.jam_selesai,
      },

      setor: {
        id: updated.setor.id,
        status: updated.setor.status,
        metode_setor: updated.setor.metode_setor,
      },
    },
  };
}

  async findOne(
    id: number,
    userId: number,
    role: Role,
  ) {
    const setor = await this.prisma.setorSampah.findUnique({
      where: {
        id,
      },
      include: {
        nasabah: true,
        admin: true,

        detailSetor: {
          include: {
            kategoriSampah: true,
          },
        },

        penjemputan: {
          include: {
            jadwal: true,
          },
        },
      },
    });

    if (!setor) {
      throw new NotFoundException(
        `Setoran dengan ID ${id} tidak ditemukan`,
      );
    }

    // Kalau yang login NASABAH,
    // pastikan setoran memang miliknya sendiri
    if (role === Role.nasabah) {
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

      if (setor.id_nasabah !== nasabah.id) {
        throw new ForbiddenException(
          'Anda tidak memiliki akses ke setoran ini',
        );
      }
    }

    const totalBerat = setor.detailSetor.reduce(
      (total, detail) => total + detail.berat_kg,
      0,
    );

    const totalPoin = setor.detailSetor.reduce(
      (total, detail) => total + detail.subtotal_poin,
      0,
    );

    return {
      statusCode: 200,
      success: true,
      message: 'Detail setor sampah berhasil diambil',
      data: {
        id: setor.id,
        tanggal: setor.tanggal,
        status: setor.status,

        metode_setor: setor.metode_setor,

        penjemputan: setor.penjemputan
          ? {
            id: setor.penjemputan.id,
            alamat_penjemputan:
              setor.penjemputan.alamat_penjemputan,
            status: setor.penjemputan.status,

            jadwal: {
              id: setor.penjemputan.jadwal.id,
              tanggal: setor.penjemputan.jadwal.tanggal,
              jam_mulai: setor.penjemputan.jadwal.jam_mulai,
              jam_selesai: setor.penjemputan.jadwal.jam_selesai,
            },
          }
          : null,

        nasabah: {
          id: setor.nasabah.id,
          nama_nasabah: setor.nasabah.nama_nasabah,
          alamat: setor.nasabah.alamat,
          telp: setor.nasabah.telp,
        },

        total_berat_kg: totalBerat,
        total_poin: totalPoin,

        ...(role === Role.admin_bank && {
          admin_verifikator: setor.admin
            ? {
              id: setor.admin.id,
              nama_pengelola:
                setor.admin.nama_pengelola,
              nama_unit:
                setor.admin.nama_unit,
            }
            : null,
        }),

        detail_setor: setor.detailSetor.map(
          (detail) => ({
            id: detail.id,
            id_kategori_sampah:
              detail.id_kategori_sampah,
            nama_kategori:
              detail.kategoriSampah.nama_kategori,
            jenis: detail.kategoriSampah.jenis,
            berat_kg: detail.berat_kg,
            poin_per_kg:
              detail.kategoriSampah.poin_per_kg,
            subtotal_poin: detail.subtotal_poin,
          }),
        ),
      },
    };
  }

  async nota(id: number, userId: number, role: string) {
    const setor = await this.prisma.setorSampah.findUnique({
      where: { id },
      include: {
        nasabah: true,
        admin: true,

        detailSetor: {
          include: {
            kategoriSampah: true,
          },
        },

        penjemputan: {
          include: {
            jadwal: true,
          },
        },
      },
    });

    if (!setor) {
      throw new NotFoundException(
        `Setoran dengan ID ${id} tidak ditemukan`,
      );
    }

    // Nasabah hanya boleh melihat nota miliknya sendiri
    if (
      role === 'nasabah' &&
      setor.nasabah.id_user !== userId
    ) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses ke nota setoran ini',
      );
    }

    const totalBeratKg = setor.detailSetor.reduce(
      (total, detail) => total + detail.berat_kg,
      0,
    );

    const totalPoin = setor.detailSetor.reduce(
      (total, detail) => total + detail.subtotal_poin,
      0,
    );

    return {
      statusCode: 200,
      success: true,
      message: 'Nota penyetoran berhasil diambil',
      data: {
        id_setor: setor.id,
        tanggal: setor.tanggal,
        status: setor.status,

        metode_setor: setor.metode_setor,

        penjemputan: setor.penjemputan
          ? {
            alamat_penjemputan:
              setor.penjemputan.alamat_penjemputan,

            status:
              setor.penjemputan.status,

            jadwal: {
              tanggal:
                setor.penjemputan.jadwal.tanggal,

              jam_mulai:
                setor.penjemputan.jadwal.jam_mulai,

              jam_selesai:
                setor.penjemputan.jadwal.jam_selesai,
            },
          }
          : null,

        nasabah: {
          id: setor.nasabah.id,
          nama_nasabah: setor.nasabah.nama_nasabah,
          telp: setor.nasabah.telp,
          alamat: setor.nasabah.alamat,
        },

        detail_sampah: setor.detailSetor.map((detail) => ({
          id_kategori: detail.kategoriSampah.id,
          nama_kategori:
            detail.kategoriSampah.nama_kategori,
          jenis: detail.kategoriSampah.jenis,
          berat_kg: detail.berat_kg,
          poin_per_kg:
            detail.kategoriSampah.poin_per_kg,
          subtotal_poin: detail.subtotal_poin,
        })),

        total_berat_kg: Number(totalBeratKg.toFixed(2)),
        total_poin: Number(totalPoin.toFixed(2)),

        bank_sampah: setor.admin
          ? {
            nama_unit: setor.admin.nama_unit,
            nama_pengelola: setor.admin.nama_pengelola,
            telp: setor.admin.telp,
            alamat: setor.admin.alamat,
          }
          : null,
      },
    };
  }
}