import { useState, useEffect } from 'react';
import { ChevronRight, User, Phone, Mail, MapPin, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import type { StudentData } from '../types';

interface Props {
  initialData?: Partial<StudentData>;
  onNext: (data: StudentData) => void;
}

const EMPTY: StudentData = {
  nombre: '',
  apellido: '',
  dni: '',
  fechaNacimiento: '',
  edad: '',
  telefono: '',
  email: '',
  domicilio: '',
};

export default function Form1Registration({ initialData, onNext }: Props) {
  const [data, setData] = useState<StudentData>({ ...EMPTY, ...initialData });
  const [errors, setErrors] = useState<Partial<Record<keyof StudentData, string>>>({});

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const set = (field: keyof StudentData, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof StudentData, string>> = {};
    if (!data.nombre.trim()) e.nombre = 'Requerido';
    if (!data.apellido.trim()) e.apellido = 'Requerido';
    if (!data.dni.trim()) e.dni = 'Requerido';
    else if (!/^\d{7,8}$/.test(data.dni.replace(/\./g, ''))) e.dni = 'DNI inválido (7-8 dígitos)';
    if (!data.edad && data.edad !== 0) e.edad = 'Requerido';
    else if (Number(data.edad) < 10 || Number(data.edad) > 100) e.edad = 'Edad inválida';
    if (!data.telefono.trim()) e.telefono = 'Requerido';
    if (!data.domicilio.trim()) e.domicilio = 'Requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onNext(data);
  };

  const age = Number(data.edad);
  const needsMedCert = age > 0 && (age < 18 || age > 65);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-slate-800 text-white px-5 py-6 shadow-lg">
        <div className="max-w-lg mx-auto">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Club Círculo Apolo Machain Saavedra</p>
          <h1 className="text-xl font-bold">Gimnasio Apolo-25 de Mayo</h1>
          <p className="text-sm text-slate-300 mt-1">Formulario 1 de 3 — Ficha de Inscripción</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Info notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
          <AlertCircle className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-blue-700">
            Completá todos los campos con tus datos personales. Esta información quedará registrada para tu ficha de socio.
          </p>
        </div>

        {needsMedCert && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6 flex gap-3">
            <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-amber-800 font-medium">
              Por ser menor de 18 o mayor de 65 años, necesitás presentar un certificado médico expedido por un médico matriculado para poder entrenar con nosotros.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre y Apellido */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <User size={15} /> Datos personales
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Apellido *</label>
              <input
                type="text"
                value={data.apellido}
                onChange={e => set('apellido', e.target.value)}
                placeholder="Tu apellido"
                className={`w-full border rounded-xl px-4 py-3 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.apellido ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'}`}
              />
              {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre *</label>
              <input
                type="text"
                value={data.nombre}
                onChange={e => set('nombre', e.target.value)}
                placeholder="Tu nombre"
                className={`w-full border rounded-xl px-4 py-3 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.nombre ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'}`}
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <CreditCard size={13} /> DNI *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={data.dni}
                  onChange={e => set('dni', e.target.value.replace(/\D/g, ''))}
                  placeholder="00000000"
                  maxLength={8}
                  className={`w-full border rounded-xl px-4 py-3 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.dni ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'}`}
                />
                {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Edad *</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={data.edad === '' ? '' : data.edad}
                  onChange={e => set('edad', e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="18"
                  min={10}
                  max={100}
                  className={`w-full border rounded-xl px-4 py-3 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.edad ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'}`}
                />
                {errors.edad && <p className="text-red-500 text-xs mt-1">{errors.edad}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} /> Fecha de nacimiento
              </label>
              <input
                type="date"
                value={data.fechaNacimiento}
                onChange={e => set('fechaNacimiento', e.target.value)}
                className="w-full border border-slate-300 bg-slate-50 rounded-xl px-4 py-3 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Phone size={15} /> Contacto
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone size={13} /> Teléfono *
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={data.telefono}
                onChange={e => set('telefono', e.target.value)}
                placeholder="011 1234-5678"
                className={`w-full border rounded-xl px-4 py-3 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.telefono ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'}`}
              />
              {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail size={13} /> Email
              </label>
              <input
                type="email"
                inputMode="email"
                value={data.email}
                onChange={e => set('email', e.target.value)}
                placeholder="tucorreo@email.com"
                className="w-full border border-slate-300 bg-slate-50 rounded-xl px-4 py-3 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin size={13} /> Domicilio *
              </label>
              <input
                type="text"
                value={data.domicilio}
                onChange={e => set('domicilio', e.target.value)}
                placeholder="Calle, número, ciudad"
                className={`w-full border rounded-xl px-4 py-3 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-slate-400 ${errors.domicilio ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50'}`}
              />
              {errors.domicilio && <p className="text-red-500 text-xs mt-1">{errors.domicilio}</p>}
            </div>
          </div>

          {/* Terms notice */}
          <div className="bg-slate-800 rounded-2xl p-5 text-white">
            <h3 className="font-semibold text-sm mb-2">Reglamento del Gimnasio</h3>
            <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed max-h-36 overflow-y-auto pr-1">
              <p>El gimnasio funciona bajo el contrato asociativo entre el Club Círculo Apolo Machain Saavedra (CUIT 30708272759).</p>
              <p><strong className="text-white">Sede Apolo:</strong> Machain 3517, CABA</p>
              <p><strong className="text-white">Sede 25 de Mayo:</strong> Rodríguez Pena 941, B1640HBS Martínez, Provincia de Buenos Aires</p>
              <p><strong className="text-white">Horarios:</strong> Lunes a viernes de 7:00 a 23:00 hs. Sábados de 8:00 a 20:00 hs.</p>
              <p>No se podrán realizar actividades fuera del horario del Club ni fiestas, ni actos que atenten contra las buenas costumbres.</p>
              <p>El personal contratado responde exclusivamente ante el Concesionario. El Club no asume relación laboral con los empleados del gimnasio.</p>
              <p>Para cualquier divergencia contractual, las partes se someten a los tribunales Civiles y Comerciales de GCBA.</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            Continuar al Cuestionario PAR-Q
            <ChevronRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
