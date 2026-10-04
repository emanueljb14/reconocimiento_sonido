import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock3,
  Database,
  Play,
  Radio,
  RefreshCcw,
  SlidersHorizontal,
  Speaker,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  obtenerDetecciones,
} from "../../services/detecciones";


const NOMBRES_SONIDOS = {
  golpe: "Golpe",
  puerta: "Puerta",
  alarma: "Alarma",
  aplausos: "Aplausos",
  vidrio: "Vidrio",
  ruido_elevado: "Ruido elevado",
  desconocido: "Desconocido",
};


const STORAGE = {
  habilitado:
    "soundguard_voice_enabled",
  automatico:
    "soundguard_voice_auto",
  volumen:
    "soundguard_voice_volume",
  velocidad:
    "soundguard_voice_rate",
  tono:
    "soundguard_voice_pitch",
  voz:
    "soundguard_voice_name",
};


function leerStorage(
  clave,
  fallback
) {
  try {
    const valor =
      localStorage.getItem(
        clave
      );

    if (valor === null) {
      return fallback;
    }

    return JSON.parse(
      valor
    );
  } catch {
    return fallback;
  }
}


function guardarStorage(
  clave,
  valor
) {
  try {
    localStorage.setItem(
      clave,
      JSON.stringify(
        valor
      )
    );
  } catch {
    // Las preferencias siguen funcionando
    // aunque el navegador bloquee localStorage.
  }
}


function obtenerLista(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.datos)) {
    return data.datos;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
}


function numero(valor) {
  const n = Number(valor);

  return Number.isFinite(n)
    ? n
    : 0;
}


function porcentaje(valor) {
  const n = numero(valor);

  const final =
    n <= 1
      ? n * 100
      : n;

  return Math.max(
    0,
    Math.min(
      100,
      final
    )
  );
}


function porcentajeTexto(valor) {
  return `${porcentaje(
    valor
  ).toFixed(1)}%`;
}


function nombreSonido(tipo) {
  return (
    NOMBRES_SONIDOS[tipo] ||
    String(tipo || "")
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (letra) =>
          letra.toUpperCase()
      ) ||
    "Sin identificar"
  );
}


function formatearFecha(fecha) {
  if (!fecha) {
    return "Sin fecha";
  }

  const d =
    new Date(fecha);

  if (
    Number.isNaN(
      d.getTime()
    )
  ) {
    return String(fecha);
  }

  return d.toLocaleString(
    "es-PE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }
  );
}


function ordenarDetecciones(
  detecciones
) {
  return [
    ...detecciones,
  ].sort(
    (a, b) => {
      const fechaA =
        new Date(
          a?.fecha || 0
        ).getTime();

      const fechaB =
        new Date(
          b?.fecha || 0
        ).getTime();

      return (
        fechaB -
        fechaA
      );
    }
  );
}


function estiloRiesgo(
  riesgo
) {
  const r =
    String(
      riesgo || ""
    ).toUpperCase();

  if (
    r === "CRITICO" ||
    r === "CRÍTICO"
  ) {
    return {
      texto:
        "text-fuchsia-300",
      fondo:
        "bg-fuchsia-500/10",
      borde:
        "border-fuchsia-500/25",
      punto:
        "bg-fuchsia-400",
    };
  }

  if (r === "ALTO") {
    return {
      texto:
        "text-rose-300",
      fondo:
        "bg-rose-500/10",
      borde:
        "border-rose-500/25",
      punto:
        "bg-rose-400",
    };
  }

  if (r === "MEDIO") {
    return {
      texto:
        "text-amber-300",
      fondo:
        "bg-amber-500/10",
      borde:
        "border-amber-500/25",
      punto:
        "bg-amber-400",
    };
  }

  return {
    texto:
      "text-emerald-300",
    fondo:
      "bg-emerald-500/10",
    borde:
      "border-emerald-500/25",
    punto:
      "bg-emerald-400",
  };
}


function textoEvento(evento) {
  if (!evento) {
    return (
      "No hay detecciones recientes " +
      "para anunciar."
    );
  }

  const sonido =
    nombreSonido(
      evento.tipo_sonido
    );

  const confianza =
    Math.round(
      porcentaje(
        evento.confianza
      )
    );

  const riesgo =
    String(
      evento.nivel_riesgo ||
      "bajo"
    ).toLowerCase();

  if (
    evento.tipo_sonido ===
    "desconocido"
  ) {
    return (
      "Se registró un sonido no " +
      "identificado. " +
      `Confianza ${confianza} por ciento. ` +
      `Nivel de riesgo ${riesgo}.`
    );
  }

  return (
    `Se ha detectado ${sonido}. ` +
    `Nivel de riesgo ${riesgo}. ` +
    `Confianza ${confianza} por ciento.`
  );
}


function Toggle({
  activo,
  onClick,
  label,
  detail,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
                flex
                w-full
                items-center
                justify-between
                gap-4
                rounded-2xl
                border
                border-white/[0.06]
                bg-white/[0.02]
                p-4
                text-left
                transition
                hover:border-white/[0.12]
            "
    >
      <div>
        <strong
          className="
                        block
                        text-[10px]
                        font-semibold
                        text-slate-200
                    "
        >
          {label}
        </strong>

        <span
          className="
                        mt-1
                        block
                        text-[9px]
                        leading-5
                        text-slate-600
                    "
        >
          {detail}
        </span>
      </div>

      <span
        className={`
                    relative
                    h-6
                    w-11
                    shrink-0
                    rounded-full
                    border
                    transition
                    ${activo
            ? "border-lime-400/25 bg-lime-400/15"
            : "border-white/[0.08] bg-white/[0.04]"
          }
                `}
      >
        <span
          className={`
                        absolute
                        top-0.5
                        h-4.5
                        w-4.5
                        rounded-full
                        bg-white
                        transition-all
                        ${activo
              ? "left-[22px]"
              : "left-0.5"
            }
                    `}
          style={{
            width:
              "18px",
            height:
              "18px",
          }}
        />
      </span>
    </button>
  );
}


function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "",
}) {
  return (
    <div
      className="
                rounded-2xl
                border
                border-white/[0.06]
                bg-white/[0.02]
                p-4
            "
    >
      <div
        className="
                    flex
                    items-center
                    justify-between
                    gap-3
                "
      >
        <span
          className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.13em]
                        text-slate-500
                    "
        >
          {label}
        </span>

        <strong
          className="
                        text-[10px]
                        text-slate-200
                    "
        >
          {value}
          {suffix}
        </strong>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(
          event
        ) =>
          onChange(
            Number(
              event
                .target
                .value
            )
          )
        }
        className="
                    mt-4
                    w-full
                    accent-violet-500
                "
      />

      <div
        className="
                    mt-2
                    flex
                    justify-between
                    text-[8px]
                    text-slate-700
                "
      >
        <span>
          {min}
        </span>

        <span>
          {max}
        </span>
      </div>
    </div>
  );
}


export default function VoiceAssistant() {
  const [
    detecciones,
    setDetecciones,
  ] = useState([]);

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [
    actualizando,
    setActualizando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    habilitado,
    setHabilitado,
  ] = useState(
    () =>
      leerStorage(
        STORAGE.habilitado,
        true
      )
  );

  const [
    automatico,
    setAutomatico,
  ] = useState(
    () =>
      leerStorage(
        STORAGE.automatico,
        false
      )
  );

  const [
    volumen,
    setVolumen,
  ] = useState(
    () =>
      leerStorage(
        STORAGE.volumen,
        80
      )
  );

  const [
    velocidad,
    setVelocidad,
  ] = useState(
    () =>
      leerStorage(
        STORAGE.velocidad,
        0.95
      )
  );

  const [
    tono,
    setTono,
  ] = useState(
    () =>
      leerStorage(
        STORAGE.tono,
        1
      )
  );

  const [
    nombreVoz,
    setNombreVoz,
  ] = useState(
    () =>
      leerStorage(
        STORAGE.voz,
        ""
      )
  );

  const [
    voces,
    setVoces,
  ] = useState([]);

  const [
    hablando,
    setHablando,
  ] = useState(false);

  const [
    ultimoTexto,
    setUltimoTexto,
  ] = useState("");

  const [
    ultimoAnunciadoId,
    setUltimoAnunciadoId,
  ] = useState(null);

  const inicializadoRef =
    useRef(false);

  const ultimoIdRef =
    useRef(null);


  useEffect(() => {
    guardarStorage(
      STORAGE.habilitado,
      habilitado
    );
  }, [habilitado]);


  useEffect(() => {
    guardarStorage(
      STORAGE.automatico,
      automatico
    );
  }, [automatico]);


  useEffect(() => {
    guardarStorage(
      STORAGE.volumen,
      volumen
    );
  }, [volumen]);


  useEffect(() => {
    guardarStorage(
      STORAGE.velocidad,
      velocidad
    );
  }, [velocidad]);


  useEffect(() => {
    guardarStorage(
      STORAGE.tono,
      tono
    );
  }, [tono]);


  useEffect(() => {
    guardarStorage(
      STORAGE.voz,
      nombreVoz
    );
  }, [nombreVoz]);


  useEffect(() => {
    if (
      !(
        "speechSynthesis" in
        window
      )
    ) {
      return;
    }

    function cargarVoces() {
      const lista =
        window
          .speechSynthesis
          .getVoices();

      setVoces(
        lista
      );

      if (
        !nombreVoz &&
        lista.length >
        0
      ) {
        const preferida =
          lista.find(
            (voz) =>
              voz.lang
                ?.toLowerCase()
                .startsWith(
                  "es-pe"
                )
          ) ||
          lista.find(
            (voz) =>
              voz.lang
                ?.toLowerCase()
                .startsWith(
                  "es"
                )
          );

        if (preferida) {
          setNombreVoz(
            preferida.name
          );
        }
      }
    }

    cargarVoces();

    window
      .speechSynthesis
      .addEventListener(
        "voiceschanged",
        cargarVoces
      );

    return () => {
      window
        .speechSynthesis
        .removeEventListener(
          "voiceschanged",
          cargarVoces
        );
    };
  }, [nombreVoz]);


  const hablarTexto =
    useCallback(
      (
        texto,
        eventoId = null
      ) => {
        if (
          !habilitado ||
          !texto ||
          !(
            "speechSynthesis" in
            window
          )
        ) {
          return;
        }

        window
          .speechSynthesis
          .cancel();

        const mensaje =
          new SpeechSynthesisUtterance(
            texto
          );

        mensaje.lang =
          "es-PE";

        mensaje.rate =
          Number(
            velocidad
          );

        mensaje.pitch =
          Number(
            tono
          );

        mensaje.volume =
          Math.max(
            0,
            Math.min(
              1,
              Number(
                volumen
              ) /
              100
            )
          );

        const voz =
          voces.find(
            (item) =>
              item.name ===
              nombreVoz
          );

        if (voz) {
          mensaje.voice =
            voz;

          mensaje.lang =
            voz.lang ||
            "es-PE";
        }

        mensaje.onstart =
          () => {
            setHablando(
              true
            );
          };

        mensaje.onend =
          () => {
            setHablando(
              false
            );
          };

        mensaje.onerror =
          () => {
            setHablando(
              false
            );
          };

        setUltimoTexto(
          texto
        );

        if (
          eventoId !==
          null
        ) {
          setUltimoAnunciadoId(
            eventoId
          );
        }

        window
          .speechSynthesis
          .speak(
            mensaje
          );
      },
      [
        habilitado,
        velocidad,
        tono,
        volumen,
        voces,
        nombreVoz,
      ]
    );


  const detenerVoz =
    useCallback(
      () => {
        if (
          "speechSynthesis" in
          window
        ) {
          window
            .speechSynthesis
            .cancel();
        }

        setHablando(
          false
        );
      },
      []
    );


  const cargar =
    useCallback(
      async (
        silencioso = false
      ) => {
        try {
          setError("");

          if (silencioso) {
            setActualizando(
              true
            );
          } else {
            setCargando(
              true
            );
          }

          const data =
            await obtenerDetecciones();

          const lista =
            ordenarDetecciones(
              obtenerLista(
                data
              )
            );

          setDetecciones(
            lista
          );

          const ultima =
            lista[0] ||
            null;

          if (!ultima) {
            return;
          }

          const idActual =
            ultima.id ??
            ultima.fecha;

          if (
            !inicializadoRef.current
          ) {
            inicializadoRef.current =
              true;

            ultimoIdRef.current =
              idActual;

            return;
          }

          const esNueva =
            idActual !==
            ultimoIdRef.current;

          ultimoIdRef.current =
            idActual;

          if (
            esNueva &&
            automatico &&
            habilitado
          ) {
            hablarTexto(
              textoEvento(
                ultima
              ),
              ultima.id ??
              null
            );
          }
        } catch (err) {
          console.error(
            err
          );

          if (
            err?.response
          ) {
            setError(
              `Django respondió con error ${err.response.status}.`
            );
          } else {
            setError(
              "No se pudo conectar con el backend de detecciones."
            );
          }
        } finally {
          setCargando(
            false
          );

          setActualizando(
            false
          );
        }
      },
      [
        automatico,
        habilitado,
        hablarTexto,
      ]
    );


  useEffect(() => {
    cargar();

    const interval =
      window.setInterval(
        () => {
          cargar(
            true
          );
        },
        10000
      );

    return () => {
      window.clearInterval(
        interval
      );

      detenerVoz();
    };
  }, [
    cargar,
    detenerVoz,
  ]);


  const historial =
    useMemo(
      () =>
        ordenarDetecciones(
          detecciones
        ),
      [detecciones]
    );


  const ultimoEvento =
    historial[0] ||
    null;


  const soporteVoz =
    typeof window !==
    "undefined" &&
    "speechSynthesis" in
    window &&
    "SpeechSynthesisUtterance" in
    window;


  const vocesEspanol =
    useMemo(
      () =>
        voces.filter(
          (voz) =>
            voz.lang
              ?.toLowerCase()
              .startsWith(
                "es"
              )
        ),
      [voces]
    );


  function anunciarEvento(
    evento
  ) {
    hablarTexto(
      textoEvento(
        evento
      ),
      evento?.id ??
      null
    );
  }


  function probarVoz() {
    hablarTexto(
      "Prueba del asistente de voz de SoundGuard. El canal de salida de audio está funcionando correctamente."
    );
  }


  const estiloUltimo =
    estiloRiesgo(
      ultimoEvento
        ?.nivel_riesgo
    );


  return (
    <DashboardLayout
      title="Asistente de voz"
      subtitle="Alertas habladas basadas en detecciones reales registradas por SoundGuard"
    >
      <div
        className="
                    mx-auto
                    max-w-[1500px]
                    space-y-5
                "
      >
        {error && (
          <div
            className="
                            flex
                            items-start
                            gap-3
                            rounded-2xl
                            border
                            border-rose-500/20
                            bg-rose-500/[0.07]
                            p-4
                        "
          >
            <AlertTriangle
              size={18}
              className="
                                mt-0.5
                                shrink-0
                                text-rose-300
                            "
            />

            <div>
              <strong
                className="
                                    text-xs
                                    text-rose-200
                                "
              >
                No se pudo cargar
                el historial real
              </strong>

              <p
                className="
                                    mt-1
                                    text-[10px]
                                    text-rose-300/70
                                "
              >
                {error}
              </p>
            </div>
          </div>
        )}


        <section
          className="
                        flex
                        flex-col
                        gap-4
                        rounded-[24px]
                        border
                        border-white/[0.07]
                        bg-[#090e1b]
                        px-5
                        py-4
                        shadow-[0_20px_70px_rgba(0,0,0,.20)]
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                    "
        >
          <div
            className="
                            flex
                            items-start
                            gap-3
                        "
          >
            <div
              className={`
                                grid
                                h-11
                                w-11
                                shrink-0
                                place-items-center
                                rounded-2xl
                                border
                                ${soporteVoz
                  ? "border-lime-400/20 bg-lime-400/[0.07] text-lime-300"
                  : "border-rose-400/20 bg-rose-400/[0.07] text-rose-300"
                }
                            `}
            >
              {habilitado
                ? (
                  <Volume2
                    size={
                      20
                    }
                  />
                )
                : (
                  <VolumeX
                    size={
                      20
                    }
                  />
                )}
            </div>

            <div>
              <div
                className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                "
              >
                <h2
                  className="
                                        text-lg
                                        font-semibold
                                        text-white
                                    "
                >
                  Canal de alertas
                  habladas
                </h2>

                <span
                  className={`
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        border
                                        px-2.5
                                        py-1
                                        text-[8px]
                                        font-semibold
                                        uppercase
                                        ${soporteVoz
                      ? "border-lime-400/20 bg-lime-400/[0.05] text-lime-300"
                      : "border-rose-400/20 bg-rose-400/[0.05] text-rose-300"
                    }
                                    `}
                >
                  <span
                    className={`
                                            h-1.5
                                            w-1.5
                                            rounded-full
                                            ${soporteVoz
                        ? "bg-lime-300"
                        : "bg-rose-300"
                      }
                                        `}
                  />

                  {soporteVoz
                    ? "Speech API disponible"
                    : "Speech API no disponible"}
                </span>
              </div>

              <p
                className="
                                    mt-1
                                    max-w-3xl
                                    text-[10px]
                                    leading-5
                                    text-slate-500
                                "
              >
                Las alertas se construyen
                con registros obtenidos
                desde
                /api/detecciones/.
                Las preferencias de voz
                se guardan únicamente en
                este navegador.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              cargar(
                true
              )
            }
            disabled={
              actualizando
            }
            className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-white/[0.07]
                            bg-white/[0.025]
                            px-4
                            py-2.5
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-slate-400
                            transition
                            hover:border-violet-400/30
                            hover:text-white
                            disabled:opacity-40
                        "
          >
            <RefreshCcw
              size={13}
              className={
                actualizando
                  ? "animate-spin"
                  : ""
              }
            />

            Actualizar
          </button>
        </section>


        <section
          className="
                        grid
                        gap-4
                        xl:grid-cols-[1.05fr_0.95fr]
                    "
        >
          <article
            className="
                            overflow-hidden
                            rounded-[24px]
                            border
                            border-white/[0.07]
                            bg-[#090e1b]
                            shadow-[0_20px_70px_rgba(0,0,0,.20)]
                        "
          >
            <div
              className="
                                flex
                                items-center
                                justify-between
                                gap-4
                                border-b
                                border-white/[0.06]
                                px-5
                                py-4
                            "
            >
              <div>
                <span
                  className="
                                        text-[9px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.18em]
                                        text-violet-300
                                    "
                >
                  Fuente real
                </span>

                <h3
                  className="
                                        mt-1
                                        text-sm
                                        font-semibold
                                        text-white
                                    "
                >
                  Última detección
                </h3>
              </div>

              <Radio
                size={18}
                className="
                                    text-slate-600
                                "
              />
            </div>


            <div className="p-5">
              {cargando ? (
                <div
                  className="
                                        grid
                                        min-h-[290px]
                                        place-items-center
                                        text-[10px]
                                        text-slate-600
                                    "
                >
                  Cargando último
                  evento desde
                  Django...
                </div>
              ) : ultimoEvento ? (
                <>
                  <div
                    className="
                                            rounded-2xl
                                            border
                                            border-white/[0.06]
                                            bg-white/[0.025]
                                            p-5
                                        "
                  >
                    <div
                      className="
                                                flex
                                                flex-wrap
                                                items-start
                                                justify-between
                                                gap-4
                                            "
                    >
                      <div>
                        <span
                          className="
                                                        text-[9px]
                                                        uppercase
                                                        tracking-[0.16em]
                                                        text-slate-600
                                                    "
                        >
                          Sonido registrado
                        </span>

                        <strong
                          className="
                                                        mt-2
                                                        block
                                                        text-3xl
                                                        font-semibold
                                                        tracking-tight
                                                        text-white
                                                    "
                        >
                          {nombreSonido(
                            ultimoEvento
                              .tipo_sonido
                          )}
                        </strong>
                      </div>

                      <span
                        className={`
                                                    inline-flex
                                                    items-center
                                                    gap-2
                                                    rounded-full
                                                    border
                                                    px-3
                                                    py-1.5
                                                    text-[9px]
                                                    font-semibold
                                                    uppercase
                                                    ${estiloUltimo.texto}
                                                    ${estiloUltimo.fondo}
                                                    ${estiloUltimo.borde}
                                                `}
                      >
                        <span
                          className={`
                                                        h-1.5
                                                        w-1.5
                                                        rounded-full
                                                        ${estiloUltimo.punto}
                                                    `}
                        />

                        {ultimoEvento
                          .nivel_riesgo ||
                          "bajo"}
                      </span>
                    </div>

                    <div
                      className="
                                                mt-5
                                                grid
                                                gap-3
                                                sm:grid-cols-3
                                            "
                    >
                      <Dato
                        label="Confianza"
                        value={porcentajeTexto(
                          ultimoEvento
                            .confianza
                        )}
                      />

                      <Dato
                        label="Duración"
                        value={`${numero(
                          ultimoEvento
                            .duracion_segundos
                        ).toFixed(
                          1
                        )} s`}
                      />

                      <Dato
                        label="Origen"
                        value={
                          ultimoEvento
                            .origen ||
                          "—"
                        }
                      />
                    </div>

                    <div
                      className="
                                                mt-4
                                                flex
                                                items-center
                                                gap-2
                                                text-[9px]
                                                text-slate-600
                                            "
                    >
                      <Clock3
                        size={12}
                      />

                      {formatearFecha(
                        ultimoEvento
                          .fecha
                      )}
                    </div>
                  </div>


                  <div
                    className="
                                            mt-4
                                            rounded-2xl
                                            border
                                            border-violet-400/10
                                            bg-violet-500/[0.035]
                                            p-4
                                        "
                  >
                    <span
                      className="
                                                text-[8px]
                                                font-semibold
                                                uppercase
                                                tracking-[0.15em]
                                                text-violet-300/70
                                            "
                    >
                      Texto de alerta
                    </span>

                    <p
                      className="
                                                mt-2
                                                text-xs
                                                leading-6
                                                text-slate-300
                                            "
                    >
                      “
                      {textoEvento(
                        ultimoEvento
                      )}
                      ”
                    </p>
                  </div>


                  <div
                    className="
                                            mt-4
                                            flex
                                            flex-wrap
                                            gap-2
                                        "
                  >
                    <button
                      type="button"
                      onClick={() =>
                        anunciarEvento(
                          ultimoEvento
                        )
                      }
                      disabled={
                        !habilitado ||
                        !soporteVoz
                      }
                      className="
                                                inline-flex
                                                items-center
                                                gap-2
                                                rounded-xl
                                                border
                                                border-violet-400/20
                                                bg-violet-500/10
                                                px-4
                                                py-2.5
                                                text-[9px]
                                                font-semibold
                                                uppercase
                                                tracking-wider
                                                text-violet-200
                                                transition
                                                hover:border-violet-300/35
                                                hover:bg-violet-500/15
                                                disabled:cursor-not-allowed
                                                disabled:opacity-35
                                            "
                    >
                      <Play
                        size={
                          13
                        }
                      />

                      Anunciar detección
                    </button>

                    <button
                      type="button"
                      onClick={
                        detenerVoz
                      }
                      disabled={
                        !hablando
                      }
                      className="
                                                inline-flex
                                                items-center
                                                gap-2
                                                rounded-xl
                                                border
                                                border-white/[0.07]
                                                bg-white/[0.025]
                                                px-4
                                                py-2.5
                                                text-[9px]
                                                font-semibold
                                                uppercase
                                                tracking-wider
                                                text-slate-400
                                                transition
                                                hover:text-white
                                                disabled:opacity-30
                                            "
                    >
                      <Square
                        size={
                          12
                        }
                      />

                      Detener
                    </button>
                  </div>
                </>
              ) : (
                <div
                  className="
                                        grid
                                        min-h-[290px]
                                        place-items-center
                                        text-center
                                    "
                >
                  <div>
                    <Database
                      size={27}
                      className="
                                                mx-auto
                                                text-slate-700
                                            "
                    />

                    <strong
                      className="
                                                mt-3
                                                block
                                                text-xs
                                                text-slate-400
                                            "
                    >
                      No hay detecciones
                      registradas
                    </strong>

                    <p
                      className="
                                                mt-1
                                                text-[9px]
                                                text-slate-600
                                            "
                    >
                      Realiza una
                      detección desde
                      el dashboard.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </article>


          <article
            className="
                            overflow-hidden
                            rounded-[24px]
                            border
                            border-white/[0.07]
                            bg-[#090e1b]
                            shadow-[0_20px_70px_rgba(0,0,0,.20)]
                        "
          >
            <div
              className="
                                flex
                                items-center
                                justify-between
                                gap-4
                                border-b
                                border-white/[0.06]
                                px-5
                                py-4
                            "
            >
              <div>
                <span
                  className="
                                        text-[9px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.18em]
                                        text-violet-300
                                    "
                >
                  Preferencias locales
                </span>

                <h3
                  className="
                                        mt-1
                                        text-sm
                                        font-semibold
                                        text-white
                                    "
                >
                  Configuración de voz
                </h3>
              </div>

              <SlidersHorizontal
                size={18}
                className="
                                    text-slate-600
                                "
              />
            </div>


            <div
              className="
                                space-y-3
                                p-5
                            "
            >
              <Toggle
                activo={
                  habilitado
                }
                onClick={() => {
                  const nuevo =
                    !habilitado;

                  setHabilitado(
                    nuevo
                  );

                  if (
                    !nuevo
                  ) {
                    detenerVoz();
                  }
                }}
                label="Asistente habilitado"
                detail="Permite reproducir alertas habladas desde este navegador."
              />

              <Toggle
                activo={
                  automatico
                }
                onClick={() =>
                  setAutomatico(
                    (
                      actual
                    ) =>
                      !actual
                  )
                }
                label="Anunciar nuevas detecciones"
                detail="Cuando aparece un nuevo registro en Django, SoundGuard puede leerlo automáticamente."
              />


              <div
                className="
                                    rounded-2xl
                                    border
                                    border-white/[0.06]
                                    bg-white/[0.02]
                                    p-4
                                "
              >
                <label
                  className="
                                        text-[9px]
                                        font-semibold
                                        uppercase
                                        tracking-[0.13em]
                                        text-slate-500
                                    "
                >
                  Voz del sistema
                </label>

                <select
                  value={
                    nombreVoz
                  }
                  onChange={(
                    event
                  ) =>
                    setNombreVoz(
                      event
                        .target
                        .value
                    )
                  }
                  className="
                                        mt-3
                                        w-full
                                        rounded-xl
                                        border
                                        border-white/[0.07]
                                        bg-[#070b15]
                                        px-3
                                        py-2.5
                                        text-[10px]
                                        text-slate-300
                                        outline-none
                                        focus:border-violet-400/30
                                    "
                >
                  <option value="">
                    Voz predeterminada
                    del navegador
                  </option>

                  {vocesEspanol.map(
                    (voz) => (
                      <option
                        key={`${voz.name}-${voz.lang}`}
                        value={
                          voz.name
                        }
                      >
                        {
                          voz.name
                        }
                        {" · "}
                        {
                          voz.lang
                        }
                      </option>
                    )
                  )}
                </select>

                <p
                  className="
                                        mt-2
                                        text-[8px]
                                        leading-4
                                        text-slate-700
                                    "
                >
                  Se muestran las voces
                  en español que el
                  navegador expone en
                  este dispositivo.
                </p>
              </div>


              <RangeControl
                label="Volumen"
                value={
                  volumen
                }
                min={0}
                max={100}
                step={1}
                suffix="%"
                onChange={
                  setVolumen
                }
              />

              <RangeControl
                label="Velocidad"
                value={
                  velocidad
                }
                min={0.6}
                max={1.4}
                step={0.05}
                onChange={
                  setVelocidad
                }
              />

              <RangeControl
                label="Tono"
                value={
                  tono
                }
                min={0.6}
                max={1.4}
                step={0.05}
                onChange={
                  setTono
                }
              />


              <button
                type="button"
                onClick={
                  probarVoz
                }
                disabled={
                  !habilitado ||
                  !soporteVoz
                }
                className="
                                    inline-flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-lime-400/15
                                    bg-lime-400/[0.05]
                                    px-4
                                    py-3
                                    text-[9px]
                                    font-semibold
                                    uppercase
                                    tracking-wider
                                    text-lime-300
                                    transition
                                    hover:border-lime-300/30
                                    hover:bg-lime-400/[0.08]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-35
                                "
              >
                <Speaker
                  size={
                    14
                  }
                />

                Probar voz
              </button>
            </div>
          </article>
        </section>


        <section
          className="
                        overflow-hidden
                        rounded-[24px]
                        border
                        border-white/[0.07]
                        bg-[#090e1b]
                    "
        >
          <div
            className="
                            flex
                            flex-col
                            gap-3
                            border-b
                            border-white/[0.06]
                            px-5
                            py-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
          >
            <div>
              <span
                className="
                                    text-[9px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.18em]
                                    text-violet-300
                                "
              >
                Registro reciente
              </span>

              <h3
                className="
                                    mt-1
                                    text-sm
                                    font-semibold
                                    text-white
                                "
              >
                Alertas disponibles
              </h3>
            </div>

            <div
              className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                                text-[8px]
                                uppercase
                                tracking-wider
                                text-slate-600
                            "
            >
              {hablando && (
                <span
                  className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        border
                                        border-lime-400/15
                                        bg-lime-400/[0.05]
                                        px-2.5
                                        py-1
                                        text-lime-300
                                    "
                >
                  <Activity
                    size={
                      10
                    }
                    className="
                                            animate-pulse
                                        "
                  />

                  Reproduciendo
                </span>
              )}

              {ultimoAnunciadoId !==
                null && (
                  <span>
                    Último anunciado:
                    {" #"}
                    {
                      ultimoAnunciadoId
                    }
                  </span>
                )}
            </div>
          </div>


          <div className="p-5">
            {historial.length >
              0 ? (
              <div
                className="
                                    space-y-2
                                "
              >
                {historial
                  .slice(
                    0,
                    8
                  )
                  .map(
                    (
                      evento
                    ) => {
                      const estilo =
                        estiloRiesgo(
                          evento
                            .nivel_riesgo
                        );

                      return (
                        <div
                          key={
                            evento.id
                          }
                          className="
                                                        flex
                                                        flex-col
                                                        gap-3
                                                        rounded-2xl
                                                        border
                                                        border-white/[0.055]
                                                        bg-white/[0.018]
                                                        p-4
                                                        md:flex-row
                                                        md:items-center
                                                        md:justify-between
                                                    "
                        >
                          <div
                            className="
                                                            min-w-0
                                                            flex-1
                                                        "
                          >
                            <div
                              className="
                                                                flex
                                                                flex-wrap
                                                                items-center
                                                                gap-2
                                                            "
                            >
                              <strong
                                className="
                                                                    text-[11px]
                                                                    text-slate-200
                                                                "
                              >
                                {nombreSonido(
                                  evento
                                    .tipo_sonido
                                )}
                              </strong>

                              <span
                                className={`
                                                                    inline-flex
                                                                    items-center
                                                                    gap-1.5
                                                                    rounded-full
                                                                    border
                                                                    px-2
                                                                    py-0.5
                                                                    text-[7px]
                                                                    font-semibold
                                                                    uppercase
                                                                    ${estilo.texto}
                                                                    ${estilo.fondo}
                                                                    ${estilo.borde}
                                                                `}
                              >
                                <span
                                  className={`
                                                                        h-1
                                                                        w-1
                                                                        rounded-full
                                                                        ${estilo.punto}
                                                                    `}
                                />

                                {evento
                                  .nivel_riesgo ||
                                  "bajo"}
                              </span>

                              <span
                                className="
                                                                    text-[8px]
                                                                    text-slate-600
                                                                "
                              >
                                {porcentajeTexto(
                                  evento
                                    .confianza
                                )}
                              </span>
                            </div>

                            <p
                              className="
                                                                mt-1
                                                                truncate
                                                                text-[9px]
                                                                text-slate-600
                                                            "
                            >
                              {formatearFecha(
                                evento
                                  .fecha
                              )}
                              {" · "}
                              {evento.origen ||
                                "origen no indicado"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              anunciarEvento(
                                evento
                              )
                            }
                            disabled={
                              !habilitado ||
                              !soporteVoz
                            }
                            className="
                                                            inline-flex
                                                            items-center
                                                            justify-center
                                                            gap-2
                                                            rounded-xl
                                                            border
                                                            border-violet-400/10
                                                            bg-violet-400/[0.04]
                                                            px-3
                                                            py-2
                                                            text-[8px]
                                                            font-semibold
                                                            uppercase
                                                            tracking-wider
                                                            text-violet-300
                                                            transition
                                                            hover:border-violet-300/30
                                                            disabled:opacity-30
                                                        "
                          >
                            <BellRing
                              size={
                                12
                              }
                            />

                            Reproducir
                          </button>
                        </div>
                      );
                    }
                  )}
              </div>
            ) : (
              <div
                className="
                                    py-12
                                    text-center
                                "
              >
                <Database
                  size={27}
                  className="
                                        mx-auto
                                        text-slate-700
                                    "
                />

                <p
                  className="
                                        mt-3
                                        text-[10px]
                                        text-slate-600
                                    "
                >
                  Aún no hay eventos
                  disponibles para
                  reproducir.
                </p>
              </div>
            )}
          </div>
        </section>


        <section
          className="
                        rounded-[24px]
                        border
                        border-white/[0.07]
                        bg-[#090e1b]
                        p-5
                    "
        >
          <div
            className="
                            flex
                            items-start
                            gap-3
                        "
          >
            <div
              className="
                                grid
                                h-9
                                w-9
                                shrink-0
                                place-items-center
                                rounded-xl
                                border
                                border-cyan-400/15
                                bg-cyan-400/[0.05]
                                text-cyan-300
                            "
            >
              <CheckCircle2
                size={16}
              />
            </div>

            <div>
              <strong
                className="
                                    text-xs
                                    text-slate-200
                                "
              >
                Comportamiento real
                del asistente
              </strong>

              <p
                className="
                                    mt-1
                                    max-w-5xl
                                    text-[9px]
                                    leading-5
                                    text-slate-600
                                "
              >
                Esta página no genera
                detecciones. Consulta los
                eventos que Django ya
                registró y utiliza la API
                de síntesis de voz del
                navegador para leerlos.
                El modo automático compara
                el último registro recibido
                y solo anuncia cuando
                aparece un evento nuevo
                después de abrir esta vista.
              </p>
            </div>
          </div>
        </section>


        {ultimoTexto && (
          <div
            className="
                            pb-2
                            text-[8px]
                            leading-5
                            text-slate-700
                        "
          >
            Último texto enviado al
            sintetizador: “
            {ultimoTexto}
            ”
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


function Dato({
  label,
  value,
}) {
  return (
    <div
      className="
                rounded-xl
                border
                border-white/[0.055]
                bg-black/10
                p-3
            "
    >
      <span
        className="
                    text-[8px]
                    uppercase
                    tracking-[0.13em]
                    text-slate-700
                "
      >
        {label}
      </span>

      <strong
        className="
                    mt-1
                    block
                    text-[10px]
                    text-slate-300
                "
      >
        {value}
      </strong>
    </div>
  );
}
