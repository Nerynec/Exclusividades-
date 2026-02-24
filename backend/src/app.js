const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');

const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const salesRoutes = require('./routes/sales.routes');
const purchasesRoutes = require('./routes/purchases.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const cashRoutes = require('./routes/cash.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);

app.use('/api', authMiddleware);
app.use('/api/productos', productsRoutes);
app.use('/api/ventas', salesRoutes);
app.use('/api/compras', purchasesRoutes);
app.use('/api/inventario', inventoryRoutes);
app.use('/api/caja', cashRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((err, _req, res, _next) => {
  return res.status(500).json({ message: 'Error interno', detail: err.message });
});

module.exports = app;
