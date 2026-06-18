# Como Rodar o Projeto

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [PostgreSQL](https://www.postgresql.org/download/) instalado e em execução
- Aplicativo [Expo Go](https://expo.dev/go) no celular (opcional)

---

## Ordem de inicialização

```
1. PostgreSQL        →  serviço rodando localmente
2. Banco (Prisma)    →  npm run db:setup         (pasta BD_SQL/server/)
3. API REST          →  npm run dev              (pasta BD_SQL/server/)
4. Expo              →  npx expo start           (pasta raiz AppAutoCuidado/)
```

---

## 1. Banco de dados (PostgreSQL + Prisma)

### Criar o banco (primeira vez)

No **psql** ou pgAdmin, execute:

```sql
CREATE USER autocuidado_user WITH PASSWORD 'autocuidado_pass';
CREATE DATABASE autocuidado OWNER autocuidado_user;
```

> Ajuste usuário/senha no `.env` se usar credenciais diferentes.

### Aplicar schema e dados iniciais

```bash
cd BD_SQL/server
npm install
npm run db:setup
```

O comando `db:setup` aplica as migrations e popula o banco com os dados iniciais (seed).

### Comandos úteis do Prisma

| Comando | O que faz |
|---------|-----------|
| `npm run db:setup` | Aplica migrations + seed (setup completo) |
| `npm run db:seed` | Repopula dados iniciais |
| `npm run db:reset` | Apaga tudo, reaplica migrations e seed |
| `npm run prisma:migrate` | Cria/aplica migration em desenvolvimento |
| `npm run prisma:studio` | Interface visual do banco |

---

## 2. API REST (Backend)

```bash
cd BD_SQL/server
npm run dev
```

A API ficará disponível em `http://localhost:3001`.

Teste: `GET http://localhost:3001/health`

### Variáveis de ambiente

Arquivo `BD_SQL/server/.env`:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=autocuidado
POSTGRES_USER=autocuidado_user
POSTGRES_PASSWORD=autocuidado_pass
API_PORT=3001
DATABASE_URL=postgresql://autocuidado_user:autocuidado_pass@localhost:5432/autocuidado?schema=public
```

---

## 3. Aplicativo Expo (Frontend)

```bash
npm install
npx expo start
```

| Tecla | Ação |
|-------|------|
| `w` | Abrir no navegador |
| `a` | Abrir no emulador Android |
| `i` | Abrir no simulador iOS (apenas macOS) |

### Dispositivo físico

Escaneie o QR Code com o **Expo Go**.

> Em dispositivos físicos, ajuste a URL da API em `src/api/config.ts` para o IP da sua máquina na rede local.

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Status da API |
| `GET` | `/medications` | Lista medicações |
| `GET` | `/medications/:id` | Busca medicação por ID |
| `POST` | `/medications` | Cria medicação |
| `PATCH` | `/medications/:id` | Atualiza medicação |
| `DELETE` | `/medications/:id` | Remove medicação |
| `GET` | `/medication-logs` | Lista logs (`?days=7&medicationId=UUID`) |
| `POST` | `/medication-logs` | Registra uso ou perda |
| `GET` | `/weight-records` | Lista registros de peso |
| `POST` | `/weight-records` | Cria registro de peso |
