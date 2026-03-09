# Design System: Notícias 360 (Painel Admin)
**Project ID:** projects/17734198621495605880  
**Referência Stitch:** [Notícias 360](https://stitch.withgoogle.com/projects/17734198621495605880)

## 1. Visual Theme & Atmosphere
Interface limpa e utilitária: fundos claros (branco e cinza muito suave), tipografia legível e hierarquia clara. O vermelho e o azul da marca aparecem em destaques, botões primários e estados ativos, sem sobrecarregar. A sensação é de **clareza, confiança e eficiência** — adequada a um painel de administração e à página de Suporte e Tickets.

## 2. Color Palette & Roles
- **Vermelho primário (#E30614):** Ações principais, links ativos, ícones de destaque, botões de envio (ex.: "Enviar Ticket"), indicadores de notificação e estado ativo no menu.
- **Azul secundário (#004796):** Botões secundários, elementos de navegação e identidade (sidebar, avatar), ícones de canal (ex.: e-mail).
- **Branco (#FFFFFF):** Fundo de cards e inputs; contraste com sombras leves.
- **Cinza escuro para texto (#1E293B / #334155):** Títulos e texto principal.
- **Cinza médio (#64748B):** Subtítulos e texto secundário.
- **Cinza claro (#94A3B8):** Placeholders, rótulos e ícones inativos.
- **Bordas e divisórias (#E2E8F0 / #CBD5E1):** Contornos suaves em inputs e cards.
- **Fundo de página (#F4F6F8):** Base do layout para dar leve elevação aos cards.

## 3. Typography Rules
- **Fonte principal:** Lufga (e fallback Inter), sans-serif.
- **Títulos de página:** Tamanho grande (~1.875rem / 30px), peso medium, tracking amplo, cor primária ou cinza escuro.
- **Subtítulos:** ~13px, peso medium, cor cinza médio (#64748B).
- **Rótulos de formulário:** 11px, bold, uppercase, tracking largo, cor cinza claro (#94A3B8).
- **Corpo e inputs:** 13–14px, peso medium, cor cinza escuro.
- **Botões:** 12px, bold, uppercase com tracking para CTAs.

## 4. Component Stylings
- **Buttons (primário):** Vermelho (#E30614), cantos bem arredondados (pill ou rounded-2xl), sombra leve; hover com leve escurecimento.
- **Buttons (secundário/outline):** Borda vermelha, fundo branco, mesmo arredondamento.
- **Cards/Containers:** Fundo branco com borda sutil e sombra suave (ex.: `shadow-[0_8px_32px_0_rgba(31,38,135,0.03)]`), cantos generosamente arredondados (rounded-[24px] a rounded-[32px]).
- **Inputs/Forms:** Fundo branco ou white/80, borda #E2E8F0, focus com ring primário (2px); textarea com resize vertical quando necessário.
- **Upload zone:** Área com borda tracejada, ícone e texto de "arrastar ou clicar"; mesma família de cores (cinza e destaque em hover).
- **Dropdown (select):** Aparência consistente com inputs, seta à direita.

## 5. Layout Principles
- **Header de conteúdo global:** Em todas as páginas, bloco único com título, subtítulo, busca personalizada e ícone do usuário (com menu) à direita.
- **Espaçamento:** Margens laterais (ex.: px-8), gap entre seções (mb-8, gap-8); respiração entre blocos.
- **Grid de conteúdo:** Em páginas como Suporte, duas colunas em desktop: formulário à esquerda, cards informativos à direita (Canais de Atendimento, Central de Ajuda).
- **Sidebar fixa:** Navegação à esquerda com logo, links com ícones e estado ativo em vermelho; Suporte com ícone de headset/HelpCircle.
