-- CreateTable
CREATE TABLE `estabelecimentos` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NULL,
    `telefone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `endereco` VARCHAR(191) NULL,
    `cidade` VARCHAR(191) NULL,
    `estado` VARCHAR(191) NULL,
    `cep` VARCHAR(191) NULL,
    `configuracoes` JSON NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `estabelecimentos_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` VARCHAR(191) NOT NULL,
    `estabelecimento_id` VARCHAR(191) NULL,
    `nome` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `senha_hash` VARCHAR(191) NULL,
    `tipo` ENUM('cliente', 'garcom', 'cozinha', 'bar', 'admin') NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `ultimo_acesso` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id` VARCHAR(191) NOT NULL,
    `estabelecimento_id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `destino` ENUM('BAR', 'COZINHA') NOT NULL,
    `cor` VARCHAR(191) NOT NULL DEFAULT '#3b82f6',
    `icone` VARCHAR(191) NULL,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categorias_estabelecimento_id_nome_key`(`estabelecimento_id`, `nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produtos` (
    `id` VARCHAR(191) NOT NULL,
    `categoria_id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NULL,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `preco` DECIMAL(10, 2) NOT NULL,
    `preco_promocional` DECIMAL(10, 2) NULL,
    `imagem_url` VARCHAR(191) NULL,
    `disponivel` BOOLEAN NOT NULL DEFAULT true,
    `destaque` BOOLEAN NOT NULL DEFAULT false,
    `ordem` INTEGER NOT NULL DEFAULT 0,
    `estoque_controlado` BOOLEAN NOT NULL DEFAULT false,
    `quantidade_estoque` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comandas` (
    `id` VARCHAR(191) NOT NULL,
    `estabelecimento_id` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `nome_cliente` VARCHAR(191) NOT NULL,
    `telefone_cliente` VARCHAR(191) NOT NULL,
    `email_cliente` VARCHAR(191) NULL,
    `mesa` VARCHAR(191) NULL,
    `status` ENUM('ativa', 'aguardando_pagamento', 'paga', 'finalizada', 'cancelada') NOT NULL DEFAULT 'ativa',
    `total_estimado` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `observacoes` VARCHAR(191) NULL,
    `qr_code_url` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `finalizada_at` DATETIME(3) NULL,
    `cancelada_at` DATETIME(3) NULL,

    UNIQUE INDEX `comandas_codigo_key`(`codigo`),
    INDEX `comandas_estabelecimento_id_idx`(`estabelecimento_id`),
    INDEX `comandas_status_idx`(`status`),
    INDEX `comandas_codigo_idx`(`codigo`),
    INDEX `comandas_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedidos` (
    `id` VARCHAR(191) NOT NULL,
    `comanda_id` VARCHAR(191) NOT NULL,
    `numero_pedido` INTEGER NOT NULL,
    `status` ENUM('criado', 'aguardando_pagamento', 'pago', 'em_preparo', 'pronto', 'entregue', 'cancelado') NOT NULL DEFAULT 'criado',
    `destino` ENUM('BAR', 'COZINHA') NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `observacoes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `pago_at` DATETIME(3) NULL,
    `em_preparo_at` DATETIME(3) NULL,
    `pronto_at` DATETIME(3) NULL,
    `entregue_at` DATETIME(3) NULL,
    `cancelado_at` DATETIME(3) NULL,

    INDEX `pedidos_comanda_id_idx`(`comanda_id`),
    INDEX `pedidos_status_idx`(`status`),
    INDEX `pedidos_destino_idx`(`destino`),
    INDEX `pedidos_created_at_idx`(`created_at`),
    UNIQUE INDEX `pedidos_comanda_id_numero_pedido_key`(`comanda_id`, `numero_pedido`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pedido_itens` (
    `id` VARCHAR(191) NOT NULL,
    `pedido_id` VARCHAR(191) NOT NULL,
    `produto_id` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL DEFAULT 1,
    `preco_unitario` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `observacoes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pedido_itens_pedido_id_idx`(`pedido_id`),
    INDEX `pedido_itens_produto_id_idx`(`produto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historico_status_pedido` (
    `id` VARCHAR(191) NOT NULL,
    `pedido_id` VARCHAR(191) NOT NULL,
    `status_anterior` VARCHAR(191) NULL,
    `status_novo` VARCHAR(191) NOT NULL,
    `usuario_id` VARCHAR(191) NULL,
    `observacao` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `historico_status_pedido_pedido_id_idx`(`pedido_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_estabelecimento_id_fkey` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categorias` ADD CONSTRAINT `categorias_estabelecimento_id_fkey` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produtos` ADD CONSTRAINT `produtos_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comandas` ADD CONSTRAINT `comandas_estabelecimento_id_fkey` FOREIGN KEY (`estabelecimento_id`) REFERENCES `estabelecimentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedidos` ADD CONSTRAINT `pedidos_comanda_id_fkey` FOREIGN KEY (`comanda_id`) REFERENCES `comandas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido_itens` ADD CONSTRAINT `pedido_itens_pedido_id_fkey` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pedido_itens` ADD CONSTRAINT `pedido_itens_produto_id_fkey` FOREIGN KEY (`produto_id`) REFERENCES `produtos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_status_pedido` ADD CONSTRAINT `historico_status_pedido_pedido_id_fkey` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historico_status_pedido` ADD CONSTRAINT `historico_status_pedido_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
