CREATE DATABASE IF NOT EXISTS tienda_ropa;
USE tienda_ropa;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  categoria VARCHAR(80) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATETIME NOT NULL,
  total DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS venta_detalle (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  proveedor VARCHAR(150) NOT NULL,
  cantidad INT NOT NULL,
  costo_unitario DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  fecha DATETIME NOT NULL,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS caja_movimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('ingreso', 'egreso') NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  descripcion VARCHAR(255),
  fecha DATETIME NOT NULL
);

-- Contraseña: admin123
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES ('Administrador', 'admin@tienda.com', '$2a$10$esxMdEL0f3fGfEJ5wEQqDO5G13JglgJQ9nBGCQpAw5yv5ud6jFbT6', 'admin')
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  password_hash = VALUES(password_hash),
  rol = VALUES(rol),
  email = VALUES(email);

INSERT INTO productos (nombre, categoria, precio, stock) VALUES
('Bota Vaquera Cuero', 'Botas', 1899.00, 20),
('Sombrero Norteño', 'Sombreros', 699.00, 35),
('Cincho Grabado', 'Cinchos', 499.00, 40),
('Camisa Denim', 'Ropa', 799.00, 25)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
