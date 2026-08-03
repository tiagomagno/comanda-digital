# Prompt: Criar Endpoint de API

> 2026-06-30

---

## Template

```
Você está criando um novo endpoint na API REST do Dine.

## Contexto
- Backend: Express + TypeScript + Prisma
- Base URL: /api
- Auth: JWT Bearer Token
- Validação: Zod schemas em backend/src/schemas/

## Endpoint
- Método: [GET | POST | PUT | PATCH | DELETE]
- Rota: /api/[módulo]/[recurso]
- Autenticação: [público | admin | garcom | cozinha | entregador | superadmin]
- Descrição: [o que faz]

## Dados de entrada (body/params/query)
[LISTAR campos esperados com tipos]

## Dados de saída
[DESCREVER resposta esperada]

## Lógica de negócio
[DESCREVER regras, validações, side effects]

## Entregáveis
1. Schema Zod de validação
2. Método no service
3. Método no controller
4. Registro na route file
5. Emissão de evento Socket.io se necessário
```
