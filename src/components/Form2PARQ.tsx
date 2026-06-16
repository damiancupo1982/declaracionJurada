import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, AlertCircle, PenLine, Trash2 } from 'lucide-react';
import YesNoSelector from './YesNoSelector';
import SignatureCanvas, { type SignatureCanvasRef } from './SignatureCanvas';
import type { StudentData, ParqAnswers, EmergencyContact } from '../types';

interface Props {
  studentData: StudentData;
  onBack: () => void;
  onNext: (answers: ParqAnswers, emergency: EmergencyContact, firma: string) => void;
}

const QUESTIONS: { key: keyof ParqAnswers; text: string }[] = [
  { key: 'cardio', text: '¿Alguna vez te diagnosticaron una enfermedad cardiaca?' },
  { key: 'dolorPecho', text: '¿Sufrís dolores en el pecho cuando estás realizando actividad o cuando estás reposando? ¿Notaste dolores en el pecho durante el último mes?' },
  { key: 'medicamentoCardiaco', text: '¿Alguna vez te recetó el médico algún medicamento para la presión arterial u otro problema cardiocirculatorio?' },
  { key: 'desmayos', text: '¿Sufriste desmayos o mareos que te hayan hecho perder el equilibrio o el conocimiento?' },
  { key: 'asma', text: '¿Tuviste un ataque de asma durante los últimos 12 meses? ¿Fuiste diagnosticado con asma?' },
  { key: 'alteracionOsea', text: '¿Tenés alguna alteración ósea o articular que podría agravarse por la actividad física propuesta?' },
  { key: 'otraRazon', text: '¿Tenés conocimiento, por experiencia propia, o debido al consejo de algún médico, de cualquier otra razón física que te impida o dificulte hacer ejercicio sin supervisión médica?' },
];

const EMPTY_PARQ: ParqAnswers = {
  cardio: null,
  dolorPecho: null,
  medicamentoCardiaco: null,
  desmayos: null,
  asma: null,
  alteracionOsea: null,
  otraRazon: null,
};

export default function Form2PARQ({ studentData, onBack, onNext }: Props) {
  const [answers, setAnswers] = useState<ParqAnswers>(EMPTY_PARQ);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [emergency, setEmergency] = useState<EmergencyContact>({ nombre: '', telefono: '' });
  const [accepts, setAccepts] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const sigRef = useRef<SignatureCanvasRef>(null);

  const setAnswer = (key: keyof ParqAnswers, val: boolean) => {
    setAnswers(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined as unknown as string }));
  };

  const hasAnySi = Object.values(answers).some(v => v === true);
  const allAnswered = Object.values(answers).every(v => v !== null);

  const validate = () => {
    const e: Record<string, string> = {};
    QUESTIONS.forEach(q => {
      if (answers[q.key] === null) e[q.key] = 'Respondé esta pregunta';
    });
    if (!emergency.nombre.trim()) e.emergNombre = 'Requerido';
    if (!emergency.telefono.trim()) e.emergTel = 'Requerido';
    if (!accepts) e.accepts = 'Debés confirmar haber leído y comprendido tus responsabilidades';
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
    const firmaData = sigRef.current!.toDataURL();
    onNext(answers, emergency, firmaData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-slate-800 text-white px-5 py-6 shadow-lg">
        <div className="max-w-lg mx-auto">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Gimnasio Apolo-25 de Mayo</p>
          <h1 className="text-xl font-bold">Cuestionario de Aptitud Física</h1>
          <p className="text-sm text-slate-300 mt-1">Formulario 2 de 3 — PAR-Q</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Intro */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-5">
          <h2 className="font-bold text-slate-800 text-center text-base mb-3">CUESTIONARIO DE APTITUD FÍSICA (PAR-Q)</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            El Cuestionario de Aptitud Física (PAR-Q) es una herramienta que sirve para la detección de posibles problemas de salud y cardiovasculares en personas aparentemente sanas que quieran realizar actividad física en cualquier gimnasio de la Ciudad Autónoma de Buenos Aires.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            Las personas entre 18 y 65 años lo realizarán para saber si necesitan consultar con el médico antes de comenzar a realizar ejercicio físico.
          </p>
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3">
            <p className="text-xs font-semibold text-amber-800">
              En el caso de personas menores de 18 años o mayores de 65 años en todos los casos les vamos a solicitar un certificado médico expedido por un médico matriculado para poder entrenar con nosotros.
            </p>
          </div>
        </div>

        {/* Student info strip */}
        <div className="bg-slate-100 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
          <span className="text-sm text-slate-500">Completando como:</span>
          <span className="font-semibold text-slate-800 text-sm">{studentData.apellido}, {studentData.nombre} — DNI {studentData.dni}</span>
        </div>

        <div className="bg-slate-700 rounded-xl p-4 mb-5">
          <p className="text-white text-sm font-semibold leading-relaxed">
            Por favor respondé las siguientes preguntas con honestidad, recordando que el siguiente reviste carácter de Declaración Jurada.
          </p>
          <p className="text-slate-300 text-xs mt-1">Cualquier duda que tengas, estamos a tu disposición para ayudarte.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          {/* Conditional alerts */}
          {allAnswered && !hasAnySi && (
            <div className="bg-emerald-600 text-white rounded-2xl p-5">
              <p className="font-bold text-sm mb-2">SI CONTESTASTE NO A TODAS LAS PREGUNTAS, YA PODES EMPEZAR A ENTRENAR CON NOSOTROS.</p>
              <p className="text-xs text-emerald-100 leading-relaxed">
                TE PEDIMOS QUE EMPIECES DE A POCO Y SIGUIENDO LAS RECOMENDACIONES DE NUESTRO EQUIPO DE PROFESORES. AVISANOS SI EN CUALQUIER MOMENTO TE SENTIS MAL MIENTRAS ESTAS PRACTICANDO ACTIVIDAD FISICA. SI EXPERIMENTAS UN CAMBIO EN TU SALUD QUE TE HICIERA MODIFICAR ALGUNA DE TUS RESPUESTAS AL PAR-Q TE PEDIMOS QUE NOS INFORMES DE INMEDIATO.
              </p>
            </div>
          )}

          {hasAnySi && (
            <div className="bg-red-600 text-white rounded-2xl p-5">
              <p className="font-bold text-sm mb-2">SI RESPONDISTE SÍ A ALGUNA PREGUNTA ANTERIOR, TE PEDIMOS QUE CONSULTES A TU MEDICO ANTES DE ENTRENAR.</p>
              <p className="text-xs text-red-100 leading-relaxed">
                TE PEDIMOS QUE LE SOLICITES QUE TE EMITA UN CERTIFICADO MEDICO INDICANDO SI ESTAS O NO APTO PARA REALIZAR ACTIVIDAD FISICA Y BAJO QUE CONDICIONES.
              </p>
            </div>
          )}

          {/* Emergency contact */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Contacto de Emergencia</h3>
            <p className="text-sm text-slate-600">Proporciono contacto de emergencia de otra persona, a la que avisar de ser necesario.</p>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre y apellido *</label>
              <input
                type="text"
                value={emergency.nombre}
                onChange={e => setEmergency(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Nombre del contacto"
                className={`w-full border rounded-xl px-4 py-3 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.emergNombre ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'}`}
              />
              {errors.emergNombre && <p className="text-red-500 text-xs mt-1">{errors.emergNombre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono *</label>
              <input
                type="tel"
                inputMode="tel"
                value={emergency.telefono}
                onChange={e => setEmergency(p => ({ ...p, telefono: e.target.value }))}
                placeholder="011 1234-5678"
                className={`w-full border rounded-xl px-4 py-3 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.emergTel ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'}`}
              />
              {errors.emergTel && <p className="text-red-500 text-xs mt-1">{errors.emergTel}</p>}
            </div>
          </div>

          {/* Declaration */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Declaración</h3>
            <div className="text-sm text-slate-600 leading-relaxed space-y-2 italic">
              <p>
                Yo <span className="font-semibold not-italic text-slate-800">{studentData.nombre} {studentData.apellido}</span> declaro haber contestado el presente cuestionario con total libertad y honestidad, y tomo total responsabilidad por cualquier lesión o daño físico que pueda tener durante la/s actividad/es realizada/s.
              </p>
              <p>El Gimnasio Apolo-25 de Mayo no es responsable de mis gastos legales o médicos en caso de que algo me sucediese durante mis actividades físicas.</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
              <strong>Nota:</strong> Este cuestionario es válido hasta un plazo de 12 meses, a partir de la fecha que se completa. El mismo se invalida si su estado requiere contestar SÍ en alguna de las siete preguntas. La entidad no asume ninguna responsabilidad legal respecto a las personas que realizan actividad física y/o han constatado este cuestionario. En caso de dudas le recomendamos que consulte a su médico.
            </div>

            <label
              data-error={!!errors.accepts}
              className={`flex items-start gap-3 cursor-pointer rounded-xl p-3 border-2 transition-all ${errors.accepts ? 'border-red-300 bg-red-50' : accepts ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}
            >
              <div
                onClick={() => { setAccepts(p => !p); if (errors.accepts) setErrors(pr => ({ ...pr, accepts: '' })); }}
                className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center mt-0.5 transition-all ${accepts ? 'bg-emerald-500 border-emerald-500' : 'border-slate-400 bg-white'}`}
              >
                {accepts && <span className="text-white text-sm font-bold">✓</span>}
              </div>
              <p className="text-sm text-slate-700 font-medium">Confirmo haber leído y comprendido mis responsabilidades.</p>
            </label>
            {errors.accepts && <p className="text-red-500 text-xs">{errors.accepts}</p>}
          </div>

          {/* Signature */}
          <div data-error={!!errors.firma} className={`bg-white rounded-2xl shadow-sm border-2 p-5 ${errors.firma ? 'border-red-300' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <PenLine size={15} /> Firma digital
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

          {/* Alert for required fields */}
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
