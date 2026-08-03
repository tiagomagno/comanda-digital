# ADR-006: BYOG — Bring Your Own Gateway

**Status:** Aceito  
**Data:** 2026  
**Revisado em:** 2026-06-30

---

## Contexto

O Dine precisa processar pagamentos dos clientes finais nos restaurantes. Há duas opções: ser o processador de pagamentos (marketplace) ou permitir que cada restaurante use suas próprias credenciais.

---

## Decisão

Adotar o modelo **BYOG (Bring Your Own Gateway)**: cada restaurante cadastra suas próprias credenciais de gateway de pagamento, e os valores vão diretamente para a conta do restaurante.

A Dine não custodia nem processa os valores das vendas dos restaurantes.

---

## Consequências

### Positivas
- Dine não precisa de licença como instituição de pagamento
- Risco de chargeback é do restaurante, não da Dine
- Sem necessidade de split de pagamento ou repasse
- Menor responsabilidade fiscal e regulatória
- Restaurantes que já têm conta no MercadoPago/Pagar.me podem integrar imediatamente

### Negativas
- Cada restaurante precisa configurar suas credenciais (atrito no onboarding)
- Dine não tem visibilidade das transações dos restaurantes
- Suporte é mais complexo quando há problemas no gateway do lojista
- Experiência de pagamento pode variar por gateway

---

## Segurança

- Credenciais (`secretKey`) devem ser criptografadas em repouso no banco
- Nunca retornar `secretKey` ao frontend
- Criptografia: recomendado AES-256 para chaves em repouso (a implementar)

---

## Provedores Suportados

| Provedor | Status |
|---------|--------|
| MercadoPago | Suportado |
| Pagar.me | Suportado |
| Asaas | Suportado |
| Stripe (do lojista) | Suportado |

---

## Alternativas Consideradas

| Alternativa | Razão da Rejeição |
|------------|-------------------|
| Marketplace (Dine como processador) | Requer licença de pagamento, alto custo regulatório |
| Apenas dinheiro/manual | Inviável para delivery, UX ruim |
| Gateway único fixo | Força o lojista a mudar de conta, atrito alto |
