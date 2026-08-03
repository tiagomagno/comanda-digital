# ADR-003: Frontend com Next.js App Router

**Status:** Aceito  
**Data:** 2025  
**Revisado em:** 2026-06-30

---

## Contexto

O sistema Dine precisa de múltiplas interfaces distintas: painel do gestor, tela do garçom, KDS, tela do cliente (via QR Code), área do entregador e super admin. Algumas telas precisam de renderização rápida (cliente via QR Code) e outras de navegação complexa (painel admin).

---

## Decisão

Usar **Next.js 14+** com **App Router** como único frontend, organizando as telas por Route Groups:
- `(painel)/` — painel operacional
- `superadmin/` — gestão da plataforma
- `app/` raiz — fluxos de cliente/delivery

---

## Consequências

### Positivas
- Route Groups permitem layouts diferentes por área sem alterar URLs
- App Router com React Server Components para otimização quando necessário
- Tailwind CSS + shadcn/ui para desenvolvimento rápido de UI
- SSR disponível para páginas que precisam de SEO (landing, cardápio público)
- Único repositório para todas as interfaces

### Negativas
- App Router é relativamente novo — padrões em evolução
- Todas as interfaces no mesmo projeto pode aumentar o bundle se não houver code splitting
- Requer atenção na diferenciação Server vs Client Components

---

## Alternativas Consideradas

| Alternativa | Razão da Rejeição |
|------------|-------------------|
| CRA / Vite SPA puro | Sem SSR nativo, menos otimizado para cardápio público |
| Next.js Pages Router | App Router é o futuro recomendado pelo Next.js |
| Múltiplos projetos frontend separados | Duplicação de código, mais complexidade de deploy |
| React Native para entregador | Adicionaria plataforma mobile separada ao MVP |
