## 📄 README-TECHNICAL.md

*(Documentação Técnica do Projeto)*

# AutoCuidado – Documentação Técnica

Este documento descreve os **aspectos técnicos** do projeto AutoCuidado, incluindo tecnologias utilizadas, estrutura real do projeto, o papel de cada arquivo e pasta, e as decisões de arquitetura adotadas.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Para quê |
|---|---|---|
| **React Native** | 0.81.5 | Framework mobile multiplataforma (Android/iOS) |
| **TypeScript** | 5.9 | Tipagem estática, contratos entre camadas |
| **Expo** | SDK 54 | Toolchain para build, dev server, splash screen |
| **Expo Router** | 6.x | Roteamento por arquivos (file-based routing) |
| **@expo/vector-icons** | 15.x | Ícones vetoriais (MaterialCommunityIcons) |
| **expo-splash-screen** | 31.x | Controle da splash screen nativa |
| **expo-status-bar** | 3.x | Controle da barra de status do sistema |
| **React Navigation** | 7.x | Base da navegação por abas (bottom tabs) |
| **ESLint** | 9.x | Linting e padrão de código |

---

## 🧠 Arquitetura

Arquitetura baseada em **API interna** com separação em 4 camadas:

```
┌─────────────────────────────┐
│         UI (Telas)          │  ← app/(tabs)/*.tsx
├─────────────────────────────┤
│         Services            │  ← src/services/ (regras de negócio)
├─────────────────────────────┤
│        Repositories         │  ← src/repositories/ (acesso a dados)
├─────────────────────────────┤
│      Dados (mock/local)     │  ← src/mocks/ (dados fake)
└─────────────────────────────┘
```

**Regras:**
- A UI **nunca** acessa dados diretamente
- Services contêm toda a regra de negócio
- Repositories abstraem a origem dos dados
- Mocks simulam dados reais para desenvolvimento
- A comunicação entre camadas ocorre por **interfaces TypeScript**

---

## 🧱 Estrutura Completa do Projeto

```
AppAutoCuidado/
│
├── app/                          # 🗂️ ROTAS E TELAS (Expo Router)
│   ├── _layout.tsx               #    Layout raiz: splash screen com dicas + Stack
│   └── (tabs)/                   #    Grupo de abas (bottom tabs)
│       ├── _layout.tsx           #    Configuração das abas (Peso, Medicações, Histórico)
│       ├── index.tsx             #    Tela "Peso" — gráfico, resumo, lista de registros
│       ├── medications.tsx       #    Tela "Medicações" — cards com Tomei/Perdi
│       └── history.tsx           #    Tela "Histórico" — timeline unificada
│
├── components/                   # 🧩 COMPONENTES REUTILIZÁVEIS
│   ├── button.tsx                #    Botão (primary, secondary, outline, danger)
│   ├── card.tsx                  #    Card com título opcional e sombra
│   ├── input.tsx                 #    Input com label, erro e multiline
│   └── index.ts                 #    Barrel export (reexporta todos os componentes)
│
├── constants/                    # 🎨 CONFIGURAÇÕES VISUAIS
│   └── theme.ts                  #    Paleta de cores, fontes, espaçamentos, sombras
│
├── src/                          # 🧠 LÓGICA DE NEGÓCIO
│   ├── models/                   #    Interfaces/tipos TypeScript
│   │   ├── weight.ts             #    WeightRecord, WeightChartData, WeightSummary, WeightTrend
│   │   ├── medication.ts         #    Medication, MedicationLog, MedicationFrequency, MedicationStatus
│   │   ├── notification.ts       #    AppNotification, NotificationType
│   │   └── index.ts              #    Barrel export
│   │
│   ├── repositories/             #    Contratos de acesso a dados
│   │   ├── weight-repository.ts  #    IWeightRepository (CRUD de peso)
│   │   ├── medication-repository.ts # IMedicationRepository (CRUD + logs de medicação)
│   │   └── index.ts              #    Barrel export
│   │
│   ├── services/                 #    Contratos de regras de negócio
│   │   ├── weight-service.ts     #    IWeightService (registros, gráfico, tendência)
│   │   ├── medication-service.ts #    IMedicationService (cadastro, uso, histórico)
│   │   ├── notification-service.ts # INotificationService (agendar, cancelar)
│   │   └── index.ts              #    Barrel export
│   │
│   └── mocks/                    #    Dados fake para desenvolvimento
│       ├── weight-mocks.ts       #    7 registros de peso + gráfico + resumo
│       ├── medication-mocks.ts   #    3 medicações + 8 logs de uso
│       ├── health-tips.ts        #    10 dicas de saúde para splash screen
│       └── index.ts              #    Barrel export
│
├── assets/                       # 🖼️ RECURSOS ESTÁTICOS
│   └── images/
│       ├── icon.png              #    Ícone do app
│       ├── splash-icon.png       #    Ícone da splash screen nativa
│       ├── favicon.png           #    Favicon (versão web)
│       ├── android-icon-foreground.png  # Adaptive icon Android (foreground)
│       ├── android-icon-background.png  # Adaptive icon Android (background)
│       └── android-icon-monochrome.png  # Adaptive icon Android (monocromático)
│
├── docs/                         # 📚 DOCUMENTAÇÃO
│   ├── README-DESCRICAO.md       #    Descrição geral do projeto
│   ├── README-MVP.md             #    Definição do MVP
│   ├── README-PITCH.md           #    Pitch do projeto
│   ├── README-RESPONSIBILITIES.md #   Divisão de responsabilidades
│   └── README-TECHNICAL.md       #    Este arquivo (documentação técnica)
│
├── app.json                      # ⚙️ Configuração do Expo (nome, ícones, plugins)
├── package.json                  # ⚙️ Dependências e scripts npm
├── tsconfig.json                 # ⚙️ Configuração TypeScript (strict, paths com @/)
├── eslint.config.js              # ⚙️ Configuração do ESLint
├── expo-env.d.ts                 # ⚙️ Tipos globais do Expo
└── README.md                     # 📖 README principal do projeto
```

---

## 📁 Explicação Detalhada de Cada Pasta

### `app/` — Rotas e Telas

Pasta **obrigatória do Expo Router**. Cada arquivo `.tsx` aqui vira automaticamente uma rota de navegação. Somente telas e layouts ficam aqui.

- **`_layout.tsx`** — Layout raiz. Exibe a splash screen customizada com uma dica de saúde aleatória enquanto carrega, depois mostra o Stack de navegação.
- **`(tabs)/`** — Grupo de rotas com navegação por abas. Os parênteses indicam ao Expo Router que é um grupo de layout.
  - **`_layout.tsx`** — Configura as 3 abas: Peso (ícone balança), Medicações (ícone pílula), Histórico (ícone clipboard). Define cores do header e tab bar usando o tema.
  - **`index.tsx`** — Tela de Peso. Mostra card de resumo (atual vs anterior + tendência), mini gráfico de barras da evolução, e lista de registros com data e anotações.
  - **`medications.tsx`** — Tela de Medicações. Lista cada medicamento com nome, dosagem, frequência e horários. Botões rápidos "Tomei" e "Perdi" em cada card.
  - **`history.tsx`** — Tela de Histórico. Timeline unificada de peso + medicação agrupada por data, com ícones e cores diferenciados por tipo.

### `components/` — Componentes Reutilizáveis

Fora de `app/` porque **não são rotas**. São peças visuais usadas em várias telas.

- **`button.tsx`** — 4 variantes (primary, secondary, outline, danger), suporte a loading e disabled.
- **`card.tsx`** — Container com bordas arredondadas, sombra e título opcional.
- **`input.tsx`** — Campo de texto com label, placeholder, validação de erro e suporte a multiline.
- **`index.ts`** — Reexporta tudo para import limpo: `import { Button, Card, Input } from '@/components'`.

### `constants/` — Configuração Visual

- **`theme.ts`** — Define toda a identidade visual:
  - `Colors` — Paleta completa (primary, secondary, background, text, success, error, etc.)
  - `Fonts` — Tamanhos (xs a title) e pesos (regular a bold)
  - `Spacing` — Espaçamentos padronizados (xs a xxl)
  - `BorderRadius` — Raios de borda (sm, md, lg, full)
  - `Shadows` — Sombras para cards e botões

### `src/models/` — Contratos de Dados (TypeScript)

Interfaces que definem a **forma dos dados** em toda a aplicação:

- **`weight.ts`** — `WeightRecord` (id, value, date, notes), `WeightChartData`, `WeightSummary`, `WeightTrend`
- **`medication.ts`** — `Medication` (id, name, dosage, frequency, times, notes), `MedicationLog`, `MedicationStatus`
- **`notification.ts`** — `AppNotification` (id, title, body, scheduledDate, type)

### `src/repositories/` — Contratos de Acesso a Dados

Interfaces que definem **como acessar dados**, sem amarrar a uma implementação específica:

- **`weight-repository.ts`** — `IWeightRepository`: getAll, getById, create, update, remove
- **`medication-repository.ts`** — `IMedicationRepository`: CRUD de medicamentos + logs de uso

### `src/services/` — Contratos de Regras de Negócio

Interfaces que definem a **API interna** consumida pela UI:

- **`weight-service.ts`** — `IWeightService`: getAllRecords, addRecord, getChartData, getSummary
- **`medication-service.ts`** — `IMedicationService`: getAllMedications, addMedication, registerUse, getRecentLogs
- **`notification-service.ts`** — `INotificationService`: schedule, cancel, getAll

### `src/mocks/` — Dados Fake

Dados simulados para desenvolvimento e testes da interface:

- **`weight-mocks.ts`** — 7 registros de peso (jan-fev 2026), gráfico formatado e resumo com tendência
- **`medication-mocks.ts`** — 3 medicações (Losartana, Metformina, Vitamina D) + 8 logs de uso
- **`health-tips.ts`** — 10 dicas de saúde exibidas aleatoriamente na splash screen

---

## 🔁 Fluxo de Dados (API Interna)

```
Tela (UI)  →  chama método do Service  →  Service aplica regra de negócio
                                            ↓
                                       Repository busca/salva dados
                                            ↓
                                       Dados retornam para a UI
```

Exemplo prático no fluxo de peso:

```
WeightScreen  →  weightService.addRecord(80.5, '2026-02-18')
                    → weightRepository.create({ value: 80.5, date: '...' })
                    → retorna WeightRecord criado
                    → tela atualiza a lista
```

---

## ⚙️ Arquivos de Configuração

| Arquivo | Função |
|---|---|
| `app.json` | Nome do app, ícones, splash, plugins do Expo, orientação |
| `package.json` | Dependências, scripts (start, android, ios, web, lint) |
| `tsconfig.json` | TypeScript strict mode, alias `@/*` apontando para a raiz |
| `eslint.config.js` | Padrão de código (eslint-config-expo) |
| `expo-env.d.ts` | Tipos globais gerados pelo Expo |

---

## 📌 Decisões Técnicas

| Decisão | Justificativa |
|---|---|
| Expo Router (file-based) | Roteamento automático por arquivos — menos configuração manual |
| `app/` só para telas | Exigência do Expo Router, evita conflito com rotas automáticas |
| `src/` para lógica | Separação clara entre UI e negócio, facilita trabalho em equipe |
| Interfaces em vez de classes | Contratos leves, permitem trocar implementação (mock → real) |
| Barrel exports (index.ts) | Imports limpos: `from '@/src/models'` em vez de caminhos longos |
| Dados mockados | MVP funcional sem banco de dados, fácil de testar |
| Tema centralizado | Uma única fonte de verdade para cores, fontes e espaçamentos |

---

## 🔮 Possibilidades de Evolução Técnica

- Persistência local definitiva (AsyncStorage ou SQLite)
- Implementação concreta dos services e repositories
- Criação de backend externo futuramente
- Sincronização em nuvem
- Testes automatizados (Jest + React Native Testing Library)
- Modularização mais avançada

---

## 📚 Observação Final

Este documento reflete a estrutura **real e atual** do projeto, servindo como guia para entender o papel de cada arquivo e pasta, tanto para fins acadêmicos quanto para manutenção e evolução futura.