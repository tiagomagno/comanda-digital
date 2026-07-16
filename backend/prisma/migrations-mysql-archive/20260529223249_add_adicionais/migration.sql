-- CreateTable
CREATE TABLE `adicional_grupos` (
    `id` VARCHAR(191) NOT NULL,
    `produto_id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `obrigatorio` BOOLEAN NOT NULL DEFAULT false,
    `min_selecoes` INTEGER NOT NULL DEFAULT 0,
    `max_selecoes` INTEGER NOT NULL DEFAULT 1,
    `ordem` INTEGER NOT NULL DEFAULT 0,

    INDEX `adicional_grupos_produto_id_idx`(`produto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `adicionais` (
    `id` VARCHAR(191) NOT NULL,
    `grupo_id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `preco` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `disponivel` BOOLEAN NOT NULL DEFAULT true,
    `ordem` INTEGER NOT NULL DEFAULT 0,

    INDEX `adicionais_grupo_id_idx`(`grupo_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedido_item_adicionais` (
    `id` VARCHAR(191) NOT NULL,
    `pedido_item_id` VARCHAR(191) NOT NULL,
    `adicional_id` VARCHAR(191) NOT NULL,
    `preco` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pedido_item_adicionais_pedido_item_id_idx`(`pedido_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `adicional_grupos` ADD CONSTRAINT `adicional_grupos_produto_id_fkey` FOREIGN KEY (`produto_id`) REFERENCES `produtos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adicionais` ADD CONSTRAINT `adicionais_grupo_id_fkey` FOREIGN KEY (`grupo_id`) REFERENCES `adicional_grupos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido_item_adicionais` ADD CONSTRAINT `pedido_item_adicionais_pedido_item_id_fkey` FOREIGN KEY (`pedido_item_id`) REFERENCES `pedido_itens`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido_item_adicionais` ADD CONSTRAINT `pedido_item_adicionais_adicional_id_fkey` FOREIGN KEY (`adicional_id`) REFERENCES `adicionais`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
