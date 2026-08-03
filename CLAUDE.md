# Dine (MVP)

## Visão geral
Plataforma Dine — gestão gastronômica para bares e restaurantes. MVP focado no módulo de comanda — controle via QR Code, suporte a comanda individual, separação automática de pedidos por destino (bar/cozinha), operação online + local/offline.

## Stack
Backend: Node.js + Express + TypeScript + Prisma (MySQL), JWT, multer, qrcode. Frontend: Next.js + TypeScript + Tailwind, axios, framer-motion, js-cookie.

## Estrutura
- `backend/` — API Node/Express (Prisma + MySQL)
- `frontend/` — Next.js (cliente, garçom, KDS)
- `database/` — scripts SQL
- `docs/` — documentação técnica
- `tmp/` — arquivos temporários

## Comandos principais
Backend: `cd backend && npm i && npm run prisma:generate && npm run prisma:migrate && npm run prisma:seed && npm run dev`
Frontend: `cd frontend && npm i && npm run dev` (script `start-rede.ps1` para servir na rede local)
Testes: `cd backend && npm test`

## Observações
Vários `*.md` no backend documentando refatoração. Existe `extract-kizan.ts` e dados Kizan exportados — provável integração com sistema Kizan.

---

_Este arquivo serve como ficha técnica do projeto para o Claude. Quando esta pasta é aberta, o Claude lê este arquivo automaticamente para entender o projeto rapidamente._
