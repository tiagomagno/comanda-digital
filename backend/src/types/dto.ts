/**
 * DTOs (Data Transfer Objects) para tipagem de requisições
 */

export interface CriarComandaDTO {
    estabelecimentoId: string;
    nomeCliente: string;
    telefoneCliente: string;
    emailCliente?: string;
    mesa?: string;
    mesaId?: string;
    tipoComanda?: 'mesa' | 'individual' | 'delivery';
    formaPagamento?: 'imediato' | 'final';
    // Delivery
    clienteId?: string;
    enderecoEntregaId?: string;
    taxaEntrega?: number;
}

export interface CriarPedidoDTO {
    comandaCodigo: string;
    itens: Array<{
        produtoId: string;
        quantidade: number;
        observacoes?: string;
    }>;
    observacoes?: string;
}

export interface AtualizarStatusPedidoDTO {
    status: string;
}

export interface CriarProdutoDTO {
    categoriaId: string;
    codigo?: string;
    nome: string;
    descricao?: string;
    preco: number;
    precoPromocional?: number;
    imagemUrl?: string;
    videoUrl?: string;
    disponivel?: boolean;
    destaque?: boolean;
    ordem?: number;
    estoqueControlado?: boolean;
    quantidadeEstoque?: number;
}

export interface CriarCategoriaDTO {
    estabelecimentoId: string;
    nome: string;
    descricao?: string;
    destino: 'BAR' | 'COZINHA';
    cor?: string;
    icone?: string;
    ordem?: number;
}

// Delivery: registro/Login de cliente
export interface RegistrarClienteDTO {
    estabelecimentoId: string;
    nome: string;
    telefone: string;
    email?: string;
    senha?: string;
    cpf?: string;
}

export interface LoginClienteDTO {
    estabelecimentoId: string;
    telefone: string;
    senha?: string;
}

export interface CriarEnderecoClienteDTO {
    clienteId: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    referencia?: string;
    padrao?: boolean;
}

// Delivery: iniciar pedido delivery completo (cria comanda + pedido em sequência)
export interface IniciarPedidoDeliveryDTO {
    estabelecimentoId: string;
    cliente: {
        nome: string;
        telefone: string;
        email?: string;
        senha?: string;
    };
    endereco: {
        cep: string;
        logradouro: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        estado: string;
        referencia?: string;
    };
    itens: Array<{
        produtoId: string;
        quantidade: number;
        observacoes?: string;
    }>;
    observacoes?: string;
    formaPagamento?: 'imediato' | 'final';
    taxaEntrega?: number;
}


export interface CriarPedidoDTO {
    comandaCodigo: string;
    itens: Array<{
        produtoId: string;
        quantidade: number;
        observacoes?: string;
    }>;
    observacoes?: string;
}

export interface AtualizarStatusPedidoDTO {
    status: string;
}

export interface CriarProdutoDTO {
    categoriaId: string;
    codigo?: string;
    nome: string;
    descricao?: string;
    preco: number;
    precoPromocional?: number;
    imagemUrl?: string;
    videoUrl?: string;
    disponivel?: boolean;
    destaque?: boolean;
    ordem?: number;
    estoqueControlado?: boolean;
    quantidadeEstoque?: number;
}

export interface CriarCategoriaDTO {
    estabelecimentoId: string;
    nome: string;
    descricao?: string;
    destino: 'BAR' | 'COZINHA';
    cor?: string;
    icone?: string;
    ordem?: number;
}
