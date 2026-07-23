## 📄 README-RESPONSIBILITIES.md

*(Divisão de Responsabilidades do Projeto)*

```md
# AutoCuidado – Divisão de Responsabilidades

Este documento define claramente as **responsabilidades de cada integrante** do projeto AutoCuidado, garantindo organização, alinhamento e integração entre os módulos da aplicação.

---

## 👤 Felipe — Estrutura Base e Interface

### 🎯 Objetivo
Criar o esqueleto da aplicação e garantir que todas as funcionalidades estejam integradas visualmente de forma consistente e funcional.

### 📌 Responsabilidades
- Criar o projeto base em React Native
- Definir a arquitetura inicial do aplicativo
- Documentar a tecnologia escolhida
- Criar a navegação por abas:
  - Monitoramento de Peso
  - Medicações
  - Histórico / Configurações
- Desenvolver layout base do aplicativo
- Criar componentes reutilizáveis:
  - Botões
  - Cards
  - Inputs
- Definir paleta de cores e tipografia
- Implementar tela de splash/loading com dicas de saúde
- Preparar contratos/interfaces para:
  - Registro de peso
  - Registro de medicações
  - Disparo de notificações
- Integrar dados mockados fornecidos pelo Anderson
- Integrar pontos de disparo de notificações fornecidos pelo Gustavo

---

## 👤 Anderson — Lógica de Monitoramento de Peso

### 🎯 Objetivo
Implementar toda a lógica relacionada ao monitoramento de peso e fornecer dados formatados para a interface.

### 📌 Responsabilidades
- Criar o modelo de dados de peso:
  - Valor
  - Data personalizada
  - Anotações opcionais
- Implementar CRUD de registros de peso (mock/local)
- Criar estrutura de dados para gráficos temporais
- Calcular indicadores de tendência:
  - Ganho de peso
  - Perda de peso
- Criar regra de lembrete mensal de pesagem
- Enviar eventos relacionados a peso para o sistema de notificações
- Criar dados fake/mocados para testes e desenvolvimento

---

## 👤 Gustavo — Medicações e Notificações

### 🎯 Objetivo
Garantir o funcionamento dos alarmes, lembretes e histórico de uso de medicações.

### 📌 Responsabilidades
- Criar modelo de dados de medicação:
  - Nome
  - Dosagem
  - Frequência
  - Horários
  - Anotações
- Implementar sistema de alarmes com múltiplos horários
- Criar alertas visuais e sonoros
- Implementar ações rápidas:
  - “Tomei”
  - “Perdi”
- Gerar histórico automático dos últimos 30 dias
- Implementar sistema de notificações do sistema operacional (Android)
- Criar agendamento automático de notificações com base na frequência
- Desenvolver mock funcional do sistema de notificações
- Expor callbacks/eventos para integração com a interface
- Receber regras de lembrete mensal do módulo de peso

---

## 🔁 Integração entre Responsabilidades

- A comunicação entre os módulos ocorre por meio de **API interna**
- Nenhum módulo acessa diretamente a implementação do outro
- A interface consome apenas métodos públicos expostos pelos services
- Eventos e callbacks são utilizados para comunicação entre módulos

---

## 📌 Observação Final

Esta divisão de responsabilidades foi definida para garantir clareza no desenvolvimento, facilitar integração e evitar conflitos de escopo durante a implementação do projeto.
