const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT v.id, v.fecha, v.total, p.nombre AS producto, vd.cantidad, vd.precio_unitario
     FROM ventas v
     JOIN venta_detalle vd ON vd.venta_id = v.id
     JOIN productos p ON p.id = vd.producto_id
     ORDER BY v.fecha DESC`
  );

  return res.json(rows);
});

router.post('/', async (req, res) => {
  const io = req.app.get('io');
  const conn = await pool.getConnection();
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: 'Debe enviar al menos un item de venta' });
    }

    await conn.beginTransaction();

    let total = 0;
    for (const item of items) {
      total += Number(item.cantidad) * Number(item.precio_unitario);
    }

    const [ventaResult] = await conn.query('INSERT INTO ventas (fecha, total) VALUES (NOW(), ?)', [total]);
    const ventaId = ventaResult.insertId;

    for (const item of items) {
      await conn.query(
        'INSERT INTO venta_detalle (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [ventaId, item.producto_id, item.cantidad, item.precio_unitario]
      );
      await conn.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [item.cantidad, item.producto_id]);
    }

    await conn.query('INSERT INTO caja_movimientos (tipo, monto, descripcion, fecha) VALUES (?, ?, ?, NOW())', [
      'ingreso',
      total,
      `Venta #${ventaId}`
    ]);

    await conn.commit();

    if (io) {
      io.emit('sale:created', { ventaId, total, fecha: new Date().toISOString() });
    }

    return res.status(201).json({ ventaId, total });
  } catch (error) {
    await conn.rollback();
    return res.status(500).json({ message: 'Error al registrar venta', detail: error.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
