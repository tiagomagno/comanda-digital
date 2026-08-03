# Convenções de Desenvolvimento — Dine

> Baseado em CLAUDE.md global | 2026-06-30

---

## Convenção de Commits

**Formato:** `tipo(escopo): descrição`

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Refatoração sem mudança de comportamento |
| `docs` | Documentação |
| `style` | Estilo/UI sem lógica |
| `test` | Testes |
| `chore` | Infraestrutura/configuração |

**Exemplos:**
```
feat(comanda): adiciona suporte a comanda delivery com endereço
fix(kds): corrige filtro de destino no Kanban
refactor(auth): extrai verificação de entitlements para middleware
docs(api): documenta endpoints de omnichannel
chore(prisma): adiciona migration de índice em pedidos
```

---

## Estratégia de Branches

```
feature/* → dev → pre-prod → main
```

| Branch | Finalidade | Restrição |
|--------|-----------|-----------|
| `main` | Produção | Nunca desenvolvimento direto |
| `pre-prod` | Homologação | Apenas via PR de dev |
| `dev` | Desenvolvimento | Branch base para features |
| `feature/*` | Features isoladas | Criado a partir de dev |
| `fix/*` | Correções | Criado a partir de dev |
| `hotfix/*` | Urgências produção | Criado a partir de main |
| `refactor/*` | Refatorações | Criado a partir de dev |

**Pull Request é obrigatório** para qualquer merge em dev, pre-prod ou main.

---

## Padrões de Código Backend

### Nomenclatura
- Controllers: `nome.controller.ts` — métodos em camelCase
- Routes: `nome.routes.ts`
- Services: `nome.service.ts`
- Schemas: `nome.schema.ts`

### Pattern de Controller
```typescript
// Usar asyncHandler para capturar erros async
export const listar = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { estabelecimentoId } = req;
    const dados = await service.listar(estabelecimentoId!);
    res.json(dados);
});
```

### Erros
```typescript
// Usar classes de erro customizadas
throw new NotFoundError('Comanda não encontrada');
throw new ForbiddenError('Sem permissão');
```

---

## Padrões de Código Frontend

- Componentes: PascalCase (`ComandaCard.tsx`)
- Hooks: camelCase com prefixo `use` (`useComanda.ts`)
- Pages: `page.tsx` (App Router convention)
- Layouts: `layout.tsx`

---

## Banco de Dados

- Migrations via `prisma migrate dev`
- Nunca alterar tabelas de produção diretamente
- Migrations destrutivas requerem aprovação explícita
- Sempre criar migration antes de alterar schema
