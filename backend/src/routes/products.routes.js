const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM productos ORDER BY id DESC');
  return res.json(rows);
});

router.post('/', async (req, res) => {
  const { nombre, categoria, precio, stock } = req.body;
  if (!nombre || !categoria || precio == null || stock == null) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const [result] = await pool.query(
    'INSERT INTO productos (nombre, categoria, precio, stock) VALUES (?, ?, ?, ?)',
    [nombre, categoria, precio, stock]
  );

  return res.status(201).json({ id: result.insertId, nombre, categoria, precio, stock });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, precio, stock } = req.body;

  await pool.query(
    'UPDATE productos SET nombre = ?, categoria = ?, precio = ?, stock = ? WHERE id = ?',
    [nombre, categoria, precio, stock, id]
  );

  return res.json({ id: Number(id), nombre, categoria, precio, stock });
});

module.exports = router;
