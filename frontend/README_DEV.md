# Documentação do Frontend - Comanda Digital

Este projeto foi atualizado com todos os módulos funcionais.

## Módulos Implementados

### 1. Autenticação (`/auth/login`)
- Sistema de login baseado em código de acesso e Token JWT.
- Proteção de rotas via Middleware (backend e frontend).
- Redirecionamento automático baseado no cargo (Role).

### 2. Painel do Garçom (`/garcom`)
- Listagem de comandas ativas em tempo real.
- Detalhes da comanda com lista de pedidos criados.
- Aprovação e Rejeição de pedidos novos.
- Ações de pagamento parcial e fechamento de conta.

### 3. Cozinha (`/cozinha`) & Bar (`/bar`)
- Sistema Kanban com 3 colunas: Aguardando, Em Preparo, Prontos.
- Atualização de status com um clique.
- Contadores de tempo de espera.
- Bar filtra apenas bebidas, Cozinha filtra comidas.

### 4. Caixa (`/caixa`)
- Visualização de comandas aguardando pagamento final.
- Processamento de pagamentos (Dinheiro, Cartão, PIX).
- Relatórios de vendas diárias e top produtos.

### 5. Administração (`/admin`)
- Gestão de Mesas.
- Geração e Download de QR Codes para as mesas.
- Regeneração de QR Codes por segurança.

### 6. Cliente (`/cliente`)
- Fluxo de entrada via QR Code (`/cliente/mesa/:estabelecimento/:mesa`).
- Cardápio digital com categorias e fotos.
- Carrinho de compras e envio de pedidos.
- Acompanhamento do status e total da conta.

## Configuração

Certifique-se de que o Backend esteja rodando na porta **3001**.
Se houver problemas de autenticação, reinicie o servidor frontend para carregar o novo `middleware.ts`.

## Próximos Passos Sugeridos

1. Testar o fluxo completo de ponta a ponta.
2. Integrar WebSockets para atualizações instantâneas (sem precisar de polling).
3. Melhorar a UI do Cardápio com fotos reais.
