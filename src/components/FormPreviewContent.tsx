import { forwardRef } from 'react';
import type { StudentData, ParqAnswers, EmergencyContact, DeclarationData } from '../types';

interface Props {
  studentData: StudentData;
  answers: ParqAnswers;
  emergency: EmergencyContact;
  firmaData: string;
  declaration: DeclarationData;
  date: string;
}

const PARQ_QUESTIONS: { key: keyof ParqAnswers; text: string }[] = [
  { key: 'cardio', text: '¿Alguna vez te diagnosticaron una enfermedad cardiaca?' },
  { key: 'dolorPecho', text: '¿Sufrís dolores en el pecho cuando estás realizando actividad o cuando estás reposando? ¿Notaste dolores en el pecho durante el último mes?' },
  { key: 'medicamentoCardiaco', text: '¿Alguna vez te recetó el médico algún medicamento para la presión arterial u otro problema cardiocirculatorio?' },
  { key: 'desmayos', text: '¿Sufriste desmayos o mareos que te hayan hecho perder el equilibrio o el conocimiento?' },
  { key: 'asma', text: '¿Tuviste un ataque de asma durante los últimos 12 meses? ¿Fuiste diagnosticado con asma?' },
  { key: 'alteracionOsea', text: '¿Tenés alguna alteración ósea o articular que podría agravarse por la actividad física propuesta?' },
  { key: 'otraRazon', text: '¿Tenés conocimiento, por experiencia propia, o debido al consejo de algún médico, de cualquier otra razón física que te impida o dificulte hacer ejercicio sin supervisión médica?' },
];

const DECL_QUESTIONS = [
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

function XBox({ checked }: { checked: boolean }) {
  return (
    <div style={{ width: 16, height: 16, border: '1.5px solid #555', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12, color: '#111', flexShrink: 0 }}>
      {checked ? 'X' : ''}
    </div>
  );
}

const FormPreviewContent = forwardRef<HTMLDivElement, Props>(({ studentData, answers, emergency, firmaData, declaration, date }, ref) => {
  const hasAnySi = Object.values(answers).some(v => v === true);

  return (
    <div
      ref={ref}
      style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: 10,
        color: '#111',
        background: '#fff',
        padding: '20px',
        maxWidth: 700,
        margin: '0 auto',
        lineHeight: 1.45,
      }}
    >
      {/* ===== FORM 1: FICHA DE INSCRIPCION ===== */}
      <div style={{ borderBottom: '2px solid #1e293b', paddingBottom: 14, marginBottom: 14 }}>
        <div style={{ textAlign: 'center', background: '#1e293b', color: '#fff', padding: '7px 0', marginBottom: 10, borderRadius: 3 }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', letterSpacing: 0.5 }}>GIMNASIO APOLO-25 DE MAYO</div>
          <div style={{ fontSize: 9, opacity: 0.7 }}>FICHA DE INSCRIPCIÓN</div>
        </div>
        <div style={{ fontSize: 9, textAlign: 'center', color: '#555', marginBottom: 8 }}>
          Club Círculo Apolo Machain Saavedra — Machain 3517, CABA &nbsp;|&nbsp; Sede 25 de Mayo — Rodríguez Pena 941, Martínez, PBA
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', width: '28%', fontWeight: 'bold', background: '#f9f9f9', fontSize: 9 }}>Apellido</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 10 }}>{studentData.apellido}</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', width: '18%', fontWeight: 'bold', background: '#f9f9f9', fontSize: 9 }}>Nombre</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 10 }}>{studentData.nombre}</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 9 }}>DNI</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 10 }}>{studentData.dni}</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 9 }}>Edad</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 10 }}>{studentData.edad} años</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 9 }}>Fecha nac.</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 10 }}>{studentData.fechaNacimiento || '—'}</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 9 }}>Teléfono</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 10 }}>{studentData.telefono}</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 9 }}>Email</td>
              <td colSpan={3} style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 10 }}>{studentData.email || '—'}</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 9 }}>Domicilio</td>
              <td colSpan={3} style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 10 }}>{studentData.domicilio}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: 7, padding: '5px 8px', background: '#f1f5f9', borderRadius: 3, fontSize: 8.5 }}>
          <strong>Reglamento:</strong> Horarios: Lunes a viernes 7:00–23:00 hs. Sábados 8:00–20:00 hs. El personal responde exclusivamente ante el Concesionario. Para divergencias: tribunales Civiles y Comerciales de GCBA.
        </div>
      </div>

      {/* ===== FORM 2: PAR-Q ===== */}
      <div style={{ borderBottom: '2px solid #1e293b', paddingBottom: 14, marginBottom: 14 }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' }}>Cuestionario de Aptitud Física (PAR-Q)</div>
        </div>
        <p style={{ marginBottom: 6, fontSize: 9 }}>
          El PAR-Q es una herramienta para la detección de posibles problemas de salud y cardiovasculares. Las personas entre 18 y 65 años lo realizarán para saber si necesitan consultar con el médico antes de comenzar a realizar ejercicio físico.
        </p>
        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '4px 8px', borderRadius: 3, marginBottom: 8, fontSize: 8.5 }}>
          <strong>Personas menores de 18 o mayores de 65 años:</strong> deben presentar certificado médico expedido por un médico matriculado.
        </div>
        <p style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 9 }}>
          Por favor respondé con honestidad. Este cuestionario reviste carácter de Declaración Jurada.
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
          <tbody>
            {PARQ_QUESTIONS.map((q) => (
              <tr key={q.key}>
                <td style={{ padding: '4px 6px', border: '1px solid #ccc', fontSize: 9, width: '68%' }}>{q.text}</td>
                <td style={{ padding: '4px 6px', border: '1px solid #ccc', textAlign: 'center', width: '16%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <XBox checked={answers[q.key] === true} />
                    <span style={{ fontSize: 9, fontWeight: 'bold' }}>SÍ</span>
                  </div>
                </td>
                <td style={{ padding: '4px 6px', border: '1px solid #ccc', textAlign: 'center', width: '16%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <XBox checked={answers[q.key] === false} />
                    <span style={{ fontSize: 9, fontWeight: 'bold' }}>NO</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {hasAnySi ? (
          <div style={{ background: '#fee2e2', border: '1px solid #ef4444', padding: '5px 8px', borderRadius: 3, marginBottom: 8, fontSize: 8.5 }}>
            <strong>SI RESPONDISTE SÍ A ALGUNA PREGUNTA ANTERIOR, TE PEDIMOS QUE CONSULTES A TU MEDICO ANTES DE ENTRENAR Y QUE LE SOLICITES UN CERTIFICADO MEDICO.</strong>
          </div>
        ) : (
          <div style={{ background: '#d1fae5', border: '1px solid #10b981', padding: '5px 8px', borderRadius: 3, marginBottom: 8, fontSize: 8.5 }}>
            <strong>SI CONTESTASTE NO A TODAS LAS PREGUNTAS, YA PODES EMPEZAR A ENTRENAR CON NOSOTROS. AVISANOS SI EN CUALQUIER MOMENTO TE SENTIS MAL.</strong>
          </div>
        )}

        <div style={{ marginBottom: 8, fontSize: 9 }}>
          <p>Proporciono contacto de emergencia de otra persona, a la que avisar de ser necesario.</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4 }}>
            <tbody>
              <tr>
                <td style={{ padding: '3px 6px', border: '1px solid #ccc', fontWeight: 'bold', background: '#f9f9f9', fontSize: 8.5, width: '28%' }}>Nombre y apellido</td>
                <td style={{ padding: '3px 6px', border: '1px solid #ccc', fontSize: 9 }}>{emergency.nombre}</td>
                <td style={{ padding: '3px 6px', border: '1px solid #ccc', fontWeight: 'bold', background: '#f9f9f9', fontSize: 8.5, width: '12%' }}>Tel.</td>
                <td style={{ padding: '3px 6px', border: '1px solid #ccc', fontSize: 9 }}>{emergency.telefono}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: 8, fontSize: 9 }}>
          <p>Yo <strong>{studentData.nombre} {studentData.apellido}</strong> declaro haber contestado con total libertad y honestidad, y tomo total responsabilidad por cualquier lesión o daño físico que pueda tener. El Gimnasio Apolo-25 de Mayo no es responsable de mis gastos legales o médicos.</p>
        </div>
        <p style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 5 }}>Confirmo haber leído y comprendido mis responsabilidades.</p>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 6 }}>
          <tbody>
            <tr>
              <td style={{ padding: '3px 6px', border: '1px solid #ccc', width: '30%', fontSize: 9 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 3 }}>Fecha</div>
                <div>{date}</div>
              </td>
              <td style={{ padding: '3px 6px', border: '1px solid #ccc', width: '40%', textAlign: 'center', fontSize: 9 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 3 }}>Firma</div>
                {firmaData && <img src={firmaData} alt="Firma" style={{ maxHeight: 55, maxWidth: '100%', objectFit: 'contain' }} />}
              </td>
              <td style={{ padding: '3px 6px', border: '1px solid #ccc', width: '30%', fontSize: 9 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 3 }}>Aclaración / DNI</div>
                <div>{studentData.apellido}, {studentData.nombre}</div>
                <div>DNI: {studentData.dni}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '5px 8px', borderRadius: 3, fontSize: 8, fontStyle: 'italic', color: '#555' }}>
          Nota: Este cuestionario es válido hasta un plazo de 12 meses. Se invalida si su estado requiere contestar SÍ en alguna pregunta. La entidad no asume responsabilidad legal respecto a las personas que realizan actividad física.
        </div>
      </div>

      {/* ===== FORM 3: DECLARACION JURADA ===== */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>Declaración Jurada</div>
          <div style={{ fontSize: 10, fontWeight: 'bold', color: '#444' }}>Historia Clínica</div>
          <div style={{ fontSize: 9, color: '#888' }}>Fecha de ingreso: {date}</div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
          <tbody>
            <tr>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 8.5, width: '25%' }}>Apellido y Nombre</td>
              <td colSpan={3} style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 9 }}>{studentData.apellido}, {studentData.nombre}</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 8.5, width: '10%' }}>DNI</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 9 }}>{studentData.dni}</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 8.5 }}>Email</td>
              <td colSpan={5} style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 9 }}>{studentData.email || '—'}</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 8.5 }}>Fecha de nac.</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 9 }}>{studentData.fechaNacimiento || '—'}</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 8.5, width: '8%' }}>Sexo</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 9 }}>{declaration.sexo}</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 8.5 }}>Edad</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 9 }}>{studentData.edad}</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 8.5 }}>Dirección</td>
              <td colSpan={3} style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 9 }}>{studentData.domicilio}</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 8.5 }}>Teléfono</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 9 }}>{studentData.telefono}</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 8.5 }}>Ocupación</td>
              <td colSpan={5} style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 9 }}>{declaration.ocupacion || '—'}</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 8.5 }}>Obra Social</td>
              <td colSpan={3} style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 9 }}>{declaration.obraSocial || '—'}</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 8.5 }}>Grupo/Factor</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 9 }}>{declaration.grupoSanguineo || '—'}</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 8.5 }}>Emergencia</td>
              <td colSpan={3} style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 9 }}>{emergency.nombre}</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontWeight: 'bold', background: '#f9f9f9', fontSize: 8.5 }}>Tel.</td>
              <td style={{ padding: '3px 6px', border: '1px solid #ddd', fontSize: 9 }}>{emergency.telefono}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ border: '1.5px solid #333', padding: '4px 6px', marginBottom: 6 }}>
          <div style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 9, marginBottom: 4 }}>CONTESTE CON UNA X LA RESPUESTA CORRECTA</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '3px 5px', border: '1px solid #aaa', width: '76%', fontSize: 8.5, textAlign: 'left', background: '#f0f0f0' }}></th>
                <th style={{ padding: '3px 5px', border: '1px solid #aaa', width: '12%', fontSize: 8.5, textAlign: 'center', background: '#f0f0f0' }}>SI</th>
                <th style={{ padding: '3px 5px', border: '1px solid #aaa', width: '12%', fontSize: 8.5, textAlign: 'center', background: '#f0f0f0' }}>NO</th>
              </tr>
            </thead>
            <tbody>
              {DECL_QUESTIONS.map((q) => (
                <tr key={q.key}>
                  <td style={{ padding: '3px 5px', border: '1px solid #aaa', fontSize: 8.5 }}>{q.text}</td>
                  <td style={{ padding: '3px 5px', border: '1px solid #aaa', textAlign: 'center' }}>
                    <XBox checked={declaration.answers[q.key] === true} />
                  </td>
                  <td style={{ padding: '3px 5px', border: '1px solid #aaa', textAlign: 'center' }}>
                    <XBox checked={declaration.answers[q.key] === false} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {declaration.partesCuerpo.length > 0 && (
          <div style={{ fontSize: 8.5, marginBottom: 5 }}>
            <strong>Si respondió SÍ, marque el lugar:</strong>{' '}
            {declaration.partesCuerpo.join(', ')}
          </div>
        )}
        <div style={{ fontSize: 8.5, marginBottom: 10 }}>
          <strong>Explicación:</strong> {declaration.explicacion || '—'}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 8px', border: '1px solid #ccc', width: '45%', textAlign: 'center', fontSize: 9 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 3 }}>FIRMA DEL DECLARANTE / PADRE / TUTOR</div>
                {declaration.firma && <img src={declaration.firma} alt="Firma declaración" style={{ maxHeight: 60, maxWidth: '100%', objectFit: 'contain' }} />}
                <div style={{ borderTop: '1px solid #aaa', marginTop: 4, paddingTop: 3 }}>{studentData.apellido}, {studentData.nombre}</div>
              </td>
              <td style={{ padding: '4px 8px', border: '1px solid #ccc', width: '30%', textAlign: 'center', fontSize: 9 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 3 }}>ACLARACIÓN</div>
                <div style={{ borderTop: '1px solid #aaa', marginTop: 20, paddingTop: 3, fontWeight: 'bold' }}>{studentData.apellido}, {studentData.nombre}</div>
                <div style={{ marginTop: 2 }}>DNI: {studentData.dni}</div>
              </td>
              <td style={{ padding: '4px 8px', border: '1px solid #ccc', width: '25%', fontSize: 9 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 3 }}>Fecha</div>
                <div>{date}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
});

FormPreviewContent.displayName = 'FormPreviewContent';

export default FormPreviewContent;
