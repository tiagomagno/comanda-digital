-- ============================================
-- SCHEMA DO BANCO DE DADOS
-- Sistema de Comandas Digitais - MVP
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABELA: estabelecimentos
-- ============================================
CREATE TABLE estabelecimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(8),
    configuracoes JSONB DEFAULT '{
        "modo_offline": true,
        "impressao_automatica": false,
        "tempo_expiracao_comanda": 0
    }',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: usuarios
-- ============================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID REFERENCES estabelecimentos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    senha_hash VARCHAR(255),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('cliente', 'garcom', 'cozinha', 'bar', 'admin')),
    ativo BOOLEAN DEFAULT true,
    ultimo_acesso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: categorias
-- ============================================
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID REFERENCES estabelecimentos(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    destino VARCHAR(20) NOT NULL CHECK (destino IN ('BAR', 'COZINHA')),
    cor VARCHAR(7) DEFAULT '#3b82f6', -- Cor em hexadecimal para UI
    icone VARCHAR(50), -- Nome do ícone (ex: 'beer', 'food')
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_categoria_estabelecimento UNIQUE (estabelecimento_id, nome)
);

-- ============================================
-- TABELA: produtos
-- ============================================
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
    codigo VARCHAR(50), -- Código interno do produto
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL CHECK (preco >= 0),
    preco_promocional DECIMAL(10, 2) CHECK (preco_promocional >= 0),
    imagem_url VARCHAR(500),
    disponivel BOOLEAN DEFAULT true,
    destaque BOOLEAN DEFAULT false, -- Produto em destaque no cardápio
    ordem INTEGER DEFAULT 0,
    estoque_controlado BOOLEAN DEFAULT false,
    quantidade_estoque INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: comandas
-- ============================================
CREATE TABLE comandas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID REFERENCES estabelecimentos(id) ON DELETE CASCADE,
    codigo VARCHAR(10) UNIQUE NOT NULL, -- Código curto para identificação (ex: A001)
    nome_cliente VARCHAR(255) NOT NULL,
    telefone_cliente VARCHAR(20) NOT NULL,
    email_cliente VARCHAR(255),
    mesa VARCHAR(20), -- Opcional - pode ser NULL para clientes sem mesa
    status VARCHAR(30) NOT NULL DEFAULT 'ativa' CHECK (status IN (
        'ativa',
        'aguardando_pagamento',
        'paga',
        'finalizada',
        'cancelada'
    )),
    total_estimado DECIMAL(10, 2) DEFAULT 0 CHECK (total_estimado >= 0),
    observacoes TEXT,
    qr_code_url VARCHAR(500), -- URL do QR Code gerado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finalizada_at TIMESTAMP,
    cancelada_at TIMESTAMP,
    
    -- Índices para performance
    INDEX idx_comandas_estabelecimento (estabelecimento_id),
    INDEX idx_comandas_status (status),
    INDEX idx_comandas_codigo (codigo),
    INDEX idx_comandas_created_at (created_at)
);

-- ============================================
-- TABELA: pedidos
-- ============================================
CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comanda_id UUID REFERENCES comandas(id) ON DELETE CASCADE,
    numero_pedido INTEGER NOT NULL, -- Sequencial por comanda (1, 2, 3...)
    status VARCHAR(30) NOT NULL DEFAULT 'criado' CHECK (status IN (
        'criado',
        'aguardando_pagamento',
        'pago',
        'em_preparo',
        'pronto',
        'entregue',
        'cancelado'
    )),
    destino VARCHAR(20) CHECK (destino IN ('BAR', 'COZINHA')),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pago_at TIMESTAMP,
    em_preparo_at TIMESTAMP,
    pronto_at TIMESTAMP,
    entregue_at TIMESTAMP,
    cancelado_at TIMESTAMP,
    
    -- Índices para performance
    INDEX idx_pedidos_comanda (comanda_id),
    INDEX idx_pedidos_status (status),
    INDEX idx_pedidos_destino (destino),
    INDEX idx_pedidos_created_at (created_at),
    
    CONSTRAINT unique_numero_pedido_comanda UNIQUE (comanda_id, numero_pedido)
);

-- ============================================
-- TABELA: pedido_itens
-- ============================================
CREATE TABLE pedido_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id) ON DELETE RESTRICT,
    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    preco_unitario DECIMAL(10, 2) NOT NULL CHECK (preco_unitario >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    observacoes TEXT, -- Observações específicas do item (ex: "sem cebola")
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para performance
    INDEX idx_pedido_itens_pedido (pedido_id),
    INDEX idx_pedido_itens_produto (produto_id)
);

-- ============================================
-- TABELA: historico_status_pedido
-- ============================================
-- Auditoria de mudanças de status
CREATE TABLE historico_status_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    status_anterior VARCHAR(30),
    status_novo VARCHAR(30) NOT NULL,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    observacao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_historico_pedido (pedido_id)
);

-- ============================================
-- TABELA: sessoes_offline
-- ============================================
-- Controle de sincronização offline
CREATE TABLE sessoes_offline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estabelecimento_id UUID REFERENCES estabelecimentos(id) ON DELETE CASCADE,
    dispositivo_id VARCHAR(255) NOT NULL, -- ID único do dispositivo
    ultima_sincronizacao TIMESTAMP,
    dados_pendentes JSONB DEFAULT '[]', -- Fila de operações pendentes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_dispositivo UNIQUE (estabelecimento_id, dispositivo_id)
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_estabelecimentos_updated_at BEFORE UPDATE ON estabelecimentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comandas_updated_at BEFORE UPDATE ON comandas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para gerar código único de comanda
CREATE OR REPLACE FUNCTION gerar_codigo_comanda()
RETURNS TRIGGER AS $$
DECLARE
    novo_codigo VARCHAR(10);
    codigo_existe BOOLEAN;
BEGIN
    LOOP
        -- Gera código aleatório (ex: A001, B234, etc)
        novo_codigo := CHR(65 + floor(random() * 26)::int) || 
                      LPAD(floor(random() * 1000)::text, 3, '0');
        
        -- Verifica se já existe
        SELECT EXISTS(SELECT 1 FROM comandas WHERE codigo = novo_codigo) INTO codigo_existe;
        
        -- Se não existe, usa este código
        IF NOT codigo_existe THEN
            NEW.codigo := novo_codigo;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_gerar_codigo_comanda 
BEFORE INSERT ON comandas 
FOR EACH ROW 
WHEN (NEW.codigo IS NULL)
EXECUTE FUNCTION gerar_codigo_comanda();

-- Trigger para calcular subtotal do item
CREATE OR REPLACE FUNCTION calcular_subtotal_item()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal := NEW.quantidade * NEW.preco_unitario;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_calcular_subtotal 
BEFORE INSERT OR UPDATE ON pedido_itens 
FOR EACH ROW 
EXECUTE FUNCTION calcular_subtotal_item();

-- Trigger para atualizar total do pedido
CREATE OR REPLACE FUNCTION atualizar_total_pedido()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pedidos 
    SET total = (
        SELECT COALESCE(SUM(subtotal), 0) 
        FROM pedido_itens 
        WHERE pedido_id = NEW.pedido_id
    )
    WHERE id = NEW.pedido_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_atualizar_total_pedido 
AFTER INSERT OR UPDATE OR DELETE ON pedido_itens 
FOR EACH ROW 
EXECUTE FUNCTION atualizar_total_pedido();

-- Trigger para registrar histórico de status
CREATE OR REPLACE FUNCTION registrar_historico_status()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO historico_status_pedido (pedido_id, status_anterior, status_novo)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_historico_status 
AFTER UPDATE ON pedidos 
FOR EACH ROW 
EXECUTE FUNCTION registrar_historico_status();

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View de comandas ativas com totais
CREATE OR REPLACE VIEW v_comandas_ativas AS
SELECT 
    c.id,
    c.codigo,
    c.nome_cliente,
    c.telefone_cliente,
    c.mesa,
    c.status,
    c.created_at,
    COUNT(DISTINCT p.id) as total_pedidos,
    COALESCE(SUM(p.total), 0) as total_geral,
    e.nome as estabelecimento_nome
FROM comandas c
LEFT JOIN pedidos p ON p.comanda_id = c.id
LEFT JOIN estabelecimentos e ON e.id = c.estabelecimento_id
WHERE c.status IN ('ativa', 'aguardando_pagamento')
GROUP BY c.id, e.nome;

-- View de pedidos pendentes por destino
CREATE OR REPLACE VIEW v_pedidos_pendentes AS
SELECT 
    p.id,
    p.numero_pedido,
    p.status,
    p.destino,
    p.total,
    p.created_at,
    c.codigo as comanda_codigo,
    c.nome_cliente,
    c.mesa,
    e.nome as estabelecimento_nome,
    json_agg(
        json_build_object(
            'produto', pr.nome,
            'quantidade', pi.quantidade,
            'observacoes', pi.observacoes
        )
    ) as itens
FROM pedidos p
JOIN comandas c ON c.id = p.comanda_id
JOIN estabelecimentos e ON e.id = c.estabelecimento_id
LEFT JOIN pedido_itens pi ON pi.pedido_id = p.id
LEFT JOIN produtos pr ON pr.id = pi.produto_id
WHERE p.status IN ('pago', 'em_preparo')
GROUP BY p.id, c.codigo, c.nome_cliente, c.mesa, e.nome;

-- ============================================
-- DADOS DE EXEMPLO (SEED)
-- ============================================

-- Estabelecimento de exemplo
INSERT INTO estabelecimentos (nome, cnpj, telefone, email, cidade, estado)
VALUES ('Bar do João', '12345678000199', '11999999999', 'contato@bardojoao.com.br', 'São Paulo', 'SP');

-- Usuário admin de exemplo
INSERT INTO usuarios (estabelecimento_id, nome, email, senha_hash, tipo)
SELECT 
    id,
    'Administrador',
    'admin@bardojoao.com.br',
    crypt('senha123', gen_salt('bf')), -- Senha: senha123
    'admin'
FROM estabelecimentos 
WHERE cnpj = '12345678000199';

-- Categorias de exemplo
INSERT INTO categorias (estabelecimento_id, nome, destino, cor, icone, ordem)
SELECT 
    id,
    'Bebidas',
    'BAR',
    '#3b82f6',
    'beer',
    1
FROM estabelecimentos WHERE cnpj = '12345678000199';

INSERT INTO categorias (estabelecimento_id, nome, destino, cor, icone, ordem)
SELECT 
    id,
    'Petiscos',
    'COZINHA',
    '#f59e0b',
    'food',
    2
FROM estabelecimentos WHERE cnpj = '12345678000199';

-- Produtos de exemplo
INSERT INTO produtos (categoria_id, nome, descricao, preco, disponivel, ordem)
SELECT 
    id,
    'Cerveja Heineken',
    'Cerveja long neck 330ml',
    12.00,
    true,
    1
FROM categorias WHERE nome = 'Bebidas';

INSERT INTO produtos (categoria_id, nome, descricao, preco, disponivel, ordem)
SELECT 
    id,
    'Coca-Cola',
    'Refrigerante lata 350ml',
    8.00,
    true,
    2
FROM categorias WHERE nome = 'Bebidas';

INSERT INTO produtos (categoria_id, nome, descricao, preco, disponivel, ordem)
SELECT 
    id,
    'Porção de Batata Frita',
    'Batata frita crocante (500g)',
    25.00,
    true,
    1
FROM categorias WHERE nome = 'Petiscos';

-- ============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE estabelecimentos IS 'Cadastro de bares e restaurantes que utilizam o sistema';
COMMENT ON TABLE usuarios IS 'Usuários do sistema (clientes, garçons, cozinha, bar, admin)';
COMMENT ON TABLE categorias IS 'Categorias de produtos do cardápio';
COMMENT ON TABLE produtos IS 'Produtos disponíveis no cardápio';
COMMENT ON TABLE comandas IS 'Comandas abertas pelos clientes';
COMMENT ON TABLE pedidos IS 'Pedidos realizados dentro de uma comanda';
COMMENT ON TABLE pedido_itens IS 'Itens individuais de cada pedido';
COMMENT ON TABLE historico_status_pedido IS 'Auditoria de mudanças de status dos pedidos';
COMMENT ON TABLE sessoes_offline IS 'Controle de sincronização para modo offline';

-- ============================================
-- FIM DO SCHEMA
-- ============================================
