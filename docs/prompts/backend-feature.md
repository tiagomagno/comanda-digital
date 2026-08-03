# Prompt: Implementar Feature de Backend

> Prompt reutilizável para criar endpoints, controllers e services no Dine

---

## Template

```
Você está implementando uma nova feature no backend do sistema Dine.

## Contexto do Projeto
- Stack: Node.js + Express + TypeScript + Prisma (MySQL) + Socket.io
- Autenticação: JWT Bearer Token
- Papéis: superadmin, admin, garcom, cozinha, bar, entregador
- Banco multi-tenant: toda query filtra por estabelecimentoId
- Padrão: controller → service → Prisma

## Arquivos de referência
- backend/src/controllers/comanda.controller.ts (exemplo de controller)
- backend/src/services/comanda.service.ts (exemplo de service)
- backend/src/routes/comanda.routes.ts (exemplo de rotas)
- backend/prisma/schema.prisma (schema atual)

## Feature a implementar
[DESCREVER AQUI: nome, objetivo, papéis que podem usar, entidades envolvidas]

## Entregáveis esperados
1. Migration Prisma (se necessário)
2. Schema Zod de validação
3. Service com lógica de negócio
4. Controller com tratamento de erros
5. Rotas com middlewares de auth corretos
6. Registro da rota em routes/index.ts

## Restrições
- Não quebrar features existentes
- Usar asyncHandler em todos os controllers
- Filtrar sempre por estabelecimentoId
- Emitir evento Socket.io se a mudança impacta KDS ou tempo real
- Documentar em docs/modules/ após implementação
```

---

## Exemplo de Uso

```
Você está implementando uma nova feature no backend do sistema Dine.

[contexto acima...]

## Feature a implementar
Módulo de avaliação pós-pedido de entregador:
- Nome: avaliacaoEntregador
- Objetivo: Cliente avalia entregador após entrega com nota de 1-5
- Papéis: público (cliente final, por código de comanda)
- Entidades: nova tabela AvaliacaoEntregador (comandaId, entregadorId, nota, comentario)
```
