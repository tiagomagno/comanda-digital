# ADR-002: Autenticação via JWT

**Status:** Aceito  
**Data:** 2025  
**Revisado em:** 2026-06-30

---

## Contexto

O sistema tem múltiplos papéis de usuário (admin, garcom, cozinha, bar, entregador, superadmin) e precisa autenticar chamadas de API de forma stateless para suportar múltiplas instâncias de servidor.

---

## Decisão

Usar **JSON Web Tokens (JWT)** com Bearer Token no header Authorization para autenticação stateless.

O payload inclui: `{ id, tipo, estabelecimentoId }`.

---

## Consequências

### Positivas
- Stateless — sem necessidade de session store (Redis) para auth básica
- Escalável horizontalmente sem sincronização de sessão
- Claims no token eliminam consultas ao banco em cada request
- Simples de implementar e debugar

### Negativas
- Sem mecanismo de revogação (token válido até expirar)
- Payload visível (base64) — não armazenar dados sensíveis no token
- Sem refresh token — usuário re-loga após expiração (7 dias)

---

## Alternativas Consideradas

| Alternativa | Razão da Rejeição |
|------------|-------------------|
| Sessions + Redis | Adiciona dependência de Redis, mais complexidade operacional |
| OAuth2 / OIDC | Over-engineering para o MVP, complexidade desnecessária |
| API Keys por estabelecimento | Não suporta múltiplos papéis facilmente |

---

## Decisões Pendentes

- Implementar refresh token para melhor UX
- Implementar lista de revogação (blacklist) para logout seguro
- Implementar rate limiting no endpoint de login
