import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// GET /weight-records -> Lista todos os pesos
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM weight_records ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error("ERRO NO BANCO:", err);
        res.status(500).json({ error: 'Erro ao buscar pesos no servidor.' });
    }
});

// POST /weight-records -> Salva um novo peso
router.post('/', async (req, res) => {
    const { value, date, notes } = req.body;
    try {
        const query = 'INSERT INTO weight_records (value, date, notes) VALUES ($1, $2, $3) RETURNING *';
        const values = [value, date || new Date(), notes];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao registrar peso no banco.' });
    }
});

export default router;