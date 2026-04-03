import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// ----------------------------------------------------------------
// GET /weight-records — lista todos os registros de peso
// ----------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, value, date, notes FROM weight_records ORDER BY date DESC'
    );
    // Formata a data como string ISO (YYYY-MM-DD)
    const formatted = rows.map((r) => ({
      ...r,
      date: (r.date as Date).toISOString().split('T')[0],
    }));
    res.json(formatted);
  } catch (err) {
    console.error('ERRO AO BUSCAR PESOS:', err);
    res
      .status(500)
      .json({ error: 'Erro ao buscar pesos no servidor.', detail: String(err) });
  }
});

// ----------------------------------------------------------------
// GET /weight-records/:id — busca um registro de peso pelo id
// ----------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, value, date, notes FROM weight_records WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Registro de peso não encontrado' });
    }
    const record = {
      ...rows[0],
      date: (rows[0].date as Date).toISOString().split('T')[0],
    };
    res.json(record);
  } catch (err) {
    console.error('ERRO AO BUSCAR PESO:', err);
    res
      .status(500)
      .json({ error: 'Erro ao buscar peso.', detail: String(err) });
  }
});

// ----------------------------------------------------------------
// POST /weight-records — cria um novo registro de peso
// ----------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  const { value, date, notes } = req.body as {
    value: number;
    date?: string;
    notes?: string;
  };

  if (value === undefined || value === null || value <= 0) {
    return res
      .status(400)
      .json({ error: 'Campos obrigatórios: value (deve ser > 0)' });
  }

  try {
    const recordDate = date || new Date().toISOString().split('T')[0];
    const { rows } = await pool.query(
      `INSERT INTO weight_records (value, date, notes)
       VALUES ($1, $2, $3)
       RETURNING id, value, date, notes`,
      [value, recordDate, notes ?? null]
    );
    const record = {
      ...rows[0],
      date: (rows[0].date as Date).toISOString().split('T')[0],
    };
    res.status(201).json(record);
  } catch (err) {
    console.error('ERRO AO REGISTRAR PESO:', err);
    res
      .status(500)
      .json({ error: 'Erro ao registrar peso no banco.', detail: String(err) });
  }
});

// ----------------------------------------------------------------
// PATCH /weight-records/:id — atualiza um registro de peso
// ----------------------------------------------------------------
router.patch('/:id', async (req: Request, res: Response) => {
  const allowed = ['value', 'date', 'notes'];
  const updates: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates.push(`${key} = $${idx++}`);
      values.push(req.body[key]);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Nenhum campo para atualizar' });
  }

  values.push(req.params.id);

  try {
    const { rows } = await pool.query(
      `UPDATE weight_records
       SET ${updates.join(', ')}
       WHERE id = $${idx}
       RETURNING id, value, date, notes`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Registro de peso não encontrado' });
    }

    const record = {
      ...rows[0],
      date: (rows[0].date as Date).toISOString().split('T')[0],
    };
    res.json(record);
  } catch (err) {
    console.error('ERRO AO ATUALIZAR PESO:', err);
    res
      .status(500)
      .json({ error: 'Erro ao atualizar peso.', detail: String(err) });
  }
});

// ----------------------------------------------------------------
// DELETE /weight-records/:id — remove um registro de peso
// ----------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM weight_records WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Registro de peso não encontrado' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('ERRO AO DELETAR PESO:', err);
    res
      .status(500)
      .json({ error: 'Erro ao deletar peso.', detail: String(err) });
  }
});

export default router;