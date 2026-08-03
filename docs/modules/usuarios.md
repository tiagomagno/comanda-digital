# Módulo: Usuários

> 2026-06-30

---

## Objetivo

Gerenciar usuários do estabelecimento (garçons, cozinheiros, caixa, etc.).

---

## Tipos de Usuário

| Tipo | Acesso |
|------|--------|
| admin | Gestor — acesso completo ao painel |
| garcom | Painel do garçom |
| cozinha | KDS Cozinha |
| bar | KDS Bar |
| entregador | App do entregador |
| superadmin | Gestão da plataforma |

---

## Tela do Frontend

| Rota | Descrição |
|------|-----------|
| /admin/usuarios | Listagem e criação de usuários do estabelecimento |

---

## Criação de Usuários

Via `POST /api/auth/register` ou pelo próprio painel do gestor.

---

## Acesso Operacional

Usuários operacionais (garçom, cozinha, bar) podem usar:
1. **Email/senha** — login padrão
2. **Código de acesso** (`codigoAcesso`) — acesso simplificado via `/acesso`

---

## Limites por Plano

| Plano | Máximo de usuários |
|-------|-------------------|
| Start | 1 |
| Growth | 5 |
| Scale | Ilimitado |
