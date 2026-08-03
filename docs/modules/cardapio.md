# Módulo: Cardápio

> 2026-06-30

---

## Objetivo

Gerenciar produtos, categorias e disponibilizar o cardápio público para clientes e integrações.

---

## Estrutura do Cardápio

```
Estabelecimento
└── Categoria (destino: BAR | COZINHA)
    └── Produto
        └── AdicionalGrupo (ex: "Ponto da carne")
            └── Adicional (ex: "Mal passado", "Bem passado")
```

---

## Rotas Públicas (sem autenticação)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/cardapio | Cardápio completo (?estabelecimentoId=) |
| GET | /api/cardapio/estabelecimentos | Listar estabelecimentos ativos |
| GET | /api/cardapio/estabelecimento/:id | Detalhes do estabelecimento |
| GET | /api/cliente/cardapio/:estabelecimentoId | Cardápio para cliente logado |

---

## Rotas Admin (autenticadas)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | /api/categorias | admin | Listar categorias |
| POST | /api/categorias | admin | Criar categoria |
| PUT | /api/categorias/:id | admin | Atualizar categoria |
| DELETE | /api/categorias/:id | admin | Deletar |
| POST | /api/categorias/reordenar | admin | Reordenar |
| GET | /api/produtos | admin | Listar produtos |
| POST | /api/produtos | admin | Criar produto |
| PUT | /api/produtos/:id | admin | Atualizar |
| DELETE | /api/produtos/:id | admin | Deletar |

---

## Produto — Campos

| Campo | Descrição |
|-------|-----------|
| `preco` | Preço base |
| `precoPromocional` | Preço em promoção (opcional) |
| `imagemUrl` | Imagem do produto |
| `videoUrl` | Vídeo do produto |
| `disponivel` | Disponibilidade atual |
| `destaque` | Aparecer em destaque no cardápio |
| `estoqueControlado` | Controle de estoque ativo? |
| `quantidadeEstoque` | Quantidade em estoque |
| `ordem` | Posição no cardápio |

---

## Destino da Categoria

O campo `destino` da Categoria (`BAR` ou `COZINHA`) determina para onde os pedidos de produtos dessa categoria serão roteados no KDS.

---

## Importação de Produtos

Rota: `POST /api/importar`

Permite importação em lote via planilha/CSV (controller `importar.controller.ts`).

---

## Telas do Frontend

| Rota | Descrição |
|------|-----------|
| /cardapio | Cardápio público geral |
| /cardapio/estabelecimento/:id | Cardápio do estabelecimento |
| /admin/produtos | Gestão de produtos |
| /admin/produtos/importar | Importação em lote |
