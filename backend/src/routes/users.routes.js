const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const requireRole = require('../middleware/roles');

const router = express.Router();

router.get('/', requireRole('admin'), async (_req, res) => {
  const [users] = await pool.query('SELECT id, nombre, email, rol, created_at FROM usuarios ORDER BY id DESC');
  return res.json(users);
});

router.post('/', requireRole('admin'), async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ message: 'nombre, email, password y rol son requeridos' });
  }

  if (!['admin', 'vendedor'].includes(rol)) {
    return res.status(400).json({ message: 'Rol inválido' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, passwordHash, rol]
  );

  return res.status(201).json({ id: result.insertId, nombre, email, rol });
});

router.put('/:id/rol', requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  if (!['admin', 'vendedor'].includes(rol)) {
    return res.status(400).json({ message: 'Rol inválido' });
  }

  await pool.query('UPDATE usuarios SET rol = ? WHERE id = ?', [rol, id]);
  return res.json({ id: Number(id), rol });
});

module.exports = router;
