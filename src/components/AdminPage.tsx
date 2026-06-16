import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, Search, Eye, Printer, ChevronLeft, Users, Loader2, AlertCircle, X, Share2, Download, Home, CheckSquare, Square, Trash2, ShieldAlert } from 'lucide-react';
import FormPreviewContent from './FormPreviewContent';
import type { FormSubmission, ParqAnswers, DeclarationData } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ADMIN_PASSWORD = '2525';
const SUPER_ADMIN_PASSWORD = '842114';

function formatDate(iso: string | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function buildDeclaration(s: FormSubmission): DeclarationData {
  return {
    sexo: s.sexo || '',
    ocupacion: s.ocupacion || '',
    obraSocial: s.obra_social || '',
    grupoSanguineo: s.grupo_sanguineo || '',
    answers: (s.declaracion_respuestas as Record<string, boolean | null>) || {},
    partesCuerpo: s.declaracion_partes_cuerpo || [],
    explicacion: s.declaracion_explicacion || '',
    firma: s.firma_declaracion || '',
  };
}

function buildParq(s: FormSubmission): ParqAnswers {
  return {
    cardio: s.parq_cardio,
    dolorPecho: s.parq_dolor_pecho,
    medicamentoCardiaco: s.parq_medicamento_cardiaco,
    desmayos: s.parq_desmayos,
    asma: s.parq_asma,
    alteracionOsea: s.parq_alteracion_osea,
    otraRazon: s.parq_otra_razon,
  };
}

async function renderToPDF(el: HTMLDivElement, filename: string) {
  const canvas = await html2canvas(el, { scale: 1.5, backgroundColor: '#ffffff', logging: false, allowTaint: true });
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = imgW * canvas.height / canvas.width;
  let pos = 0;
  let remaining = imgH;
  pdf.addImage(dataUrl, 'JPEG', 0, pos, imgW, imgH);
  remaining -= pageH;
  while (remaining > 0) {
    pos -= pageH;
    pdf.addPage();
    pdf.addImage(dataUrl, 'JPEG', 0, pos, imgW, imgH);
    remaining -= pageH;
  }
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminPage({ onBackToHome }: { onBackToHome?: () => void }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState('');
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FormSubmission | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  // Bulk selection state
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [bulkQueue, setBulkQueue] = useState<FormSubmission[]>([]);
  const [bulkIndex, setBulkIndex] = useState(0); // 1-based; 0 = idle
  const bulkRef = useRef<HTMLDivElement>(null);

  // Delete modal state
  type DeleteStep = 'password' | 'confirm';
  const [deleteModal, setDeleteModal] = useState<DeleteStep | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const openDeleteModal = () => {
    setDeletePassword('');
    setDeletePasswordError('');
    setDeleteModal('password');
  };

  const closeDeleteModal = () => {
    setDeleteModal(null);
    setDeletePassword('');
    setDeletePasswordError('');
  };

  const handleDeletePasswordSubmit = () => {
    if (deletePassword === SUPER_ADMIN_PASSWORD) {
      setDeletePasswordError('');
      setDeleteModal('confirm');
    } else {
      setDeletePasswordError('Clave incorrecta.');
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    const ids = Array.from(checkedIds);
    const { error } = await supabase.from('submissions').delete().in('id', ids);
    if (!error) {
      setSubmissions(prev => prev.filter(s => !checkedIds.has(s.id)));
      setCheckedIds(new Set());
      closeDeleteModal();
    } else {
      setDeletePasswordError(error.message);
    }
    setDeleting(false);
  };

  const login = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError('');
    } else {
      setPwError('Contraseña incorrecta.');
    }
  };

  useEffect(() => {
    if (!authed) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('submissions')
        .select('id,nombre,apellido,dni,edad,sexo,telefono,email,domicilio,fecha_nacimiento,fecha_completado,created_at,contacto_emergencia_nombre,contacto_emergencia_tel,parq_cardio,parq_dolor_pecho,parq_medicamento_cardiaco,parq_desmayos,parq_asma,parq_alteracion_osea,parq_otra_razon')
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setSubmissions((data as FormSubmission[]) || []);
      setLoading(false);
    };
    load();
  }, [authed]);

  // Bulk PDF download queue processor
  useEffect(() => {
    if (bulkIndex === 0 || bulkIndex > bulkQueue.length) {
      if (bulkIndex > bulkQueue.length && bulkQueue.length > 0) {
        setBulkQueue([]);
        setBulkIndex(0);
        setCheckedIds(new Set());
      }
      return;
    }

    let cancelled = false;
    const process = async () => {
      await new Promise(r => setTimeout(r, 350));
      if (cancelled) return;
      const el = bulkRef.current;
      if (!el) { setBulkIndex(i => i + 1); return; }
      const sub = bulkQueue[bulkIndex - 1];
      try {
        await renderToPDF(el, `formulario_${sub.apellido}_${sub.dni}.pdf`);
      } catch {
        // continue even if one fails
      }
      if (!cancelled) setBulkIndex(i => i + 1);
    };
    process();
    return () => { cancelled = true; };
  }, [bulkIndex, bulkQueue]);

  const filtered = submissions.filter(s => {
    const q = search.toLowerCase();
    return (
      s.nombre.toLowerCase().includes(q) ||
      s.apellido.toLowerCase().includes(q) ||
      s.dni.includes(q)
    );
  });

  const allChecked = filtered.length > 0 && filtered.every(s => checkedIds.has(s.id));

  const toggleCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allChecked) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(filtered.map(s => s.id)));
    }
  };

  const startBulkDownload = () => {
    const toDownload = filtered.filter(s => checkedIds.has(s.id));
    if (toDownload.length === 0) return;
    setBulkQueue(toDownload);
    setBulkIndex(1);
  };

  const generatePDF = async (): Promise<Blob> => {
    const el = previewRef.current;
    if (!el) throw new Error('No se pudo generar el documento');
    const canvas = await html2canvas(el, { scale: 1.5, backgroundColor: '#ffffff', logging: false, allowTaint: true });
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = imgW * canvas.height / canvas.width;
    let pos = 0;
    let remaining = imgH;
    pdf.addImage(dataUrl, 'JPEG', 0, pos, imgW, imgH);
    remaining -= pageH;
    while (remaining > 0) {
      pos -= pageH;
      pdf.addPage();
      pdf.addImage(dataUrl, 'JPEG', 0, pos, imgW, imgH);
      remaining -= pageH;
    }
    return pdf.output('blob');
  };

  const handleExportImage = async () => {
    try {
      setActionError('');
      const blob = await generatePDF();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `formulario_${selected?.apellido}_${selected?.dni}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setActionError('No se pudo exportar el PDF.');
    }
  };

  const handleShare = async () => {
    try {
      setActionError('');
      const blob = await generatePDF();
      const file = new File([blob], `formulario_${selected?.apellido}_${selected?.dni}.pdf`, { type: 'application/pdf' });

      if (navigator.share) {
        try {
          await navigator.share({
            title: `Formulario — ${selected?.apellido}, ${selected?.nombre}`,
            text: `Formulario Gimnasio Apolo-25 de Mayo\n${selected?.apellido}, ${selected?.nombre} — DNI: ${selected?.dni}`,
            files: [file],
          });
          return;
        } catch (shareErr) {
          if (shareErr instanceof Error && shareErr.name === 'AbortError') return;
        }
      }
      await handleExportImage();
    } catch {
      setActionError('No se pudo compartir.');
    }
  };

  const handlePrint = () => {
    const el = previewRef.current;
    if (!el) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Formulario ${selected?.apellido}, ${selected?.nombre}</title>
      <style>body{margin:16px;} img{max-width:100%;} *{box-sizing:border-box;}</style>
      </head><body>${el.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-5">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Panel Admin</h1>
            <p className="text-sm text-slate-500 mt-1">Gimnasio Apolo-25 de Mayo</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={pw}
                onChange={e => { setPw(e.target.value); setPwError(''); }}
                onKeyDown={e => e.key === 'Enter' && login()}
                placeholder="••••••"
                className={`w-full border rounded-xl px-4 py-3 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-slate-400 ${pwError ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
              />
              {pwError && (
                <div className="flex items-center gap-1 mt-2">
                  <AlertCircle size={13} className="text-red-500" />
                  <p className="text-red-500 text-xs">{pwError}</p>
                </div>
              )}
            </div>
            <button
              onClick={login}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95"
            >
              Ingresar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Detail view
  if (selected) {
    const date = selected.fecha_completado
      ? new Date(selected.fecha_completado).toLocaleDateString('es-AR')
      : new Date(selected.created_at || '').toLocaleDateString('es-AR');

    return (
      <div className="min-h-screen bg-slate-100">
        <div className="bg-slate-800 text-white px-5 py-5 shadow-lg">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button onClick={() => { setSelected(null); setActionError(''); }} className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors">
              <ChevronLeft size={20} /> Volver
            </button>
            <span className="font-semibold text-sm">{selected.apellido}, {selected.nombre}</span>
            <span className="text-xs text-slate-400">DNI {selected.dni}</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-5">
          {detailLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm">Cargando formulario...</span>
            </div>
          )}
          {actionError && (
            <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
              <p className="text-sm text-red-600">{actionError}</p>
            </div>
          )}

          {!detailLoading && (
          <div className="flex gap-2 mb-5 flex-wrap">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 shadow-sm transition-all">
              <Printer size={16} /> Imprimir
            </button>
            <button onClick={handleExportImage} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 shadow-sm transition-all">
              <Download size={16} /> Descargar
            </button>
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 font-medium text-sm hover:bg-emerald-100 shadow-sm transition-all">
              <Share2 size={16} /> Compartir
            </button>
          </div>
          )}

          {!detailLoading && selected.documento_firmado ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-5 p-2">
              <img src={selected.documento_firmado} alt="Formulario firmado" className="w-full rounded-xl" />
            </div>
          ) : null}

          {!detailLoading && (
          <div
            className={selected.documento_firmado ? 'sr-only' : 'bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-5'}
            aria-hidden={!!selected.documento_firmado}
          >
            <div className="overflow-x-auto">
              <FormPreviewContent
                ref={previewRef}
                studentData={{
                  nombre: selected.nombre,
                  apellido: selected.apellido,
                  dni: selected.dni,
                  fechaNacimiento: selected.fecha_nacimiento || '',
                  edad: selected.edad ?? '',
                  telefono: selected.telefono || '',
                  email: selected.email || '',
                  domicilio: selected.domicilio || '',
                }}
                answers={buildParq(selected)}
                emergency={{
                  nombre: selected.contacto_emergencia_nombre || '',
                  telefono: selected.contacto_emergencia_tel || '',
                }}
                firmaData={selected.firma_data || ''}
                declaration={buildDeclaration(selected)}
                date={date}
              />
            </div>
          </div>
          )}

          {!detailLoading && selected.documento_firmado && (
            <div style={{ position: 'absolute', left: -9999, top: 0, pointerEvents: 'none', opacity: 0 }}>
              <FormPreviewContent
                ref={previewRef}
                studentData={{
                  nombre: selected.nombre,
                  apellido: selected.apellido,
                  dni: selected.dni,
                  fechaNacimiento: selected.fecha_nacimiento || '',
                  edad: selected.edad ?? '',
                  telefono: selected.telefono || '',
                  email: selected.email || '',
                  domicilio: selected.domicilio || '',
                }}
                answers={buildParq(selected)}
                emergency={{
                  nombre: selected.contacto_emergencia_nombre || '',
                  telefono: selected.contacto_emergencia_tel || '',
                }}
                firmaData={selected.firma_data || ''}
                declaration={buildDeclaration(selected)}
                date={date}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Bulk render area — off-screen, renders current queued submission for PDF capture
  const bulkCurrent = bulkIndex > 0 && bulkIndex <= bulkQueue.length ? bulkQueue[bulkIndex - 1] : null;
  const bulkDate = bulkCurrent
    ? (bulkCurrent.fecha_completado
        ? new Date(bulkCurrent.fecha_completado).toLocaleDateString('es-AR')
        : new Date(bulkCurrent.created_at || '').toLocaleDateString('es-AR'))
    : '';

  // List view
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Off-screen bulk render target */}
      {bulkCurrent && (
        <div style={{ position: 'fixed', left: -9999, top: 0, width: 794, pointerEvents: 'none', zIndex: -1 }}>
          <div ref={bulkRef}>
            <FormPreviewContent
              studentData={{
                nombre: bulkCurrent.nombre,
                apellido: bulkCurrent.apellido,
                dni: bulkCurrent.dni,
                fechaNacimiento: bulkCurrent.fecha_nacimiento || '',
                edad: bulkCurrent.edad ?? '',
                telefono: bulkCurrent.telefono || '',
                email: bulkCurrent.email || '',
                domicilio: bulkCurrent.domicilio || '',
              }}
              answers={buildParq(bulkCurrent)}
              emergency={{
                nombre: bulkCurrent.contacto_emergencia_nombre || '',
                telefono: bulkCurrent.contacto_emergencia_tel || '',
              }}
              firmaData={bulkCurrent.firma_data || ''}
              declaration={buildDeclaration(bulkCurrent)}
              date={bulkDate}
            />
          </div>
        </div>
      )}

      <div className="bg-slate-800 text-white px-5 py-5 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest">Gimnasio Apolo-25 de Mayo</p>
            <h1 className="text-lg font-bold">Panel Administrador</h1>
          </div>
          <div className="flex items-center gap-3">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors text-sm"
              >
                <Home size={16} /> Inicio
              </button>
            )}
            <button
              onClick={() => setAuthed(false)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <LogOut size={16} /> Salir
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total de alumnos</p>
              <p className="text-3xl font-bold text-slate-800">{submissions.length}</p>
            </div>
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Users className="text-slate-600" size={24} />
            </div>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o DNI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-slate-300 bg-white rounded-xl pl-11 pr-10 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
        </div>

        {error && (
          <div className="flex gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{search ? 'Sin resultados para tu búsqueda.' : 'No hay formularios registrados aún.'}</p>
          </div>
        ) : (
          <>
            {/* Select all row */}
            <div className="flex items-center justify-between px-1 mb-2">
              <button
                onClick={toggleAll}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                {allChecked
                  ? <CheckSquare size={18} className="text-slate-700" />
                  : <Square size={18} className="text-slate-400" />
                }
                {allChecked ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
              {checkedIds.size > 0 && (
                <span className="text-xs text-slate-500">{checkedIds.size} seleccionado{checkedIds.size !== 1 ? 's' : ''}</span>
              )}
            </div>

            <div className="space-y-2 pb-28">
              {filtered.map(s => {
                const hasSi = [s.parq_cardio, s.parq_dolor_pecho, s.parq_medicamento_cardiaco, s.parq_desmayos, s.parq_asma, s.parq_alteracion_osea, s.parq_otra_razon].some(v => v === true);
                const isChecked = checkedIds.has(s.id);
                return (
                  <div
                    key={s.id}
                    className={`w-full bg-white rounded-2xl shadow-sm border transition-all flex items-center gap-3 px-4 py-4 ${isChecked ? 'border-slate-500 ring-1 ring-slate-400' : 'border-slate-200'}`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={e => toggleCheck(s.id, e)}
                      className="flex-shrink-0 p-0.5 rounded focus:outline-none"
                      aria-label="Seleccionar"
                    >
                      {isChecked
                        ? <CheckSquare size={22} className="text-slate-700" />
                        : <Square size={22} className="text-slate-300 hover:text-slate-500 transition-colors" />
                      }
                    </button>

                    {/* Row content — click to open detail */}
                    <button
                      onClick={async () => {
                        setDetailLoading(true);
                        setSelected(s); // show skeleton immediately
                        const { data } = await supabase.from('submissions').select('*').eq('id', s.id).single();
                        if (data) setSelected(data as FormSubmission);
                        setDetailLoading(false);
                      }}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm">{s.apellido}, {s.nombre}</span>
                        {hasSi && (
                          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">SÍ en PAR-Q</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span>DNI: {s.dni}</span>
                        {s.edad && <span>{s.edad} años</span>}
                        {s.sexo && <span>{s.sexo}</span>}
                        <span>{formatDate(s.fecha_completado || s.created_at)}</span>
                      </div>
                    </button>

                    <Eye size={16} className="text-slate-300 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Floating bulk action bar */}
      {checkedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-5 pointer-events-none">
          <div className="w-full max-w-2xl pointer-events-auto">
            <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-bold text-sm">
                  {checkedIds.size} formulario{checkedIds.size !== 1 ? 's' : ''} seleccionado{checkedIds.size !== 1 ? 's' : ''}
                </p>
                {bulkIndex > 0 && bulkIndex <= bulkQueue.length && (
                  <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" />
                    Descargando {bulkIndex} de {bulkQueue.length}...
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCheckedIds(new Set())}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={openDeleteModal}
                  disabled={bulkIndex > 0 && bulkIndex <= bulkQueue.length}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-500 text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
                <button
                  onClick={startBulkDownload}
                  disabled={bulkIndex > 0 && bulkIndex <= bulkQueue.length}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', color: '#000' }}
                >
                  {bulkIndex > 0 && bulkIndex <= bulkQueue.length
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Download size={16} />
                  }
                  Descargar PDF{checkedIds.size !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150">

            {deleteModal === 'password' && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="text-red-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Eliminar declaraciones</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Ingresá la clave de superadministrador</p>
                  </div>
                </div>

                <input
                  type="password"
                  value={deletePassword}
                  onChange={e => { setDeletePassword(e.target.value); setDeletePasswordError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleDeletePasswordSubmit()}
                  placeholder="••••••"
                  autoFocus
                  className={`w-full border rounded-xl px-4 py-3 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-red-400 mb-1 ${deletePasswordError ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                />
                {deletePasswordError && (
                  <div className="flex items-center gap-1 mb-3">
                    <AlertCircle size={12} className="text-red-500" />
                    <p className="text-xs text-red-500">{deletePasswordError}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={closeDeleteModal}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeletePasswordSubmit}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all active:scale-95"
                  >
                    Continuar
                  </button>
                </div>
              </>
            )}

            {deleteModal === 'confirm' && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Trash2 className="text-red-600" size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">¿Confirmar eliminación?</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Esta acción no se puede deshacer</p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                  <p className="text-sm text-red-700 font-medium">
                    Se eliminarán permanentemente <span className="font-bold">{checkedIds.size} declaracion{checkedIds.size !== 1 ? 'es' : ''}</span> del sistema.
                  </p>
                  <p className="text-xs text-red-500 mt-1">Asegurate de haber descargado los PDFs antes de continuar.</p>
                </div>

                {deletePasswordError && (
                  <div className="flex items-center gap-1 mb-3">
                    <AlertCircle size={12} className="text-red-500" />
                    <p className="text-xs text-red-500">{deletePasswordError}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={closeDeleteModal}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
