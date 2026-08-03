import { Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { crmService } from '../services/crm.service.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

export const listarClientes = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { segmento, diasInatividade, busca } = req.query;
    const clientes = await crmService.listarClientes(req.estabelecimentoId!, {
        segmento: typeof segmento === 'string' ? segmento : undefined,
        diasInatividade: diasInatividade ? parseInt(diasInatividade as string) : undefined,
        busca: typeof busca === 'string' ? busca : undefined,
    });
    res.json(clientes);
});

export const resumo = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json(await crmService.resumo(req.estabelecimentoId!));
});

export const criarCampanha = asyncHandler(async (req: AuthRequest, res: Response) => {
    const resultado = await crmService.criarCampanha(req.estabelecimentoId!, req.body);
    res.status(201).json(resultado);
});
