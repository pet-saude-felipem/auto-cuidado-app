import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// ----------------------------------------------------------------
// GET /medications — lista todas as medicações
// ----------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, dosage, frequency, times, notes FROM medications ORDER BY name',
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar medicações', detail: String(err) });
  }
});

// ----------------------------------------------------------------
// GET /medications/:id — busca uma medicação pelo id
// ----------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, dosage, frequency, times, notes FROM medications WHERE id = $1',
      [req.params.id],
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Medicação não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar medicação', detail: String(err) });
  }
});

// ----------------------------------------------------------------
// POST /medications — cria uma nova medicação
// ----------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  const { name, dosage, frequency, times, notes } = req.body as {
    name: string;
    dosage: string;
    frequency: string;
    times: string[];
    notes?: string;
  };

  if (!name || !dosage || !frequency || !times?.length) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, dosage, frequency, times' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO medications (name, dosage, frequency, times, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, dosage, frequency, times, notes ?? null],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar medicação', detail: String(err) });
  }
});

// ----------------------------------------------------------------
// PATCH /medications/:id — atualiza campos de uma medicação
// ----------------------------------------------------------------
router.patch('/:id', async (req: Request, res: Response) => {
  const allowed = ['name', 'dosage', 'frequency', 'times', 'notes'];
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
    return res.status(400).json({ error: 'Nenhum campo válido para atualizar' });
  }

  values.push(req.params.id);

  try {
    const { rows } = await pool.query(
      `UPDATE medications SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Medicação não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar medicação', detail: String(err) });
  }
});

// ----------------------------------------------------------------
// DELETE /medications/:id — remove uma medicação
// ----------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM medications WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Medicação não encontrada' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover medicação', detail: String(err) });
  }
});

export default router;
