-- Medios: Comprehensive Dummy Data for "Publicidad Rosario"
-- Run AFTER 001_initial_schema.sql AND 002_extended_schema.sql

-- Clear existing data
TRUNCATE servicio_propiedad, presupuesto_propiedades, servicios, presupuestos, propiedades, formatos, usuarios, clientes, anunciantes, locadores, locaciones, negociaciones_locacion, reservas, reserva_propiedades, contacto_locadores RESTART IDENTITY CASCADE;

-- 1. FORMATOS
INSERT INTO formatos (id, nombre) VALUES
  (uuid_generate_v4(), 'Sextuple 6x3'),
  (uuid_generate_v4(), 'Valla 4x3'),
  (uuid_generate_v4(), 'Pantalla LED 4x3'),
  (uuid_generate_v4(), 'Columnas 12x4'),
  (uuid_generate_v4(), 'Mupi / Paleta'),
  (uuid_generate_v4(), 'Medianera Gigante');

-- 2. LOCADORES (Owners)
INSERT INTO locadores (id, nombre, dni_cuit, direccion, forma_pago, banco) VALUES
  ('a0000001-0001-4000-8000-000000000001', 'Inmobiliaria del Centro', '30-12345678-9', 'España 800, Rosario', 'Transferencia', 'Banco Municipal'),
  ('a0000001-0001-4000-8000-000000000002', 'Juan Ignacio Lopez', '20-22333444-5', 'Bv. Oroño 1200, Rosario', 'Cheque', 'Santander'),
  ('a0000001-0001-4000-8000-000000000003', 'Fideicomiso Puerto Norte', '30-99888777-1', 'Av. Carballo 500, Rosario', 'Transferencia', 'Galicia');

-- 3. PROPIEDADES (Billboard Positions)
INSERT INTO propiedades (id, ref_n, ubicacion, localidad, descripcion, latlong, tipo_id, caras, base, altura, costo_colocacion, precio_mensual, locador_id) VALUES
  ('e0000001-0001-4000-8000-000000000001', 'ROS-001', 'Av. Pellegrini 1500', 'Rosario Centro', 'Cartel 6x3 sobre avenida principal', '-32.9512, -60.6558', (SELECT id FROM formatos WHERE nombre = 'Sextuple 6x3'), 1, 6, 3, 15000, 8500, 'a0000001-0001-4000-8000-000000000001'),
  ('e0000001-0001-4000-8000-000000000002', 'ROS-002', 'Bv. Oroño y Córdoba', 'Rosario Centro', 'Pantalla LED alto impacto', '-32.9431, -60.6512', (SELECT id FROM formatos WHERE nombre = 'Pantalla LED 4x3'), 1, 4, 3, 25000, 45000, 'a0000001-0001-4000-8000-000000000002'),
  ('e0000001-0001-4000-8000-000000000003', 'ROS-103', 'Av. Alberdi 200', 'Rosario Norte', 'Valla de ingreso a la ciudad', '-32.9221, -60.6710', (SELECT id FROM formatos WHERE nombre = 'Valla 4x3'), 1, 4, 3, 12000, 7800, 'a0000001-0001-4000-8000-000000000003'),
  ('e0000001-0001-4000-8000-000000000004', 'ROS-205', 'Bv. 27 de Febrero 800', 'Rosario Sur', 'Columna de doble cara', '-32.9682, -60.6425', (SELECT id FROM formatos WHERE nombre = 'Columnas 12x4'), 2, 12, 4, 45000, 22000, 'a0000001-0001-4000-8000-000000000001');

-- 4. LOCACIONES (Lease Contracts with Owners)
INSERT INTO locaciones (id, locador_id, propiedad_id, inicio, fin, canon_pactado, estado) VALUES
  (uuid_generate_v4(), 'a0000001-0001-4000-8000-000000000001', 'e0000001-0001-4000-8000-000000000001', '2024-01-01', '2025-12-31', 4000, 'Activo'),
  (uuid_generate_v4(), 'a0000001-0001-4000-8000-000000000002', 'e0000001-0001-4000-8000-000000000002', '2024-03-01', '2025-02-28', 15000, 'Activo');

-- 5. CLIENTES & ANUNCIANTES
INSERT INTO clientes (id, nombre) VALUES
  ('c0000001-0001-4000-8000-000000000001', 'Supermercados Libertad'),
  ('c0000001-0001-4000-8000-000000000002', 'Banco de Santa Fe');

INSERT INTO anunciantes (id, nombre) VALUES
  ('d0000001-0001-4000-8000-000000000001', 'Agencia Impacto'),
  ('d0000001-0001-4000-8000-000000000002', 'Creativos Rosario');

-- 6. PRESUPUESTOS (Budgets)
INSERT INTO presupuestos (id, numero, fecha, cliente_id, anunciante_id, estado) VALUES
  ('b0000001-0001-4000-8000-000000000001', 'P-1050', '2024-05-15', 'c0000001-0001-4000-8000-000000000001', 'd0000001-0001-4000-8000-000000000001', 'Aprobado'),
  ('b0000001-0001-4000-8000-000000000002', 'P-1051', '2024-05-20', 'c0000001-0001-4000-8000-000000000002', 'd0000001-0001-4000-8000-000000000002', 'Borrador');

-- 7. PRESUPUESTO_PROPIEDADES (Items)
INSERT INTO presupuesto_propiedades (presupuesto_id, propiedad_id, costo_colocacion, precio_mensual) VALUES
  ('b0000001-0001-4000-8000-000000000001', 'e0000001-0001-4000-8000-000000000001', 15000, 8500),
  ('b0000001-0001-4000-8000-000000000001', 'e0000001-0001-4000-8000-000000000003', 12000, 7800);

-- 8. SERVICIOS (Active Contracts)
INSERT INTO servicios (id, numero, inicio, fin, cliente_id, anunciante_id, presupuesto_id) VALUES
  (uuid_generate_v4(), 'S-2055', '2024-06-01', '2024-08-31', 'c0000001-0001-4000-8000-000000000001', 'd0000001-0001-4000-8000-000000000001', 'b0000001-0001-4000-8000-000000000001');

-- 9. RESERVAS
INSERT INTO reservas (id, numero, fecha, cliente_id, anunciante_id, estado, vencimiento) VALUES
  (uuid_generate_v4(), 'R-500', '2024-06-01', 'c0000001-0001-4000-8000-000000000002', 'd0000001-0001-4000-8000-000000000002', 'Pendiente', '2024-06-10');
