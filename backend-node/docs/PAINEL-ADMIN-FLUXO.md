# Painel administrativo – fluxo e perfis

Definição de perfis (roles), estados das notícias e quem pode fazer o quê. O painel fica no **frontend** (`/admin`), usando [Kibo UI](https://www.kibo-ui.com/); a lógica de permissões e workflow fica no **backend**.

**Schema (Prisma):** o modelo `User` e o campo `status` em `Noticia` já estão em `prisma/schema.prisma`. Para aplicar no banco, em um terminal interativo rode: `npx prisma migrate dev --name add_user_and_workflow` ou `npx prisma db push`. Em seguida, `npx prisma generate` e `npm run seed` (se quiser repovoar com notícias em status `publicado`).

---

## Perfis (roles)

| Perfil            | Código no backend | Descrição resumida                          |
|-------------------|-------------------|--------------------------------------------|
| **Jornalista**    | `JORNALISTA`      | Cria e edita próprias notícias; envia para revisão. |
| **Editor-chefe**  | `EDITOR_CHEFE`    | Revisa, aprova, publica e arquiva; edita/remove qualquer notícia. |
| **Gestor**        | `GESTOR`          | Mesmas permissões do editor + (futuro) gestão de usuários e configurações. |

---

## Estados da notícia (workflow)

| Status        | Descrição |
|---------------|-----------|
| `rascunho`    | Em edição pelo jornalista; só ele (e editor/gestor) pode editar. |
| `em_revisao`  | Enviada para o editor; aguardando revisão/publicação. |
| `publicado`   | Visível no site. |
| `arquivado`   | Removido do site (não aparece na home/editorias). |

---

## Quem pode fazer o quê

| Ação                    | Jornalista | Editor-chefe | Gestor |
|-------------------------|------------|--------------|--------|
| Criar notícia (rascunho)| Sim        | Sim          | Sim    |
| Editar própria (rascunho) | Sim      | Sim          | Sim    |
| Editar qualquer notícia | Não*       | Sim          | Sim    |
| Enviar para revisão     | Sim (própria) | Sim      | Sim    |
| Aprovar / publicar      | Não        | Sim          | Sim    |
| Arquivar                | Não        | Sim          | Sim    |
| Remover (excluir)       | Não        | Sim          | Sim    |
| Listar todas / filtros  | Próprias** | Todas        | Todas  |

\* Jornalista só edita notícias em `rascunho` das quais é autor.  
\** Opcional: jornalista pode ver só as próprias na listagem do painel.

---

## Fluxo resumido

1. **Jornalista** cria a notícia → status `rascunho`.
2. **Jornalista** (ou editor/gestor) envia para revisão → status `em_revisao`.
3. **Editor-chefe** ou **Gestor** revisa e publica → status `publicado` (e `publishedAt` preenchido).
4. **Editor** ou **Gestor** pode arquivar → status `arquivado`.

No site público, só notícias com status `publicado` aparecem (home, editorias, últimas, busca). Rascunho e em_revisao são só no painel.

---

## Onde implementar

- **Backend:** modelo `User` com `role`; campo `status` (e opcionalmente `createdById`) em `Noticia`; rotas protegidas por role; endpoints para transição de status (ex.: `PUT /noticias/:id/enviar-revisao`, `PUT /noticias/:id/publicar`).
- **Frontend:** área `/admin` com layout e páginas do painel; componentes [Kibo UI](https://www.kibo-ui.com/) (e shadcn/ui) para listagens, formulários e ações do fluxo.
