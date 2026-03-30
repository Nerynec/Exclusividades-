const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (_req, res) => {
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
    [nombre, categoria, Number(precio), Number(stock)]
  );

  return res.status(201).json({ id: result.insertId, nombre, categoria, precio: Number(precio), stock: Number(stock) });
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, precio, stock } = req.body;

  if (!nombre || !categoria || precio == null || stock == null) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  await pool.query(
    'UPDATE productos SET nombre = ?, categoria = ?, precio = ?, stock = ? WHERE id = ?',
    [nombre, categoria, Number(precio), Number(stock), id]
  );

  return res.json({ id: Number(id), nombre, categoria, precio: Number(precio), stock: Number(stock) });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const [[product]] = await pool.query('SELECT id FROM productos WHERE id = ?', [id]);
  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  await pool.query('DELETE FROM productos WHERE id = ?', [id]);
  return res.json({ message: 'Producto eliminado', id: Number(id) });
});

module.exports = router;
