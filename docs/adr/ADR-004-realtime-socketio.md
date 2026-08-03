# ADR-004: Comunicação em Tempo Real com Socket.io

**Status:** Aceito  
**Data:** 2025  
**Revisado em:** 2026-06-30

---

## Contexto

O KDS (cozinha/bar), o painel do garçom e o painel de expedição precisam atualizar em tempo real quando novos pedidos chegam ou status mudam. O cliente também precisa ver o status do pedido sem precisar recarregar a página.

---

## Decisão

Usar **Socket.io** para comunicação bidirecional em tempo real, com salas organizadas por `estabelecimentoId`.

```
Formato da sala: 'estabelecimento:{estabelecimentoId}'
```

---

## Implementação

```typescript
// Servidor (app.ts):
io.on('connection', (socket) => {
    socket.on('join:estabelecimento', (id) => socket.join(`estabelecimento:${id}`));
});

// Emissão de evento (em um service/controller):
const io = getIO();
io.to(`estabelecimento:${estabelecimentoId}`).emit('pedido:novo', { pedido });
```

---

## Consequências

### Positivas
- Atualizações em tempo real sem polling
- Salas por estabelecimento garantem isolamento multi-tenant
- Socket.io tem fallback automático para long-polling
- Suporte a reconexão automática no cliente

### Negativas
- Estado não sincronizado se múltiplos servidores sem Redis adapter
- Socket.io tem mais overhead que WebSocket puro para cenários simples
- Requer gerenciamento de ciclo de vida (join/leave salas)

---

## Alternativas Consideradas

| Alternativa | Razão da Rejeição |
|------------|-------------------|
| Polling HTTP | Ineficiente, latência alta, sobrecarga no servidor |
| SSE (Server-Sent Events) | Unidirecional, não suporta eventos do cliente para servidor |
| WebSocket puro | Socket.io adiciona reconexão automática e fallbacks sem custo |
| Pusher / Ably | Custo adicional, dependência externa |

---

## Escalabilidade

Para múltiplas instâncias do servidor, adicionar **Socket.io Redis Adapter** para sincronizar eventos entre instâncias.
