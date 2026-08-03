# Prompt: Criar Componente Frontend

> Prompt reutilizável para criar componentes e telas no frontend Dine

---

## Template

```
Você está criando uma tela ou componente no frontend do sistema Dine.

## Contexto do Projeto
- Framework: Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui
- Autenticação: JWT armazenado em cookie via js-cookie
- API: axios com base URL em NEXT_PUBLIC_API_URL
- Realtime: Socket.io client conectado ao backend
- Animações: framer-motion disponível

## Padrões de rota:
- Painel operacional: /frontend/app/(painel)/
- Fluxo do cliente: /frontend/app/cliente/ ou /comanda/
- Super Admin: /frontend/app/superadmin/

## Componente/Tela a criar:
[DESCREVER: nome, rota, papel do usuário, dados exibidos, ações disponíveis]

## Dados da API:
[LISTAR endpoints que a tela vai consumir]

## Entregáveis esperados:
1. Arquivo page.tsx na rota correta
2. Componentes filhos em components/ se reutilizáveis
3. Hook customizado em hooks/ se lógica complexa
4. Tratamento de loading, erro e estado vazio
5. Responsivo para mobile e desktop
```
