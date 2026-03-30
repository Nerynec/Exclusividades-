const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT id, nombre, categoria, stock,
            CASE WHEN stock <= 5 THEN 'bajo' ELSE 'ok' END AS estado_stock
     FROM productos
     ORDER BY stock ASC`
  );
  return res.json(rows);
});

module.exports = router;
