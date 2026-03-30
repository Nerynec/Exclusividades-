const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/movimientos', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM caja_movimientos ORDER BY fecha DESC');
  return res.json(rows);
});

router.post('/movimientos', async (req, res) => {
  const { tipo, monto, descripcion } = req.body;

  if (!['ingreso', 'egreso'].includes(tipo) || !monto) {
    return res.status(400).json({ message: 'Tipo y monto son obligatorios' });
  }

  const [result] = await pool.query(
    'INSERT INTO caja_movimientos (tipo, monto, descripcion, fecha) VALUES (?, ?, ?, NOW())',
    [tipo, Number(monto), descripcion || null]
  );

  return res.status(201).json({ id: result.insertId, tipo, monto: Number(monto), descripcion: descripcion || null });
});

router.get('/balance', async (_req, res) => {
  const [[result]] = await pool.query(
    `SELECT 
      COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) AS ingresos,
      COALESCE(SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END), 0) AS egresos,
      COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END), 0) AS balance
     FROM caja_movimientos`
  );

  return res.json(result);
});

module.exports = router;
