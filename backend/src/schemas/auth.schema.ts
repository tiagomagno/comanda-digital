import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Email inválido').optional(),
        senha: z.string().min(1, 'Senha é obrigatória').optional(),
        codigo: z.string().min(1, 'Código é obrigatório').optional(),
    }).refine(
        (data) => (data.email && data.senha) || data.codigo,
        {
            message: 'Informe email/senha ou código de acesso',
            path: ['codigo'],
        }
    ),
});

export const registerSchema = z.object({
    body: z.object({
        nome: z.string().min(1, 'Nome é obrigatório'),
        email: z.string().email('Email inválido'),
        senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
        estabelecimentoId: z.string().uuid('ID do estabelecimento inválido').optional(),
    }),
});

export const meSchema = z.object({
    // Sem body/params, apenas valida autenticação via middleware
});

export const onboardingSchema = z.object({
    body: z.object({
        // Dados do estabelecimento
        estabelecimento: z.object({
            nome: z.string().min(2, 'Nome do estabelecimento obrigatório'),
            operaLocal: z.boolean().optional(),
            operaHospedado: z.boolean().optional(),
            operaDelivery: z.boolean().optional(),
            telefone: z.string().optional(),
            email: z.string().email('Email do estabelecimento inválido').optional(),
        }),
        // Dados do gestor
        gestor: z.object({
            nome: z.string().min(2, 'Nome do gestor obrigatório'),
            email: z.string().email('Email inválido'),
            senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
        }),
    }),
});
