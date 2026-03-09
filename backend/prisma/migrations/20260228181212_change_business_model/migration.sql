/*
  Warnings:

  - You are about to drop the column `tipo_negocio` on the `estabelecimentos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `estabelecimentos` DROP COLUMN `tipo_negocio`,
    ADD COLUMN `opera_delivery` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `opera_hospedado` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `opera_local` BOOLEAN NOT NULL DEFAULT false;
