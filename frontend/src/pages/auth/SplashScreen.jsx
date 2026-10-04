import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Activity,
    ArrowRight,
    AudioWaveform,
    BrainCircuit,
    Calendar,
    Clock,
    Database,
    Mic2,
    RefreshCw,
    Server,
    ShieldCheck,
    Volume2,
    VolumeX,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
    obtenerEstadoModelo,
    obtenerMetricasModelo,
} from "../../services/inteligencia";

import "./SplashScreen.css";


const EQUIPO = [
    "Jostin Davalos",
    "Renzo Silva",
    "Emanuel Bello",
    "Omar",
];


const CLASES_BASE = [
    "golpe",
    "puerta",
    "alarma",
    "aplausos",
    "vidrio",
    "ruido_elevado",
];


const NUMERO_BARRAS = 36;


const MENSAJE_BIENVENIDA =
    "Bienvenido a SoundGuard. " +
    "Sistema de detección acústica desarrollado por Jostin Davalos, Renzo Silva, Emanuel Bello y Omar, " +
    "bajo el liderazgo del Coronel Leonzo Prado. " +
    "La plataforma captura audio real, analiza eventos sonoros y registra información útil para su interpretación.";


function porcentaje(valor) {
    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "—";
    }

    return `${(numero * 100).toFixed(1)}%`;
}


function nombreClase(valor) {
    return String(valor || "")
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letra) =>
            letra.toUpperCase()
        );
}


function formatearFecha(fecha) {
    return fecha.toLocaleDateString(
        "es-PE",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        }
    );
}


function formatearHora(fecha) {
    return fecha.toLocaleTimeString(
        "es-PE",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }
    );
}


export default function SplashScreen() {
    const navigate = useNavigate();

    const [ahora, setAhora] =
        useState(new Date());

    const [
        backendEstado,
        setBackendEstado,
    ] = useState("cargando");

    const [
        estadoModelo,
        setEstadoModelo,
    ] = useState(null);

    const [
        metricasModelo,
        setMetricasModelo,
    ] = useState(null);

    const [
        errorBackend,
        setErrorBackend,
    ] = useState("");

    const [
        speaking,
        setSpeaking,
    ] = useState(false);

    const [
        micEstado,
        setMicEstado,
    ] = useState("apagado");

    const [
        nivelMic,
        setNivelMic,
    ] = useState(0);

    const [
        barras,
        setBarras,
    ] = useState(
        Array(NUMERO_BARRAS).fill(4)
    );

    const [
        saliendo,
        setSaliendo,
    ] = useState(false);

    const streamRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationRef = useRef(null);


    const datos = useMemo(() => {
        const estado =
            estadoModelo || {};

        const respuestaMetricas =
            metricasModelo || {};

        const bloque =
            respuestaMetricas.metricas ||
            estado.metricas ||
            respuestaMetricas ||
            {};

        const clases =
            Array.isArray(
                respuestaMetricas.clases
            )
                ? respuestaMetricas.clases
                : Array.isArray(
                    estado.clases
                )
                    ? estado.clases
                    : CLASES_BASE;

        return {
            disponible:
                Boolean(
                    estado.modelo_disponible ||
                    estado.estado ===
                    "entrenado"
                ),

            nombre:
                respuestaMetricas.modelo ||
                estado.modelo ||
                "Clasificador acústico",

            version:
                respuestaMetricas.version ||
                estado.version ||
                "—",

            accuracy:
                bloque.accuracy,

            precision:
                bloque.precision_macro,

            recall:
                bloque.recall_macro,

            f1:
                bloque.f1_macro,

            muestras:
                respuestaMetricas
                    .muestras_totales ??
                estado.muestras_totales,

            caracteristicas:
                respuestaMetricas
                    .caracteristicas ??
                estado.caracteristicas,

            clases,
        };
    }, [
        estadoModelo,
        metricasModelo,
    ]);


    async function comprobarBackend() {
        setBackendEstado("cargando");
        setErrorBackend("");

        try {
            const [
                estadoResultado,
                metricasResultado,
            ] = await Promise.allSettled([
                obtenerEstadoModelo(),
                obtenerMetricasModelo(),
            ]);

            if (
                estadoResultado.status ===
                "rejected"
            ) {
                throw estadoResultado.reason;
            }

            setEstadoModelo(
                estadoResultado.value
            );

            if (
                metricasResultado.status ===
                "fulfilled"
            ) {
                setMetricasModelo(
                    metricasResultado.value
                );
            } else {
                setMetricasModelo(null);
            }

            setBackendEstado("conectado");
        } catch (error) {
            setBackendEstado(
                "desconectado"
            );

            setEstadoModelo(null);
            setMetricasModelo(null);

            setErrorBackend(
                error?.response?.data?.detail ||
                error?.message ||
                "No fue posible conectar con Django."
            );
        }
    }


    function hablar() {
        if (
            !("speechSynthesis" in window)
        ) {
            return;
        }

        window.speechSynthesis.cancel();

        const mensaje =
            new SpeechSynthesisUtterance(
                MENSAJE_BIENVENIDA
            );

        mensaje.lang = "es-ES";
        mensaje.rate = 1.03;
        mensaje.pitch = 0.96;
        mensaje.volume = 1;

        const voces =
            window.speechSynthesis
                .getVoices();

        const voz =
            voces.find((item) =>
                item.lang
                    ?.toLowerCase()
                    .startsWith("es")
            );

        if (voz) {
            mensaje.voice = voz;
        }

        mensaje.onstart = () => {
            setSpeaking(true);
        };

        mensaje.onend = () => {
            setSpeaking(false);
        };

        mensaje.onerror = () => {
            setSpeaking(false);
        };

        window.speechSynthesis.speak(
            mensaje
        );
    }


    function detenerVoz() {
        if (
            "speechSynthesis" in window
        ) {
            window.speechSynthesis.cancel();
        }

        setSpeaking(false);
    }


    function detenerMicrofono() {
        if (animationRef.current) {
            cancelAnimationFrame(
                animationRef.current
            );

            animationRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current
                .getTracks()
                .forEach((track) =>
                    track.stop()
                );

            streamRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current
                .close()
                .catch(() => { });

            audioContextRef.current = null;
        }

        analyserRef.current = null;

        setMicEstado("apagado");
        setNivelMic(0);
        setBarras(
            Array(NUMERO_BARRAS).fill(4)
        );
    }


    async function activarMicrofono() {
        if (
            micEstado === "activo"
        ) {
            detenerMicrofono();
            return;
        }

        setMicEstado("solicitando");

        try {
            const stream =
                await navigator.mediaDevices
                    .getUserMedia({
                        audio: {
                            channelCount: 1,
                            echoCancellation: false,
                            noiseSuppression: false,
                            autoGainControl: false,
                        },
                    });

            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContextClass) {
                throw new Error(
                    "AudioContext no está disponible."
                );
            }

            const contexto =
                new AudioContextClass();

            if (
                contexto.state ===
                "suspended"
            ) {
                await contexto.resume();
            }

            const fuente =
                contexto
                    .createMediaStreamSource(
                        stream
                    );

            const analyser =
                contexto.createAnalyser();

            analyser.fftSize = 256;
            analyser.smoothingTimeConstant =
                0.78;

            fuente.connect(analyser);

            streamRef.current = stream;
            audioContextRef.current =
                contexto;
            analyserRef.current =
                analyser;

            const datosFrecuencia =
                new Uint8Array(
                    analyser
                        .frequencyBinCount
                );

            const actualizar =
                () => {
                    if (
                        !analyserRef.current
                    ) {
                        return;
                    }

                    analyserRef.current
                        .getByteFrequencyData(
                            datosFrecuencia
                        );

                    const paso =
                        Math.max(
                            1,
                            Math.floor(
                                datosFrecuencia
                                    .length /
                                NUMERO_BARRAS
                            )
                        );

                    const nuevasBarras =
                        Array.from(
                            {
                                length:
                                    NUMERO_BARRAS,
                            },
                            (_, indice) => {
                                const inicio =
                                    indice *
                                    paso;

                                const fin =
                                    Math.min(
                                        inicio +
                                        paso,
                                        datosFrecuencia
                                            .length
                                    );

                                let suma = 0;

                                for (
                                    let i =
                                        inicio;
                                    i < fin;
                                    i++
                                ) {
                                    suma +=
                                        datosFrecuencia[
                                        i
                                        ];
                                }

                                const promedio =
                                    suma /
                                    Math.max(
                                        1,
                                        fin -
                                        inicio
                                    );

                                return Math.max(
                                    4,
                                    Math.min(
                                        100,
                                        (
                                            promedio /
                                            255
                                        ) *
                                        100 *
                                        1.8
                                    )
                                );
                            }
                        );

                    const promedioGeneral =
                        datosFrecuencia.reduce(
                            (
                                total,
                                valor
                            ) =>
                                total +
                                valor,
                            0
                        ) /
                        datosFrecuencia
                            .length;

                    setBarras(
                        nuevasBarras
                    );

                    setNivelMic(
                        Math.min(
                            100,
                            (
                                promedioGeneral /
                                255
                            ) *
                            100 *
                            2.1
                        )
                    );

                    animationRef.current =
                        requestAnimationFrame(
                            actualizar
                        );
                };

            setMicEstado("activo");

            actualizar();
        } catch (error) {
            setMicEstado("error");
            setNivelMic(0);
        }
    }


    function entrar() {
        if (saliendo) {
            return;
        }

        setSaliendo(true);
        detenerVoz();
        detenerMicrofono();

        window.setTimeout(() => {
            navigate("/login", {
                replace: true,
            });
        }, 700);
    }


    useEffect(() => {
        comprobarBackend();

        const reloj =
            window.setInterval(
                () => {
                    setAhora(new Date());
                },
                1000
            );

        const backendIntervalo =
            window.setInterval(
                comprobarBackend,
                15000
            );

        return () => {
            window.clearInterval(
                reloj
            );

            window.clearInterval(
                backendIntervalo
            );

            detenerVoz();
            detenerMicrofono();
        };
    }, []);


    return (
        <div
            className={`sg-c ${saliendo
                    ? "sg-c--leaving"
                    : ""
                }`}
        >
            <div className="sg-c__noise" />
            <div className="sg-c__grid" />
            <div className="sg-c__aura sg-c__aura--a" />
            <div className="sg-c__aura sg-c__aura--b" />

            <header className="sg-c__header">
                <div className="sg-c__brand">
                    <div className="sg-c__brandMark">
                        <AudioWaveform
                            size={22}
                            strokeWidth={1.75}
                        />
                    </div>

                    <div>
                        <strong>
                            SOUNDGUARD
                        </strong>

                        <span>
                            SISTEMA DE DETECCIÓN
                            ACÚSTICA
                        </span>
                    </div>
                </div>

                <div className="sg-c__headerRight">
                    <div className="sg-c__dateBlock">
                        <Calendar
                            size={14}
                        />

                        <div>
                            <span>
                                {formatearFecha(
                                    ahora
                                )}
                            </span>

                            <strong>
                                <Clock
                                    size={13}
                                />
                                {formatearHora(
                                    ahora
                                )}
                            </strong>
                        </div>
                    </div>

                    <div
                        className={`sg-c__backend sg-c__backend--${backendEstado}`}
                    >
                        <span className="sg-c__backendDot" />

                        <div>
                            <small>
                                DJANGO API
                            </small>

                            <strong>
                                {backendEstado ===
                                    "conectado"
                                    ? "Conectado"
                                    : backendEstado ===
                                        "cargando"
                                        ? "Verificando"
                                        : "Sin conexión"}
                            </strong>
                        </div>

                        <button
                            type="button"
                            onClick={
                                comprobarBackend
                            }
                            title="Actualizar estado"
                        >
                            <RefreshCw
                                size={14}
                            />
                        </button>
                    </div>
                </div>
            </header>


            <main className="sg-c__main">
                <section className="sg-c__hero">
                    <div className="sg-c__eyebrow">
                        <span />

                        <strong>
                            INGENIERÍA DE SOFTWARE
                            + AUDIO + ML
                        </strong>
                    </div>

                    <h1>
                        Sound
                        <span>
                            Guard
                        </span>
                    </h1>

                    <h2>
                        El entorno habla.
                        Nosotros lo convertimos
                        en información.
                    </h2>

                    <p className="sg-c__description">
                        SoundGuard captura audio
                        desde el navegador,
                        prepara la señal,
                        ejecuta el modelo de
                        clasificación y registra
                        cada evento acústico en
                        el backend.
                    </p>

                    <div className="sg-c__actions">
                        <button
                            type="button"
                            className="sg-c__primary"
                            onClick={entrar}
                        >
                            <span>
                                Entrar al sistema
                            </span>

                            <ArrowRight
                                size={18}
                            />
                        </button>

                        <button
                            type="button"
                            className="sg-c__secondary"
                            onClick={
                                speaking
                                    ? detenerVoz
                                    : hablar
                            }
                        >
                            {speaking
                                ? (
                                    <VolumeX
                                        size={17}
                                    />
                                )
                                : (
                                    <Volume2
                                        size={17}
                                    />
                                )}

                            <span>
                                {speaking
                                    ? "Silenciar"
                                    : "Presentación"}
                            </span>
                        </button>
                    </div>

                    <div className="sg-c__team">
                        <div>
                            <span>
                                EQUIPO
                            </span>

                            <strong>
                                {EQUIPO.join(
                                    " · "
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                LIDERAZGO
                            </span>

                            <strong>
                                Coronel Leonzo Prado
                            </strong>
                        </div>
                    </div>
                </section>


                <section className="sg-c__workspace">
                    <div className="sg-c__workspaceHeader">
                        <div>
                            <span>
                                CENTRO DE MONITOREO
                            </span>

                            <strong>
                                Estado operativo
                            </strong>
                        </div>

                        <ShieldCheck
                            size={21}
                        />
                    </div>


                    <div className="sg-c__signal">
                        <div className="sg-c__signalHead">
                            <div>
                                <span>
                                    SEÑAL DEL MICRÓFONO
                                </span>

                                <strong>
                                    {micEstado ===
                                        "activo"
                                        ? "Captura en tiempo real"
                                        : micEstado ===
                                            "solicitando"
                                            ? "Solicitando permiso..."
                                            : micEstado ===
                                                "error"
                                                ? "Permiso no disponible"
                                                : "Micrófono inactivo"}
                                </strong>
                            </div>

                            <button
                                type="button"
                                className={`sg-c__micButton ${micEstado ===
                                        "activo"
                                        ? "is-active"
                                        : ""
                                    }`}
                                onClick={
                                    activarMicrofono
                                }
                            >
                                <Mic2
                                    size={16}
                                />

                                <span>
                                    {micEstado ===
                                        "activo"
                                        ? "Detener"
                                        : "Activar micrófono"}
                                </span>
                            </button>
                        </div>

                        <div className="sg-c__bars">
                            {barras.map(
                                (
                                    valor,
                                    indice
                                ) => (
                                    <i
                                        key={indice}
                                        style={{
                                            height:
                                                `${valor}%`,
                                        }}
                                    />
                                )
                            )}
                        </div>

                        <div className="sg-c__signalFooter">
                            <span>
                                Nivel
                                {" "}
                                {nivelMic.toFixed(
                                    0
                                )}
                                %
                            </span>

                            <span>
                                22.05 kHz
                            </span>

                            <span>
                                Mono
                            </span>

                            <span>
                                Ventana de análisis:
                                3 s
                            </span>
                        </div>
                    </div>


                    <div className="sg-c__statusGrid">
                        <article>
                            <div className="sg-c__statusIcon">
                                <Server
                                    size={18}
                                />
                            </div>

                            <span>
                                Backend
                            </span>

                            <strong
                                className={
                                    backendEstado ===
                                        "conectado"
                                        ? "is-ok"
                                        : backendEstado ===
                                            "desconectado"
                                            ? "is-bad"
                                            : ""
                                }
                            >
                                {backendEstado ===
                                    "conectado"
                                    ? "Django conectado"
                                    : backendEstado ===
                                        "cargando"
                                        ? "Verificando..."
                                        : "No disponible"}
                            </strong>
                        </article>

                        <article>
                            <div className="sg-c__statusIcon">
                                <BrainCircuit
                                    size={18}
                                />
                            </div>

                            <span>
                                Modelo
                            </span>

                            <strong
                                className={
                                    datos.disponible
                                        ? "is-ok"
                                        : ""
                                }
                            >
                                {datos.disponible
                                    ? "Disponible"
                                    : "No disponible"}
                            </strong>
                        </article>

                        <article>
                            <div className="sg-c__statusIcon">
                                <Activity
                                    size={18}
                                />
                            </div>

                            <span>
                                Accuracy
                            </span>

                            <strong>
                                {porcentaje(
                                    datos.accuracy
                                )}
                            </strong>
                        </article>

                        <article>
                            <div className="sg-c__statusIcon">
                                <Database
                                    size={18}
                                />
                            </div>

                            <span>
                                Dataset
                            </span>

                            <strong>
                                {datos.muestras
                                    ? `${datos.muestras} muestras`
                                    : "—"}
                            </strong>
                        </article>
                    </div>


                    <div className="sg-c__pipeline">
                        <div className="sg-c__sectionTitle">
                            <span>
                                FLUJO REAL
                            </span>

                            <small>
                                navegador → backend
                            </small>
                        </div>

                        <div className="sg-c__pipelineGrid">
                            <article>
                                <Mic2
                                    size={19}
                                />

                                <strong>
                                    Captura
                                </strong>

                                <span>
                                    Audio desde el
                                    navegador
                                </span>
                            </article>

                            <article>
                                <AudioWaveform
                                    size={19}
                                />

                                <strong>
                                    Prepara
                                </strong>

                                <span>
                                    WAV · mono ·
                                    22.05 kHz
                                </span>
                            </article>

                            <article>
                                <BrainCircuit
                                    size={19}
                                />

                                <strong>
                                    Clasifica
                                </strong>

                                <span>
                                    Probabilidad por
                                    clase
                                </span>
                            </article>

                            <article>
                                <Database
                                    size={19}
                                />

                                <strong>
                                    Registra
                                </strong>

                                <span>
                                    Django y
                                    PostgreSQL
                                </span>
                            </article>
                        </div>
                    </div>


                    <div className="sg-c__model">
                        <div className="sg-c__sectionTitle">
                            <span>
                                MODELO ACTUAL
                            </span>

                            <small>
                                datos del backend
                            </small>
                        </div>

                        <div className="sg-c__modelTop">
                            <div>
                                <h3>
                                    {datos.nombre}
                                </h3>

                                <p>
                                    Versión
                                    {" "}
                                    <b>
                                        {datos.version}
                                    </b>
                                    {" · "}
                                    {datos.caracteristicas ??
                                        "—"}
                                    {" "}
                                    características
                                </p>
                            </div>

                            <div className="sg-c__metrics">
                                <div>
                                    <span>
                                        Precision
                                    </span>

                                    <strong>
                                        {porcentaje(
                                            datos.precision
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Recall
                                    </span>

                                    <strong>
                                        {porcentaje(
                                            datos.recall
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        F1
                                    </span>

                                    <strong>
                                        {porcentaje(
                                            datos.f1
                                        )}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div className="sg-c__classes">
                            {datos.clases.map(
                                (clase) => (
                                    <span
                                        key={clase}
                                    >
                                        {nombreClase(
                                            clase
                                        )}
                                    </span>
                                )
                            )}
                        </div>

                        {errorBackend && (
                            <div className="sg-c__error">
                                <strong>
                                    Backend no disponible
                                </strong>

                                <span>
                                    Verifica que
                                    Django esté
                                    ejecutándose en
                                    http://127.0.0.1:8000
                                </span>
                            </div>
                        )}
                    </div>
                </section>
            </main>


            <footer className="sg-c__footer">
                <span>
                    SOUNDGUARD · 2026
                </span>

                <span>
                    React · Django · PostgreSQL
                    · procesamiento de audio ·
                    aprendizaje automático
                </span>
            </footer>
        </div>
    );
}
