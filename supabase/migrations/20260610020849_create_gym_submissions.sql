
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dni TEXT NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  fecha_nacimiento DATE,
  edad INTEGER,
  telefono TEXT,
  email TEXT,
  domicilio TEXT,
  -- PAR-Q answers
  parq_cardio BOOLEAN,
  parq_dolor_pecho BOOLEAN,
  parq_medicamento_cardiaco BOOLEAN,
  parq_desmayos BOOLEAN,
  parq_asma BOOLEAN,
  parq_alteracion_osea BOOLEAN,
  parq_otra_razon BOOLEAN,
  -- Emergency contact
  contacto_emergencia_nombre TEXT,
  contacto_emergencia_tel TEXT,
  -- Accepts terms
  acepta_condiciones BOOLEAN DEFAULT FALSE,
  -- Signature and document
  firma_data TEXT,
  documento_firmado TEXT,
  -- Metadata
  fecha_completado TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_submissions" ON submissions FOR INSERT
  TO anon WITH CHECK (true);

CREATE POLICY "select_submissions" ON submissions FOR SELECT
  TO anon USING (true);

CREATE POLICY "update_submissions" ON submissions FOR UPDATE
  TO anon USING (true) WITH CHECK (true);

CREATE POLICY "delete_submissions" ON submissions FOR DELETE
  TO anon USING (true);
