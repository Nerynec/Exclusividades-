# Sistema de gestión para tienda de ropa y accesorios

Proyecto fullstack con **backend en Node.js/Express**, **frontend en React** y **MySQL** para administrar:

- Productos (ropa, botas, sombreros, cinchos, etc.)
- Ventas
- Compras
- Inventario
- Caja (ingresos/egresos y balance)
- Dashboard con filtros por fecha, productos más vendidos y ventas por día/mes
- Login con JWT

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

## Endpoints principales

- `POST /api/auth/login`
- `GET/POST/PUT /api/productos`
- `GET/POST /api/ventas`
- `GET/POST /api/compras`
- `GET /api/inventario`
- `GET /api/caja/movimientos`
- `GET /api/caja/balance`
- `GET /api/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD`
