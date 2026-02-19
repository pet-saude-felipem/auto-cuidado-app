# AutoCuidado – Monitor de Saúde Pessoal 🩺

Aplicativo mobile de **monitoramento pessoal de saúde**, desenvolvido como MVP com foco em autocuidado, organização e criação de hábitos saudáveis.

O AutoCuidado permite acompanhar a evolução de peso e gerenciar o uso de medicações de forma simples, centralizada e acessível — tudo 100% offline, sem depender de internet.

---

## 📱 Funcionalidades do MVP

### ⚖️ Monitoramento de Peso
- Registro manual de peso com data personalizada
- Anotações opcionais por registro
- Visualização da evolução em gráfico
- Indicação de tendência (ganho, perda ou estável)
- Lembrete mensal de pesagem

### 💊 Controle de Medicações
- Cadastro de medicamentos (nome, dosagem, frequência, horários)
- Ações rápidas: **"Tomei"** ou **"Perdi"**
- Histórico automático dos últimos 30 dias
- Alarmes e lembretes automáticos

### 🔔 Notificações
- Notificações locais no dispositivo
- Agendamento automático com base na frequência
- Alertas visuais e sonoros

### 🎨 Interface
- Navegação por abas (Peso, Medicações, Histórico)
- Layout limpo e funcional
- Componentes reutilizáveis (Button, Card, Input)
- Splash screen com dicas de saúde

---

## 🧱 Arquitetura

O projeto segue uma arquitetura em camadas com **API interna**:

```
UI (Telas) → Services → Repositories → Dados (mock/local)
```

A interface **nunca acessa dados diretamente**. Toda regra de negócio fica nos services, e os dados são fornecidos por repositories.

### Estrutura do Projeto

```
AppAutoCuidado/
  app/                    # Rotas/telas (Expo Router)
    _layout.tsx           # Layout raiz + splash screen
    (tabs)/
      _layout.tsx         # Navegação por abas
      index.tsx           # Tela de Peso
      medications.tsx     # Tela de Medicações
      history.tsx         # Tela de Histórico
  components/             # Componentes reutilizáveis
    button.tsx
    card.tsx
    input.tsx
  constants/
    theme.ts              # Cores, fontes, espaçamentos
  src/
    models/               # Interfaces TypeScript (Peso, Medicação, Notificação)
    repositories/         # Contratos de acesso a dados
    services/             # Contratos de regras de negócio
    mocks/                # Dados fake para desenvolvimento
```

---

## 🛠️ Tecnologias

- **React Native** + **TypeScript**
- **Expo** (SDK 54) + **Expo Router** (file-based routing)
- **MaterialCommunityIcons** para ícones
- Armazenamento local (sem backend externo)

---

## 🚀 Como Configurar e Rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Expo Go](https://expo.dev/go) instalado no celular (Android ou iOS)
- Ou um emulador Android / simulador iOS configurado

### Instalação

1. Clone o repositório e entre na pasta do projeto:

   ```bash
   cd AppAutoCuidado
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

### Executando o App

```bash
npx expo start
```

Depois de iniciar, você pode abrir o app de três formas:

| Método | Como fazer |
|---|---|
| **Expo Go (celular)** | Escaneie o QR Code que aparece no terminal com o app Expo Go |
| **Emulador Android** | Pressione `a` no terminal |
| **Simulador iOS** | Pressione `i` no terminal (somente macOS) |

### Outros comandos

```bash
npm run android    # Inicia direto no Android
npm run ios        # Inicia direto no iOS
npm run web        # Inicia versão web
npm run lint       # Verifica erros de código
```

---

## 👥 Equipe

| Integrante | Responsabilidade |
|---|---|
| **Felipe** | Estrutura base, interface, navegação, componentes, tema, splash screen |
| **Anderson** | Lógica de monitoramento de peso (models, cálculos, tendências, mocks) |
| **Gustavo** | Medicações e notificações (alarmes, agendamento, histórico, callbacks) |

---

## 🔒 Privacidade

- Dados armazenados **somente no dispositivo**
- Sem compartilhamento de informações
- Sem dependência de internet
- Controle total do usuário sobre seus registros

---

## 📚 Documentação

Documentação detalhada disponível na pasta `docs/`:

- [Descrição do Projeto](../docs/README-DESCRICAO.md)
- [Definição do MVP](../docs/README-MVP.md)
- [Pitch do Projeto](../docs/README-PITCH.md)
- [Divisão de Responsabilidades](../docs/README-RESPONSIBILITIES.md)
- [Documentação Técnica](../docs/README-TECHNICAL.md)
