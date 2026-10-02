import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    ArrowRight,
    BrainCircuit,
    Mic2,
    ShieldCheck,
    Sparkles,
    Volume2,
    VolumeX,
    Waves,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./SplashScreen.css";


const DURACION = 17000;


const MENSAJE_BIENVENIDA =
    "Bienvenido a SoundGuard AI. " +
    "Nuestro sistema inteligente escucha, analiza y reconoce sonidos importantes en tiempo real. " +
    "Transformamos el sonido en información útil para ayudarte a actuar con mayor rapidez y seguridad. " +
    "SoundGuard AI. Escucha, analiza y protege.";


export default function SplashScreen() {
    const navigate = useNavigate();

    const [progress, setProgress] = useState(0);
    const [closing, setClosing] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    const voiceStarted = useRef(false);


    const status = useMemo(() => {
        if (progress < 18) {
            return "Activando núcleo acústico";
        }

        if (progress < 36) {
            return "Abriendo canal de escucha";
        }

        if (progress < 56) {
            return "Inicializando inteligencia artificial";
        }

        if (progress < 76) {
            return "Interpretando señales del entorno";
        }

        if (progress < 94) {
            return "Sincronizando respuesta inteligente";
        }

        return "Sistema preparado";
    }, [progress]);


    const hablar = () => {
        if (!("speechSynthesis" in window)) {
            return;
        }

        window.speechSynthesis.cancel();

        const utterance =
            new SpeechSynthesisUtterance(
                MENSAJE_BIENVENIDA
            );

        utterance.lang = "es-ES";

        /*
          Si la voz termina demasiado tarde,
          cambia rate a 1.20 o 1.25.
        */
        utterance.rate = 1.12;
        utterance.pitch = 0.94;
        utterance.volume = 1;


        const voices =
            window.speechSynthesis.getVoices();


        const spanishVoice =
            voices.find((voice) =>
                voice.lang
                    ?.toLowerCase()
                    .startsWith("es")
            );


        if (spanishVoice) {
            utterance.voice = spanishVoice;
        }


        utterance.onstart = () => {
            setSpeaking(true);
        };


        utterance.onend = () => {
            setSpeaking(false);
        };


        utterance.onerror = () => {
            setSpeaking(false);
        };


        window.speechSynthesis.speak(
            utterance
        );
    };


    const detenerVoz = () => {
        if (
            "speechSynthesis" in window
        ) {
            window.speechSynthesis.cancel();
        }

        setSpeaking(false);
    };


    const entrar = () => {
        if (closing) {
            return;
        }

        detenerVoz();

        setClosing(true);

        setTimeout(() => {
            navigate("/login", {
                replace: true,
            });
        }, 800);
    };


    /*
      VOZ
    */
    useEffect(() => {
        const iniciar = () => {
            if (voiceStarted.current) {
                return;
            }

            voiceStarted.current = true;

            hablar();
        };


        const timer =
            setTimeout(iniciar, 650);


        if (
            "speechSynthesis" in window
        ) {
            window.speechSynthesis.addEventListener(
                "voiceschanged",
                iniciar
            );
        }


        return () => {
            clearTimeout(timer);

            if (
                "speechSynthesis" in window
            ) {
                window.speechSynthesis.removeEventListener(
                    "voiceschanged",
                    iniciar
                );

                window.speechSynthesis.cancel();
            }
        };
    }, []);


    /*
      PROGRESO
    */
    useEffect(() => {
        const start = Date.now();


        const interval =
            setInterval(() => {
                const elapsed =
                    Date.now() - start;

                const value =
                    Math.min(
                        100,
                        (elapsed / DURACION) * 100
                    );

                setProgress(value);
            }, 60);


        const timer =
            setTimeout(() => {
                detenerVoz();

                setClosing(true);

                setTimeout(() => {
                    navigate("/login", {
                        replace: true,
                    });
                }, 800);

            }, DURACION);


        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [navigate]);


    return (
        <div
            className={`nova ${closing
                ? "nova--closing"
                : ""
                }`}
            style={{
                "--progress": progress,
            }}
        >

            {/* FONDO */}

            <div className="nova__noise" />
            <div className="nova__grid" />
            <div className="nova__glow nova__glow--a" />
            <div className="nova__glow nova__glow--b" />


            {/* CABECERA */}

            <header className="nova__header">

                <div className="nova__identity">

                    <div className="nova__monogram">
                        SG
                    </div>

                    <div>
                        <strong>
                            SOUNDGUARD AI
                        </strong>

                        <span>
                            INTELLIGENT SOUND SYSTEM
                        </span>
                    </div>

                </div>


                <div className="nova__online">

                    <i />

                    <span>
                        CORE ONLINE
                    </span>

                </div>

            </header>


            {/* CONTENIDO */}

            <main className="nova__main">

                {/* TEXTO */}

                <section className="nova__copy">

                    <div className="nova__kicker">

                        <Sparkles size={13} />

                        <span>
                            EL SONIDO TAMBIÉN PUEDE HABLAR
                        </span>

                    </div>


                    <h1>
                        Escuchar
                        <span>
                            ya no es suficiente.
                        </span>
                    </h1>


                    <h2>
                        Bienvenido a nuestro
                        <strong>
                            sistema inteligente de
                            detección de sonidos.
                        </strong>
                    </h2>


                    <p className="nova__lead">
                        Imagina una inteligencia capaz
                        de escuchar lo que sucede a tu
                        alrededor, reconocer cuándo un
                        sonido merece atención y
                        transformarlo en información
                        que puedas comprender.
                    </p>


                    <div className="nova__quote">

                        <span className="nova__quote-line" />

                        <p>
                            Porque detrás de un golpe,
                            una alarma o una ruptura
                            puede existir una historia
                            que merece ser escuchada.
                        </p>

                    </div>


                    {/* CAPACIDADES */}

                    <div className="nova__features">

                        <article>

                            <span className="nova__feature-number">
                                01
                            </span>

                            <Waves size={19} />

                            <div>
                                <strong>
                                    Escucha
                                </strong>

                                <small>
                                    Captura el entorno acústico
                                </small>
                            </div>

                        </article>


                        <article>

                            <span className="nova__feature-number">
                                02
                            </span>

                            <BrainCircuit size={19} />

                            <div>
                                <strong>
                                    Comprende
                                </strong>

                                <small>
                                    Interpreta mediante IA
                                </small>
                            </div>

                        </article>


                        <article>

                            <span className="nova__feature-number">
                                03
                            </span>

                            <ShieldCheck size={19} />

                            <div>
                                <strong>
                                    Responde
                                </strong>

                                <small>
                                    Convierte sonido en eventos
                                </small>
                            </div>

                        </article>

                    </div>

                </section>


                {/* NÚCLEO SONORO */}

                <section className="nova__sonic">

                    <div className="sonic">

                        <div className="sonic__halo" />

                        <div className="sonic__ring sonic__ring--1" />

                        <div className="sonic__ring sonic__ring--2">
                            <i />
                        </div>

                        <div className="sonic__ring sonic__ring--3">
                            <i />
                        </div>


                        <div className="sonic__scanner" />


                        <div className="sonic__pulse sonic__pulse--1" />
                        <div className="sonic__pulse sonic__pulse--2" />


                        <div className="sonic__wave sonic__wave--left">

                            <i />
                            <i />
                            <i />
                            <i />
                            <i />
                            <i />
                            <i />

                        </div>


                        <div className="sonic__core">

                            <div className="sonic__core-inner">

                                <div className="sonic__core-glow" />

                                <Mic2
                                    size={64}
                                    strokeWidth={1.35}
                                />

                            </div>

                        </div>


                        <div className="sonic__wave sonic__wave--right">

                            <i />
                            <i />
                            <i />
                            <i />
                            <i />
                            <i />
                            <i />

                        </div>


                        <div className="sonic__label">

                            <span>
                                ACOUSTIC CORE
                            </span>

                            <strong>
                                {speaking
                                    ? "COMUNICANDO"
                                    : "ESCUCHANDO"}
                            </strong>

                        </div>

                    </div>


                    {/* ESTADO */}

                    <div className="nova__status">

                        <div className="nova__status-row">

                            <span>
                                {status}
                            </span>

                            <strong>
                                {Math.round(progress)}
                                <small>%</small>
                            </strong>

                        </div>


                        <div className="nova__progress">

                            <div
                                className="nova__progress-fill"
                                style={{
                                    width:
                                        `${progress}%`,
                                }}
                            />

                            <div
                                className="nova__progress-dot"
                                style={{
                                    left:
                                        `${progress}%`,
                                }}
                            />

                        </div>


                        <div className="nova__stages">

                            <span>
                                SENSOR
                            </span>

                            <span>
                                AUDIO
                            </span>

                            <span>
                                IA
                            </span>

                            <span>
                                ANÁLISIS
                            </span>

                            <span>
                                READY
                            </span>

                        </div>

                    </div>


                    {/* BOTONES */}

                    <div className="nova__actions">

                        <button
                            type="button"
                            className="nova__voice"
                            onClick={
                                speaking
                                    ? detenerVoz
                                    : hablar
                            }
                        >

                            {speaking
                                ? <VolumeX size={16} />
                                : <Volume2 size={16} />
                            }

                            <span>
                                {speaking
                                    ? "Silenciar"
                                    : "Escuchar bienvenida"}
                            </span>

                        </button>


                        <button
                            type="button"
                            className="nova__enter"
                            onClick={entrar}
                        >

                            Entrar

                            <ArrowRight size={16} />

                        </button>

                    </div>

                </section>

            </main>


            {/* PIE */}

            <footer className="nova__footer">

                <span>
                    ESCUCHA
                </span>

                <i />

                <span>
                    ANALIZA
                </span>

                <i />

                <span>
                    PROTEGE
                </span>

            </footer>

        </div>
    );
}