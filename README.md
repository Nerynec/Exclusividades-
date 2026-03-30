# Sistema de gestión para tienda de ropa y accesorios

Proyecto fullstack con **backend en Node.js/Express**, **frontend en React** y **MySQL** para administrar:

- Productos (alta, edición y eliminación: ropa, botas, sombreros, cinchos, etc.)
- Ventas
- Compras
- Inventario
- Caja (ingresos/egresos y balance)
- Dashboard con filtros por fecha, productos más vendidos y ventas por día/mes
- Login con JWT
- Roles: admin y vendedor
- Reportes PDF descargables
- Dashboard en tiempo real (WebSockets)
- Modo oscuro

## Estructura

- `backend/`: API REST
- `frontend/`: interfaz web
- `backend/sql/schema.sql`: esquema e inserts iniciales
- `docker-compose.yml`: MySQL listo para usar

## 1) Levantar MySQL

```bash
docker compose up -d mysql
```

## 2) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## 3) Frontend

```bash
cd frontend
npm install
# opcional: export VITE_API_URL=http://localhost:4000/api
npm run dev
```

## Arranque rápido (un solo comando)

También puedes iniciar todo con:

```bash
chmod +x setup.sh
./setup.sh
```

Este script:
- Levanta MySQL con Docker Compose
- Espera a que la base esté lista
- Crea `backend/.env` si no existe
- Instala dependencias de backend y frontend
- Inicia backend y frontend

## Credenciales iniciales

- Usuario: `admin@tienda.com`
- Contraseña: `admin123`


## Si no te deja iniciar sesión

Si ya tenías una base creada de una versión anterior, puede existir un hash viejo para el usuario admin.

Opciones:
- Reiniciar la base (solo en desarrollo):

```bash
docker compose down -v
docker compose up -d mysql
```

- O simplemente intenta entrar con `admin@tienda.com` / `admin123`:
  al primer login exitoso, el backend migra automáticamente el hash del admin por defecto.

## Endpoints principales

- `POST /api/auth/login`
- `GET/POST/PUT /api/productos`
- `GET/POST /api/ventas`
- `GET/POST /api/compras`
- `GET /api/inventario`
- `GET /api/caja/movimientos`
- `GET /api/caja/balance`
- `GET /api/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET/POST /api/usuarios` (admin)
- `PUT /api/usuarios/:id/rol` (admin)
- `GET /api/reportes/ventas.pdf`
- `POST /api/caja/movimientos`
