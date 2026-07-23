# Relatório de Segurança — AutoCuidado

> Análise realizada com base no OWASP Top 10.  
> Escopo: backend Express + PostgreSQL (`BD_SQL/server/`)

---

## 🔴 Falha 1 — Interpolação de parâmetro em SQL (SQL Injection parcial)

**Arquivo:** `BD_SQL/server/src/routes/medication-logs.ts`  
**OWASP:** A03:2021 – Injection  
**Severidade:** Alta

### Problema

O parâmetro `days` da query string é interpolado diretamente na string SQL, mesmo que `Number()` seja usado:

```ts
// ❌ INSEGURO
conditions.push(`date >= CURRENT_DATE - INTERVAL '${Number(days)} days'`);
```

Se `days` for um valor não-numérico, `Number()` retorna `NaN`, gerando a query:

```sql
date >= CURRENT_DATE - INTERVAL 'NaN days'
```

Isso causa um erro de sintaxe no PostgreSQL, que é então **exposto ao cliente** via `detail: String(err)` (ver Falha 2). Embora a conversão com `Number()` previna injeção clássica de strings, o padrão está errado e o valor nunca é parametrizado.

### Correção

```ts
// ✅ SEGURO — usar parâmetro e validar antes
if (days) {
  const parsedDays = parseInt(String(days), 10);
  if (isNaN(parsedDays) || parsedDays <= 0) {
    return res.status(400).json({ error: 'Parâmetro "days" deve ser um inteiro positivo.' });
  }
  conditions.push(`date >= CURRENT_DATE - ($${idx++} * INTERVAL '1 day')`);
  values.push(parsedDays);
}
```

---

## 🔴 Falha 2 — Detalhes internos de erro expostos nas respostas

**Arquivos:** todos os arquivos em `BD_SQL/server/src/routes/`  
**OWASP:** A09:2021 – Security Logging and Monitoring Failures  
**Severidade:** Alta

### Problema

Todos os blocos `catch` retornam o erro bruto do banco para o cliente:

```ts
// ❌ INSEGURO — em weight-records.ts, medications.ts e medication-logs.ts
res.status(500).json({ error: 'Erro ao buscar pesos.', detail: String(err) });
```

Isso expõe para qualquer usuário:
- Nomes de tabelas e colunas do banco de dados
- Stack traces internas
- Mensagens de erro do PostgreSQL (ex: violação de constraint, tipos de dados)

Essas informações são valiosas para um atacante mapear a estrutura do sistema.

### Correção

```ts
// ✅ SEGURO — logar internamente, retornar mensagem genérica
} catch (err) {
  console.error('Erro interno:', err); // só no servidor
  res.status(500).json({ error: 'Erro interno no servidor.' }); // sem detalhes
}
```

---

## 🟠 Falha 3 — CORS aberto para todas as origens

**Arquivo:** `BD_SQL/server/src/index.ts`  
**OWASP:** A05:2021 – Security Misconfiguration  
**Severidade:** Média

### Problema

```ts
// ❌ INSEGURO — permite qualquer origem
app.use(cors());
```

Com `cors()` sem configuração, qualquer site na internet pode fazer requisições para a API enquanto ela estiver acessível na rede.

### Correção

```ts
// ✅ SEGURO — restringir origens
app.use(cors({
  origin: ['http://localhost:8081', 'http://10.0.2.2:8081'], // origens do Expo
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
```

---

## 🟠 Falha 4 — Sem validação do campo `status` nos logs de medicação

**Arquivo:** `BD_SQL/server/src/routes/medication-logs.ts`  
**OWASP:** A03:2021 – Injection  
**Severidade:** Média

### Problema

O campo `status` é apenas verificado para existência, sem validar se é um dos valores permitidos (`'taken'` ou `'missed'`):

```ts
// ❌ INSEGURO — qualquer string é aceita e gravada no banco
if (!medicationId || !date || !time || !status) { ... }
```

Um cliente malicioso pode inserir valores arbitrários no campo `status` do banco de dados.

### Correção

```ts
// ✅ SEGURO — validar contra a lista de valores aceitos
const ALLOWED_STATUS = ['taken', 'missed'] as const;
if (!ALLOWED_STATUS.includes(status)) {
  return res.status(400).json({ error: 'status deve ser "taken" ou "missed".' });
}
```

---

## 🟡 Falha 5 — Credenciais padrão hardcoded no código-fonte

**Arquivo:** `BD_SQL/server/src/db.ts`  
**OWASP:** A07:2021 – Identification and Authentication Failures  
**Severidade:** Baixa (contexto local/dev)

### Problema

```ts
// ❌ Credenciais de fallback hardcoded
password: process.env.POSTGRES_PASSWORD ?? 'autocuidado_pass',
```

Se o arquivo `.env` não for criado, a aplicação sobe com credenciais conhecidas e documentadas publicamente no repositório.

### Correção

Remover os valores de fallback e exigir as variáveis de ambiente explicitamente:

```ts
// ✅ Falha se não configurado — força o desenvolvedor a criar o .env
const required = (key: string) => {
  const val = process.env[key];
  if (!val) throw new Error(`Variável de ambiente obrigatória não definida: ${key}`);
  return val;
};

export const pool = new Pool({
  host:     process.env.POSTGRES_HOST ?? 'localhost',
  port:     Number(process.env.POSTGRES_PORT ?? 5432),
  database: process.env.POSTGRES_DB ?? 'autocuidado',
  user:     required('POSTGRES_USER'),
  password: required('POSTGRES_PASSWORD'),
});
```

---

## Resumo

| # | Descrição | Severidade | OWASP |
|---|-----------|-----------|-------|
| 1 | Interpolação de `days` em INTERVAL SQL | 🔴 Alta | A03 Injection |
| 2 | Detalhes de erro interno retornados ao cliente | 🔴 Alta | A09 Logging |
| 3 | CORS aberto para todas as origens | 🟠 Média | A05 Misconfiguration |
| 4 | Campo `status` sem validação de enum | 🟠 Média | A03 Injection |
| 5 | Credenciais padrão hardcoded | 🟡 Baixa | A07 Authentication |

> **Nota:** Este é um projeto educacional/MVP. As falhas de maior impacto (1 e 2) devem ser corrigidas mesmo em ambiente de desenvolvimento, pois ensinam boas práticas que serão necessárias em produção.
