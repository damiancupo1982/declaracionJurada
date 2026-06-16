import { useState, useEffect } from 'react';
import Form1Registration from './components/Form1Registration';
import Form2PARQ from './components/Form2PARQ';
import Form3Declaration from './components/Form3Declaration';
import FormPreview from './components/FormPreview';
import AdminPage from './components/AdminPage';
import HomeScreen from './components/HomeScreen';
import type { StudentData, ParqAnswers, EmergencyContact, DeclarationData, AppStep } from './types';
import { CheckCircle, Shield, X, AlertCircle } from 'lucide-react';

function useRoute() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);
  return path;
}

const EMPTY_STUDENT: StudentData = {
  nombre: '',
  apellido: '',
  dni: '',
  fechaNacimiento: '',
  edad: '',
  telefono: '',
  email: '',
  domicilio: '',
};

const EMPTY_PARQ: ParqAnswers = {
  cardio: null,
  dolorPecho: null,
  medicamentoCardiaco: null,
  desmayos: null,
  asma: null,
  alteracionOsea: null,
  otraRazon: null,
};

const EMPTY_DECL: DeclarationData = {
  sexo: '',
  ocupacion: '',
  obraSocial: '',
  grupoSanguineo: '',
  answers: {},
  partesCuerpo: [],
  explicacion: '',
  firma: '',
};

const ADMIN_PASSWORD = '2525';

function AdminModal({ onClose, onEnter }: { onClose: () => void; onEnter: () => void }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const tryEnter = () => {
    if (pw === ADMIN_PASSWORD) {
      onEnter();
    } else {
      setErr('Contraseña incorrecta.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-5" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl p-7 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
              <Shield className="text-white" size={18} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Modo Administrador</h2>
              <p className="text-xs text-slate-500">Ingresá la contraseña</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setErr(''); }}
            onKeyDown={e => e.key === 'Enter' && tryEnter()}
            placeholder="Contraseña"
            autoFocus
            className={`w-full border rounded-xl px-4 py-3 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-slate-400 ${err ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
          />
          {err && (
            <div className="flex items-center gap-1.5">
              <AlertCircle size={13} className="text-red-500" />
              <p className="text-red-500 text-xs">{err}</p>
            </div>
          )}
          <button
            onClick={tryEnter}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
          >
            Ingresar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const path = useRoute();
  const [step, setStep] = useState<AppStep>('home');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [goToAdmin, setGoToAdmin] = useState(false);
  const [studentData, setStudentData] = useState<StudentData>(EMPTY_STUDENT);
  const [parqAnswers, setParqAnswers] = useState<ParqAnswers>(EMPTY_PARQ);
  const [emergency, setEmergency] = useState<EmergencyContact>({ nombre: '', telefono: '' });
  const [firmaData, setFirmaData] = useState('');
  const [declaration, setDeclaration] = useState<DeclarationData>(EMPTY_DECL);

  // Allow /admin path OR admin modal flow
  if (path === '/admin' || goToAdmin) {
    return <AdminPage onBackToHome={goToAdmin ? () => setGoToAdmin(false) : undefined} />;
  }

  const resetAll = () => {
    setStep('home');
    setStudentData(EMPTY_STUDENT);
    setParqAnswers(EMPTY_PARQ);
    setEmergency({ nombre: '', telefono: '' });
    setFirmaData('');
    setDeclaration(EMPTY_DECL);
  };

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center px-6 text-center">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-10 max-w-sm w-full">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-500" size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Formulario enviado</h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Tu ficha de inscripción, cuestionario PAR-Q y declaración jurada fueron guardados correctamente. ¡Te esperamos en el gimnasio!
          </p>
          <button
            onClick={resetAll}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95"
          >
            Nuevo formulario
          </button>
        </div>
      </div>
    );
  }

  if (step === 'home') {
    return (
      <>
        <HomeScreen
          onStart={() => setStep('form1')}
          onAdmin={() => setShowAdminModal(true)}
        />
        {showAdminModal && (
          <AdminModal
            onClose={() => setShowAdminModal(false)}
            onEnter={() => { setShowAdminModal(false); setGoToAdmin(true); }}
          />
        )}
      </>
    );
  }

  if (step === 'form1') {
    return (
      <Form1Registration
        initialData={studentData}
        onNext={(data) => {
          setStudentData(data);
          setStep('form2');
        }}
      />
    );
  }

  if (step === 'form2') {
    return (
      <Form2PARQ
        studentData={studentData}
        onBack={() => setStep('form1')}
        onNext={(answers, em, firma) => {
          setParqAnswers(answers);
          setEmergency(em);
          setFirmaData(firma);
          setStep('form3');
        }}
      />
    );
  }

  if (step === 'form3') {
    return (
      <Form3Declaration
        studentData={studentData}
        parqEmergency={emergency}
        onBack={() => setStep('form2')}
        onNext={(decl) => {
          setDeclaration(decl);
          setStep('preview');
        }}
      />
    );
  }

  if (step === 'preview') {
    return (
      <FormPreview
        studentData={studentData}
        answers={parqAnswers}
        emergency={emergency}
        firmaData={firmaData}
        declaration={declaration}
        onBack={() => setStep('form3')}
        onDone={() => setStep('done')}
      />
    );
  }

  return null;
}
