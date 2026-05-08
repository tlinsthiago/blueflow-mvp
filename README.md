# BlueFlow Gestão Hidráulica

Aplicação web responsiva para gestão operacional de uma empresa de manutenção hidráulica condominial, com foco em carteira de condomínios, visitas técnicas, relatórios, contratos e documentação comercial.

## Visão geral

O projeto foi construído como um MVP frontend-first para validar fluxos de negócio da empresa `F TEC AUTOMAÇÃO`. Hoje ele opera sem backend, com persistência local em `localStorage`, mas já possui organização suficiente para futura migração para API e banco de dados.

## Stack atual

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React
- `localStorage` para persistência local

## Funcionalidades atuais

- Landing page institucional
- Login simulado
- Painel com indicadores
- Gestão de condomínios
- Gestão de técnicos
- Gestão de visitas técnicas
- Checklist técnico hidráulico
- Termo de responsabilidade com aceite digital
- Upload de fotos de vistoria
- Gestão de relatórios com filtros e resumo
- Gestão de contratos por condomínio
- Prévia, impressão e exportação de contratos
- Upload de contrato assinado
- Configuração de dados da empresa contratada

## Funcionalidades futuras

- Backend com autenticação real
- Banco de dados relacional
- Upload persistido em storage externo
- Geração real de PDF
- Envio de notificações por WhatsApp e e-mail
- Portal do cliente
- PWA/mobile para equipe de campo
- Escalabilidade SaaS

## Instalação

```bash
npm install
```

## Execução em desenvolvimento

```bash
npm run dev
```

Abra a URL local exibida pelo Vite no terminal.

## Build de produção

```bash
npm run build
```

## Estrutura de documentação

A pasta [docs](./docs/README.md) concentra a documentação funcional, técnica, de dados, componentes, API futura e roadmap.

## Observações importantes

- Ainda não existe backend.
- A autenticação é simulada.
- Os dados são persistidos no navegador.
- O projeto está preparado para evolução incremental, sem perda do contexto funcional atual.
