# Como Rodar o Projeto

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) **ou** [PostgreSQL](https://www.postgresql.org/download/windows/) instalado localmente
- Aplicativo [Expo Go](https://expo.dev/go) no celular (opcional, para testar em dispositivo físico)

---

## 1. Banco de Dados (PostgreSQL)

### Opção A — Docker (recomendado)

```bash
cd BD_SQL
docker-compose up -d
```

O Docker irá:
- Subir o PostgreSQL na porta `5432`
- Criar o banco `autocuidado`
- Executar o schema e popular com os dados iniciais automaticamente

### Opção B — PostgreSQL instalado localmente

1. Abra o **psql** como superuser e execute:

```sql
CREATE USER autocuidado_user WITH PASSWORD 'autocuidado_pass';
CREATE DATABASE autocuidado OWNER autocuidado_user;
\c autocuidado
```

2. Execute os arquivos SQL:

```sql
\i 'caminho_da_pasta_no_seu_PC/BD_SQL/schema.sql'
\i 'caminho_da_pasta_no_seu_PC/BD_SQL/seed.sql'
```

---

## 2. API REST (Backend)

```bash
cd BD_SQL/server
npm install
npm run dev
```

A API ficará disponível em `http://localhost:3001`.

Para verificar se está funcionando:
```
GET http://localhost:3001/health
```

### Variáveis de ambiente

O arquivo `BD_SQL/server/.env` já está configurado com os valores padrão:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=autocuidado
POSTGRES_USER=autocuidado_user
POSTGRES_PASSWORD=autocuidado_pass
API_PORT=3001
```

---

## 3. Aplicativo Expo (Frontend)

```bash
cd AppAutoCuidado   # raiz do projeto Expo
npm install
npx expo start
```

Após iniciar, escolha a plataforma:

| Tecla | Ação |
|-------|------|
| `w` | Abrir no navegador |
| `a` | Abrir no emulador Android |
| `i` | Abrir no simulador iOS (apenas macOS) |

### Dispositivo físico

Escaneie o QR Code com o app **Expo Go**.

> **Atenção:** em dispositivos físicos ou no emulador Android, altere a URL da API em `src/api/config.ts`:
> ```ts
> // Emulador Android
> export const API_BASE_URL = 'http://10.0.2.2:3001';
>
> // Dispositivo físico (use o IP da sua máquina)
> export const API_BASE_URL = 'http://192.168.x.x:3001';
> ```

---

## Instalando as dependências

> Execute este passo sempre que clonar o repositório ou após excluir as pastas `node_modules/` (equivalente ao `target` do Java — não são versionadas).

**Expo (raiz do projeto):**
```bash
npm install
```

**Servidor (API REST):**
```bash
cd BD_SQL/server
npm install
```

---

## Ordem de inicialização

```
0. Instalar deps   →  npm install            (raiz e BD_SQL/server/)
1. Banco de dados  →  docker-compose up -d   (pasta BD_SQL/)
2. API REST        →  npm run dev             (pasta BD_SQL/server/)
3. Expo            →  npx expo start          (pasta raiz)
```

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/medications` | Lista todas as medicações |
| `GET` | `/medications/:id` | Busca medicação por ID |
| `POST` | `/medications` | Cria nova medicação |
| `PATCH` | `/medications/:id` | Atualiza medicação |
| `DELETE` | `/medications/:id` | Remove medicação |
| `GET` | `/medication-logs` | Lista logs (aceita `?days=7&medicationId=UUID`) |
| `POST` | `/medication-logs` | Registra uso ou perda de medicação |
