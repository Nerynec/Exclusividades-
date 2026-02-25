const $ = (s) => document.querySelector(s);
const loginView = $('#loginView');
const appView = $('#appView');

async function api(route, method = 'GET', body) {
  const res = await fetch(`/api.php?route=${route}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('Respuesta inválida del servidor. Verifica conexión a MySQL y configuración .env');
  }

  if (!res.ok) throw new Error(data.error || data.details || 'Error');
  return data;
}

function money(v) { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0); }
function table(rows, headers) {
  if (!rows.length) return '<p>Sin datos.</p>';
  return `<table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${Object.values(r).map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

async function refresh() {
  const from = $('#fromDate').value;
  const to = $('#toDate').value;
  const q = `from=${from}&to=${to}`;

  const dash = await api(`dashboard&${q}`);
  $('#kpiSales').textContent = dash.kpis.sales_count;
  $('#kpiRevenue').textContent = money(dash.kpis.revenue);
  $('#kpiProfit').textContent = money(dash.kpis.gross_profit);
  $('#topProducts').innerHTML = table(dash.top_products.map(x => ({ Producto: x.name, Cantidad: x.qty, Importe: money(x.amount) })), ['Producto', 'Cantidad', 'Importe']);
  $('#salesMonth').innerHTML = table(dash.sales_by_month.map(x => ({ Mes: x.period, Total: money(x.total) })), ['Mes', 'Total']);
  $('#salesDay').innerHTML = table(dash.sales_by_day.map(x => ({ Día: x.day, Total: money(x.total) })), ['Día', 'Total']);

  const inv = await api('inventory');
  $('#inventory').innerHTML = table(inv.map(i => ({ ID: i.id, Producto: i.name, Categoría: i.category, Stock: i.stock, Valor: money(i.inventory_value) })), ['ID', 'Producto', 'Categoría', 'Stock', 'Valor']);

  const cash = await api(`cash&${q}`);
  $('#cashBalance').textContent = `Balance en caja: ${money(cash.balance)}`;
}

$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  try {
    await api('login', 'POST', Object.fromEntries(form.entries()));
    loginView.classList.add('hidden');
    appView.classList.remove('hidden');
    const today = new Date().toISOString().slice(0, 10);
    const first = `${today.slice(0, 8)}01`;
    $('#fromDate').value = first;
    $('#toDate').value = today;
    document.querySelectorAll('input[type="date"]').forEach(i => { if (!i.value) i.value = today; });
    await refresh();
  } catch (err) {
    alert(err.message);
  }
});

$('#logoutBtn').addEventListener('click', async () => { await api('logout', 'POST'); location.reload(); });
$('#applyFilters').addEventListener('click', refresh);

$('#productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('products', 'POST', Object.fromEntries(new FormData(e.target).entries()));
    e.target.reset();
    await refresh();
  } catch (err) { alert(err.message); }
});

$('#cashForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('cash', 'POST', Object.fromEntries(new FormData(e.target).entries()));
    e.target.reset();
    await refresh();
  } catch (err) { alert(err.message); }
});

$('#saleForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target).entries());
  try {
    await api('sales', 'POST', { sale_date: d.sale_date, items: [{ product_id: +d.product_id, quantity: +d.quantity, unit_price: +d.unit_price }] });
    e.target.reset();
    await refresh();
  } catch (err) { alert(err.message); }
});

$('#purchaseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target).entries());
  try {
    await api('purchases', 'POST', { purchase_date: d.purchase_date, items: [{ product_id: +d.product_id, quantity: +d.quantity, unit_cost: +d.unit_cost }] });
    e.target.reset();
    await refresh();
  } catch (err) { alert(err.message); }
});
