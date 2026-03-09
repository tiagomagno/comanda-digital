-- AlterTable
ALTER TABLE `comandas` ADD COLUMN `grupoMesaId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `grupos_mesa` (
    `id` VARCHAR(191) NOT NULL,
    `estabelecimento_id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `capacidade_total` INTEGER NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mesa_grupo` (
    `id` VARCHAR(191) NOT NULL,
    `grupo_id` VARCHAR(191) NOT NULL,
    `mesa_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `mesa_grupo_grupo_id_mesa_id_key`(`grupo_id`, `mesa_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `grupos_mesa` ADD CONSTRAINT `grupos_mesa_estabelecimento_id_fkey` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mesa_grupo` ADD CONSTRAINT `mesa_grupo_grupo_id_fkey` FOREIGN KEY (`grupo_id`) REFERENCES `grupos_mesa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mesa_grupo` ADD CONSTRAINT `mesa_grupo_mesa_id_fkey` FOREIGN KEY (`mesa_id`) REFERENCES `mesas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comandas` ADD CONSTRAINT `comandas_grupoMesaId_fkey` FOREIGN KEY (`grupoMesaId`) REFERENCES `grupos_mesa`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
