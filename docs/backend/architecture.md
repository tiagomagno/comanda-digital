# Arquitetura do Backend — Dine

> Fonte: `backend/src/` | Atualizado em: 2026-06-30

---

## Objetivo

Documentar a arquitetura da API do Dine: stack, padrões, estrutura de pastas, fluxo de request, configuração e decisões técnicas.

---

## Stack

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Node.js | 18+ | Runtime |
| Express | 4.x | Framework HTTP |
| TypeScript | 5.x | Tipagem estática |
| Prisma | 5.x | ORM + migrations |
| MySQL | 8.x | Banco de dados |
| Socket.io | 4.x | WebSocket / realtime |
| JWT (jsonwebtoken) | — | Autenticação |
| Zod | — | Validação de input |
| bcryptjs | — | Hash de senhas |
| Multer | — | Upload de arquivos |
| Stripe SDK | — | Billing SaaS |
| Winston/Logger | — | Logging estruturado |

---

## Diagrama de Arquitetura

```mermaid
graph TB
    subgraph Client["Clientes"]
        FE[Frontend Next.js]
        Mobile[App Mobile / Entregador]
        External[Canais Externos<br/>iFood / WhatsApp]
    end

    subgraph Backend["Backend Express + TypeScript"]
        direction TB
        MW[Middlewares<br/>auth · role · validate · error]
        R[Routes<br/>27 route files]
        C[Controllers<br/>30 controllers]
        S[Services<br/>15 services]
        U[Utils<br/>logger · prisma-helpers]
    end

    subgraph Data["Dados"]
        Prisma[Prisma ORM]
        MySQL[(MySQL 8)]
        Uploads[/uploads<br/>imagens/]
    end

    subgraph Realtime["Realtime"]
        SIO[Socket.io<br/>salas por estabelecimento]
    end

    subgraph External2["Integrações Externas"]
        Stripe[Stripe<br/>SaaS Billing]
        MPA[MercadoPago<br/>BYOG]
        PGA[Pagar.me<br/>BYOG]
        QR[QRCode lib]
    end

    FE -->|HTTP/REST| MW
    Mobile -->|HTTP/REST| MW
    External -->|Webhook POST| MW
    MW --> R
    R --> C
    C --> S
    S --> Prisma
    Prisma --> MySQL
    C --> SIO
    SIO -->|eventos em tempo real| FE
    S --> Stripe
    S --> MPA
    S --> PGA
    C --> QR
    C --> Uploads
```

---

## Estrutura de Pastas

```
backend/src/
├── app.ts              # Express app, Socket.io, middlewares globais
├── server.ts           # HTTP server entry point (porta)
├── config/
│   ├── database.ts     # Singleton do Prisma Client
│   └── socket.ts       # Singleton do Socket.io (setIO / getIO)
├── controllers/        # Camada HTTP: req → service → res
├── routes/             # Definição de rotas e middlewares por módulo
├── middlewares/        # auth, error, role, upload, validate
├── services/           # Lógica de negócio pura (sem req/res)
├── schemas/            # Schemas Zod para validação de input
├── types/
│   ├── dto.ts          # Data Transfer Objects
│   ├── errors.ts       # Classes de erro customizadas
│   └── express.d.ts    # Extensão do Request com userId, userTipo, etc.
└── utils/
    ├── logger.ts        # Winston logger
    ├── prisma-errors.ts # Tratamento de erros do Prisma
    ├── prisma-includes.ts # Includes reutilizáveis do Prisma
    └── comanda-utils.ts  # Utilitários de comanda
```

---

## Fluxo de Request

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant authMiddleware
    participant roleMiddleware
    participant validate
    participant Controller
    participant Service
    participant Prisma
    participant MySQL
    participant SocketIO

    Client->>Express: HTTP Request
    Express->>authMiddleware: Bearer Token?
    authMiddleware->>authMiddleware: jwt.verify()
    authMiddleware->>Express: req.userId, req.userTipo, req.estabelecimentoId
    Express->>roleMiddleware: Verifica tipo do usuário
    Express->>validate: Valida req.body/params com Zod
    validate->>Controller: Dados validados
    Controller->>Service: Chama método de negócio
    Service->>Prisma: Query/Mutation
    Prisma->>MySQL: SQL
    MySQL-->>Prisma: Resultado
    Prisma-->>Service: Entidade(s)
    Service-->>Controller: Dados processados
    Controller->>SocketIO: Emite evento (se necessário)
    SocketIO-->>Client: Evento realtime
    Controller-->>Client: HTTP Response (JSON)
```

---

## Configuração do Express (app.ts)

```typescript
// Middlewares globais registrados na ordem:
1. cors({ origin: CORS_ORIGIN, credentials: true })
2. express.json()
3. express.urlencoded({ extended: true })
4. express.static('uploads')     // /uploads/...
5. app.use('/api', routes)        // todas as rotas sob /api
6. errorHandler                   // último middleware

// Health check:
GET /health → { status: 'ok', timestamp, uptime }
GET /        → { message, version, docs }
```

---

## Configuração do Socket.io

```typescript
// Salas por estabelecimento:
// Formato: 'estabelecimento:{estabelecimentoId}'

// Eventos do servidor → cliente:
// 'pedido:novo'          - novo pedido criado
// 'pedido:status'        - mudança de status do pedido
// 'comanda:atualizada'   - comanda atualizada
// 'entregador:localizacao' - atualização GPS

// Eventos do cliente → servidor:
// 'join:estabelecimento' - entrar na sala
// 'leave:estabelecimento' - sair da sala
```

---

## Padrões de Código

### Controller Pattern
```typescript
// controllers/exemplo.controller.ts
export const listar = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { estabelecimentoId } = req;
    const resultado = await exemploService.listar(estabelecimentoId!);
    res.json(resultado);
});
```

### Service Pattern
```typescript
// services/exemplo.service.ts
export const listar = async (estabelecimentoId: string) => {
    return await prisma.exemplo.findMany({
        where: { estabelecimentoId },
        orderBy: { createdAt: 'desc' }
    });
};
```

### Zod Validation
```typescript
// schemas/exemplo.schema.ts
export const criarExemploSchema = z.object({
    body: z.object({
        nome: z.string().min(1),
        valor: z.number().positive()
    })
});
```

---

## Tratamento de Erros

```typescript
// types/errors.ts — Classes de erro customizadas
class AppError extends Error { statusCode: number }
class NotFoundError extends AppError { statusCode = 404 }
class ValidationError extends AppError { statusCode = 400 }
class UnauthorizedError extends AppError { statusCode = 401 }
class ForbiddenError extends AppError { statusCode = 403 }

// middlewares/error.middleware.ts
// errorHandler captura todos os erros e retorna:
{
  "error": "mensagem do erro",
  "code": "CODIGO_ERRO",    // para erros Prisma
  "details": {}             // detalhes adicionais
}
```

---

## Variáveis de Ambiente

```env
DATABASE_URL=mysql://user:pass@host:3306/dine
JWT_SECRET=secret-muito-seguro
CORS_ORIGIN=http://localhost:3000,https://app.dine.com.br
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=production
PORT=3001
```

---

## Endpoints de Sistema

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /health | Health check com uptime |
| GET | / | Info da API |
| GET | /api/ping | Teste de conectividade |
| POST | /api/seed-personas | Seed de dados (desabilitado em produção) |

---

## Dependências Críticas

```json
{
  "express": "framework HTTP",
  "prisma": "ORM + migrations",
  "@prisma/client": "cliente gerado",
  "socket.io": "WebSocket",
  "jsonwebtoken": "JWT auth",
  "bcryptjs": "hash de senha",
  "zod": "validação de input",
  "multer": "upload de arquivos",
  "stripe": "billing SaaS",
  "qrcode": "geração de QR Codes",
  "winston": "logging"
}
```

---

## Limitações Conhecidas

1. **Autenticação do cliente delivery** usa telefone/token simples, sem JWT completo
2. **Seed endpoint** (`/api/seed-personas`) desabilitado em produção mas ainda existe no código
3. **Campo `comanda.mesa`** (String) está deprecated — usar `mesaId` (FK)
4. **Testes automatizados** cobertura mínima em `__tests__/simple.test.ts`
5. **Rate limiting** mencionado no plano tático mas não verificado na implementação atual
