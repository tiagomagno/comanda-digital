# Painel Administrativo Comanda Digital — Mapeamento Stitch

Este documento vincula o **projeto Stitch** ao **Painel de Gestão** do Comanda Digital (visão do gestor do restaurante) e serve como referência para validar e transferir o formato das telas.

---

## Projeto Stitch

| Campo | Valor |
|-------|--------|
| **Nome no Stitch** | Kitchen Kanban Board |
| **Project ID** | `14803662431633772295` |
| **Tipo** | TEXT_TO_UI_PRO |
| **Device** | DESKTOP |
| **Tema** | Light, Work Sans, cantos arredondados (ROUND_EIGHT) |

O `projectId` está persistido em **`stitch.json`** na raiz do repositório para uso com Stitch MCP e stitch-loop.

---

## Mapeamento: Telas Stitch ↔ Rotas do Painel

| Tela no Stitch | Screen ID (último segmento) | Rota no app Next.js | Descrição |
|----------------|----------------------------|----------------------|-----------|
| **Admin Dashboard Overview** | `03ab73aaf3f04c6c8112e1d7ef6f87d8` / `cfa34767bb8b4c8eacc9aa09b4b76706` | `/admin/dashboard` | Dashboard: Receita total, comandas ativas, total de pedidos, ticket médio; gráficos (vendas diárias, receita por categoria); produtos em alta; estoque esgotado. |
| **Menu Product Management** | `c3eb032684c241e49db51a31563ee716` / `8f269b86a5314c88bedb5a84bcaddf07` / `80a07e5f20e8405f8e8117256d9c60fc` | `/admin/produtos` | Gestão de produtos: abas por categoria (Pizzas, Hambúrguer, Pratos, Lanches, Bebidas), cards de produto com preço e estoque, card "Adicionar Prato". |
| **Kitchen Kanban Board** | `15b8a27697ed475698928bc063359846` / `6022ce0cff4f43c9bce60e8169f23d0e` | `/cozinha` | Kanban: colunas Aguardando, Em Preparo, Pronto; cards de pedido (salão/entrega/para levar); ações Iniciar Preparo, Pronto, Arquivar. |
| **Tables and QR Codes Management** | `c921492db0d9496eac34de6118a69043` / `d40da89a84be47d48bf201350074c1b9` | `/admin/mesas` | Gestão de mesas e QR: grid de mesas (Livre / Reservada / Ocupada), reservas ativas, chegadas, Regenerar QR, Baixar QR, Check-in. |
| **Admin Dashboard Live Ops** | `91e46d3975b04556835660be5fed19d1` / `e6387fb07a6a491ca59e337642784395` | `/admin/dashboard` (ou visão “Operações”) | Operações em tempo real: receita, pedidos ativos, salão/para levar; tabela de comandas ativas; gráfico de receita; produtos esgotados; pratos populares. |

As telas com título duplicado (ex.: várias "Menu Product Management") são variantes/versões no mesmo projeto; pode-se usar qualquer uma como referência de layout.

---

## Uso com Stitch MCP

- **Listar telas:** `list_screens` com `projectId`: `14803662431633772295`.
- **Obter detalhes/HTML/screenshot de uma tela:** `get_screen` com `name`: `projects/14803662431633772295/screens/<screenId>` (e `projectId` / `screenId` conforme API).
- **Gerar novas telas alinhadas ao painel:** usar `generate_screen_from_text` com `projectId`: `14803662431633772295` para manter o mesmo tema e estilo.
- **Editar telas existentes:** `edit_screens` com `projectId` e `selectedScreenIds` (apenas o ID curto do screen, ex.: `03ab73aaf3f04c6c8112e1d7ef6f87d8`).

---

## Transferência do formato para o frontend

Para “transferir” o formato do Stitch para o Next.js:

1. **Baixar HTML/CSS** de uma tela via `get_screen` → `htmlCode.downloadUrl` (ou screenshot para referência visual).
2. **Adaptar** o markup/estilos para os componentes e rotas do painel (sidebar em `PainelSidebar`, layout em `(painel)/layout.tsx`).
3. **Manter** a estrutura de rotas e nomes descritos em `PROJETO_CONTEXTO_E_TELAS.md` (Dashboard, Produtos, Mesas, Cozinha, etc.).

O design theme atual do projeto no Stitch está em `stitch.json` (`designTheme`); use-o como referência ao gerar novas telas ou ao documentar um DESIGN.md para o painel.

---

*Documento gerado após validação da conexão Stitch MCP. Projeto Stitch: Kitchen Kanban Board (ID 14803662431633772295).*
