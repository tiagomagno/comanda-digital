# Prompt: Refatoração

> 2026-06-30

---

## Template

```
Você está refatorando código no sistema Dine.

## Regras obrigatórias
- NÃO alterar comportamento externo (API contracts, responses)
- NÃO adicionar features durante refatoração
- NÃO alterar schema do banco sem necessidade explícita
- NÃO mudar nomes de rotas ou exports públicos
- Manter 100% de compatibilidade com frontend existente

## Objetivo da refatoração
[DESCREVER: o que está sendo melhorado e por quê]

## Arquivo(s) alvo
[LISTAR arquivos a refatorar]

## Tipo de refatoração
[ ] Extrair função/método
[ ] Eliminar duplicação
[ ] Melhorar tipagem TypeScript
[ ] Reorganizar responsabilidades (controller vs service)
[ ] Melhorar tratamento de erros

## Critério de sucesso
- Todos os testes passam após a refatoração
- Comportamento idêntico ao anterior
- Código mais legível/manutenível
```
