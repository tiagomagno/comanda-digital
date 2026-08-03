# Prompt: Code Review

> 2026-06-30

---

## Template

```
Você está fazendo code review de uma mudança no sistema Dine.

## Contexto do Projeto
- Backend: Node.js + Express + TypeScript + Prisma + MySQL
- Frontend: Next.js 14 + TypeScript + Tailwind
- Sistema multi-tenant: estabelecimentoId é a fronteira de segurança

## Código para revisar
[COLAR o diff ou arquivos alterados]

## Foco do review
[ ] Segurança — verificar isolamento de tenant, validações, auth
[ ] Lógica de negócio — regras corretas, edge cases
[ ] Performance — N+1 queries, falta de índices
[ ] Padrões de código — consistência com o projeto
[ ] Testes — cobertura adequada

## Checklist de Segurança Multi-Tenant
- Toda query filtra por estabelecimentoId?
- Validação de propriedade antes de atualizar/deletar?
- Não vaza dados de outros estabelecimentos?

## Checklist de Performance
- Usa includes necessários (não mais)?
- Tem paginação se retorna lista?
- Operações em loop fazem queries separadas (N+1)?
```
