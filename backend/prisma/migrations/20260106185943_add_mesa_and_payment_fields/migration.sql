-- AlterTable
ALTER TABLE `comandas` ADD COLUMN `forma_pagamento` ENUM('imediato', 'final') NULL,
    ADD COLUMN `mesa_id` VARCHAR(191) NULL,
    ADD COLUMN `tipo_comanda` ENUM('mesa', 'individual') NOT NULL DEFAULT 'individual';

-- AlterTable
ALTER TABLE `estabelecimentos` ADD COLUMN `lotacao_maxima` INTEGER NULL,
    ADD COLUMN `permite_comanda_individual` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `pedidos` ADD COLUMN `aprovado_at` DATETIME(3) NULL,
    ADD COLUMN `aprovado_por` VARCHAR(191) NULL,
    ADD COLUMN `metodo_pagamento` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `mesas` (
    `id` VARCHAR(191) NOT NULL,
    `estabelecimento_id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `capacidade` INTEGER NOT NULL DEFAULT 4,
    `qr_code_url` VARCHAR(191) NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mesas_estabelecimento_id_numero_key`(`estabelecimento_id`, `numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `comandas_mesa_id_idx` ON `comandas`(`mesa_id`);

-- AddForeignKey
ALTER TABLE `mesas` ADD CONSTRAINT `mesas_estabelecimento_id_fkey` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comandas` ADD CONSTRAINT `comandas_mesa_id_fkey` FOREIGN KEY (`mesa_id`) REFERENCES `mesas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
