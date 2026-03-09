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
    tipoComanda?: 'mesa' | 'individual';
    formaPagamento?: 'imediato' | 'final';
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
