-- Medios: Extended schema to match AppSheet complexity
-- Includes Locadores, Locaciones, Negociaciones, etc.

-- 1. LOCADORES (Property Owners / Lessors)
CREATE TABLE IF NOT EXISTS locadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  dni_cuit TEXT,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  forma_pago TEXT,
  banco TEXT,
  cbu TEXT,
  observaciones TEXT,
  deleted BOOLEAN DEFAULT false
);

-- 2. Update Propiedades to link with Locadores
ALTER TABLE propiedades ADD COLUMN IF NOT EXISTS locador_id UUID REFERENCES locadores(id);

-- 3. LOCACIONES (Lease Contracts with Owners)
CREATE TABLE IF NOT EXISTS locaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  locador_id UUID REFERENCES locadores(id),
  propiedad_id UUID REFERENCES propiedades(id),
  inicio DATE,
  fin DATE,
  canon_pactado NUMERIC,
  moneda TEXT DEFAULT 'ARS',
  estado TEXT DEFAULT 'Activo', -- Activo, Vencido, Rescindido
  pdf_url TEXT,
  deleted BOOLEAN DEFAULT false
);

-- 4. NEGOCIACIONES_LOCACION (History of lease negotiations)
CREATE TABLE IF NOT EXISTS negociaciones_locacion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  locacion_id UUID REFERENCES locaciones(id) ON DELETE CASCADE,
  fecha DATE DEFAULT CURRENT_DATE,
  desde DATE,
  hasta DATE,
  detalle TEXT,
  total NUMERIC,
  moneda TEXT DEFAULT 'ARS'
);

-- 5. RESERVAS (Temporary reservations before budgets)
CREATE TABLE IF NOT EXISTS reservas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  cliente_id UUID REFERENCES clientes(id),
  anunciante_id UUID REFERENCES anunciantes(id),
  estado TEXT DEFAULT 'Pendiente', -- Pendiente, Convertida, Cancelada
  vencimiento DATE
);

CREATE TABLE IF NOT EXISTS reserva_propiedades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reserva_id UUID REFERENCES reservas(id) ON DELETE CASCADE,
  propiedad_id UUID REFERENCES propiedades(id),
  notas TEXT
);

-- 6. CONTACTO_LOCADORES
CREATE TABLE IF NOT EXISTS contacto_locadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  locador_id UUID REFERENCES locadores(id) ON DELETE CASCADE,
  nombre TEXT,
  cargo TEXT,
  telefono TEXT,
  email TEXT
);

-- Enable RLS for new tables
ALTER TABLE locadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE locaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE negociaciones_locacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserva_propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacto_locadores ENABLE ROW LEVEL SECURITY;

-- Allow all for anon (Dummy/Dev phase)
CREATE POLICY "Allow all for anon" ON locadores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON locaciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON negociaciones_locacion FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON reservas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON reserva_propiedades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON contacto_locadores FOR ALL USING (true) WITH CHECK (true);
