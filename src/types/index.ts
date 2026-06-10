export interface StudentData {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  edad: number | '';
  telefono: string;
  email: string;
  domicilio: string;
}

export interface EmergencyContact {
  nombre: string;
  telefono: string;
  relacion?: string;
}

export interface ParqAnswers {
  cardio: boolean | null;
  dolorPecho: boolean | null;
  medicamentoCardiaco: boolean | null;
  desmayos: boolean | null;
  asma: boolean | null;
  alteracionOsea: boolean | null;
  otraRazon: boolean | null;
}

export type DeclarationAnswers = Record<string, boolean | null>;

export interface DeclarationData {
  sexo: string;
  ocupacion: string;
  obraSocial: string;
  grupoSanguineo: string;
  answers: DeclarationAnswers;
  partesCuerpo: string[];
  explicacion: string;
  firma: string;
}

export interface FormSubmission {
  id?: string;
  dni: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento?: string;
  edad?: number | '';
  telefono?: string;
  email?: string;
  domicilio?: string;
  sexo?: string;
  ocupacion?: string;
  obra_social?: string;
  grupo_sanguineo?: string;
  parq_cardio: boolean | null;
  parq_dolor_pecho: boolean | null;
  parq_medicamento_cardiaco: boolean | null;
  parq_desmayos: boolean | null;
  parq_asma: boolean | null;
  parq_alteracion_osea: boolean | null;
  parq_otra_razon: boolean | null;
  contacto_emergencia_nombre?: string;
  contacto_emergencia_tel?: string;
  contacto_emergencia_relacion?: string;
  acepta_condiciones: boolean;
  firma_data?: string;
  declaracion_respuestas?: DeclarationAnswers;
  declaracion_partes_cuerpo?: string[];
  declaracion_explicacion?: string;
  firma_declaracion?: string;
  documento_firmado?: string;
  fecha_completado?: string;
  created_at?: string;
}

export type AppStep = 'home' | 'form1' | 'form2' | 'form3' | 'preview' | 'done';
