# Decisions Log

## Objetivo
Este arquivo registra decisões arquiteturais, funcionais e estruturais relevantes do projeto, em formato leve inspirado em ADR (Architecture Decision Record).

O objetivo é:
- preservar contexto para futuras evoluções;
- facilitar continuidade por novos desenvolvedores;
- reduzir perda de entendimento em conversas futuras com IA;
- justificar escolhas técnicas e de produto já adotadas.

---

## DEC-001: Construção inicial como MVP frontend-first
### Status
Aceita

### Contexto
O projeto precisava validar rapidamente o fluxo operacional da empresa antes de investir em backend, autenticação real e banco de dados.

### Decisão
Construir a primeira versão como aplicação React com persistência local via `localStorage`.

### Consequências
**Positivas**
- acelera prototipação;
- reduz custo inicial;
- facilita demonstração comercial;
- permite validação rápida dos fluxos.

**Negativas**
- não escala para produção real;
- não suporta múltiplos usuários;
- não oferece segurança adequada;
- dificulta auditoria e concorrência de dados.

---

## DEC-002: Uso de React + Vite + Tailwind CSS
### Status
Aceita

### Contexto
Era necessário montar rapidamente uma SPA responsiva com boa experiência visual e baixo atrito de desenvolvimento.

### Decisão
Usar React como base da interface, Vite como bundler/dev server e Tailwind CSS para composição visual.

### Consequências
**Positivas**
- ótima velocidade de desenvolvimento;
- build rápido;
- facilidade de modularização;
- styling consistente com componentes reutilizáveis.

**Negativas**
- o uso excessivo de classes utilitárias pode aumentar o custo de manutenção visual se não houver disciplina.

---

## DEC-003: Variáveis internas em inglês e UI em português
### Status
Aceita

### Contexto
O produto é voltado ao mercado brasileiro, mas o código precisa manter padrão técnico adequado para manutenção futura.

### Decisão
Manter nomes de variáveis, funções e estruturas internas em inglês, enquanto toda a interface permanece em português do Brasil.

### Consequências
**Positivas**
- mantém legibilidade técnica;
- facilita integração futura com backend e convenções internacionais;
- preserva UX local para o cliente final.

**Negativas**
- exige disciplina na separação entre domínio visível e nomenclatura interna.

---

## DEC-004: Estado global centralizado em AppContext
### Status
Aceita

### Contexto
O sistema precisava compartilhar dados entre múltiplas telas com baixo custo de implementação.

### Decisão
Centralizar leitura, normalização, CRUD e toasts em `AppContext`.

### Consequências
**Positivas**
- implementação simples;
- reduz duplicação;
- facilita persistência única no `localStorage`.

**Negativas**
- tende a crescer demais com a expansão do sistema;
- pode gerar re-renderizações mais amplas;
- não é a melhor solução para escala avançada.

### Observação futura
Migrar gradualmente para arquitetura com API + cache de dados usando React Query ou equivalente.

---

## DEC-005: Uso de componentes reutilizáveis para filtros, ações e modais
### Status
Aceita

### Contexto
As telas de listagem começaram a repetir padrões de filtros, ações e confirmações.

### Decisão
Criar componentes reutilizáveis como:
- `FilterPanel`
- `ActionButtons`
- `ConfirmationModal`
- `ModalShell`
- `EmptyState`
- `StatusBadge`

### Consequências
**Positivas**
- consistência visual;
- menor duplicação;
- manutenção facilitada;
- escalabilidade melhor da interface.

**Negativas**
- mudanças estruturais nesses componentes impactam várias telas ao mesmo tempo.

---

## DEC-006: Relatórios resumidos com filtros e abertura detalhada
### Status
Aceita

### Contexto
A listagem direta de todos os relatórios completos não escalava bem com muitos condomínios e visitas.

### Decisão
Exibir relatórios em cards-resumo com filtros, ordenação e carregamento progressivo, abrindo o relatório completo sob demanda.

### Consequências
**Positivas**
- melhora escalabilidade visual;
- reduz poluição da interface;
- aproxima o comportamento esperado de sistemas reais.

**Negativas**
- aumenta a necessidade de componentes e estados auxiliares para detalhe.

---

## DEC-007: Contratos como entidade independente vinculada ao condomínio
### Status
Aceita

### Contexto
O sistema precisava evoluir de operação técnica para também suportar governança comercial e documental.

### Decisão
Criar a entidade `contracts`, separada de visitas e relatórios, vinculada ao condomínio e com suporte a múltiplos contratos por cliente.

### Consequências
**Positivas**
- modelagem mais correta do domínio;
- facilita gestão de vigência, SLA e valores;
- prepara o sistema para ciclo comercial completo.

**Negativas**
- amplia a complexidade do estado e da UI;
- exige novos fluxos de detalhe e prévia.

---

## DEC-008: Geração de contrato em HTML imprimível
### Status
Aceita

### Contexto
Era necessário gerar uma versão imprimível do contrato sem depender ainda de backend ou biblioteca de PDF.

### Decisão
Montar a prévia e impressão do contrato em HTML, com layout profissional inspirado no modelo DOCX fornecido.

### Consequências
**Positivas**
- solução rápida;
- funciona no navegador;
- facilita visualização e exportação inicial.

**Negativas**
- não substitui PDF jurídico definitivo;
- impressão pode variar entre navegadores;
- não há controle de versão documental robusto.

### Observação futura
Migrar para geração server-side de PDF com template versionado.

---

## DEC-009: Upload de arquivos em base64 no estado local
### Status
Aceita com restrição

### Contexto
Era necessário permitir upload de fotos e contratos assinados sem backend.

### Decisão
Armazenar os arquivos temporariamente como `data URL/base64` no próprio estado persistido.

### Consequências
**Positivas**
- simples de implementar;
- suficiente para demonstração do MVP.

**Negativas**
- consome muito espaço;
- não escala;
- degrada a persistência no `localStorage`;
- não é seguro para produção.

### Observação futura
Substituir por upload real em storage externo com metadados persistidos em banco.

---

## DEC-010: Bloqueio de exclusão com vínculos
### Status
Aceita

### Contexto
Era necessário evitar que exclusões quebrassem coerência mínima dos dados.

### Decisão
Bloquear exclusão de:
- condomínio com visitas ou contratos vinculados;
- técnico com visitas vinculadas.

### Consequências
**Positivas**
- protege integridade lógica do MVP;
- aproxima o comportamento de sistemas reais.

**Negativas**
- no futuro pode exigir estratégias mais completas, como arquivamento ou soft delete.

---

## DEC-011: Status do condomínio calculado por visita concluída no mês
### Status
Aceita

### Contexto
Era necessário um indicador simples para saber se o condomínio foi atendido no mês atual.

### Decisão
Considerar `Concluído` quando existir pelo menos uma visita com status `Concluída` no mês corrente.

### Consequências
**Positivas**
- regra simples e objetiva;
- útil para painel e carteira.

**Negativas**
- não considera casos mais complexos, como exigência de múltiplas visitas no mesmo mês.

### Observação futura
Permitir parametrização por contrato e frequência contratada.

---

## DEC-012: Documentação persistente dentro de /docs
### Status
Aceita

### Contexto
O projeto começou a crescer e havia risco de perda de contexto entre sessões, conversas ou handoffs.

### Decisão
Criar a pasta `/docs` como fonte de verdade complementar para contexto funcional, técnico, de dados e roadmap.

### Consequências
**Positivas**
- reduz dependência do histórico da conversa;
- melhora onboarding;
- facilita continuidade por IA e pessoas.

**Negativas**
- exige atualização contínua para não ficar desatualizada.

---

## Próximas decisões esperadas
Os próximos ADRs provavelmente devem registrar:
- estratégia de autenticação;
- escolha de banco de dados;
- escolha de storage de arquivos;
- estratégia de multiempresa;
- política de geração de PDF;
- arquitetura do backend;
- uso ou não de React Query;
- política de auditoria e soft delete.
