import { Request, Response } from 'express';
import { AuthRequest } from '../types/express.js';
import prisma from '../config/database.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { BadRequestError } from '../types/errors.js';
import { ProvedorGateway } from '@prisma/client';
import crypto from 'crypto';

// Utilizando a chave secreta do app para derivar a chave de criptografia do banco
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'a_very_long_fallback_secret_key_32bytes!';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Retorna as configurações de gateway do lojista (Sem expor a secret key)
 */
export const verCredenciais = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado no token');
    }

    const credenciais = await prisma.credencialGateway.findMany({
        where: { estabelecimentoId: req.estabelecimentoId },
    });

    // Mascarar dados sensíveis antes de retornar
    const credenciaisMascaradas = credenciais.map(cred => ({
        id: cred.id,
        provedor: cred.provedor,
        publicKey: cred.publicKey ? `${cred.publicKey.substring(0, 10)}...` : null,
        temSecretKey: !!cred.secretKey, // Boleano só pra indicar que existe
        temWebhookSecret: !!cred.webhookSecret,
        ativo: cred.ativo,
        createdAt: cred.createdAt,
        updatedAt: cred.updatedAt
    }));

    res.json(credenciaisMascaradas);
});

/**
 * Salva ou atualiza as credenciais do Gateway (Criptografando as chaves secretas)
 */
export const salvarCredenciais = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.estabelecimentoId) {
        throw new BadRequestError('Estabelecimento não identificado no token');
    }

    const { provedor, publicKey, secretKey, webhookSecret, ativo } = req.body;

    if (!provedor || typeof provedor !== 'string') {
        throw new BadRequestError('Provedor de pagamento é obrigatório (ex: MERCADO_PAGO)');
    }

    // Criptografar as chaves antes de salvar no banco
    const encryptedSecretKey = secretKey ? encrypt(secretKey) : undefined;
    const encryptedWebhookSecret = webhookSecret ? encrypt(webhookSecret) : undefined;

    // Tentar encontrar se já existe uma credencial para este provedor
    const existente = await prisma.credencialGateway.findFirst({
        where: { 
            estabelecimentoId: req.estabelecimentoId,
            provedor: provedor as ProvedorGateway 
        }
    });

    let resultado;

    if (existente) {
        // Atualiza
        resultado = await prisma.credencialGateway.update({
            where: { id: existente.id },
            data: {
                publicKey: publicKey !== undefined ? publicKey : existente.publicKey,
                secretKey: encryptedSecretKey !== undefined ? encryptedSecretKey : existente.secretKey,
                webhookSecret: encryptedWebhookSecret !== undefined ? encryptedWebhookSecret : existente.webhookSecret,
                ativo: ativo !== undefined ? ativo : existente.ativo,
            }
        });
    } else {
        // Cria
        // Se estiver criando novo, a secretKey geralmente é obrigatória no mundo real dependendo do gateway,
        // mas vamos flexibilizar com base na entrada.
        resultado = await prisma.credencialGateway.create({
            data: {
                estabelecimentoId: req.estabelecimentoId,
                provedor: provedor as ProvedorGateway,
                publicKey,
                secretKey: encryptedSecretKey || '', // Caso a regra de negócio permita vazio inicialmente
                webhookSecret: encryptedWebhookSecret,
                ativo: ativo !== undefined ? ativo : true,
            }
        });
    }

    res.status(200).json({ 
        message: 'Credenciais salvas com sucesso', 
        credencialId: resultado.id,
        provedor: resultado.provedor
    });
});
