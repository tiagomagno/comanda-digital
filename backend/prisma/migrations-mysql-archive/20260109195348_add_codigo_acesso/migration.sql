/*
  Warnings:

  - A unique constraint covering the columns `[codigo_acesso]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `codigo_acesso` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `usuarios_codigo_acesso_key` ON `usuarios`(`codigo_acesso`);
