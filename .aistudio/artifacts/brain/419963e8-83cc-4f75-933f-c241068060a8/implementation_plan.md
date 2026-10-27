# OmniDesk - Sistema Integrado de Gerenciamento de Chamados & SLA Enterprise

O OmniDesk é um sistema completo e de alto desempenho para gestão de chamados corporativos, combinando visualização fluida em Kanban drag-and-drop e Lista, motor de contagem e cálculo dinâmico de SLAs com alertas de violação, trilha de auditoria completa por card, central de simulação de notificações em tempo real (Push, SMS e E-mail) com alertas visuais e sonoros, além de painéis analíticos interativos e relatórios exportáveis em PDF e CSV para múltiplos departamentos (TI, RH, Manutenção e Atendimento).

### User Review & Critical Decisions

> [!IMPORTANT]
> As decisões críticas alinhadas na etapa de clarificação foram incorporadas integralmente na arquitetura da solução:

- **Segmento Operacional Multidepartamental**: O sistema já vem preparado e pré-carregado com departamentos e categorias flexíveis (TI & Infraestrutura, Recursos Humanos, Manutenção Predial/Instalações e SAC/Atendimento), permitindo alternar visualizações ou filtrar chamados por área com campos customizados específicos.
- **Identidade Visual Enterprise Clean (Linear & Jira inspired)**: Interface refinada com suporte nativo a temas Claro (Clean Slate White) e Escuro (Deep Carbon Slate), tipografia com números tabulares (`tabular-nums`), hierarquia sem ruídos visuais e zero "pill badge sandwiches" desnecessários.
- **Central de Notificações Multicanal ao Vivo**: Painel interativo com simulador de envio em tempo real para os técnicos responsáveis (E-mail corporativo formatado, SMS com template de celular e Push Notification com som sintetizado via Web Audio API), permitindo testar gatilhos automáticos de atribuição, mudança de status e estouro de SLA.
- **Exportação Dual (PDF & CSV)**: Exportação imediata em CSV compatível com Excel/Sheets e gerador de relatório executivo em PDF com cabeçalho institucional, tabela de SLAs e resumo de métricas.

---

### 1. Overview & Core Concept

- **O que a aplicação faz**: Permite registrar, triar, priorizar, atribuir e solucionar chamados operacionais. Apresenta modo Kanban interativo com arraste e soltura sem engasgos e visualização em Lista com filtros avançados. Cada chamado conta com histórico detalhado e imutável de alterações (quem alterou, data/hora, campo anterior e novo valor).
- **Público-alvo**: Gestores de operações, líderes de suporte, analistas de helpdesk, técnicos de campo e colaboradores que abrem demandas nas áreas de TI, RH, Facilities e Atendimento.
- **Valor Principal**: Redução de tempo de resolução com visibilidade clara dos prazos de SLA (contagem regressiva visual, estados normal/alerta/estourado), transparência total via auditoria e garantia de comunicação instantânea aos técnicos envolvidos.

---

### 2. User Experience & Visual Design

#### Fluxos Principais do Usuário
1. **Triagem e Acompanhamento no Kanban**:
   - Visualização em colunas (`Novo`, `Em Análise`, `Em Atendimento`, `Pendente`, `Resolvido`, `Cancelado`).
   - Drag-and-drop nativo fluido de cards entre colunas, com registro automático imediato na trilha de auditoria e disparo de notificação multicanal para o técnico atribuído.
2. **Criação e Edição Rápida de Chamados**:
   - Modal com campos: Título, Descrição, Departamento, Categoria, Prioridade (P1-Crítico, P2-Alto, P3-Médio, P4-Baixo), Técnico Responsável, Solicitante e Anexos/Tags.
   - Cálculo automático do prazo de SLA baseado na matriz de criticidade (ex: P1 = 2h resposta / 4h resolução; P4 = 24h / 48h).
3. **Auditoria e Detalhes do Chamado**:
   - Gaveta lateral (*Drawer*) ou modal expandido exibindo a timeline completa de eventos: criação, trocas de status, reatribuição de técnico, comentários internos e alertas disparados.
4. **Painel de Métricas & Dashboard de SLAs**:
   - Indicadores-chave (KPIs): Total de chamados, Chamados no prazo, SLAs em risco, Violações de SLA, Tempo Médio de Resolução (MTTR) e Produtividade por Técnico.
   - Gráficos interativos (distribuição por departamento, volume diário/semanal, evolução de resolução).
5. **Central de Notificações & Simulador em Tempo Real**:
   - Feed suspenso no topo com contador de não lidas.
   - Janela de teste do técnico onde é possível visualizar a chegada de E-mails formatados em HTML, SMSs em simulador de smartphone e notificações Push de desktop com som de alerta.
6. **Central de Relatórios & Exportação**:
   - Filtros por período, departamento, status e técnico.
   - Botão para download de planilha CSV estruturada e botão para impressão/PDF de relatório executivo formatado.

#### Identidade Visual & Tema
- **Estilo**: Enterprise Clean profissional, alta densidade informacional sem poluição visual, alinhamento rigoroso e contraste WCAG AA.
- **Paleta de Cores**:
  - *Light Mode*: Fundo `#F8FAFC` (Slate 50), superfícies `#FFFFFF`, bordas sutis `#E2E8F0` (Slate 200), texto principal `#0F172A` (Slate 900).
  - *Dark Mode*: Fundo `#0B0F17` (Deep Dark Carbon), superfícies `#131B29`, bordas `#1E293B`, texto principal `#F1F5F9`.
  - *Acentos Semânticos*:
    - P1 Crítico / SLA Estourado: Vermelho Carmim `#DC2626`
    - P2 Alto / SLA em Alerta: Âmbar `#D97706`
    - P3 Médio: Azul Técnico `#2563EB`
    - P4 Baixo / Resolvido: Verde Esmeralda `#059669`
- **Tipografia**: Sans contemporânea de alta legibilidade, com dados numéricos e cronômetros estritamente em `tabular-nums` e fonte mono (`IBM Plex Mono` / monospace tabular).

---

### 3. Key Product Decisions & Trade-Offs

- **Kanban Fluido com HTML5 Drag & Drop Nativo & Animações Motion**:
  - *Abordagem*: Implementação robusta sem dependências pesadas e instáveis, garantindo transferência de dados instantânea e feedback visual com classes de arraste otimizadas.
- **Motor de SLA com Cronômetro Dinâmico**:
  - *Abordagem*: Cálculos reativos de tempo restante atualizados a cada segundo, com marcação de prazo limite e badges informativas de estado (`Dentro do SLA`, `Atenção < 30min`, `SLA Violado`).
- **Histórico e Trilha de Auditoria Imutável**:
  - *Abordagem*: Cada mutação em um chamado gera um registro estruturado com timestamp preciso, autor da alteração, campo modificado, valor anterior e novo valor.
- **Simulador Realista de Notificações Multicanal**:
  - *Abordagem*: Painel interativo com pré-visualização de Push, E-mail e SMS, histórico de disparos e alertas sonoros personalizáveis utilizando Web Audio API (sem arquivos externos suscetíveis a falha de rede).
- **Persistência de Dados Híbrida**:
  - *Abordagem*: Estado reativo em memória com sincronização contínua no `localStorage` do navegador, pré-alimentado com chamados e histórico ricos em múltiplos departamentos, permitindo também resetar para o dataset inicial de fábrica a qualquer momento.

---

### 4. Technical Architecture & Data Strategy

#### Diagrama de Arquitetura do Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                        OmniDesk Application                            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌──────────────────┐    ┌───────────────────────┐    ┌──────────────────┐
│   Top Bar Nav    │    │  Global State & Store │    │ Audio & Notifs   │
│ - Breadcrumbs    │    │ - Tickets Store       │    │ - Web Audio Bell │
│ - Dept Selector  │    │ - Audit Logs Store    │    │ - Push / SMS /   │
│ - Theme Switcher │    │ - Technicians Store   │    │   Email Preview  │
│ - Live Notifs 🔔 │    │ - SLA Engine Watcher  │    │ - Sound Toggle   │
└──────────────────┘    └───────────┬───────────┘    └──────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌──────────────────┐    ┌───────────────────────┐    ┌──────────────────┐
│ Kanban / List    │    │ Dashboard & Analytics │    │ Reports & Export │
│ - Fluid DragDrop │    │ - KPI Cards (MTTR)    │    │ - PDF Generator  │
│ - SLA Badges     │    │ - SLA Compliance %    │    │ - CSV Formatter  │
│ - Quick Filter   │    │ - Dept Charts         │    │ - Custom Period  │
│ - Priority Icons │    │ - Tech Leaderboard    │    │ - Filtered Views │
└────────┬─────────┘    └───────────────────────┘    └──────────────────┘
         │
         ▼
┌───────────────────────────────────────────────────────────────────────┐
│ Ticket Detail Drawer / Audit Log Modal                                │
│ - Edit Status & Tech | Activity Timeline | Multi-channel Dispatch Log │
└───────────────────────────────────────────────────────────────────────┘
```

#### Entidades de Dados Principais

```typescript
type Priority = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';

type TicketStatus = 'NEW' | 'ANALYSIS' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED';

type Department = 'IT' | 'HR' | 'MAINTENANCE' | 'CUSTOMER_SUPPORT';

interface AuditLogEntry {
  id: string;
  ticketId: string;
  timestamp: string; // ISO string
  authorName: string;
  authorRole: string;
  action: 'CREATED' | 'STATUS_CHANGED' | 'PRIORITY_CHANGED' | 'ASSIGNED' | 'COMMENT_ADDED' | 'SLA_BREACH';
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  notes?: string;
}

interface NotificationDispatch {
  id: string;
  ticketId: string;
  ticketTitle: string;
  recipientName: string;
  recipientContact: string; // email or phone
  channel: 'EMAIL' | 'PUSH' | 'SMS';
  subject: string;
  body: string;
  timestamp: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED';
}

interface Ticket {
  id: string;
  code: string; // ex: "IT-1042", "HR-208"
  title: string;
  description: string;
  department: Department;
  category: string;
  priority: Priority;
  status: TicketStatus;
  requesterName: string;
  requesterEmail: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  createdAt: string;
  updatedAt: string;
  dueResponseAt: string;
  dueResolutionAt: string;
  resolvedAt?: string;
  tags: string[];
  customFields?: Record<string, string>;
}
```
