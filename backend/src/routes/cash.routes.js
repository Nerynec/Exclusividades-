const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/movimientos', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM caja_movimientos ORDER BY fecha DESC');
  return res.json(rows);
});

router.get('/balance', async (_req, res) => {
  const [[result]] = await pool.query(
    `SELECT 
      SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) AS ingresos,
      SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END) AS egresos,
      SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END) AS balance
     FROM caja_movimientos`
  );

  return res.json(result);
});

module.exports = router;
