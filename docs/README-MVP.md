## 📄 README-MVP.md

*(Definição do Produto Mínimo Viável)*

# AutoCuidado – Definição do MVP

Este documento descreve o **Produto Mínimo Viável (MVP)** do aplicativo AutoCuidado, definindo claramente o escopo, funcionalidades essenciais, limitações e critérios de conclusão do projeto.

---

## 🎯 Objetivo do MVP

O objetivo do MVP do AutoCuidado é **demonstrar, de forma funcional**, um aplicativo mobile capaz de:

- Monitorar peso corporal
- Controlar o uso de medicações
- Emitir lembretes e notificações locais
- Aplicar conceitos de organização, arquitetura e integração interna

O MVP prioriza **funcionalidade, clareza arquitetural e integração entre módulos**, não robustez comercial.

---

## 📱 Escopo do MVP

O MVP contempla **somente funcionalidades essenciais**, suficientes para validar a proposta do aplicativo.

---

## ⚖️ Funcionalidades Incluídas

### Monitoramento de Peso
- Registro manual de peso
- Data personalizada para cada registro
- Anotações opcionais
- Listagem de registros
- Visualização da evolução em gráfico simples
- Identificação de tendência (ganho ou perda)
- Lembrete mensal de pesagem

---

### 💊 Controle de Medicações
- Cadastro de medicamentos
- Definição de dosagem
- Definição de frequência (1x, 2x, 3x ao dia, etc.)
- Definição de horários
- Alarmes e lembretes automáticos
- Registro rápido de uso:
  - “Tomei”
  - “Perdi”
- Histórico automático dos últimos 30 dias

---

### 🔔 Notificações
- Notificações locais no dispositivo
- Alertas visuais e sonoros
- Agendamento automático com base na frequência
- Disparo de eventos internos

---

### 🎨 Interface
- Navegação por abas
- Layout simples e funcional
- Componentes reutilizáveis
- Splash screen com dicas de saúde (mock/local)

---

## ❌ Funcionalidades Fora do Escopo do MVP

As seguintes funcionalidades **não fazem parte do MVP**:

- Backend ou API externa
- Login ou autenticação
- Sincronização em nuvem
- Múltiplos usuários
- Integração com dispositivos de saúde
- Relatórios avançados
- Exportação de dados
- Personalização avançada de tema

---

## 🧠 Premissas do MVP

- Aplicação totalmente local
- Uso de dados mockados ou persistência local simples
- Foco em arquitetura e integração
- Interface funcional, não final
- Sem dependência de internet

---

## 📌 Critérios de Conclusão do MVP

O MVP será considerado concluído quando:

- As abas principais estiverem funcionando:
  - Peso
  - Medicação
  - Histórico / Configurações
- O usuário conseguir:
  - Registrar peso
  - Visualizar gráfico
  - Cadastrar medicação
  - Receber alarmes
  - Registrar uso (“Tomei/Perdi”)
- As notificações funcionarem corretamente no Android
- Os módulos estiverem integrados via API interna
- O código estiver organizado conforme arquitetura definida

---

## 👥 Divisão de Responsabilidades no MVP

- **Interface e Estrutura**
  - Navegação
  - Layout
  - Integração visual

- **Lógica de Peso**
  - Modelos
  - Cálculos
  - Tendências
  - Dados para gráficos

- **Medicações e Notificações**
  - Alarmes
  - Agendamento
  - Histórico
  - Eventos internos

---

## 🚀 Visão Pós-MVP

Após a conclusão do MVP, o projeto pode evoluir para:

- Persistência local avançada
- Exportação de dados
- Relatórios detalhados
- Suporte a múltiplos perfis
- Sincronização em nuvem
- Backend externo

---

## 📚 Observação Final

Este MVP foi definido com foco em **clareza, viabilidade e alinhamento acadêmico**, garantindo que o projeto entregue valor funcional sem extrapolar o escopo proposto.