-- CreateEnum
CREATE TYPE "MetodeSetor" AS ENUM ('jemput', 'antar');

-- CreateEnum
CREATE TYPE "StatusPenjemputan" AS ENUM ('menunggu', 'menuju_lokasi', 'sudah_diambil', 'selesai');

-- AlterTable
ALTER TABLE "admin_bank" ADD COLUMN     "hari_operasional" VARCHAR(100),
ADD COLUMN     "jam_buka" VARCHAR(5),
ADD COLUMN     "jam_tutup" VARCHAR(5);

-- AlterTable
ALTER TABLE "setor_sampah" ADD COLUMN     "metode_setor" "MetodeSetor" NOT NULL DEFAULT 'antar';

-- CreateTable
CREATE TABLE "jadwal_penjemputan" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jam_mulai" VARCHAR(5) NOT NULL,
    "jam_selesai" VARCHAR(5) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "jadwal_penjemputan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penjemputan" (
    "id" SERIAL NOT NULL,
    "id_setor" INTEGER NOT NULL,
    "id_jadwal" INTEGER NOT NULL,
    "alamat_penjemputan" TEXT NOT NULL,
    "status" "StatusPenjemputan" NOT NULL DEFAULT 'menunggu',

    CONSTRAINT "penjemputan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "penjemputan_id_setor_key" ON "penjemputan"("id_setor");

-- AddForeignKey
ALTER TABLE "penjemputan" ADD CONSTRAINT "penjemputan_id_setor_fkey" FOREIGN KEY ("id_setor") REFERENCES "setor_sampah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penjemputan" ADD CONSTRAINT "penjemputan_id_jadwal_fkey" FOREIGN KEY ("id_jadwal") REFERENCES "jadwal_penjemputan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
