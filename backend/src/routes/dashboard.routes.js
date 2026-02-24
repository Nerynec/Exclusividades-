const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  const { from, to } = req.query;

  const filters = [];
  const params = [];

  if (from) {
    filters.push('v.fecha >= ?');
    params.push(from);
  }
  if (to) {
    filters.push('v.fecha <= ?');
    params.push(to);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const [topProducts] = await pool.query(
    `SELECT p.nombre, SUM(vd.cantidad) AS total_vendido
     FROM venta_detalle vd
     JOIN productos p ON p.id = vd.producto_id
     JOIN ventas v ON v.id = vd.venta_id
     ${whereClause}
     GROUP BY p.id
     ORDER BY total_vendido DESC
     LIMIT 5`,
    params
  );

  const [salesByMonth] = await pool.query(
    `SELECT DATE_FORMAT(v.fecha, '%Y-%m') AS periodo, SUM(v.total) AS total
     FROM ventas v
     ${whereClause}
     GROUP BY DATE_FORMAT(v.fecha, '%Y-%m')
     ORDER BY periodo DESC`,
    params
  );

  const [salesByDay] = await pool.query(
    `SELECT DATE(v.fecha) AS fecha, SUM(v.total) AS total
     FROM ventas v
     ${whereClause}
     GROUP BY DATE(v.fecha)
     ORDER BY fecha DESC`,
    params
  );

  return res.json({ topProducts, salesByMonth, salesByDay });
});

module.exports = router;
