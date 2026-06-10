import { useRef, useState, useCallback, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ChevronLeft, Download, Share2, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import FormPreviewContent from './FormPreviewContent';
import { supabase } from '../lib/supabase';
import type { StudentData, ParqAnswers, EmergencyContact, DeclarationData } from '../types';

interface Props {
  studentData: StudentData;
  answers: ParqAnswers;
  emergency: EmergencyContact;
  firmaData: string;
  declaration: DeclarationData;
  onBack: () => void;
  onDone: () => void;
}

export default function FormPreview({ studentData, answers, emergency, firmaData, declaration, onBack, onDone }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  const captureCanvas = useCallback(async () => {
    const el = contentRef.current;
    if (!el) throw new Error('No se pudo generar el documento');
    return html2canvas(el, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff', logging: false, allowTaint: true });
  }, []);

  const generatePDF = useCallback(async (): Promise<Blob> => {
    const canvas = await captureCanvas();
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
  }, [captureCanvas]);

  const buildPayload = () => ({
    dni: studentData.dni,
    nombre: studentData.nombre,
    apellido: studentData.apellido,
    fecha_nacimiento: studentData.fechaNacimiento || null,
    edad: studentData.edad === '' ? null : Number(studentData.edad),
    telefono: studentData.telefono,
    email: studentData.email || null,
    domicilio: studentData.domicilio,
    sexo: declaration.sexo,
    ocupacion: declaration.ocupacion || null,
    obra_social: declaration.obraSocial || null,
    grupo_sanguineo: declaration.grupoSanguineo || null,
    parq_cardio: answers.cardio,
    parq_dolor_pecho: answers.dolorPecho,
    parq_medicamento_cardiaco: answers.medicamentoCardiaco,
    parq_desmayos: answers.desmayos,
    parq_asma: answers.asma,
    parq_alteracion_osea: answers.alteracionOsea,
    parq_otra_razon: answers.otraRazon,
    contacto_emergencia_nombre: emergency.nombre,
    contacto_emergencia_tel: emergency.telefono,
    acepta_condiciones: true,
    firma_data: firmaData,
    declaracion_respuestas: declaration.answers,
    declaracion_partes_cuerpo: declaration.partesCuerpo,
    declaracion_explicacion: declaration.explicacion || null,
    firma_declaracion: declaration.firma,
    fecha_completado: new Date().toISOString(),
  });

  const handleSaveAndFinish = async () => {
    setSaving(true);
    setError('');
    try {
      const { error: dbError } = await supabase
        .from('submissions')
        .upsert(buildPayload(), { onConflict: 'dni' });

      if (dbError) throw dbError;

      setSaved(true);

      // Save a JPEG preview in background for admin viewer
      captureCanvas()
        .then(canvas => {
          const img = canvas.toDataURL('image/jpeg', 0.8);
          return supabase.from('submissions').update({ documento_firmado: img }).eq('dni', studentData.dni);
        })
        .catch(() => {});
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? `Error al guardar: ${err.message}`
          : 'Error al guardar. Verificá tu conexión e intentá de nuevo.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await generatePDF();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `formulario_${studentData.apellido}_${studentData.dni}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('No se pudo generar el PDF para descargar.');
    }
  };

  const handleShare = async () => {
    try {
      const blob = await generatePDF();
      const file = new File(
        [blob],
        `formulario_${studentData.apellido}_${studentData.dni}.pdf`,
        { type: 'application/pdf' }
      );

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Formulario Gimnasio Apolo-25 de Mayo',
            text: `Formulario de ${studentData.nombre} ${studentData.apellido} — DNI ${studentData.dni}`,
            files: [file],
          });
          return;
        } catch (shareErr) {
          if (shareErr instanceof Error && shareErr.name === 'AbortError') return;
        }
      }
      // Fallback: download PDF
      await handleDownload();
    } catch {
      setError('No se pudo compartir. Intentá con el botón Descargar.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="bg-slate-800 text-white px-5 py-6 shadow-lg">
        <div className="max-w-lg mx-auto">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Vista previa del documento</p>
          <h1 className="text-xl font-bold">Formulario completo</h1>
          <p className="text-sm text-slate-300 mt-1">Revisá y guardá tu formulario</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {saved && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-300 rounded-xl p-4 mb-5">
            <CheckCircle className="text-emerald-500 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm text-emerald-700 font-semibold">Formulario guardado correctamente.</p>
              <p className="text-xs text-emerald-600 mt-0.5">Podés descargarlo o compartirlo, o volver al inicio.</p>
            </div>
          </div>
        )}

        {error && (
          <div ref={errorRef} className="flex items-start gap-3 bg-red-50 border border-red-300 rounded-xl p-4 mb-5">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Preview */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-5">
          <div className="overflow-x-auto">
            <div style={{ minWidth: 320 }}>
              <FormPreviewContent
                ref={contentRef}
                studentData={studentData}
                answers={answers}
                emergency={emergency}
                firmaData={firmaData}
                declaration={declaration}
                date={today}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pb-8">
          {saved ? (
            <button
              onClick={onDone}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <CheckCircle size={20} /> Volver al inicio
            </button>
          ) : (
            <button
              onClick={handleSaveAndFinish}
              disabled={saving}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              {saving ? (
                <><Loader2 size={20} className="animate-spin" /> Guardando...</>
              ) : (
                <><CheckCircle size={20} /> Guardar y Finalizar</>
              )}
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-all active:scale-95"
            >
              <Download size={18} /> Descargar
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-emerald-400 text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition-all active:scale-95"
            >
              <Share2 size={18} /> Compartir
            </button>
          </div>

          {!saved && (
            <button
              type="button"
              onClick={onBack}
              className="w-full flex items-center justify-center gap-1 py-3 text-slate-500 text-sm hover:text-slate-700 transition-colors"
            >
              <ChevronLeft size={16} /> Volver y editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
