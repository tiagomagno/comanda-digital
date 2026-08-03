# Módulo: Super Admin

> 2026-06-30

---

## Objetivo

Painel de gestão da plataforma Dine para o time interno. Gerencia estabelecimentos, assinaturas, usuários e métricas globais.

---

## Rotas

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/superadmin/dashboard | superadmin | Métricas da plataforma |
| GET | /api/superadmin/estabelecimentos | superadmin | Listar todos |
| POST | /api/superadmin/estabelecimentos | superadmin | Criar estabelecimento + admin |
| GET | /api/superadmin/estabelecimentos/:id | superadmin | Detalhes |
| PUT | /api/superadmin/estabelecimentos/:id | superadmin | Atualizar |
| PATCH | /api/superadmin/estabelecimentos/:id/toggle | superadmin | Ativar/Desativar |
| GET | /api/superadmin/usuarios | superadmin | Listar gestores |
| POST | /api/superadmin/criar-superadmin | superadmin | Criar novo superadmin |

---

## Dashboard Métricas

Implementado em `superadmin.controller.getDashboard()`. Métricas prováveis:
- Total de estabelecimentos ativos
- MRR atual
- Assinaturas em trialing / active / past_due / canceled
- Novos estabelecimentos no período

---

## Telas do Frontend

| Rota | Descrição |
|------|-----------|
| /superadmin/login | Login exclusivo superadmin |
| /superadmin/dashboard | Métricas da plataforma |
| /superadmin/estabelecimentos | Lista e busca de estabelecimentos |
| /superadmin/estabelecimentos/novo | Criar manualmente |
| /superadmin/estabelecimentos/:id | Detalhe e edição |
| /superadmin/usuarios | Gestores da plataforma |

---

## Segurança

- Rota protegida por `requireSuperAdmin` — tipo `superadmin` obrigatório
- Login em `/superadmin/login` (separado do login operacional)
- Superadmin não tem `estabelecimentoId` no JWT
