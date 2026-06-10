ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS sexo TEXT,
  ADD COLUMN IF NOT EXISTS ocupacion TEXT,
  ADD COLUMN IF NOT EXISTS obra_social TEXT,
  ADD COLUMN IF NOT EXISTS grupo_sanguineo TEXT,
  ADD COLUMN IF NOT EXISTS contacto_emergencia_relacion TEXT,
  ADD COLUMN IF NOT EXISTS declaracion_respuestas JSONB,
  ADD COLUMN IF NOT EXISTS declaracion_partes_cuerpo TEXT[],
  ADD COLUMN IF NOT EXISTS declaracion_explicacion TEXT,
  ADD COLUMN IF NOT EXISTS firma_declaracion TEXT;
