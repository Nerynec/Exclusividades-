const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM compras ORDER BY fecha DESC');
  return res.json(rows);
});

router.post('/', async (req, res) => {
  const { producto_id, proveedor, cantidad, costo_unitario } = req.body;
  if (!producto_id || !proveedor || !cantidad || !costo_unitario) {
    return res.status(400).json({ message: 'Datos incompletos para la compra' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const total = Number(cantidad) * Number(costo_unitario);

    await conn.query(
      'INSERT INTO compras (producto_id, proveedor, cantidad, costo_unitario, total, fecha) VALUES (?, ?, ?, ?, ?, NOW())',
      [producto_id, proveedor, cantidad, costo_unitario, total]
    );

    await conn.query('UPDATE productos SET stock = stock + ? WHERE id = ?', [cantidad, producto_id]);

    await conn.query('INSERT INTO caja_movimientos (tipo, monto, descripcion, fecha) VALUES (?, ?, ?, NOW())', [
      'egreso',
      total,
      `Compra proveedor ${proveedor}`
    ]);

    await conn.commit();
    return res.status(201).json({ message: 'Compra registrada', total });
  } catch (error) {
    await conn.rollback();
    return res.status(500).json({ message: 'Error al registrar compra', detail: error.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
