-- DropForeignKey
ALTER TABLE "setor_sampah" DROP CONSTRAINT "setor_sampah_id_admin_fkey";

-- AlterTable
ALTER TABLE "setor_sampah" ALTER COLUMN "id_admin" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "setor_sampah" ADD CONSTRAINT "setor_sampah_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "admin_bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
