import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, PenLine, Trash2, AlertCircle } from 'lucide-react';
import YesNoSelector from './YesNoSelector';
import SignatureCanvas, { type SignatureCanvasRef } from './SignatureCanvas';
import type { StudentData, DeclarationData } from '../types';

interface Props {
  studentData: StudentData;
  parqEmergency: { nombre: string; telefono: string };
  onBack: () => void;
  onNext: (data: DeclarationData) => void;
}

const QUESTIONS: { key: string; text: string }[] = [
  { key: 'q1', text: '¿Ha tenido alguna enfermedad o lesión en el último año? ¿Tiene alguna enfermedad crónica?' },
  { key: 'q2', text: '¿Alguna vez estuvo internado/a? ¿Tuvo alguna cirugía?' },
  { key: 'q3', text: '¿Está tomando actualmente alguna medicación, pastilla o inhalador prescripto o no por un médico?' },
  { key: 'q4', text: '¿Ha tomado algún suplemento o vitamina para aumentar o bajar de peso o mejorar su rendimiento?' },
  { key: 'q5', text: '¿Tiene algún tipo de alergia (Ej. Polen, comida, medicación o picadura de insectos)?' },
  { key: 'q6', text: '¿Alguna vez tuvo urticaria o erupción cutánea durante la realización de ejercicio?' },
  { key: 'q7', text: '¿Alguna vez se desmayó durante o después del ejercicio?' },
  { key: 'q8', text: '¿Alguna vez tuvo mareos durante o después del ejercicio?' },
  { key: 'q9', text: '¿Alguna vez tuvo dolor de pecho durante el ejercicio?' },
  { key: 'q10', text: '¿Se siente cansado más rápidamente que sus compañeros al realizar ejercicio?' },
  { key: 'q11', text: '¿Alguna vez tuvo palpitaciones?' },
  { key: 'q12', text: '¿Tiene presión alta o colesterol alto?' },
  { key: 'q13', text: '¿Alguna vez le dijeron que tenía un soplo en el corazón?' },
  { key: 'q14', text: '¿Algún familiar directo tuvo problemas cardíacos o tuvo muerte súbita antes de los 50 años de edad?' },
  { key: 'q15', text: '¿En el último mes tuvo alguna enfermedad viral como miocarditis o mononucleosis infecciosa?' },
  { key: 'q16', text: '¿Le dijo un médico que no podía hacer ejercicio en forma parcial o total por algún problema cardíaco?' },
  { key: 'q17', text: '¿Alguna vez tuvo un traumatismo de cráneo?' },
  { key: 'q18', text: '¿Alguna vez perdió el conocimiento o perdió la memoria por un traumatismo de cráneo?' },
  { key: 'q19', text: '¿Alguna vez tuvo convulsiones?' },
  { key: 'q20', text: '¿Sufre de epilepsia?' },
  { key: 'q21', text: '¿Alguna vez tuvo tos o falta de aire fuera de lo habitual durante o después del ejercicio?' },
  { key: 'q22', text: '¿Usted tiene asma?' },
  { key: 'q23', text: '¿Tiene alergia estacional que requiera tratamiento?' },
  { key: 'q24', text: '¿Usa equipo de protección o correctivo para practicar su deporte (Protector dental, férula, etc.)?' },
  { key: 'q25', text: '¿Tiene algún trastorno en los ojos o en la visión?' },
  { key: 'q26', text: '¿Usa anteojos, lentes de contacto o lentes de protección?' },
  { key: 'q27', text: '¿Se siente estresado?' },
  { key: 'q28', text: '¿Alguna vez tuvo distensión muscular o tendinosa, esguince o hinchazón después de un traumatismo?' },
  { key: 'q29', text: '¿Alguna vez tuvo fractura de hueso o luxación de una articulación?' },
  { key: 'q30', text: '¿Tuvo algún otro problema con dolor, hinchazón en musculación, tendones, huesos o articulaciones?' },
];

const BODY_PARTS = [
  'Cabeza', 'Tobillo', 'Tórax', 'Codo', 'Muslo', 'Mano', 'Cuello', 'Pie',
  'Hombros', 'Antebrazo', 'Rodilla', 'Dedos', 'Lumbar', 'Abdominal', 'Muñeca', 'Pierna', 'Cadera',
];

const EMPTY_ANSWERS: Record<string, boolean | null> = Object.fromEntries(
  QUESTIONS.map(q => [q.key, null])
);

export default function Form3Declaration({ studentData, parqEmergency, onBack, onNext }: Props) {
  const [sexo, setSexo] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [ocupacion, setOcupacion] = useState('');
  const [obraSocial, setObraSocial] = useState('');
  const [grupoSanguineo, setGrupoSanguineo] = useState('');
  const [answers, setAnswers] = useState<Record<string, boolean | null>>(EMPTY_ANSWERS);
  const [partesCuerpo, setPartesCuerpo] = useState<string[]>([]);
  const [explicacion, setExplicacion] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const sigRef = useRef<SignatureCanvasRef>(null);

  const toggleParte = (p: string) => {
    setPartesCuerpo(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const setAnswer = (key: string, val: boolean) => {
    setAnswers(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const hasAnySi = Object.values(answers).some(v => v === true);

  const validate = () => {
    const e: Record<string, string> = {};
    QUESTIONS.forEach(q => {
      if (answers[q.key] === null) e[q.key] = 'Respondé esta pregunta';
    });
    if (!sexo.trim()) e.sexo = 'Requerido';
    if (sigRef.current?.isEmpty()) e.firma = 'Firmá antes de continuar';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstErr = document.querySelector('[data-error="true"]');
      firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onNext({
      sexo,
      ocupacion,
      obraSocial,
      grupoSanguineo,
      answers,
      partesCuerpo,
      explicacion,
      firma: sigRef.current!.toDataURL(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="bg-slate-800 text-white px-5 py-6 shadow-lg">
        <div className="max-w-lg mx-auto">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Gimnasio Apolo-25 de Mayo</p>
          <h1 className="text-xl font-bold">Declaración Jurada</h1>
          <p className="text-sm text-slate-300 mt-1">Formulario 3 de 3 — Historia Clínica</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-5">
          <h2 className="font-bold text-center text-slate-800 mb-1">DECLARACIÓN JURADA</h2>
          <h3 className="font-semibold text-center text-slate-600 text-sm mb-4">HISTORIA CLÍNICA</h3>

          {/* Auto-filled student info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-slate-500 w-32 flex-shrink-0">Apellido y Nombre:</span>
              <span className="font-semibold text-slate-800">{studentData.apellido}, {studentData.nombre}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500 w-32 flex-shrink-0">DNI:</span>
              <span className="font-semibold text-slate-800">{studentData.dni}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500 w-32 flex-shrink-0">Email:</span>
              <span className="text-slate-800">{studentData.email || '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex gap-2">
                <span className="text-slate-500 text-xs">Fecha nac.:</span>
                <span className="text-slate-800 text-xs">{studentData.fechaNacimiento || '—'}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500 text-xs">Edad:</span>
                <span className="text-slate-800 text-xs">{studentData.edad || '—'}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500 w-32 flex-shrink-0">Dirección:</span>
              <span className="text-slate-800">{studentData.domicilio}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500 w-32 flex-shrink-0">Teléfono:</span>
              <span className="text-slate-800">{studentData.telefono}</span>
            </div>
          </div>

          {/* Additional fields */}
          <div className="space-y-3">
            <div data-error={!!errors.sexo}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexo *</label>
              <div className="flex gap-3">
                {['Masculino', 'Femenino', 'Otro'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setSexo(s); if (errors.sexo) setErrors(p => ({ ...p, sexo: '' })); }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${sexo === s ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-500'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {errors.sexo && <p className="text-red-500 text-xs mt-1">{errors.sexo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ocupación</label>
              <input
                type="text"
                value={ocupacion}
                onChange={e => setOcupacion(e.target.value)}
                placeholder="Tu ocupación"
                className="w-full border border-slate-300 bg-slate-50 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Obra Social</label>
                <input
                  type="text"
                  value={obraSocial}
                  onChange={e => setObraSocial(e.target.value)}
                  placeholder="Obra social"
                  className="w-full border border-slate-300 bg-slate-50 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Grupo y Factor</label>
                <input
                  type="text"
                  value={grupoSanguineo}
                  onChange={e => setGrupoSanguineo(e.target.value)}
                  placeholder="A+, O-, etc."
                  className="w-full border border-slate-300 bg-slate-50 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency contact (pre-filled from PAR-Q) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-5">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">En caso de emergencia llamar</h3>
          <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1">
            <div className="flex gap-2">
              <span className="text-slate-500 w-20 flex-shrink-0">Nombre:</span>
              <span className="text-slate-800">{parqEmergency.nombre || '—'}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500 w-20 flex-shrink-0">Teléfono:</span>
              <span className="text-slate-800">{parqEmergency.telefono || '—'}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Instruction */}
          <div className="bg-slate-700 rounded-xl p-4">
            <p className="text-white text-sm font-semibold text-center">CONTESTE CON UNA X LA RESPUESTA CORRECTA</p>
          </div>

          {/* Questions */}
          <div className="space-y-3">
            {QUESTIONS.map((q, i) => (
              <div
                key={q.key}
                data-error={!!errors[q.key]}
                className={`bg-white rounded-2xl border-2 p-4 transition-all ${
                  errors[q.key] ? 'border-red-300' : answers[q.key] === null ? 'border-slate-200' : answers[q.key] ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'
                }`}
              >
                <div className="flex gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                    answers[q.key] === null ? 'bg-slate-200 text-slate-500' : answers[q.key] ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700 leading-relaxed mb-3">{q.text}</p>
                    <YesNoSelector
                      value={answers[q.key]}
                      onChange={val => setAnswer(q.key, val)}
                    />
                    {errors[q.key] && <p className="text-red-500 text-xs mt-2">{errors[q.key]}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Body parts */}
          {hasAnySi && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <p className="text-sm font-semibold text-slate-700 mb-3">
                Si respondió SÍ, marque el lugar y explique abajo:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {BODY_PARTS.map(parte => (
                  <button
                    key={parte}
                    type="button"
                    onClick={() => toggleParte(parte)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                      partesCuerpo.includes(parte)
                        ? 'bg-slate-800 border-slate-800 text-white'
                        : 'bg-white border-slate-300 text-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {partesCuerpo.includes(parte) ? '✗ ' : ''}{parte}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Explicación</label>
                <textarea
                  value={explicacion}
                  onChange={e => setExplicacion(e.target.value)}
                  placeholder="Describí brevemente el problema o lesión..."
                  rows={3}
                  className="w-full border border-slate-300 bg-slate-50 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                />
              </div>
            </div>
          )}

          {/* Signature */}
          <div data-error={!!errors.firma} className={`bg-white rounded-2xl shadow-sm border-2 p-5 ${errors.firma ? 'border-red-300' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <PenLine size={15} /> Firma del Declarante / Padre / Tutor
              </h3>
              <button
                type="button"
                onClick={() => sigRef.current?.clear()}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={13} /> Borrar
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Firmá con el dedo en el recuadro de abajo</p>
            <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50" style={{ height: '140px' }}>
              <SignatureCanvas ref={sigRef} />
            </div>
            {errors.firma && <p className="text-red-500 text-xs mt-2">{errors.firma}</p>}
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
              <p className="text-sm text-red-600">Revisá los campos marcados antes de continuar.</p>
            </div>
          )}

          <div className="flex gap-3 pb-8">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-1 px-5 py-4 rounded-2xl border-2 border-slate-300 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-all"
            >
              <ChevronLeft size={18} /> Volver
            </button>
            <button
              type="submit"
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              Ver vista previa
              <ChevronRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
