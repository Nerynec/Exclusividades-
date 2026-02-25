<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../src/Database.php';

function jsonInput(): array
{
    $raw = file_get_contents('php://input');
    return $raw ? (json_decode($raw, true) ?: []) : [];
}

function respond($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function requireAuth(): void
{
    if (empty($_SESSION['user_id'])) {
        respond(['error' => 'No autorizado'], 401);
    }
}

function isValidPassword(array $user, string $password): bool
{
    $stored = (string)($user['password_hash'] ?? '');
    if ($stored === '') {
        return false;
    }

    if (password_verify($password, $stored)) {
        return true;
    }

    // Compatibilidad: algunos usuarios cargaron contraseñas en texto plano.
    return hash_equals($stored, $password);
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $path = $_GET['route'] ?? '';
    $pdo = Database::connection();

    if ($path === 'login' && $method === 'POST') {
        $body = jsonInput();
        $username = trim((string)($body['username'] ?? ''));
        $password = (string)($body['password'] ?? '');

        if ($username === '' || $password === '') {
            respond(['error' => 'Usuario y contraseña son obligatorios'], 422);
        }

        $stmt = $pdo->prepare('SELECT id, username, password_hash, full_name FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !isValidPassword($user, $password)) {
            respond(['error' => 'Credenciales inválidas'], 401);
        }

        // Si la contraseña estaba en texto plano, la migramos automáticamente a hash seguro.
        if (!password_verify($password, (string)$user['password_hash'])) {
            $newHash = password_hash($password, PASSWORD_BCRYPT);
            $update = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
            $update->execute([$newHash, (int)$user['id']]);
        }

        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['username'] = $user['username'];

        respond(['message' => 'Login correcto', 'user' => ['id' => (int)$user['id'], 'name' => $user['full_name']]]);
    }

    if ($path === 'logout' && $method === 'POST') {
        session_destroy();
        respond(['message' => 'Sesión cerrada']);
    }

    requireAuth();

    if ($path === 'products' && $method === 'GET') {
        $rows = $pdo->query('SELECT id, name, category, sku, purchase_price, sale_price, stock, created_at FROM products ORDER BY created_at DESC')->fetchAll();
        respond($rows);
    }

    if ($path === 'products' && $method === 'POST') {
        $body = jsonInput();
        $stmt = $pdo->prepare('INSERT INTO products(name, category, sku, purchase_price, sale_price, stock) VALUES(?,?,?,?,?,?)');
        $stmt->execute([
            $body['name'] ?? '',
            $body['category'] ?? 'General',
            $body['sku'] ?? null,
            (float)($body['purchase_price'] ?? 0),
            (float)($body['sale_price'] ?? 0),
            (int)($body['stock'] ?? 0),
        ]);
        respond(['message' => 'Producto creado', 'id' => (int)$pdo->lastInsertId()], 201);
    }

    if ($path === 'sales' && $method === 'POST') {
        $body = jsonInput();
        $items = $body['items'] ?? [];
        if (!$items) {
            respond(['error' => 'La venta requiere al menos un producto'], 422);
        }

        $pdo->beginTransaction();
        try {
            $stmtSale = $pdo->prepare('INSERT INTO sales(customer_name, payment_method, notes, sale_date, total_amount, user_id) VALUES(?,?,?,?,?,?)');
            $stmtItem = $pdo->prepare('INSERT INTO sale_items(sale_id, product_id, quantity, unit_price, subtotal) VALUES(?,?,?,?,?)');
            $stmtStock = $pdo->prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');
            $stmtPrice = $pdo->prepare('SELECT sale_price FROM products WHERE id = ?');

            $resolvedItems = [];
            $total = 0;
            foreach ($items as $item) {
                $stmtPrice->execute([(int)$item['product_id']]);
                $product = $stmtPrice->fetch();
                if (!$product) {
                    throw new Exception('Producto no encontrado');
                }

                $qty = (int)$item['quantity'];
                if ($qty <= 0) {
                    throw new Exception('Cantidad inválida en venta');
                }

                $unit = (float)($item['unit_price'] ?? $product['sale_price']);
                $subtotal = $qty * $unit;
                $total += $subtotal;
                $resolvedItems[] = ['product_id' => (int)$item['product_id'], 'quantity' => $qty, 'unit_price' => $unit, 'subtotal' => $subtotal];
            }

            $stmtSale->execute([
                $body['customer_name'] ?? null,
                $body['payment_method'] ?? 'Efectivo',
                $body['notes'] ?? null,
                $body['sale_date'] ?? date('Y-m-d'),
                $total,
                $_SESSION['user_id'],
            ]);

            $saleId = (int)$pdo->lastInsertId();

            foreach ($resolvedItems as $item) {
                $stmtItem->execute([$saleId, $item['product_id'], $item['quantity'], $item['unit_price'], $item['subtotal']]);
                $stmtStock->execute([$item['quantity'], $item['product_id'], $item['quantity']]);
                if ($stmtStock->rowCount() === 0) {
                    throw new Exception('Stock insuficiente para producto ID ' . $item['product_id']);
                }
            }

            $pdo->prepare("INSERT INTO cash_movements(type, amount, description, movement_date, source) VALUES('INGRESO', ?, ?, ?, 'VENTA')")
                ->execute([$total, 'Venta #' . $saleId, $body['sale_date'] ?? date('Y-m-d')]);

            $pdo->commit();
            respond(['message' => 'Venta registrada', 'sale_id' => $saleId, 'total' => $total], 201);
        } catch (Throwable $e) {
            $pdo->rollBack();
            respond(['error' => $e->getMessage()], 422);
        }
    }

    if ($path === 'purchases' && $method === 'POST') {
        $body = jsonInput();
        $items = $body['items'] ?? [];
        if (!$items) {
            respond(['error' => 'La compra requiere al menos un producto'], 422);
        }

        $pdo->beginTransaction();
        try {
            $stmtPurchase = $pdo->prepare('INSERT INTO purchases(supplier_name, notes, purchase_date, total_amount, user_id) VALUES(?,?,?,?,?)');
            $stmtItem = $pdo->prepare('INSERT INTO purchase_items(purchase_id, product_id, quantity, unit_cost, subtotal) VALUES(?,?,?,?,?)');
            $stmtStock = $pdo->prepare('UPDATE products SET stock = stock + ?, purchase_price = ? WHERE id = ?');

            $total = 0;
            foreach ($items as $item) {
                $qty = (int)$item['quantity'];
                $unit = (float)$item['unit_cost'];
                $total += $qty * $unit;
            }

            $stmtPurchase->execute([
                $body['supplier_name'] ?? null,
                $body['notes'] ?? null,
                $body['purchase_date'] ?? date('Y-m-d'),
                $total,
                $_SESSION['user_id'],
            ]);

            $purchaseId = (int)$pdo->lastInsertId();

            foreach ($items as $item) {
                $qty = (int)$item['quantity'];
                $unit = (float)$item['unit_cost'];
                $subtotal = $qty * $unit;
                $productId = (int)$item['product_id'];
                $stmtItem->execute([$purchaseId, $productId, $qty, $unit, $subtotal]);
                $stmtStock->execute([$qty, $unit, $productId]);
            }

            $pdo->prepare("INSERT INTO cash_movements(type, amount, description, movement_date, source) VALUES('EGRESO', ?, ?, ?, 'COMPRA')")
                ->execute([$total, 'Compra #' . $purchaseId, $body['purchase_date'] ?? date('Y-m-d')]);

            $pdo->commit();
            respond(['message' => 'Compra registrada', 'purchase_id' => $purchaseId, 'total' => $total], 201);
        } catch (Throwable $e) {
            $pdo->rollBack();
            respond(['error' => $e->getMessage()], 422);
        }
    }

    if ($path === 'inventory' && $method === 'GET') {
        $rows = $pdo->query('SELECT id, name, category, sku, stock, purchase_price, sale_price, (stock * sale_price) as inventory_value FROM products ORDER BY stock ASC')->fetchAll();
        respond($rows);
    }

    if ($path === 'cash' && $method === 'GET') {
        $from = $_GET['from'] ?? '2000-01-01';
        $to = $_GET['to'] ?? date('Y-m-d');
        $stmt = $pdo->prepare('SELECT id, type, amount, description, movement_date, source FROM cash_movements WHERE movement_date BETWEEN ? AND ? ORDER BY movement_date DESC, id DESC');
        $stmt->execute([$from, $to]);
        $rows = $stmt->fetchAll();

        $sum = $pdo->prepare("SELECT COALESCE(SUM(CASE WHEN type='INGRESO' THEN amount ELSE -amount END),0) as balance FROM cash_movements WHERE movement_date BETWEEN ? AND ?");
        $sum->execute([$from, $to]);
        $balance = $sum->fetch()['balance'];

        respond(['balance' => (float)$balance, 'movements' => $rows]);
    }

    if ($path === 'cash' && $method === 'POST') {
        $body = jsonInput();
        $stmt = $pdo->prepare('INSERT INTO cash_movements(type, amount, description, movement_date, source) VALUES(?,?,?,?,?)');
        $stmt->execute([
            $body['type'] ?? 'INGRESO',
            (float)($body['amount'] ?? 0),
            $body['description'] ?? '',
            $body['movement_date'] ?? date('Y-m-d'),
            'MANUAL'
        ]);
        respond(['message' => 'Movimiento registrado', 'id' => (int)$pdo->lastInsertId()], 201);
    }

    if ($path === 'dashboard' && $method === 'GET') {
        $from = $_GET['from'] ?? date('Y-m-01');
        $to = $_GET['to'] ?? date('Y-m-d');

        $top = $pdo->prepare('SELECT p.name, SUM(si.quantity) as qty, SUM(si.subtotal) as amount
            FROM sale_items si
            JOIN sales s ON s.id = si.sale_id
            JOIN products p ON p.id = si.product_id
            WHERE s.sale_date BETWEEN ? AND ?
            GROUP BY p.id, p.name
            ORDER BY qty DESC
            LIMIT 10');
        $top->execute([$from, $to]);

        $monthly = $pdo->prepare("SELECT DATE_FORMAT(sale_date, '%Y-%m') as period, SUM(total_amount) as total
            FROM sales WHERE sale_date BETWEEN ? AND ? GROUP BY period ORDER BY period");
        $monthly->execute([$from, $to]);

        $daily = $pdo->prepare('SELECT sale_date as day, SUM(total_amount) as total
            FROM sales WHERE sale_date BETWEEN ? AND ? GROUP BY sale_date ORDER BY sale_date');
        $daily->execute([$from, $to]);

        $kpis = $pdo->prepare('SELECT COUNT(*) as sales_count, COALESCE(SUM(total_amount),0) as revenue
            FROM sales WHERE sale_date BETWEEN ? AND ?');
        $kpis->execute([$from, $to]);

        $profit = $pdo->prepare('SELECT COALESCE(SUM(si.subtotal - (si.quantity * p.purchase_price)),0) as gross_profit
            FROM sale_items si
            JOIN sales s ON s.id = si.sale_id
            JOIN products p ON p.id = si.product_id
            WHERE s.sale_date BETWEEN ? AND ?');
        $profit->execute([$from, $to]);

        respond([
            'filters' => ['from' => $from, 'to' => $to],
            'kpis' => array_merge($kpis->fetch(), $profit->fetch()),
            'top_products' => $top->fetchAll(),
            'sales_by_month' => $monthly->fetchAll(),
            'sales_by_day' => $daily->fetchAll(),
        ]);
    }

    respond(['error' => 'Ruta no encontrada'], 404);
} catch (Throwable $e) {
    respond([
        'error' => 'Error interno del servidor',
        'details' => $e->getMessage(),
    ], 500);
}
