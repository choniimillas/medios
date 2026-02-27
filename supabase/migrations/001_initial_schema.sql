-- Medios: Initial schema (AppSheet migration)
-- Run this in Supabase SQL Editor or via Supabase CLI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Formatos (tipo de propiedad)
CREATE TABLE IF NOT EXISTS formatos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL
);

-- Users & Roles
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  rol TEXT
);

-- Core Entities
CREATE TABLE IF NOT EXISTS anunciantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS propiedades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ref_n TEXT,
  ubicacion TEXT,
  localidad TEXT,
  descripcion TEXT,
  latlong TEXT,
  tipo_id UUID REFERENCES formatos(id),
  caras NUMERIC,
  base NUMERIC,
  altura NUMERIC,
  m2 NUMERIC GENERATED ALWAYS AS (caras * base * altura) STORED,
  costo_colocacion NUMERIC,
  precio_mensual NUMERIC,
  disponible TEXT DEFAULT 'Disponible',
  deleted BOOLEAN DEFAULT false
);

-- Transactions & Workflows
CREATE TABLE IF NOT EXISTS presupuestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  cliente_id UUID REFERENCES clientes(id),
  anunciante_id UUID REFERENCES anunciantes(id),
  estado TEXT,
  version NUMERIC DEFAULT 1,
  pdf_url TEXT
);

CREATE TABLE IF NOT EXISTS presupuesto_propiedades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presupuesto_id UUID REFERENCES presupuestos(id) ON DELETE CASCADE,
  propiedad_id UUID REFERENCES propiedades(id),
  costo_colocacion NUMERIC,
  precio_mensual NUMERIC
);

CREATE TABLE IF NOT EXISTS servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero TEXT,
  inicio DATE,
  fin DATE,
  cliente_id UUID REFERENCES clientes(id),
  anunciante_id UUID REFERENCES anunciantes(id),
  presupuesto_id UUID REFERENCES presupuestos(id)
);

-- Optional: servicio_propiedad for contract details (if used)
CREATE TABLE IF NOT EXISTS servicio_propiedad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sp_servicio UUID REFERENCES servicios(id) ON DELETE CASCADE,
  sp_propiedad UUID REFERENCES propiedades(id),
  sp_inicio DATE,
  sp_fin DATE
);

-- Trigger: When servicio dates change, update servicio_propiedad
CREATE OR REPLACE FUNCTION update_servicio_propiedad_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.inicio IS DISTINCT FROM OLD.inicio OR NEW.fin IS DISTINCT FROM OLD.fin THEN
    UPDATE servicio_propiedad
    SET sp_inicio = NEW.inicio, sp_fin = NEW.fin
    WHERE sp_servicio = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_servicio_dates ON servicios;
CREATE TRIGGER trg_servicio_dates
  AFTER UPDATE ON servicios
  FOR EACH ROW
  EXECUTE FUNCTION update_servicio_propiedad_dates();

-- Optional: productos table for Compras (Sin Stock rule)
CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  stock NUMERIC DEFAULT 0
);

-- RLS (Row-Level Security) - enable per table as needed
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuesto_propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;

-- Example policy: allow all for anon (adjust for production)
CREATE POLICY "Allow all for anon" ON presupuestos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON presupuesto_propiedades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON servicios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON propiedades FOR ALL USING (true) WITH CHECK (true);
