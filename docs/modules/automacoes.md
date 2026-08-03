# Módulo: Automações de Marketing

> 2026-06-30

---

## Objetivo

Configurar e executar automações de marketing disparadas por eventos do ciclo de consumo do cliente.

---

## Tipos de Automação

| Tipo | Disparo | Exemplo de Ação |
|------|---------|-----------------|
| `apos_entrega` | Após entrega do pedido | Enviar solicitação de avaliação |
| `cliente_inativo` | Após N dias sem pedido | Enviar cupom de retorno |

---

## Ações Disponíveis

O campo `acao` é um JSON:
```json
{
  "tipo": "avaliacao" | "cupom" | "mensagem",
  "cupomCodigo": "RETORNO10",    // se tipo = cupom
  "mensagem": "Sentimos sua falta!" // se tipo = mensagem
}
```

---

## Rotas

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/automacoes | admin | Listar regras |
| POST | /api/automacoes | admin | Criar regra |
| PUT | /api/automacoes/:id | admin | Atualizar |
| DELETE | /api/automacoes/:id | admin | Deletar |
| POST | /api/automacoes/processar | admin | Executar automações pendentes |
| GET | /api/automacoes/:id/historico | admin | Histórico de execuções |

---

## Execução

O endpoint `POST /api/automacoes/processar` avalia as regras ativas e cria `ExecucaoAutomacao` para as que devem disparar.

Cada execução tem:
- `referencia` — ID da comanda ou cliente
- `status` — pendente | executado | erro
- `resultado` — JSON com resultado da execução

---

## Tela do Frontend

| Rota | Descrição |
|------|-----------|
| /admin/automacoes | Configuração de regras |
