import { Shield, ClipboardList, ChevronRight, MapPin } from 'lucide-react';

interface Props {
  onStart: () => void;
  onAdmin: () => void;
}

const STEPS = [
  { n: 1, title: 'Ficha de Inscripción', sub: 'Datos personales y de contacto', color: '#facc15' },
  { n: 2, title: 'Cuestionario PAR-Q', sub: 'Aptitud física — declaración jurada', color: '#38bdf8' },
  { n: 3, title: 'Historia Clínica', sub: 'Declaración jurada médica', color: '#4ade80' },
];

export default function HomeScreen({ onStart, onAdmin }: Props) {
  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #070b14 0%, #0f1724 45%, #0a0f1c 100%)' }}
    >
      {/* Subtle radial glow behind logos */}
      <div
        className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56,189,248,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Top logo strip */}
      <div className="relative z-10 pt-8 px-5">
        <div className="max-w-sm mx-auto flex items-stretch justify-between gap-4">
          {/* Apolo logo */}
          <div
            className="flex-1 rounded-2xl overflow-hidden border border-white/10 shadow-xl"
            style={{ background: '#111', aspectRatio: '4/3' }}
          >
            <img
              src="/image.png"
              alt="Apolo Megagym"
              className="w-full h-full object-cover"
              onError={e => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                (e.currentTarget.parentElement as HTMLDivElement).style.display = 'flex';
                (e.currentTarget.parentElement as HTMLDivElement).style.alignItems = 'center';
                (e.currentTarget.parentElement as HTMLDivElement).style.justifyContent = 'center';
              }}
            />
          </div>

          {/* Divider */}
          <div className="flex flex-col items-center justify-center gap-1.5 flex-shrink-0">
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <div
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/40 text-xs font-bold"
              style={{ fontSize: 10 }}
            >
              &amp;
            </div>
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          </div>

          {/* 25 de Mayo logo */}
          <div
            className="flex-1 rounded-2xl overflow-hidden border border-white/10 shadow-xl"
            style={{ background: '#04101e', aspectRatio: '4/3' }}
          >
            <img
              src="/logo25.png"
              alt="25 de Mayo Gym"
              className="w-full h-full object-cover"
              onError={e => {
                const parent = e.currentTarget.parentElement as HTMLDivElement;
                e.currentTarget.style.display = 'none';
                parent.style.display = 'flex';
                parent.style.flexDirection = 'column';
                parent.style.alignItems = 'center';
                parent.style.justifyContent = 'center';
                parent.style.padding = '10px';
                parent.innerHTML = `
                  <div style="font-size:30px;font-weight:900;line-height:1;color:#38bdf8;letter-spacing:-2px;text-shadow:0 0 20px rgba(56,189,248,0.6)">25</div>
                  <div style="font-size:9px;font-weight:800;color:#38bdf8;letter-spacing:3px;margin-top:2px;opacity:0.9">DE MAYO</div>
                  <div style="margin-top:5px;background:#1e3a5f;padding:2px 8px;border:1px solid #38bdf8;border-radius:3px">
                    <span style="font-size:8px;font-weight:900;color:#7dd3fc;letter-spacing:4px">GYM</span>
                  </div>`;
              }}
            />
          </div>
        </div>
      </div>

      {/* Hero text */}
      <div className="relative z-10 px-5 mt-7 text-center">
        <p className="text-xs font-bold tracking-[0.3em] text-sky-400/80 uppercase mb-2">
          Formulario de Inscripción
        </p>
        <h1
          className="text-4xl font-black text-white leading-none tracking-tight mb-1"
          style={{ textShadow: '0 2px 20px rgba(56,189,248,0.3)' }}
        >
          APOLO
        </h1>
        <h2
          className="text-2xl font-black mb-4"
          style={{
            background: 'linear-gradient(90deg, #38bdf8, #7dd3fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          25 DE MAYO
        </h2>

        {/* Addresses */}
        <div className="flex flex-col gap-1 mb-6">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
            <MapPin size={11} className="text-yellow-400 flex-shrink-0" />
            <span>Apolo — Machain 3517, CABA</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
            <MapPin size={11} className="text-sky-400 flex-shrink-0" />
            <span>25 de Mayo — Rodríguez Pena 941, Martínez, PBA</span>
          </div>
        </div>
      </div>

      {/* Step cards */}
      <div className="relative z-10 px-5 max-w-sm mx-auto w-full mb-6">
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest text-center mb-3">
          Completá 3 formularios
        </p>
        <div className="space-y-2">
          {STEPS.map(s => (
            <div
              key={s.n}
              className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/8"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0"
                style={{ background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}44` }}
              >
                {s.n}
              </div>
              <div className="flex-1 text-left">
                <p className="text-white text-sm font-semibold leading-tight">{s.title}</p>
                <p className="text-white/40 text-xs">{s.sub}</p>
              </div>
              <ChevronRight size={14} className="text-white/20" />
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 px-5 max-w-sm mx-auto w-full mt-auto pb-8">
        <button
          onClick={onStart}
          className="w-full font-black text-lg py-4 rounded-2xl mb-3 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
            color: '#000',
            boxShadow: '0 8px 32px rgba(250,204,21,0.35)',
          }}
        >
          <ClipboardList size={22} />
          Comenzar inscripción
        </button>

        <button
          onClick={onAdmin}
          className="w-full flex items-center justify-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs font-semibold py-2 tracking-widest uppercase"
        >
          <Shield size={13} /> Modo Administrador
        </button>
      </div>
    </div>
  );
}
