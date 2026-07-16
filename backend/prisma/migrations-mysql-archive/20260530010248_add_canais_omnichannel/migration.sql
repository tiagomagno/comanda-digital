-- CreateTable
CREATE TABLE `canais_externos` (
    `id` VARCHAR(191) NOT NULL,
    `estabelecimento_id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `tipo` ENUM('whatsapp', 'ifood', 'rappi', 'instagram', 'site_proprio', 'telefone', 'generico') NOT NULL,
    `webhook_secret` VARCHAR(191) NULL,
    `configuracoes` JSON NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `canais_externos_estabelecimento_id_idx`(`estabelecimento_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedidos_externos` (
    `id` VARCHAR(191) NOT NULL,
    `canal_id` VARCHAR(191) NOT NULL,
    `comanda_id` VARCHAR(191) NULL,
    `external_id` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'recebido',
    `payload` JSON NOT NULL,
    `erro_mensagem` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pedidos_externos_canal_id_idx`(`canal_id`),
    INDEX `pedidos_externos_external_id_idx`(`external_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `canais_externos` ADD CONSTRAINT `canais_externos_estabelecimento_id_fkey` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidos_externos` ADD CONSTRAINT `pedidos_externos_canal_id_fkey` FOREIGN KEY (`canal_id`) REFERENCES `canais_externos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidos_externos` ADD CONSTRAINT `pedidos_externos_comanda_id_fkey` FOREIGN KEY (`comanda_id`) REFERENCES `comandas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
