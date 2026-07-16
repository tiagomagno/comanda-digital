-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `status_entregador` ENUM('offline', 'online', 'pausado', 'em_corrida') NULL;

-- CreateTable
CREATE TABLE `corridas` (
    `id` VARCHAR(191) NOT NULL,
    `comanda_id` VARCHAR(191) NOT NULL,
    `entregador_id` VARCHAR(191) NOT NULL,
    `status` ENUM('oferecida', 'aceita', 'recusada', 'em_coleta', 'coletada', 'em_entrega', 'entregue', 'cancelada') NOT NULL DEFAULT 'oferecida',
    `observacoes` TEXT NULL,
    `oferecida_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `aceita_at` DATETIME(3) NULL,
    `em_coleta_at` DATETIME(3) NULL,
    `coletada_at` DATETIME(3) NULL,
    `em_entrega_at` DATETIME(3) NULL,
    `entrega_at` DATETIME(3) NULL,
    `cancelada_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `corridas_comanda_id_key`(`comanda_id`),
    INDEX `corridas_entregador_id_idx`(`entregador_id`),
    INDEX `corridas_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `localizacao_entregadores` (
    `id` VARCHAR(191) NOT NULL,
    `entregador_id` VARCHAR(191) NOT NULL,
    `lat` DECIMAL(10, 7) NOT NULL,
    `lng` DECIMAL(10, 7) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `localizacao_entregadores_entregador_id_idx`(`entregador_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `corridas` ADD CONSTRAINT `corridas_comanda_id_fkey` FOREIGN KEY (`comanda_id`) REFERENCES `comandas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `corridas` ADD CONSTRAINT `corridas_entregador_id_fkey` FOREIGN KEY (`entregador_id`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `localizacao_entregadores` ADD CONSTRAINT `localizacao_entregadores_entregador_id_fkey` FOREIGN KEY (`entregador_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
