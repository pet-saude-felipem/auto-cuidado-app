import { Router, Request, Response } from 'express';
import { pool } from '../db';

const router = Router();

// ----------------------------------------------------------------
// GET /medication-logs
//   ?days=7   → apenas os últimos N dias (padrão: todos)
//   ?medicationId=UUID → filtra por medicação
// ----------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  const { days, medicationId } = req.query;
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (days) {
    conditions.push(`date >= CURRENT_DATE - INTERVAL '${Number(days)} days'`);
  }
  if (medicationId) {
    conditions.push(`medication_id = $${idx++}`);
    values.push(medicationId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const { rows } = await pool.query(
      `SELECT id, medication_id AS "medicationId", date, time, status
       FROM medication_logs
       ${where}
       ORDER BY date DESC, time DESC`,
      values,
    );
    // Formata a data como string ISO (YYYY-MM-DD)
    const formatted = rows.map((r) => ({
      ...r,
      date: (r.date as Date).toISOString().split('T')[0],
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar logs', detail: String(err) });
  }
});

// ----------------------------------------------------------------
// POST /medication-logs — registra uso/perda de medicação
// ----------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  const { medicationId, date, time, status } = req.body as {
    medicationId: string;
    date: string;
    time: string;
    status: 'taken' | 'missed';
  };

  if (!medicationId || !date || !time || !status) {
    return res
      .status(400)
      .json({ error: 'Campos obrigatórios: medicationId, date, time, status' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO medication_logs (medication_id, date, time, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, medication_id AS "medicationId", date, time, status`,
      [medicationId, date, time, status],
    );
    const log = {
      ...rows[0],
      date: (rows[0].date as Date).toISOString().split('T')[0],
    };
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar uso', detail: String(err) });
  }
});

export default router;
