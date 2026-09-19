import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../generated/prisma/enums';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                role: true,
                created_at: true,

                nasabah: {
                    select: {
                        id: true,
                        nama_nasabah: true,
                        alamat: true,
                        telp: true,
                        saldo_poin: true,
                        foto: true,
                    },
                },

                adminBank: {
                    select: {
                        id: true,
                        nama_unit: true,
                        nama_pengelola: true,
                        telp: true,
                        foto: true,
                    },
                },
            },

            orderBy: {
                id: 'asc',
            },
        });

        return {
            statusCode: 200,
            success: true,
            message: 'Data user berhasil diambil',
            data: users,
        };
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                username: true,
                role: true,
                created_at: true,

                nasabah: {
                    select: {
                        id: true,
                        nama_nasabah: true,
                        alamat: true,
                        telp: true,
                        saldo_poin: true,
                        foto: true,
                    },
                },

                adminBank: {
                    select: {
                        id: true,
                        nama_unit: true,
                        nama_pengelola: true,
                        telp: true,
                        foto: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException(`User dengan id ${id} tidak ditemukan`);
        }

        return {
            statusCode: 200,
            success: true,
            message: 'Detail user berhasil diambil',
            data: user,
        };
    }

    async update(id: number, dto: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                nasabah: true,
                adminBank: true,
            },
        });

        if (!user) {
            throw new NotFoundException(
                `User dengan id ${id} tidak ditemukan`,
            );
        }

        // Cek username kalau diubah
        if (dto.username && dto.username !== user.username) {
            const existingUsername = await this.prisma.user.findUnique({
                where: {
                    username: dto.username,
                },
            });

            if (existingUsername) {
                throw new ConflictException(
                    'Username sudah digunakan',
                );
            }
        }

        let hashedPassword: string | undefined;

        if (dto.password) {
            hashedPassword = await bcrypt.hash(dto.password, 10);
        }

        const result = await this.prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: {
                    id,
                },
                data: {
                    ...(dto.username && {
                        username: dto.username,
                    }),

                    ...(hashedPassword && {
                        password: hashedPassword,
                    }),
                },
            });

            // UPDATE NASABAH
            if (user.role === Role.nasabah) {
                await tx.nasabah.update({
                    where: {
                        id_user: id,
                    },
                    data: {
                        ...(dto.nama_nasabah !== undefined && {
                            nama_nasabah: dto.nama_nasabah,
                        }),

                        ...(dto.alamat !== undefined && {
                            alamat: dto.alamat,
                        }),

                        ...(dto.telp !== undefined && {
                            telp: dto.telp,
                        }),

                        ...(dto.foto !== undefined && {
                            foto: dto.foto,
                        }),
                    },
                });
            }

            // UPDATE ADMIN BANK
            if (user.role === Role.admin_bank) {
                await tx.adminBank.update({
                    where: {
                        id_user: id,
                    },
                    data: {
                        ...(dto.nama_unit !== undefined && {
                            nama_unit: dto.nama_unit,
                        }),

                        ...(dto.nama_pengelola !== undefined && {
                            nama_pengelola: dto.nama_pengelola,
                        }),

                        ...(dto.alamat !== undefined && {
                            alamat: dto.alamat,
                        }),

                        ...(dto.telp !== undefined && {
                            telp: dto.telp,
                        }),

                        ...(dto.foto !== undefined && {
                            foto: dto.foto,
                        }),

                        ...(dto.hari_operasional !== undefined && {
                            hari_operasional: dto.hari_operasional,
                        }),

                        ...(dto.jam_buka !== undefined && {
                            jam_buka: dto.jam_buka,
                        }),

                        ...(dto.jam_tutup !== undefined && {
                            jam_tutup: dto.jam_tutup,
                        }),
                    },

                });
            }

            return updatedUser;
        });

        const updatedData = await this.prisma.user.findUnique({
            where: { id },
            include: {
                nasabah: true,
                adminBank: true,
            },
        });

        if (!updatedData) {
            throw new NotFoundException(`User dengan id ${id} tidak ditemukan`);
        }

        // RESPONSE NASABAH
        if (updatedData.role === Role.nasabah) {
            return {
                statusCode: 200,
                success: true,
                message: 'Data nasabah berhasil diperbarui',
                data: {
                    id: updatedData.id,
                    username: updatedData.username,
                    role: updatedData.role,
                    nama_nasabah: updatedData.nasabah?.nama_nasabah,
                    alamat: updatedData.nasabah?.alamat,
                    telp: updatedData.nasabah?.telp,
                    saldo_poin: updatedData.nasabah?.saldo_poin,
                    foto: updatedData.nasabah?.foto,
                    created_at: updatedData.created_at,
                },
            };
        }

        // RESPONSE ADMIN BANK
        return {
            statusCode: 200,
            success: true,
            message: 'Data admin bank berhasil diperbarui',
            data: {
                id: updatedData.id,
                username: updatedData.username,
                role: updatedData.role,

                nama_unit: updatedData.adminBank?.nama_unit,
                nama_pengelola: updatedData.adminBank?.nama_pengelola,
                alamat: updatedData.adminBank?.alamat,
                telp: updatedData.adminBank?.telp,

                hari_operasional:
                    updatedData.adminBank?.hari_operasional,

                jam_buka:
                    updatedData.adminBank?.jam_buka,

                jam_tutup:
                    updatedData.adminBank?.jam_tutup,

                foto: updatedData.adminBank?.foto,
                created_at: updatedData.created_at,
            },
        };
    }

    async remove(id: number) {
        // 1. Cari user
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                nasabah: {
                    include: {
                        setorSampah: true,
                    },
                },
                adminBank: {
                    include: {
                        setorSampah: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException(
                `User dengan id ${id} tidak ditemukan`,
            );
        }

        // 2. Jika NASABAH sudah punya transaksi setoran
        if (
            user.role === Role.nasabah &&
            user.nasabah &&
            user.nasabah.setorSampah.length > 0
        ) {
            throw new BadRequestException(
                'Nasabah tidak dapat dihapus karena sudah memiliki riwayat setoran',
            );
        }

        // 3. Jika ADMIN sudah terhubung dengan transaksi setoran
        if (
            user.role === Role.admin_bank &&
            user.adminBank &&
            user.adminBank.setorSampah.length > 0
        ) {
            throw new BadRequestException(
                'Admin bank tidak dapat dihapus karena sudah memiliki riwayat setoran',
            );
        }

        // 4. Hapus profil + user dalam transaction
        await this.prisma.$transaction(async (tx) => {
            if (user.role === Role.nasabah && user.nasabah) {
                await tx.nasabah.delete({
                    where: {
                        id_user: id,
                    },
                });
            }

            if (user.role === Role.admin_bank && user.adminBank) {
                await tx.adminBank.delete({
                    where: {
                        id_user: id,
                    },
                });
            }

            await tx.user.delete({
                where: {
                    id,
                },
            });
        });

        return {
            statusCode: 200,
            success: true,
            message: `User dengan id ${id} berhasil dihapus`,
        };
    }

    async getBankInfo() {
  const bankInfo = await this.prisma.adminBank.findFirst({
    where: {
      alamat: {
        not: null,
      },
      hari_operasional: {
        not: null,
      },
      jam_buka: {
        not: null,
      },
      jam_tutup: {
        not: null,
      },
    },

    orderBy: {
      id: 'desc',
    },

    select: {
      nama_unit: true,
      nama_pengelola: true,
      alamat: true,
      telp: true,
      hari_operasional: true,
      jam_buka: true,
      jam_tutup: true,
    },
  });

  if (!bankInfo) {
    throw new NotFoundException(
      'Informasi bank sampah belum tersedia',
    );
  }

  return {
    statusCode: 200,
    success: true,
    message: 'Informasi bank sampah berhasil diambil',
    data: bankInfo,
  };
}
}