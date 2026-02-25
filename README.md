# Sistema de gestión para negocio de ropa y accesorios

Backend + frontend en **PHP + MySQL** para gestionar:

- Login.
- Productos.
- Ventas.
- Compras.
- Inventario.
- Caja.
- Dashboard con filtros (rango de fechas), productos más vendidos, ventas por mes y por día.

## 1) Requisitos

- PHP 8+
- MySQL Server 8+

## 2) Configuración rápida

1. Crear base de datos y tablas:

```bash
mysql -u root -p < database/schema.sql
```

2. Configurar variables de entorno:

```bash
cp .env.example .env
# editar .env con tus credenciales
```

3. Levantar servidor:

```bash
php -S 0.0.0.0:8000 -t public
```

4. Abrir en navegador:

`http://localhost:8000`

## 3) Usuario demo

- usuario: `admin`
- contraseña: `admin123`

## 4) API principal

- `POST /api.php?route=login`
- `POST /api.php?route=logout`
- `GET|POST /api.php?route=products`
- `POST /api.php?route=sales`
- `POST /api.php?route=purchases`
- `GET /api.php?route=inventory`
- `GET|POST /api.php?route=cash`
- `GET /api.php?route=dashboard&from=YYYY-MM-DD&to=YYYY-MM-DD`

## 5) Si no te deja iniciar sesión

1. Verifica que se importó `database/schema.sql` (debe existir la tabla `users` con el usuario `admin`).
2. Verifica credenciales de MySQL en `.env`.
3. Confirma que MySQL está encendido.
4. Prueba login por terminal:

```bash
curl -X POST 'http://localhost:8000/api.php?route=login' \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

Si hay error interno, la API responde JSON con `details` para diagnóstico.
