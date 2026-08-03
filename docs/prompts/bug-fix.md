# Prompt: Corrigir Bug

> 2026-06-30

---

## Template

```
Você está corrigindo um bug no sistema Dine.

## Contexto
- Backend: Node.js + Express + TypeScript + Prisma + MySQL
- Frontend: Next.js 14 App Router + TypeScript + Tailwind

## Descrição do bug
[DESCREVER: comportamento esperado vs comportamento atual]

## Arquivo(s) afetado(s)
[LISTAR arquivos suspeitos]

## Stacktrace / Erro
[COLAR stacktrace ou mensagem de erro]

## Passos para reproduzir
1.
2.
3.

## Restrições
- Corrigir APENAS o bug descrito — não refatorar código adjacente
- Não alterar schema do banco sem criar migration
- Não modificar a assinatura de funções públicas sem avaliar impacto
- Criar teste para reproduzir o bug antes de corrigir
```
