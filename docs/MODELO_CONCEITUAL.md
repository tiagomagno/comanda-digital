# Base Conceitual do Produto — Plataforma de Gestão de Consumo e Pedidos

## Objetivo deste documento

Este documento define o **modelo conceitual oficial do produto** e deve servir como **base permanente de consulta** para decisões de produto, UX, arquitetura, regras de negócio e desenvolvimento futuro.

Sempre que novas funcionalidades forem criadas, elas devem respeitar os princípios descritos aqui.

---

## 1. Definição do Produto

A plataforma **não é apenas um cardápio digital**.

O produto é definido como:

> **Uma plataforma de gestão de consumo e pedidos baseada em cardápio digital, capaz de operar múltiplos contextos gastronômicos através de diferentes canais de consumo.**

O cardápio digital é o núcleo do sistema, porém o valor da plataforma está na **orquestração do fluxo de pedidos conforme o contexto operacional** do estabelecimento.

---

## 2. Princípio Fundamental

Todos os estabelecimentos (restaurantes, bares, hotéis e operações delivery) compartilham o mesmo elemento central:

**Cardápio → Itens → Pedidos → Produção → Consumo**

O que muda não é o cardápio, mas sim **como o consumo acontece**.

Portanto, o sistema não deve ser modelado baseado apenas no tipo de empresa, mas sim no **contexto de consumo**.

---

## 3. Contextos de Consumo (Modelo Oficial)

O sistema deve operar baseado em três contextos universais:

### 3.1 Consumo Local (Local Consumption)

O cliente está fisicamente no estabelecimento.

Exemplos:

* mesas de restaurante
* comandas de bar
* pedidos via QR Code
* atendimento presencial

Fluxo operacional:

Mesa/Comanda → Pedido → Produção → Fechamento de conta

Características:

* pedidos recorrentes
* conta aberta
* consumo acumulado
* pagamento ao final ou parcial

---

### 3.2 Consumo Hospedado (Hosted Consumption)

O cliente consome dentro de uma unidade associada ao estabelecimento.

Exemplos:

* quartos de hotel
* resorts
* hospitais
* condomínios ou unidades privadas

Fluxo operacional:

Unidade (quarto) → Pedido → Produção → Lançamento em conta vinculada

Características:

* vínculo com unidade/hóspede
* cobrança posterior
* integração com sistemas de hospedagem

---

### 3.3 Consumo Remoto (Remote Consumption / Delivery)

O cliente não está presente no local.

Exemplos:

* delivery
* retirada
* pedidos online

Fluxo operacional:

Cliente remoto → Pedido → Produção → Entrega/Retirada

Características:

* endereço obrigatório
* logística de entrega
* pagamento antecipado ou online

---

## 4. Modelo Operacional Unificado

O sistema deve seguir o seguinte modelo mental:

CARDÁPIO
↓
CANAL DE CONSUMO
↓
CONTEXTO DE PEDIDO
↓
FLUXO OPERACIONAL

O cardápio é único e reutilizável.
O fluxo operacional muda conforme o contexto.

---

## 5. Tipos de Estabelecimento (Abstração de Negócio)

Os tipos tradicionais de negócio são apenas combinações de contextos:

| Tipo de Negócio | Contextos Ativos                        |
| --------------- | --------------------------------------- |
| Restaurante     | Consumo Local + Delivery                |
| Bar             | Consumo Local                           |
| Hotel           | Consumo Hospedado (+ opcional Delivery) |
| Dark Kitchen    | Delivery                                |
| Food Truck      | Local + Delivery                        |

Portanto, o sistema deve priorizar configuração por **modo operacional**, não por categoria fixa de empresa.

---

## 6. Regra Arquitetural Importante

Evitar regras condicionais baseadas em:

tipo_estabelecimento = restaurante | bar | hotel

Preferir:

operation_modes = {
local_consumption,
hosted_consumption,
delivery
}

Isso garante escalabilidade e evita refatorações futuras.

---

## 7. Impacto nas Regras de Negócio

Toda nova funcionalidade deve responder primeiro:

1. Em qual contexto de consumo ela opera?
2. Ela altera o fluxo de pedido ou apenas o cardápio?
3. Ela depende de presença física, unidade vinculada ou cliente remoto?

Exemplos:

* divisão de conta → consumo local
* room service → consumo hospedado
* cálculo de rota → consumo remoto

---

## 8. Impacto no Onboarding

Durante o cadastro do estabelecimento, o sistema deve perguntar:

"Como seus clientes consomem seus produtos?"

Opções:

☐ No local (mesas/comandas)
☐ Em quartos ou unidades
☐ Delivery ou retirada

Essa escolha ativa os módulos do sistema.

---

## 9. Princípios para Evolução do Produto

Sempre manter:

* Um único cardápio central
* Fluxos adaptáveis por contexto
* Configuração modular
* Reutilização máxima de regras
* Separação entre conteúdo (cardápio) e operação (pedido)

---

## 10. Definição Estratégica Final

O posicionamento oficial do produto é:

> A plataforma adapta automaticamente o fluxo de pedidos ao contexto de consumo do cliente, permitindo que diferentes operações gastronômicas funcionem sobre o mesmo núcleo tecnológico.

---

## 11. Uso deste Documento

Este material deve ser utilizado como referência para:

* criação de novas features
* decisões de UX
* modelagem de banco de dados
* arquitetura multi-tenant
* definição de APIs
* prompts de desenvolvimento assistido por IA

Qualquer nova regra criada deve respeitar este modelo conceitual.
