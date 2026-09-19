-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin_bank', 'nasabah');

-- CreateEnum
CREATE TYPE "JenisSampah" AS ENUM ('plastik', 'kertas', 'logam', 'kaca');

-- CreateEnum
CREATE TYPE "StatusSetor" AS ENUM ('belum_dikonfirmasi', 'diproses', 'selesai', 'ditolak');

-- CreateEnum
CREATE TYPE "StatusPenukaran" AS ENUM ('diproses', 'selesai');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nasabah" (
    "id" SERIAL NOT NULL,
    "nama_nasabah" VARCHAR(100) NOT NULL,
    "alamat" TEXT NOT NULL,
    "telp" VARCHAR(20) NOT NULL,
    "saldo_poin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "id_user" INTEGER NOT NULL,
    "foto" VARCHAR(255),

    CONSTRAINT "nasabah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_bank" (
    "id" SERIAL NOT NULL,
    "nama_unit" VARCHAR(100) NOT NULL,
    "nama_pengelola" VARCHAR(100) NOT NULL,
    "telp" VARCHAR(20) NOT NULL,
    "id_user" INTEGER NOT NULL,

    CONSTRAINT "admin_bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori_sampah" (
    "id" SERIAL NOT NULL,
    "nama_kategori" VARCHAR(100) NOT NULL,
    "harga_per_kg" DOUBLE PRECISION NOT NULL,
    "poin_per_kg" DOUBLE PRECISION NOT NULL,
    "jenis" "JenisSampah" NOT NULL,
    "foto" VARCHAR(255),

    CONSTRAINT "kategori_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setor_sampah" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "id_admin" INTEGER NOT NULL,
    "id_nasabah" INTEGER NOT NULL,
    "status" "StatusSetor" NOT NULL,

    CONSTRAINT "setor_sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "detail_setor" (
    "id" SERIAL NOT NULL,
    "id_setor" INTEGER NOT NULL,
    "id_kategori_sampah" INTEGER NOT NULL,
    "berat_kg" DOUBLE PRECISION NOT NULL,
    "subtotal_poin" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "detail_setor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hadiah" (
    "id" SERIAL NOT NULL,
    "nama_hadiah" VARCHAR(100) NOT NULL,
    "poin_dibutuhkan" DOUBLE PRECISION NOT NULL,
    "stok" INTEGER NOT NULL,
    "foto" VARCHAR(255),

    CONSTRAINT "hadiah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "penukaran_poin" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "id_setor" INTEGER NOT NULL,
    "id_hadiah" INTEGER NOT NULL,
    "poin_terpakai" DOUBLE PRECISION NOT NULL,
    "status" "StatusPenukaran" NOT NULL,

    CONSTRAINT "penukaran_poin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "nasabah_id_user_key" ON "nasabah"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "admin_bank_id_user_key" ON "admin_bank"("id_user");

-- AddForeignKey
ALTER TABLE "nasabah" ADD CONSTRAINT "nasabah_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_bank" ADD CONSTRAINT "admin_bank_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setor_sampah" ADD CONSTRAINT "setor_sampah_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "admin_bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setor_sampah" ADD CONSTRAINT "setor_sampah_id_nasabah_fkey" FOREIGN KEY ("id_nasabah") REFERENCES "nasabah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_setor" ADD CONSTRAINT "detail_setor_id_setor_fkey" FOREIGN KEY ("id_setor") REFERENCES "setor_sampah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_setor" ADD CONSTRAINT "detail_setor_id_kategori_sampah_fkey" FOREIGN KEY ("id_kategori_sampah") REFERENCES "kategori_sampah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penukaran_poin" ADD CONSTRAINT "penukaran_poin_id_setor_fkey" FOREIGN KEY ("id_setor") REFERENCES "setor_sampah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "penukaran_poin" ADD CONSTRAINT "penukaran_poin_id_hadiah_fkey" FOREIGN KEY ("id_hadiah") REFERENCES "hadiah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
