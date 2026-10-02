import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Activity,
    AlertTriangle,
    BrainCircuit,
    Clock3,
    Database,
    Mic2,
    Radio,
    RefreshCcw,
    Server,
    ShieldCheck,
    Sparkles,
    Volume2,
    Waves,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
    obtenerDetecciones,
} from "../../services/detecciones";

import {
    obtenerResumen,
    obtenerPorSonido,
    obtenerPorRiesgo,
} from "../../services/estadisticas";

import {
    analizarGrabacion,
    obtenerEstadoModelo,
} from "../../services/inteligencia";

import {
    grabarWav,
} from "../../utils/grabarWav";


/* =====================================================
   NOMBRES VISUALES
===================================================== */

const NOMBRES_SONIDOS = {
    golpe: "Golpe",
    puerta: "Puerta",
    alarma: "Alarma",
    aplausos: "Aplausos",
    vidrio: "Vidrio",
    ruido_elevado: "Ruido elevado",
    desconocido: "Desconocido",
};


function nombreSonido(tipo) {
    return (
        NOMBRES_SONIDOS[tipo] ||
        tipo ||
        "Sin identificar"
    );
}


/* =====================================================
   HELPERS
===================================================== */

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
        Math.min(100, final)
    );
}


function porcentajeTexto(valor) {
    return `${porcentaje(valor).toFixed(1)}%`;
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


function formatearFecha(fecha) {
    if (!fecha) {
        return "Sin fecha";
    }

    const d = new Date(fecha);

    if (Number.isNaN(d.getTime())) {
        return fecha;
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


function normalizarDistribucion(
    data,
    clavesNombre = []
) {
    if (!data) {
        return [];
    }

    let filas = data;


    if (!Array.isArray(filas)) {
        const arrayInterno =
            Object.values(filas).find(
                (value) =>
                    Array.isArray(value)
            );

        if (arrayInterno) {
            filas = arrayInterno;
        } else {
            return Object
                .entries(filas)
                .filter(
                    ([, value]) =>
                        typeof value === "number"
                )
                .map(([key, value]) => ({
                    nombre: nombreSonido(key),
                    valor: numero(value),
                }));
        }
    }


    return filas.map((fila) => {
        const nombre =
            clavesNombre
                .map((key) => fila?.[key])
                .find(Boolean) ||
            fila?.nombre ||
            fila?.name ||
            fila?.tipo ||
            fila?.categoria ||
            "Sin nombre";


        const valor =
            fila?.total ??
            fila?.cantidad ??
            fila?.conteo ??
            fila?.count ??
            fila?.value ??
            fila?.valor ??
            0;


        return {
            nombre: nombreSonido(nombre),
            valor: numero(valor),
        };
    });
}


/* =====================================================
   COLORES DE RIESGO
===================================================== */

function estiloRiesgo(riesgo) {
    const r =
        String(riesgo || "")
            .toUpperCase();

    if (r === "CRITICO" || r === "CRÍTICO") {
        return {
            texto: "text-fuchsia-300",
            fondo: "bg-fuchsia-500/10",
            borde: "border-fuchsia-500/30",
            punto: "bg-fuchsia-400",
        };
    }

    if (r === "ALTO") {
        return {
            texto: "text-rose-300",
            fondo: "bg-rose-500/10",
            borde: "border-rose-500/30",
            punto: "bg-rose-400",
        };
    }

    if (r === "MEDIO") {
        return {
            texto: "text-amber-300",
            fondo: "bg-amber-500/10",
            borde: "border-amber-500/30",
            punto: "bg-amber-400",
        };
    }

    return {
        texto: "text-emerald-300",
        fondo: "bg-emerald-500/10",
        borde: "border-emerald-500/30",
        punto: "bg-emerald-400",
    };
}


/* =====================================================
   TARJETA ESTADÍSTICA
===================================================== */

function StatCard({
    icon: Icon,
    label,
    value,
    detail,
    accent = "violet",
}) {
    const estilos = {
        violet: {
            icon:
                "bg-violet-500/10 text-violet-300 border-violet-500/20",
            glow:
                "from-violet-500/10",
        },

        lime: {
            icon:
                "bg-lime-400/10 text-lime-300 border-lime-400/20",
            glow:
                "from-lime-400/10",
        },

        cyan: {
            icon:
                "bg-cyan-400/10 text-cyan-300 border-cyan-400/20",
            glow:
                "from-cyan-400/10",
        },

        rose: {
            icon:
                "bg-rose-400/10 text-rose-300 border-rose-400/20",
            glow:
                "from-rose-400/10",
        },
    };

    const style =
        estilos[accent] ||
        estilos.violet;


    return (
        <article
            className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.07]
        bg-[#0b1020]/80
        p-4
        shadow-[0_18px_50px_rgba(0,0,0,.18)]
        backdrop-blur-xl
        transition
        duration-300
        hover:-translate-y-1
        hover:border-white/[0.13]
      "
        >

            <div
                className={`
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-br
          ${style.glow}
          via-transparent
          to-transparent
          opacity-60
        `}
            />


            <div className="relative">

                <div className="mb-5 flex items-center justify-between">

                    <span
                        className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-slate-500
            "
                    >
                        {label}
                    </span>


                    <div
                        className={`
              grid
              h-9
              w-9
              place-items-center
              rounded-xl
              border
              ${style.icon}
            `}
                    >
                        <Icon size={17} />
                    </div>

                </div>


                <strong
                    className="
            block
            text-3xl
            font-semibold
            tracking-[-0.04em]
            text-white
          "
                >
                    {value}
                </strong>


                <span
                    className="
            mt-2
            block
            text-[10px]
            text-slate-500
          "
                >
                    {detail}
                </span>

            </div>

        </article>
    );
}


/* =====================================================
   DASHBOARD
===================================================== */

export default function AdminDashboard() {
    const [
        cargando,
        setCargando,
    ] = useState(true);

    const [
        actualizando,
        setActualizando,
    ] = useState(false);

    const [
        escuchando,
        setEscuchando,
    ] = useState(false);

    const [
        segundos,
        setSegundos,
    ] = useState(0);

    const [
        error,
        setError,
    ] = useState("");

    const [
        estadoModelo,
        setEstadoModelo,
    ] = useState(null);

    const [
        estadisticas,
        setEstadisticas,
    ] = useState(null);

    const [
        detecciones,
        setDetecciones,
    ] = useState([]);

    const [
        porSonido,
        setPorSonido,
    ] = useState([]);

    const [
        porRiesgo,
        setPorRiesgo,
    ] = useState([]);

    const [
        resultado,
        setResultado,
    ] = useState(null);


    /* ===================================================
       CARGAR BACKEND
    =================================================== */

    const cargarDashboard =
        useCallback(
            async (
                silencioso = false
            ) => {
                try {
                    setError("");

                    if (!silencioso) {
                        setCargando(true);
                    }

                    if (silencioso) {
                        setActualizando(true);
                    }


                    const [
                        modelo,
                        historial,
                        resumen,
                        sonidos,
                        riesgos,
                    ] = await Promise.all([
                        obtenerEstadoModelo(),
                        obtenerDetecciones(),
                        obtenerResumen(),
                        obtenerPorSonido(),
                        obtenerPorRiesgo(),
                    ]);


                    setEstadoModelo(modelo);

                    setDetecciones(
                        obtenerLista(historial)
                    );

                    setEstadisticas(resumen);

                    setPorSonido(
                        normalizarDistribucion(
                            sonidos,
                            [
                                "tipo_sonido",
                                "sonido",
                            ]
                        )
                    );

                    setPorRiesgo(
                        normalizarDistribucion(
                            riesgos,
                            [
                                "nivel_riesgo",
                                "riesgo",
                            ]
                        )
                    );

                } catch (err) {
                    console.error(err);

                    if (err?.response) {
                        setError(
                            `El backend respondió con error ${err.response.status}.`
                        );
                    } else {
                        setError(
                            "No se pudo conectar con Django. Verifica que el backend esté ejecutándose."
                        );
                    }

                } finally {
                    setCargando(false);
                    setActualizando(false);
                }
            },
            []
        );


    useEffect(() => {
        cargarDashboard();

        const interval =
            setInterval(() => {
                cargarDashboard(true);
            }, 10000);

        return () => {
            clearInterval(interval);
        };
    }, [cargarDashboard]);


    /* ===================================================
       MODELO
    =================================================== */

    const modeloDisponible =
        Boolean(
            estadoModelo?.modelo_disponible ??
            estadoModelo?.disponible ??
            estadoModelo?.activo ??
            estadoModelo?.cargado
        );


    /* ===================================================
       HISTORIAL ORDENADO
    =================================================== */

    const historialOrdenado =
        useMemo(() => {
            return [...detecciones].sort(
                (a, b) => {
                    const fechaA =
                        new Date(
                            a?.fecha || 0
                        ).getTime();

                    const fechaB =
                        new Date(
                            b?.fecha || 0
                        ).getTime();

                    return fechaB - fechaA;
                }
            );
        }, [detecciones]);


    const ultimoEvento =
        historialOrdenado[0] || null;


    /* ===================================================
       RESULTADO / DETECCIÓN ACTUAL
    =================================================== */

    const sonidoActual =
        resultado?.tipo_sonido ||
        ultimoEvento?.tipo_sonido ||
        null;


    const confianzaActual =
        resultado?.confianza ??
        ultimoEvento?.confianza ??
        0;


    const riesgoActual =
        resultado?.nivel_riesgo ||
        ultimoEvento?.nivel_riesgo ||
        "bajo";


    const riesgoStyle =
        estiloRiesgo(riesgoActual);


    /* ===================================================
       PROBABILIDADES
    =================================================== */

    const probabilidades =
        useMemo(() => {
            if (
                !resultado?.probabilidades
            ) {
                return [];
            }

            return Object
                .entries(
                    resultado.probabilidades
                )
                .sort(
                    ([, a], [, b]) =>
                        numero(b) -
                        numero(a)
                );

        }, [resultado]);


    /* ===================================================
       SONIDOS MÁXIMO
    =================================================== */

    const maxSonidos =
        Math.max(
            1,
            ...porSonido.map(
                (item) =>
                    numero(item.valor)
            )
        );


    /* ===================================================
       VOZ
    =================================================== */

    function anunciarDeteccion(datos) {
        if (
            !(
                "speechSynthesis" in
                window
            )
        ) {
            return;
        }


        let texto;


        if (
            datos?.tipo_sonido ===
            "desconocido"
        ) {
            texto =
                "No se pudo identificar el sonido con suficiente confianza.";
        } else {
            texto =
                `Se ha detectado ${nombreSonido(
                    datos?.tipo_sonido
                )}. ` +
                `Nivel de riesgo ${datos?.nivel_riesgo}. ` +
                `Confianza ${Math.round(
                    porcentaje(
                        datos?.confianza
                    )
                )} por ciento.`;
        }


        const voz =
            new SpeechSynthesisUtterance(
                texto
            );

        voz.lang = "es-PE";
        voz.rate = 0.95;
        voz.pitch = 1;


        window.speechSynthesis.cancel();

        window.speechSynthesis.speak(
            voz
        );
    }


    /* ===================================================
       DETECCIÓN REAL
    =================================================== */

    async function detectarSonido() {
        if (escuchando) {
            return;
        }


        let contador;


        try {
            setError("");
            setResultado(null);
            setEscuchando(true);
            setSegundos(3);


            contador =
                setInterval(() => {
                    setSegundos(
                        (actual) =>
                            Math.max(
                                actual - 1,
                                0
                            )
                    );
                }, 1000);


            const wav =
                await grabarWav(3);


            clearInterval(contador);
            setSegundos(0);


            const datos =
                await analizarGrabacion(
                    wav
                );


            setResultado(datos);

            anunciarDeteccion(datos);

            await cargarDashboard(true);

        } catch (err) {
            console.error(err);


            if (
                err?.name ===
                "NotAllowedError" ||
                err?.name ===
                "PermissionDeniedError"
            ) {
                setError(
                    "Debes permitir el acceso al micrófono para realizar la detección."
                );

            } else if (
                err?.name ===
                "NotFoundError"
            ) {
                setError(
                    "No se encontró ningún micrófono disponible."
                );

            } else if (
                err?.response
            ) {
                setError(
                    `Error ${err.response.status} al analizar el audio.`
                );

            } else {
                setError(
                    err?.message ||
                    "No se pudo realizar la detección."
                );
            }

        } finally {
            clearInterval(contador);

            setEscuchando(false);
            setSegundos(0);
        }
    }


    /* ===================================================
       UI
    =================================================== */

    return (
        <DashboardLayout
            title="Centro de monitoreo"
            subtitle="Inteligencia acústica y detección de eventos en tiempo real"
        >

            <div className="mx-auto max-w-[1500px] space-y-5">


                {/* =================================================
            HERO / ESTADO GENERAL
        ================================================= */}

                <section
                    className="
            relative
            overflow-hidden
            rounded-[24px]
            border
            border-white/[0.07]
            bg-[#090e1b]
            px-5
            py-5
            shadow-[0_20px_80px_rgba(0,0,0,.28)]
            md:px-7
          "
                >

                    <div
                        className="
              pointer-events-none
              absolute
              -right-20
              -top-36
              h-80
              w-80
              rounded-full
              bg-violet-600/10
              blur-[90px]
            "
                    />

                    <div
                        className="
              pointer-events-none
              absolute
              -bottom-40
              left-1/3
              h-72
              w-72
              rounded-full
              bg-lime-400/[0.05]
              blur-[100px]
            "
                    />


                    <div
                        className="
              relative
              flex
              flex-col
              gap-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
                    >

                        <div>

                            <div
                                className="
                  mb-3
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-lime-400/15
                  bg-lime-400/[0.04]
                  px-3
                  py-1.5
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-lime-300
                "
                            >
                                <Sparkles size={12} />

                                SoundGuard Intelligence Core
                            </div>


                            <h2
                                className="
                  max-w-3xl
                  text-2xl
                  font-semibold
                  tracking-[-0.04em]
                  text-white
                  md:text-3xl
                "
                            >
                                Tu backend ahora tiene una
                                interfaz que muestra lo que
                                realmente está ocurriendo.
                            </h2>


                            <p
                                className="
                  mt-3
                  max-w-2xl
                  text-xs
                  leading-6
                  text-slate-400
                "
                            >
                                Audio real del micrófono,
                                clasificación mediante IA,
                                nivel de riesgo, probabilidades,
                                estadísticas e historial
                                almacenado en Django.
                            </p>

                        </div>


                        <div
                            className="
                grid
                grid-cols-2
                gap-2
                sm:grid-cols-3
              "
                        >

                            <div
                                className="
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.025]
                  px-4
                  py-3
                "
                            >
                                <div
                                    className="
                    mb-2
                    flex
                    items-center
                    gap-2
                    text-[9px]
                    text-slate-500
                  "
                                >
                                    <Server size={13} />

                                    BACKEND
                                </div>

                                <strong
                                    className="
                    text-xs
                    text-emerald-300
                  "
                                >
                                    {estadoModelo
                                        ? "CONECTADO"
                                        : "CARGANDO"}
                                </strong>
                            </div>


                            <div
                                className="
                  rounded-xl
                  border
                  border-white/[0.06]
                  bg-white/[0.025]
                  px-4
                  py-3
                "
                            >
                                <div
                                    className="
                    mb-2
                    flex
                    items-center
                    gap-2
                    text-[9px]
                    text-slate-500
                  "
                                >
                                    <BrainCircuit size={13} />

                                    MODELO IA
                                </div>

                                <strong
                                    className={
                                        modeloDisponible
                                            ? "text-xs text-lime-300"
                                            : "text-xs text-rose-300"
                                    }
                                >
                                    {modeloDisponible
                                        ? "ACTIVO"
                                        : "NO DISPONIBLE"}
                                </strong>
                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    cargarDashboard(true)
                                }
                                className="
                  col-span-2
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  px-4
                  py-3
                  text-[9px]
                  font-semibold
                  tracking-wide
                  text-slate-400
                  transition
                  hover:border-violet-400/30
                  hover:text-white
                  sm:col-span-1
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

                                ACTUALIZAR
                            </button>

                        </div>

                    </div>

                </section>


                {/* =================================================
            ERROR
        ================================================= */}

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
                            <p
                                className="
                  text-xs
                  font-semibold
                  text-rose-200
                "
                            >
                                No se pudo completar una operación
                            </p>

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


                {/* =================================================
            ESTADÍSTICAS REALES
        ================================================= */}

                <section
                    className="
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
            xl:grid-cols-4
          "
                >

                    <StatCard
                        icon={Database}
                        label="Total detecciones"
                        value={
                            cargando
                                ? "..."
                                : estadisticas
                                    ?.total_detecciones ??
                                detecciones.length
                        }
                        detail="Eventos almacenados en la base de datos"
                        accent="violet"
                    />


                    <StatCard
                        icon={Activity}
                        label="Detecciones hoy"
                        value={
                            cargando
                                ? "..."
                                : estadisticas
                                    ?.detecciones_hoy ??
                                0
                        }
                        detail="Actividad registrada durante el día"
                        accent="lime"
                    />


                    <StatCard
                        icon={Clock3}
                        label="Últimas 24 horas"
                        value={
                            cargando
                                ? "..."
                                : estadisticas
                                    ?.ultimas_24_horas ??
                                0
                        }
                        detail="Eventos detectados recientemente"
                        accent="cyan"
                    />


                    <StatCard
                        icon={BrainCircuit}
                        label="Confianza promedio"
                        value={
                            cargando
                                ? "..."
                                : porcentajeTexto(
                                    estadisticas
                                        ?.confianza_promedio
                                )
                        }
                        detail="Promedio histórico del clasificador"
                        accent="rose"
                    />

                </section>


                {/* =================================================
            DETECTOR + RESULTADO
        ================================================= */}

                <section
                    className="
            grid
            gap-4
            xl:grid-cols-[0.82fr_1.18fr]
          "
                >

                    {/* ===============================================
              MICRÓFONO
          =============================================== */}

                    <article
                        className="
              relative
              overflow-hidden
              rounded-[24px]
              border
              border-white/[0.07]
              bg-[#090e1b]
              p-5
              md:p-6
            "
                    >

                        <div
                            className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                h-64
                w-64
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-violet-600/[0.08]
                blur-[80px]
              "
                        />


                        <div className="relative">

                            <div
                                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                "
                            >

                                <div>
                                    <div
                                        className="
                      flex
                      items-center
                      gap-2
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-violet-300
                    "
                                    >
                                        <Radio size={13} />

                                        Detección inteligente
                                    </div>


                                    <h3
                                        className="
                      mt-2
                      text-lg
                      font-semibold
                      tracking-tight
                      text-white
                    "
                                    >
                                        Escucha en tiempo real
                                    </h3>


                                    <p
                                        className="
                      mt-1
                      text-[10px]
                      leading-5
                      text-slate-500
                    "
                                    >
                                        Captura 3 segundos de audio
                                        y los envía al modelo real.
                                    </p>

                                </div>


                                <span
                                    className="
                    rounded-full
                    border
                    border-emerald-500/15
                    bg-emerald-500/[0.05]
                    px-3
                    py-1
                    text-[8px]
                    font-semibold
                    tracking-wider
                    text-emerald-300
                  "
                                >
                                    MIC ONLINE
                                </span>

                            </div>


                            <div
                                className="
                  flex
                  min-h-[310px]
                  flex-col
                  items-center
                  justify-center
                "
                            >

                                <div
                                    className="
                    relative
                    grid
                    h-52
                    w-52
                    place-items-center
                  "
                                >

                                    <span
                                        className={`
                      absolute
                      h-32
                      w-32
                      rounded-full
                      border
                      border-violet-400/20
                      ${escuchando
                                                ? "animate-ping"
                                                : ""
                                            }
                    `}
                                    />


                                    <span
                                        className={`
                      absolute
                      h-40
                      w-40
                      rounded-full
                      border
                      border-lime-300/10
                      ${escuchando
                                                ? "animate-pulse"
                                                : ""
                                            }
                    `}
                                    />


                                    <span
                                        className="
                      absolute
                      h-48
                      w-48
                      rounded-full
                      border
                      border-white/[0.04]
                    "
                                    />


                                    <button
                                        type="button"
                                        onClick={detectarSonido}
                                        disabled={
                                            escuchando ||
                                            !modeloDisponible
                                        }
                                        className={`
                      relative
                      z-10
                      grid
                      h-24
                      w-24
                      place-items-center
                      rounded-[32px]
                      border
                      transition
                      duration-300
                      ${escuchando
                                                ? `
                            scale-95
                            border-lime-300/40
                            bg-lime-300
                            text-[#10130a]
                            shadow-[0_0_45px_rgba(214,255,69,.2)]
                          `
                                                : `
                            border-violet-400/30
                            bg-gradient-to-br
                            from-violet-500/20
                            to-fuchsia-500/10
                            text-violet-200
                            shadow-[0_20px_60px_rgba(82,45,160,.2)]
                            hover:scale-105
                            hover:border-violet-300/50
                          `
                                            }
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    `}
                                    >
                                        <Mic2
                                            size={38}
                                            strokeWidth={1.5}
                                        />
                                    </button>

                                </div>


                                <strong
                                    className="
                    mt-1
                    text-sm
                    font-semibold
                    text-white
                  "
                                >
                                    {escuchando
                                        ? `Escuchando${segundos > 0
                                            ? ` · ${segundos}s`
                                            : ""
                                        }`
                                        : "Presiona para analizar"}
                                </strong>


                                <span
                                    className="
                    mt-2
                    max-w-[300px]
                    text-center
                    text-[9px]
                    leading-5
                    text-slate-500
                  "
                                >
                                    {escuchando
                                        ? "Produce el sonido ahora. El audio se está capturando."
                                        : "El navegador captura audio WAV y Django lo procesa con tu clasificador."}
                                </span>

                            </div>

                        </div>

                    </article>


                    {/* ===============================================
              RESULTADO
          =============================================== */}

                    <article
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
                items-center
                justify-between
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
                    text-slate-500
                  "
                                >
                                    Resultado de inteligencia artificial
                                </span>

                                <h3
                                    className="
                    mt-1
                    text-sm
                    font-semibold
                    text-white
                  "
                                >
                                    Interpretación acústica
                                </h3>
                            </div>


                            {sonidoActual && (
                                <div
                                    className={`
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    px-3
                    py-1.5
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-wider
                    ${riesgoStyle.texto}
                    ${riesgoStyle.fondo}
                    ${riesgoStyle.borde}
                  `}
                                >
                                    <span
                                        className={`
                      h-1.5
                      w-1.5
                      rounded-full
                      ${riesgoStyle.punto}
                    `}
                                    />

                                    Riesgo {String(
                                        riesgoActual
                                    ).toUpperCase()}
                                </div>
                            )}

                        </div>


                        {!sonidoActual &&
                            !escuchando && (
                                <div
                                    className="
                    flex
                    min-h-[390px]
                    flex-col
                    items-center
                    justify-center
                    p-6
                    text-center
                  "
                                >
                                    <div
                                        className="
                      grid
                      h-16
                      w-16
                      place-items-center
                      rounded-2xl
                      border
                      border-white/[0.06]
                      bg-white/[0.025]
                      text-slate-600
                    "
                                    >
                                        <Waves size={27} />
                                    </div>

                                    <strong
                                        className="
                      mt-4
                      text-sm
                      text-slate-300
                    "
                                    >
                                        Esperando una señal acústica
                                    </strong>

                                    <p
                                        className="
                      mt-2
                      max-w-xs
                      text-[10px]
                      leading-5
                      text-slate-600
                    "
                                    >
                                        Realiza una detección para
                                        visualizar la clasificación,
                                        confianza y probabilidades.
                                    </p>
                                </div>
                            )}


                        {escuchando && (
                            <div
                                className="
                  flex
                  min-h-[390px]
                  flex-col
                  items-center
                  justify-center
                  p-6
                "
                            >

                                <div
                                    className="
                    flex
                    h-20
                    items-center
                    gap-1
                  "
                                >
                                    {[
                                        28,
                                        52,
                                        72,
                                        42,
                                        66,
                                        34,
                                        58,
                                        76,
                                        46,
                                    ].map(
                                        (
                                            alto,
                                            index
                                        ) => (
                                            <span
                                                key={index}
                                                className="
                          w-1.5
                          animate-pulse
                          rounded-full
                          bg-gradient-to-t
                          from-violet-500
                          to-lime-300
                        "
                                                style={{
                                                    height:
                                                        `${alto}%`,
                                                    animationDelay:
                                                        `${index * 70}ms`,
                                                }}
                                            />
                                        )
                                    )}
                                </div>


                                <strong
                                    className="
                    mt-5
                    text-sm
                    text-white
                  "
                                >
                                    Procesando señal
                                </strong>


                                <span
                                    className="
                    mt-2
                    text-[9px]
                    uppercase
                    tracking-[0.18em]
                    text-violet-300
                  "
                                >
                                    SOUNDGUARD AI
                                </span>

                            </div>
                        )}


                        {sonidoActual &&
                            !escuchando && (
                                <div className="p-5">

                                    <div
                                        className="
                      grid
                      gap-4
                      lg:grid-cols-[0.8fr_1.2fr]
                    "
                                    >

                                        {/* RESULTADO PRINCIPAL */}

                                        <div
                                            className="
                        rounded-2xl
                        border
                        border-white/[0.06]
                        bg-white/[0.025]
                        p-5
                      "
                                        >

                                            <span
                                                className="
                          text-[9px]
                          uppercase
                          tracking-[0.18em]
                          text-slate-500
                        "
                                            >
                                                Sonido identificado
                                            </span>


                                            <h4
                                                className="
                          mt-3
                          text-3xl
                          font-semibold
                          tracking-[-0.04em]
                          text-white
                        "
                                            >
                                                {nombreSonido(
                                                    sonidoActual
                                                )}
                                            </h4>


                                            <div
                                                className="
                          mt-6
                          flex
                          items-end
                          gap-2
                        "
                                            >
                                                <strong
                                                    className="
                            text-4xl
                            font-light
                            tracking-tight
                            text-lime-300
                          "
                                                >
                                                    {porcentajeTexto(
                                                        confianzaActual
                                                    )}
                                                </strong>

                                                <span
                                                    className="
                            mb-1
                            text-[9px]
                            uppercase
                            tracking-wider
                            text-slate-500
                          "
                                                >
                                                    confianza
                                                </span>
                                            </div>


                                            <div
                                                className="
                          mt-4
                          h-1.5
                          overflow-hidden
                          rounded-full
                          bg-white/[0.05]
                        "
                                            >
                                                <div
                                                    className="
                            h-full
                            rounded-full
                            bg-gradient-to-r
                            from-violet-500
                            via-fuchsia-400
                            to-lime-300
                          "
                                                    style={{
                                                        width:
                                                            `${porcentaje(
                                                                confianzaActual
                                                            )}%`,
                                                    }}
                                                />
                                            </div>


                                            {resultado && (
                                                <div
                                                    className="
                            mt-5
                            grid
                            grid-cols-2
                            gap-2
                          "
                                                >

                                                    <div
                                                        className="
                              rounded-xl
                              border
                              border-white/[0.05]
                              bg-black/10
                              p-3
                            "
                                                    >
                                                        <span
                                                            className="
                                block
                                text-[8px]
                                uppercase
                                tracking-wider
                                text-slate-600
                              "
                                                        >
                                                            Duración
                                                        </span>

                                                        <strong
                                                            className="
                                mt-1
                                block
                                text-xs
                                text-slate-300
                              "
                                                        >
                                                            {numero(
                                                                resultado
                                                                    ?.duracion_segundos
                                                            ).toFixed(1)}s
                                                        </strong>
                                                    </div>


                                                    <div
                                                        className="
                              rounded-xl
                              border
                              border-white/[0.05]
                              bg-black/10
                              p-3
                            "
                                                    >
                                                        <span
                                                            className="
                                block
                                text-[8px]
                                uppercase
                                tracking-wider
                                text-slate-600
                              "
                                                        >
                                                            Evento
                                                        </span>

                                                        <strong
                                                            className="
                                mt-1
                                block
                                text-xs
                                text-slate-300
                              "
                                                        >
                                                            #
                                                            {resultado
                                                                ?.deteccion_id ??
                                                                "—"}
                                                        </strong>
                                                    </div>

                                                </div>
                                            )}

                                        </div>


                                        {/* PROBABILIDADES */}

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
                          mb-4
                          flex
                          items-center
                          justify-between
                        "
                                            >
                                                <div>
                                                    <span
                                                        className="
                              text-[9px]
                              uppercase
                              tracking-[0.17em]
                              text-slate-500
                            "
                                                    >
                                                        Distribución
                                                    </span>

                                                    <p
                                                        className="
                              mt-1
                              text-xs
                              font-medium
                              text-slate-300
                            "
                                                    >
                                                        Probabilidades del modelo
                                                    </p>
                                                </div>

                                                <BrainCircuit
                                                    size={20}
                                                    className="
                            text-violet-300
                          "
                                                />
                                            </div>


                                            {probabilidades.length >
                                                0 ? (
                                                <div className="space-y-3">

                                                    {probabilidades.map(
                                                        ([
                                                            tipo,
                                                            valor,
                                                        ]) => {
                                                            const pct =
                                                                porcentaje(
                                                                    valor
                                                                );

                                                            return (
                                                                <div
                                                                    key={tipo}
                                                                >

                                                                    <div
                                                                        className="
                                      mb-1.5
                                      flex
                                      items-center
                                      justify-between
                                      gap-3
                                    "
                                                                    >
                                                                        <span
                                                                            className="
                                        text-[9px]
                                        text-slate-400
                                      "
                                                                        >
                                                                            {nombreSonido(
                                                                                tipo
                                                                            )}
                                                                        </span>

                                                                        <strong
                                                                            className="
                                        text-[9px]
                                        font-medium
                                        text-slate-300
                                      "
                                                                        >
                                                                            {pct.toFixed(
                                                                                1
                                                                            )}
                                                                            %
                                                                        </strong>
                                                                    </div>


                                                                    <div
                                                                        className="
                                      h-1.5
                                      overflow-hidden
                                      rounded-full
                                      bg-white/[0.05]
                                    "
                                                                    >
                                                                        <div
                                                                            className="
                                        h-full
                                        rounded-full
                                        bg-gradient-to-r
                                        from-violet-500
                                        to-lime-300
                                      "
                                                                            style={{
                                                                                width:
                                                                                    `${pct}%`,
                                                                            }}
                                                                        />
                                                                    </div>

                                                                </div>
                                                            );
                                                        }
                                                    )}

                                                </div>
                                            ) : (
                                                <div
                                                    className="
                            grid
                            min-h-[200px]
                            place-items-center
                            text-center
                          "
                                                >
                                                    <p
                                                        className="
                              max-w-[230px]
                              text-[10px]
                              leading-5
                              text-slate-600
                            "
                                                    >
                                                        Las probabilidades completas
                                                        aparecerán después de una
                                                        nueva detección.
                                                    </p>
                                                </div>
                                            )}

                                        </div>

                                    </div>


                                    {resultado && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                anunciarDeteccion(
                                                    resultado
                                                )
                                            }
                                            className="
                        mt-4
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-violet-400/15
                        bg-violet-400/[0.04]
                        px-4
                        py-3
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-wider
                        text-violet-300
                        transition
                        hover:border-violet-300/30
                        hover:bg-violet-400/[0.08]
                      "
                                        >
                                            <Volume2 size={14} />

                                            Reproducir alerta de voz
                                        </button>
                                    )}

                                </div>
                            )}

                    </article>

                </section>


                {/* =================================================
            SONIDOS + RIESGOS
        ================================================= */}

                <section
                    className="
            grid
            gap-4
            xl:grid-cols-[1.2fr_0.8fr]
          "
                >

                    {/* SONIDOS */}

                    <article
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
                mb-5
                flex
                items-center
                justify-between
              "
                        >
                            <div>
                                <span
                                    className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.17em]
                    text-violet-300
                  "
                                >
                                    Estadística real
                                </span>

                                <h3
                                    className="
                    mt-1
                    text-sm
                    font-semibold
                    text-white
                  "
                                >
                                    Eventos por tipo de sonido
                                </h3>
                            </div>

                            <Waves
                                size={20}
                                className="
                  text-slate-600
                "
                            />
                        </div>


                        <div className="space-y-4">

                            {porSonido.length ===
                                0 ? (
                                <p
                                    className="
                    py-10
                    text-center
                    text-[10px]
                    text-slate-600
                  "
                                >
                                    No hay datos suficientes.
                                </p>
                            ) : (
                                porSonido
                                    .slice(0, 8)
                                    .map(
                                        (
                                            item,
                                            index
                                        ) => {
                                            const ancho =
                                                Math.max(
                                                    2,
                                                    (
                                                        item.valor /
                                                        maxSonidos
                                                    ) * 100
                                                );

                                            return (
                                                <div
                                                    key={`${item.nombre}-${index}`}
                                                >

                                                    <div
                                                        className="
                              mb-2
                              flex
                              items-center
                              justify-between
                            "
                                                    >
                                                        <span
                                                            className="
                                text-[10px]
                                text-slate-400
                              "
                                                        >
                                                            {item.nombre}
                                                        </span>

                                                        <strong
                                                            className="
                                text-[10px]
                                text-white
                              "
                                                        >
                                                            {item.valor}
                                                        </strong>
                                                    </div>


                                                    <div
                                                        className="
                              h-2
                              overflow-hidden
                              rounded-full
                              bg-white/[0.04]
                            "
                                                    >
                                                        <div
                                                            className="
                                h-full
                                rounded-full
                                bg-gradient-to-r
                                from-violet-600
                                via-fuchsia-500
                                to-lime-300
                              "
                                                            style={{
                                                                width:
                                                                    `${ancho}%`,
                                                            }}
                                                        />
                                                    </div>

                                                </div>
                                            );
                                        }
                                    )
                            )}

                        </div>

                    </article>


                    {/* RIESGOS */}

                    <article
                        className="
              rounded-[24px]
              border
              border-white/[0.07]
              bg-[#090e1b]
              p-5
            "
                    >

                        <div className="mb-5">

                            <span
                                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.17em]
                  text-lime-300
                "
                            >
                                Seguridad acústica
                            </span>

                            <h3
                                className="
                  mt-1
                  text-sm
                  font-semibold
                  text-white
                "
                            >
                                Distribución de riesgo
                            </h3>

                        </div>


                        <div className="space-y-3">

                            {porRiesgo.length ===
                                0 ? (
                                <p
                                    className="
                    py-10
                    text-center
                    text-[10px]
                    text-slate-600
                  "
                                >
                                    No hay datos suficientes.
                                </p>
                            ) : (
                                porRiesgo.map(
                                    (
                                        item,
                                        index
                                    ) => {
                                        const estilo =
                                            estiloRiesgo(
                                                item.nombre
                                            );

                                        return (
                                            <div
                                                key={`${item.nombre}-${index}`}
                                                className={`
                          flex
                          items-center
                          justify-between
                          rounded-xl
                          border
                          px-4
                          py-3
                          ${estilo.fondo}
                          ${estilo.borde}
                        `}
                                            >

                                                <div
                                                    className="
                            flex
                            items-center
                            gap-2
                          "
                                                >
                                                    <span
                                                        className={`
                              h-2
                              w-2
                              rounded-full
                              ${estilo.punto}
                            `}
                                                    />

                                                    <span
                                                        className={`
                              text-[9px]
                              font-semibold
                              uppercase
                              tracking-wider
                              ${estilo.texto}
                            `}
                                                    >
                                                        {item.nombre}
                                                    </span>
                                                </div>


                                                <strong
                                                    className="
                            text-lg
                            font-medium
                            text-white
                          "
                                                >
                                                    {item.valor}
                                                </strong>

                                            </div>
                                        );
                                    }
                                )
                            )}

                        </div>


                        <div
                            className="
                mt-5
                rounded-xl
                border
                border-white/[0.05]
                bg-white/[0.02]
                p-4
              "
                        >
                            <div
                                className="
                  flex
                  items-center
                  gap-2
                "
                            >
                                <ShieldCheck
                                    size={16}
                                    className="
                    text-lime-300
                  "
                                />

                                <strong
                                    className="
                    text-[10px]
                    text-slate-300
                  "
                                >
                                    Evaluación automática
                                </strong>
                            </div>

                            <p
                                className="
                  mt-2
                  text-[9px]
                  leading-5
                  text-slate-600
                "
                            >
                                El nivel mostrado corresponde
                                a la clasificación de riesgo
                                calculada por tu backend para
                                cada detección.
                            </p>
                        </div>

                    </article>

                </section>


                {/* =================================================
            HISTORIAL REAL
        ================================================= */}

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
                  tracking-[0.17em]
                  text-cyan-300
                "
                            >
                                Base de datos
                            </span>

                            <h3
                                className="
                  mt-1
                  text-sm
                  font-semibold
                  text-white
                "
                            >
                                Últimas detecciones registradas
                            </h3>
                        </div>


                        <div
                            className="
                flex
                items-center
                gap-2
                text-[9px]
                text-slate-600
              "
                        >
                            <Database size={13} />

                            {detecciones.length} registros cargados
                        </div>

                    </div>


                    <div className="overflow-x-auto">

                        <table
                            className="
                w-full
                min-w-[760px]
                text-left
              "
                        >

                            <thead
                                className="
                  bg-white/[0.015]
                  text-[8px]
                  uppercase
                  tracking-[0.14em]
                  text-slate-600
                "
                            >
                                <tr>
                                    <th className="px-5 py-3">
                                        ID
                                    </th>

                                    <th className="px-5 py-3">
                                        Fecha
                                    </th>

                                    <th className="px-5 py-3">
                                        Sonido
                                    </th>

                                    <th className="px-5 py-3">
                                        Confianza
                                    </th>

                                    <th className="px-5 py-3">
                                        Riesgo
                                    </th>

                                    <th className="px-5 py-3">
                                        Duración
                                    </th>

                                    <th className="px-5 py-3">
                                        Origen
                                    </th>
                                </tr>
                            </thead>


                            <tbody>

                                {historialOrdenado
                                    .slice(0, 7)
                                    .map((d) => {
                                        const style =
                                            estiloRiesgo(
                                                d?.nivel_riesgo
                                            );

                                        return (
                                            <tr
                                                key={d.id}
                                                className="
                          border-t
                          border-white/[0.045]
                          text-[10px]
                          transition
                          hover:bg-white/[0.02]
                        "
                                            >

                                                <td
                                                    className="
                            px-5
                            py-3.5
                            text-slate-600
                          "
                                                >
                                                    #{d.id}
                                                </td>


                                                <td
                                                    className="
                            px-5
                            py-3.5
                            text-slate-500
                          "
                                                >
                                                    {formatearFecha(
                                                        d.fecha
                                                    )}
                                                </td>


                                                <td
                                                    className="
                            px-5
                            py-3.5
                            font-medium
                            text-slate-200
                          "
                                                >
                                                    {nombreSonido(
                                                        d.tipo_sonido
                                                    )}
                                                </td>


                                                <td className="px-5 py-3.5">
                                                    <span
                                                        className="
                              text-lime-300
                            "
                                                    >
                                                        {porcentajeTexto(
                                                            d.confianza
                                                        )}
                                                    </span>
                                                </td>


                                                <td className="px-5 py-3.5">

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
                              ${style.texto}
                              ${style.fondo}
                              ${style.borde}
                            `}
                                                    >
                                                        <span
                                                            className={`
                                h-1
                                w-1
                                rounded-full
                                ${style.punto}
                              `}
                                                        />

                                                        {d.nivel_riesgo}
                                                    </span>

                                                </td>


                                                <td
                                                    className="
                            px-5
                            py-3.5
                            text-slate-400
                          "
                                                >
                                                    {numero(
                                                        d.duracion_segundos
                                                    ).toFixed(1)}
                                                    s
                                                </td>


                                                <td
                                                    className="
                            px-5
                            py-3.5
                            text-slate-500
                          "
                                                >
                                                    {d.origen || "—"}
                                                </td>

                                            </tr>
                                        );
                                    })}

                            </tbody>

                        </table>


                        {historialOrdenado.length ===
                            0 &&
                            !cargando && (
                                <div
                                    className="
                    py-14
                    text-center
                    text-[10px]
                    text-slate-600
                  "
                                >
                                    Todavía no hay detecciones
                                    registradas.
                                </div>
                            )}

                    </div>

                </section>


                {/* =================================================
            PIE TÉCNICO
        ================================================= */}

                <div
                    className="
            flex
            flex-col
            gap-2
            pb-3
            text-[8px]
            uppercase
            tracking-[0.15em]
            text-slate-700
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
                >

                    <span>
                        SOUNDGUARD AI · REAL-TIME ACOUSTIC INTELLIGENCE
                    </span>

                    <span>
                        Django · PostgreSQL · Machine Learning
                    </span>

                </div>

            </div>

        </DashboardLayout>
    );
}