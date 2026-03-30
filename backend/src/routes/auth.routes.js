const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
  }

  try {
    // Consulta usando la nueva columna 'password' en texto plano
    const [users] = await pool.query('SELECT id, nombre, email, password, rol FROM usuarios WHERE email = ?', [email]);

    if (!users.length) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const user = users[0];

    // Comparación directa de texto plano
    if (user.password !== password) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al iniciar sesión', detail: error.message });
  }
});

module.exports = router;