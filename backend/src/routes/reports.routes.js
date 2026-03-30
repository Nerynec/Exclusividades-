const express = require('express');
const PDFDocument = require('pdfkit');
const pool = require('../config/db');

const router = express.Router();

router.get('/ventas.pdf', async (req, res) => {
  const { from, to } = req.query;
  const params = [];
  const filters = [];

  if (from) {
    filters.push('fecha >= ?');
    params.push(from);
  }
  if (to) {
    filters.push('fecha <= ?');
    params.push(to);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const [sales] = await pool.query(`SELECT id, fecha, total FROM ventas ${whereClause} ORDER BY fecha DESC`, params);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="reporte-ventas.pdf"');

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  doc.fontSize(18).text('Reporte de Ventas', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Fecha generación: ${new Date().toISOString()}`);
  if (from || to) {
    doc.text(`Filtro: ${from || 'inicio'} a ${to || 'hoy'}`);
  }

  doc.moveDown();
  let totalGlobal = 0;
  sales.forEach((sale) => {
    totalGlobal += Number(sale.total);
    doc.text(`#${sale.id} | ${new Date(sale.fecha).toISOString().slice(0, 10)} | $${Number(sale.total).toFixed(2)}`);
  });

  doc.moveDown();
  doc.fontSize(12).text(`Total ventas: $${totalGlobal.toFixed(2)}`);

  doc.end();
});

module.exports = router;
