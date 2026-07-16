-- AlterTable
ALTER TABLE `comandas` ADD COLUMN `cupom_id` VARCHAR(191) NULL,
    ADD COLUMN `desconto` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `cupons` (
    `id` VARCHAR(191) NOT NULL,
    `estabelecimento_id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `tipo` ENUM('percentual', 'fixo') NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `valor_minimo` DECIMAL(10, 2) NULL,
    `uso_maximo` INTEGER NULL,
    `uso_atual` INTEGER NOT NULL DEFAULT 0,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `data_inicio` DATETIME(3) NULL,
    `data_fim` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `cupons_estabelecimento_id_idx`(`estabelecimento_id`),
    UNIQUE INDEX `cupons_estabelecimento_id_codigo_key`(`estabelecimento_id`, `codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cupons` ADD CONSTRAINT `cupons_estabelecimento_id_fkey` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comandas` ADD CONSTRAINT `comandas_cupom_id_fkey` FOREIGN KEY (`cupom_id`) REFERENCES `cupons`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
