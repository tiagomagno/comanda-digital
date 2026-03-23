import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { clienteService } from '../services/cliente.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

/** Escanear QR Code da mesa (modelo local: bar/restaurante/hotelaria) */
export const escanearQRCode = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { estabelecimentoId, mesaId } = req.params;
    const resultado = await clienteService.escanearQRCode(estabelecimentoId, mesaId);
    res.json(resultado);
});

/** Criar nova comanda (cliente - mesa ou individual) */
export const criarComanda = asyncHandler(async (req: AuthRequest, res: Response) => {
    const comanda = await clienteService.criarComanda(req.body);
    res.status(201).json(comanda);
});

/** Visualizar cardápio */
export const visualizarCardapio = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { estabelecimentoId } = req.params;
    const cardapio = await clienteService.visualizarCardapio(estabelecimentoId);
    res.json(cardapio);
});

/** Criar pedido (cliente - via comanda existente) */
export const criarPedido = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { comandaId, itens, observacoes } = req.body;
    const pedido = await clienteService.criarPedido(comandaId, itens, observacoes);
    res.status(201).json(pedido);
});

/** Visualizar comanda do cliente */
export const visualizarComanda = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { codigo } = req.params;
    const comanda = await clienteService.visualizarComanda(codigo);
    res.json(comanda);
});

// ======= DELIVERY =======

/** Registrar cliente (delivery) */
export const registrarCliente = asyncHandler(async (req: AuthRequest, res: Response) => {
    const resultado = await clienteService.registrarCliente(req.body);
    res.status(201).json(resultado);
});

/** Login/identificação do cliente por telefone */
export const loginCliente = asyncHandler(async (req: AuthRequest, res: Response) => {
    const resultado = await clienteService.loginCliente(req.body);
    res.json(resultado);
});

/** Buscar dados do cliente por ID */
export const buscarCliente = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const cliente = await clienteService.buscarCliente(id);
    res.json(cliente);
});

/** Listar endereços do cliente */
export const listarEnderecos = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { clienteId } = req.params;
    const enderecos = await clienteService.listarEnderecos(clienteId);
    res.json(enderecos);
});

/** Adicionar endereço ao cliente */
export const adicionarEndereco = asyncHandler(async (req: AuthRequest, res: Response) => {
    const endereco = await clienteService.adicionarEndereco(req.body);
    res.status(201).json(endereco);
});

/** [FLUXO PRINCIPAL] Iniciar pedido delivery completo */
export const iniciarPedidoDelivery = asyncHandler(async (req: AuthRequest, res: Response) => {
    const resultado = await clienteService.iniciarPedidoDelivery(req.body);
    res.status(201).json(resultado);
});
