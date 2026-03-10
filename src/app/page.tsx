'use client'
import { useState, useEffect } from "react";
import {
  validateAndSanitizeText,
  validateAndSanitizeTextarea,
  validateAndSanitizeNumber,
  validateEmail,
  validateDate,
  validateOption,
  validateMultipleOptions
} from './validations';

// se establece la interface para las preguntas 
interface Pregunta {
  id: number;
  texto: string;
  tipo: "texto" | "textarea" | "numero" | "fecha" | "opcion" | "multiple" | "satisfaccion" | "email";
  campo: string;
  placeholder?: string;
  opciones?: readonly string[];
  obligatoria: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
}

// Interface para las respuestas con tipos seguros
interface Respuestas {
  nombre?: string;
  email?: string;
  edad?: number;
  inicio?: string;
  carrera?: string;
  materias?: string[];
  herramientas_ia?: string[];
  frecuencia_ia?: string;
  satisfaccion_carrera?: number;
  actividades?: string[];
  recomendacion?: string;
  experiencia?: string;
  comentarios?: string;
}

// Interface para errores de validación
interface ErroresValidacion {
  [campo: string]: string;
}

//inicio de las preguntas 
const preguntas: Pregunta[] = [
  {
    id: 1,
    texto: "¿Cuál es tu nombre completo?",
    tipo: "texto",
    campo: "nombre",
    placeholder: "Ejemplo: Jose Castillo Morales",
    obligatoria: true
  },
  {
    id: 2,
    texto: "¿Cuál es tu correo electrónico?",
    tipo: "email",
    campo: "email",
    placeholder: "ejemplo@correo.com",
    obligatoria: true
  },
  {
    id: 3,
    texto: "¿Cuál es tu edad?",
    tipo: "numero",
    campo: "edad",
    placeholder: "Ejemplo: 21",
    obligatoria: true,
    min: 15,
    max: 100,
    maxLength: 3
  },
  {
    id: 4,
    texto: "¿Cuándo iniciaste tus estudios universitarios?",
    tipo: "fecha",
    campo: "inicio",
    obligatoria: true
  },
  {
    id: 5,
    texto: "¿Cuál es tu carrera? (Selección única)",
    tipo: "opcion",
    campo: "carrera",
    opciones: ["Ingeniería en Sistemas", "Ingeniería Mecatrónica", "Ingeniería Industrial", "Arquitectura", "Administración", "Derecho", "Psicologia", "Turismo", "Ingenieria en Ciencias de la Computacion", "Otra"],
    obligatoria: true
  },
  {
    id: 6,
    texto: "¿Qué materias te gustan más? (Selección múltiple - puedes elegir varias)",
    tipo: "multiple",
    campo: "materias",
    opciones: ["Matemáticas", "Programación", "Física", "Química", "Diseño", "Economía", "Historia", "Electronica", "Lenguas", "Otra"],
    obligatoria: false
  },
  {
    id: 7,
    texto: "¿Qué herramientas de IA utilizas regularmente? (Selección múltiple)",
    tipo: "multiple",
    campo: "herramientas_ia",
    opciones: ["ChatGPT", "Claude", "Gemini", "Copilot", "DALL·E", "MidJourney", "Ninguna"],
    obligatoria: false
  },
  {
    id: 8,
    texto: "¿Con qué frecuencia usas IA para estudiar?",
    tipo: "opcion",
    campo: "frecuencia_ia",
    opciones: ["Nunca", "Rara vez (1 vez al mes)", "A veces (1-2 veces por semana)", "Frecuentemente (3-5 veces por semana)", "Diariamente"],
    obligatoria: true
  },
  {
    id: 9,
    texto: "¿Qué tan satisfecho estás con tu carrera? (Escala del 1 al 10)",
    tipo: "satisfaccion",
    campo: "satisfaccion_carrera",
    obligatoria: true
  },
  {
    id: 10,
    texto: "¿Qué actividades extracurriculares realizas? (Selección múltiple)",
    tipo: "multiple",
    campo: "actividades",
    opciones: ["Deportes", "Música", "Arte", "Voluntariado", "Clubes estudiantiles", "Trabajo de medio tiempo", "Ninguna"],
    obligatoria: false
  },
  {
    id: 11,
    texto: "¿Recomendarías tu universidad a otros estudiantes?",
    tipo: "opcion",
    campo: "recomendacion",
    opciones: ["Definitivamente sí", "Probablemente sí", "No estoy seguro/a", "Probablemente no", "Definitivamente no"],
    obligatoria: true
  },
  {
    id: 12,
    texto: "Cuéntanos sobre tu experiencia universitaria hasta ahora (Pregunta abierta)",
    tipo: "textarea",
    campo: "experiencia",
    placeholder: "Escribe aquí tu experiencia, logros, desafíos, etc...",
    obligatoria: false
  },
  {
    id: 13,
    texto: "¿Tienes algún comentario o sugerencia adicional? (Pregunta libre)",
    tipo: "textarea",
    campo: "comentarios",
    placeholder: "Queremos saber tu opinion...",
    obligatoria: false
  }
];

//inicio del componente 
export default function Home() {
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuestas>({});
  const [errores, setErrores] = useState<ErroresValidacion>({});
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const pregunta = preguntas[indice];
  const progreso = ((indice + 1) / preguntas.length) * 100;

  const siguiente = () => {
    // Limpiar error al avanzar
    setErrores({ ...errores, [pregunta.campo]: '' });

    if (indice < preguntas.length - 1) {
      setIndice(indice + 1);
    } else {
      setMostrarResumen(true);
    }
  };

  const anterior = () => {
    if (indice > 0) setIndice(indice - 1);
  };

  const estaRespondida = () => {
    const respuesta = respuestas[pregunta.campo as keyof Respuestas];

    if (!pregunta.obligatoria) return true;

    if (pregunta.tipo === "multiple") {
      return Array.isArray(respuesta) && respuesta.length > 0;
    }

    // Para números, solo verificar que exista y sea mayor a 0
    if (pregunta.tipo === "numero") {
      return respuesta !== undefined && respuesta !== "" && respuesta !== null && Number(respuesta) > 0;
    }

    // Para texto, email - requiere mínimo 5 caracteres
    if (pregunta.tipo === "texto" || pregunta.tipo === "email") {
      return respuesta !== undefined && respuesta !== "" && respuesta !== null && typeof respuesta === 'string' && respuesta.length > 4;
    }

    // Para el resto de tipos (fecha, opcion, satisfaccion, textarea)
    return respuesta !== undefined && respuesta !== "" && respuesta !== null;
  };

  // useEffect para manejar la tecla Enter
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Solo actuar si presionan Enter y no están en un textarea
      if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault(); // Prevenir comportamiento por defecto

        // Solo avanzar si la pregunta está respondida
        if (estaRespondida()) {
          siguiente();
        }
      }
    };

    // Agregar el listener solo en la pantalla principal de preguntas
    if (!mostrarResumen && !enviado) {
      window.addEventListener('keydown', handleKeyPress);
    }

    // Cleanup: remover el listener
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [indice, respuestas, mostrarResumen, enviado]);

  const enviarEncuesta = () => {
    console.log("Encuesta enviada:", respuestas);
    setEnviado(true);
  };

  const reiniciar = () => {
    setIndice(0);
    setRespuestas({});
    setMostrarResumen(false);
    setEnviado(false);
  };

  //se especifica como va a ser el tipo de preguntas 
  const renderPregunta = () => {
    switch (pregunta.tipo) {

      case "texto":
        return (
          <div>
            <input
              type="text"
              className={`w-full rounded-lg border-2 px-4 py-3 focus:outline-none transition-colors text-lg ${errores[pregunta.campo]
                ? 'border-red-500 focus:border-red-600'
                : 'border-gray-300 focus:border-blue-500'
                }`}
              placeholder={pregunta.placeholder}
              value={respuestas[pregunta.campo as keyof Respuestas] ?? ""}
              onChange={(e) => {
                const valor = e.target.value;
                const resultado = validateAndSanitizeText(valor, 2, 200);

                if (resultado.isValid || valor === '') {
                  setRespuestas({ ...respuestas, [pregunta.campo]: resultado.value });
                  setErrores({ ...errores, [pregunta.campo]: '' });
                } else {
                  setRespuestas({ ...respuestas, [pregunta.campo]: resultado.value });
                  setErrores({ ...errores, [pregunta.campo]: resultado.error || '' });
                }
              }}
              maxLength={200}
            />
            {errores[pregunta.campo] && (
              <p className="text-sm text-red-600 mt-1 font-medium">
                ⚠ {errores[pregunta.campo]}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Solo caracteres seguros permitidos (min: 2, max: 200)
            </p>
          </div>
        );

      case "numero":
        return (
          <div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className={`w-full rounded-lg border-2 px-4 py-3 focus:outline-none transition-colors text-lg ${errores[pregunta.campo]
                ? 'border-red-500 focus:border-red-600'
                : 'border-gray-300 focus:border-blue-500'
                }`}
              placeholder={pregunta.placeholder}
              value={respuestas[pregunta.campo as keyof Respuestas] ?? ""}
              onChange={(e) => {
                const valor = e.target.value;

                // Permitir solo dígitos
                if (valor === '' || /^\d+$/.test(valor)) {
                  const resultado = validateAndSanitizeNumber(
                    valor,
                    pregunta.min,
                    pregunta.max,
                    pregunta.maxLength
                  );

                  if (resultado.isValid || valor === '') {
                    setRespuestas({ ...respuestas, [pregunta.campo]: resultado.value ?? valor });
                    setErrores({ ...errores, [pregunta.campo]: '' });
                  } else {
                    setRespuestas({ ...respuestas, [pregunta.campo]: valor });
                    setErrores({ ...errores, [pregunta.campo]: resultado.error || '' });
                  }
                }
              }}
              maxLength={pregunta.maxLength}
            />
            {errores[pregunta.campo] && (
              <p className="text-sm text-red-600 mt-1 font-medium">
                ⚠ {errores[pregunta.campo]}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Solo números (rango: {pregunta.min}-{pregunta.max})
            </p>
          </div>
        );

      case "email":
        return (
          <div>
            <input
              type="email"
              className={`w-full rounded-lg border-2 px-4 py-3 focus:outline-none transition-colors text-lg ${errores[pregunta.campo]
                ? 'border-red-500 focus:border-red-600'
                : 'border-gray-300 focus:border-blue-500'
                }`}
              placeholder={pregunta.placeholder}
              value={respuestas[pregunta.campo as keyof Respuestas] ?? ""}
              onChange={(e) => {
                const valor = e.target.value;
                const resultado = validateEmail(valor);

                if (resultado.isValid || valor === '') {
                  setRespuestas({ ...respuestas, [pregunta.campo]: resultado.value });
                  setErrores({ ...errores, [pregunta.campo]: '' });
                } else {
                  setRespuestas({ ...respuestas, [pregunta.campo]: resultado.value });
                  setErrores({ ...errores, [pregunta.campo]: resultado.error || '' });
                }
              }}
              maxLength={254}
            />
            {errores[pregunta.campo] && (
              <p className="text-sm text-red-600 mt-1 font-medium">
                ⚠ {errores[pregunta.campo]}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Formato: usuario@dominio.com
            </p>
          </div>
        );

      case "fecha":
        return (
          <div>
            <input
              type="date"
              className={`w-full rounded-lg border-2 px-4 py-3 focus:outline-none transition-colors text-lg ${errores[pregunta.campo]
                ? 'border-red-500 focus:border-red-600'
                : 'border-gray-300 focus:border-blue-500'
                }`}
              value={respuestas[pregunta.campo as keyof Respuestas] ?? ""}
              onChange={(e) => {
                const valor = e.target.value;
                const resultado = validateDate(valor);

                if (resultado.isValid) {
                  setRespuestas({ ...respuestas, [pregunta.campo]: resultado.value });
                  setErrores({ ...errores, [pregunta.campo]: '' });
                } else {
                  setRespuestas({ ...respuestas, [pregunta.campo]: valor });
                  setErrores({ ...errores, [pregunta.campo]: resultado.error || '' });
                }
              }}
              min="1900-01-01"
              max="2100-12-31"
            />
            {errores[pregunta.campo] && (
              <p className="text-sm text-red-600 mt-1 font-medium">
                ⚠ {errores[pregunta.campo]}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Selecciona una fecha del calendario
            </p>
          </div>
        );

      case "textarea":
        const caracteresActuales = (respuestas[pregunta.campo as keyof Respuestas] as string || '').length;
        const maxCaracteres = 2000;
        return (
          <div>
            <textarea
              className={`w-full rounded-lg border-2 px-4 py-3 focus:outline-none transition-colors text-lg min-h-[150px] resize-y ${errores[pregunta.campo]
                ? 'border-red-500 focus:border-red-600'
                : 'border-gray-300 focus:border-blue-500'
                }`}
              placeholder={pregunta.placeholder}
              value={respuestas[pregunta.campo as keyof Respuestas] ?? ""}
              onChange={(e) => {
                const valor = e.target.value;
                const resultado = validateAndSanitizeTextarea(valor, 0, maxCaracteres);

                if (resultado.isValid || valor === '') {
                  setRespuestas({ ...respuestas, [pregunta.campo]: resultado.value });
                  setErrores({ ...errores, [pregunta.campo]: '' });
                } else {
                  setRespuestas({ ...respuestas, [pregunta.campo]: resultado.value });
                  setErrores({ ...errores, [pregunta.campo]: resultado.error || '' });
                }
              }}
              rows={5}
              maxLength={maxCaracteres}
            />
            {errores[pregunta.campo] && (
              <p className="text-sm text-red-600 mt-1 font-medium">
                ⚠ {errores[pregunta.campo]}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {caracteresActuales}/{maxCaracteres} caracteres • Solo texto seguro permitido
            </p>
          </div>
        );

      case "opcion":
        return (
          <div>
            <div className="flex flex-col gap-3">
              {pregunta.opciones?.map(op => (
                <label
                  key={op}
                  className="flex gap-3 items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all"
                  style={{
                    borderColor: respuestas[pregunta.campo as keyof Respuestas] === op ? '#6d0968' : '#e5e7eb',
                    backgroundColor: respuestas[pregunta.campo as keyof Respuestas] === op ? '#eff6ff' : 'white',
                    transform: respuestas[pregunta.campo as keyof Respuestas] === op ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <input
                    type="radio"
                    name={pregunta.campo}
                    checked={respuestas[pregunta.campo as keyof Respuestas] === op}
                    onChange={() => {
                      // Validar que la opción sea permitida
                      const resultado = validateOption(op, pregunta.opciones as string[]);
                      if (resultado.isValid) {
                        setRespuestas({ ...respuestas, [pregunta.campo]: op });
                        setErrores({ ...errores, [pregunta.campo]: '' });
                      }
                    }}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="font-medium text-gray-800">{op}</span>
                </label>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Por favor selecciona una sola opción
            </p>
          </div>
        );

      case "multiple":
        const seleccionadas = (respuestas[pregunta.campo as keyof Respuestas] as string[] || []).length;
        return (
          <div>
            <div className="flex flex-col gap-3">
              {pregunta.opciones?.map(op => {
                const estaSeleccionada = (respuestas[pregunta.campo as keyof Respuestas] as string[] ?? []).includes(op);
                return (
                  <label
                    key={op}
                    className="flex gap-3 items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-all"
                    style={{
                      borderColor: estaSeleccionada ? '#6d0968' : '#e5e7eb',
                      backgroundColor: estaSeleccionada ? '#eff6ff' : 'white',
                      transform: estaSeleccionada ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={estaSeleccionada}
                      onChange={() => {
                        const actual = (respuestas[pregunta.campo as keyof Respuestas] as string[] ?? []);
                        const nuevasOpciones = actual.includes(op)
                          ? actual.filter((x: string) => x !== op)
                          : [...actual, op];

                        // Validar que todas las opciones sean permitidas
                        const resultado = validateMultipleOptions(
                          nuevasOpciones,
                          pregunta.opciones as string[]
                        );

                        if (resultado.isValid) {
                          setRespuestas({
                            ...respuestas,
                            [pregunta.campo]: resultado.value,
                          });
                          setErrores({ ...errores, [pregunta.campo]: '' });
                        }
                      }}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="font-medium text-gray-800">{op}</span>
                    {estaSeleccionada && (
                      <span className="ml-auto text-blue-600 font-bold">✓</span>
                    )}
                  </label>
                );
              })}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Puedes seleccionar múltiples opciones ({seleccionadas} seleccionada{seleccionadas !== 1 ? 's' : ''})
            </p>
          </div>
        );
      case "satisfaccion":
        const valor = typeof respuestas[pregunta.campo as keyof Respuestas] === "number" ? respuestas[pregunta.campo as keyof Respuestas] as number : 5;
        const emojis = ['😢', '😟', '😐', '😊', '😁', '🤩'];
        const emojiIndex = Math.max(0, Math.min(4, valor - 1));

        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">{emojis[emojiIndex]}</div>
              <div className="text-4xl font-bold text-blue-600">{valor}/5</div>
            </div>

            <input
              type="range"
              min={1}
              max={5}
              value={valor}
              onChange={(e) =>
                setRespuestas({ ...respuestas, [pregunta.campo]: Number(e.target.value) })
              }
              className="w-full h-3 bg-gradient-to-r from-red-300 via-yellow-300 to-green-400 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  #fca5a5 0%, 
                  #fde047 50%, 
                  #86efac 100%)`
              }}
            />

            <div className="flex justify-between text-sm font-medium text-gray-600 px-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>

            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>😢 Muy insatisfecho</span>
              <span>🤩 Muy satisfecho</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* lo que se visualiza en la pantalla de finalizacion */
  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <main className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">¡Encuesta Enviada!</h1>
          <p className="text-gray-600 mb-2">
            Gracias por completar la encuesta.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Tus respuestas han sido registradas correctanmente.
          </p>
          <button
            onClick={reiniciar}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Llenar otra encuesta
          </button>
        </main>
      </div>
    );
  }

  /* pantalla del resumen */
  if (mostrarResumen) {
    const etiquetasPregunta: Record<string, string> = {};
    preguntas.forEach(p => {
      etiquetasPregunta[p.campo] = p.texto;
    });

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <main className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl w-full">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Resumen de Respuestas</h1>
            <p className="text-gray-600">Revisa tus respuestas antes de enviar la encuesta</p>
          </div>

          <div className="space-y-4 mb-8 max-h-[500px] overflow-y-auto pr-2">
            {Object.entries(respuestas).map(([campo, valor], index) => (
              <div key={campo} className="p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">
                      {etiquetasPregunta[campo] || campo}
                    </p>
                    <p className="font-semibold text-gray-800 text-lg">
                      {Array.isArray(valor)
                        ? (valor.length > 0 ? valor.join(", ") : "No seleccionado")
                        : (valor || "Sin respuesta")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setMostrarResumen(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>←</span> Volver a editar
            </button>
            <button
              onClick={enviarEncuesta}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Enviar Encuesta <span>✓</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* pantalla principal pregunta por pregunta  */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4" >
      <main className="bg-white p-8 rounded-2xl shadow-2xl max-w-3xl w-full">

        {/* Barra de progreso */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2 font-medium">
            <span> Pregunta {indice + 1} de {preguntas.length}</span>
            <span className="text-blue-600 font-bold">{Math.round(progreso)}% completado</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${progreso}%` }}
            >
              {progreso > 10 && (
                <span className="text-white text-xs font-bold">
                  {Math.round(progreso)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/*Indicador de tipo de preguntas */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
            {pregunta.tipo === "texto" && "Texto corto"}
            {pregunta.tipo === "textarea" && "Pregunta abierta"}
            {pregunta.tipo === "numero" && "Número"}
            {pregunta.tipo === "fecha" && "Fecha"}
            {pregunta.tipo === "email" && "Correo electrónico"}
            {pregunta.tipo === "opcion" && "Selección única"}
            {pregunta.tipo === "multiple" && "Selección múltiple"}
            {pregunta.tipo === "satisfaccion" && "Escala de satisfacción"}
          </span>
        </div>

        {/* Pregunta */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-3 text-gray-800 leading-tight">
            {pregunta.texto}
            {pregunta.obligatoria && <span className="text-red-500 ml-2">*</span>}
          </h2>
          {pregunta.obligatoria ? (
            <p className="text-sm text-red-600 font-medium">Esta pregunta es obligatoria</p>
          ) : (
            <p className="text-sm text-gray-500">Esta pregunta es opcional</p>
          )}
        </div>

        {/* Respuesta */}
        <div className="mb-10">
          {renderPregunta()}
        </div>

        {/* Botones de navegación */}
        <div className="flex gap-4">
          <button
            onClick={anterior}
            disabled={indice === 0}
            className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all shadow-md
              ${indice === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-300 hover:bg-gray-400 text-gray-800 hover:shadow-lg"}`}
          >
            ← Anterior
          </button>

          <button
            onClick={siguiente}
            disabled={!estaRespondida()}
            className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all shadow-md
              ${estaRespondida()
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
          >
            {indice === preguntas.length - 1 ? "Ver Resumen →" : "Siguiente →"}
          </button>
        </div>
      </main>
    </div>
  );
}