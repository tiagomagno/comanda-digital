-- AlterTable
ALTER TABLE `comandas` MODIFY `qr_code_url` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `estabelecimentos` ADD COLUMN `tipo_negocio` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `usuarios` MODIFY `tipo` ENUM('cliente', 'garcom', 'entregador', 'cozinha', 'bar', 'admin') NOT NULL;
