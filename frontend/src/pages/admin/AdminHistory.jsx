import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock3,
    Database,
    Eye,
    Filter,
    History,
    RefreshCcw,
    Search,
    X,
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


function nombreSonido(tipo) {
    return (
        NOMBRES_SONIDOS[tipo] ||
        String(tipo || "")
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letra) =>
                letra.toUpperCase()
            ) ||
        "Sin identificar"
    );
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


function normalizarTexto(valor) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}


function obtenerFechaValida(fecha) {
    const d = new Date(fecha || 0);

    return Number.isNaN(d.getTime())
        ? null
        : d;
}


function formatearFechaCompleta(fecha) {
    const d =
        obtenerFechaValida(fecha);

    if (!d) {
        return "Sin fecha";
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


function formatearHora(fecha) {
    const d =
        obtenerFechaValida(fecha);

    if (!d) {
        return "—";
    }

    return d.toLocaleTimeString(
        "es-PE",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }
    );
}


function claveDia(fecha) {
    const d =
        obtenerFechaValida(fecha);

    if (!d) {
        return "sin-fecha";
    }

    const anio =
        d.getFullYear();

    const mes =
        String(
            d.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            d.getDate()
        ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}


function tituloDia(fecha) {
    const d =
        obtenerFechaValida(fecha);

    if (!d) {
        return "Sin fecha";
    }

    const hoy =
        new Date();

    const inicioHoy =
        new Date(
            hoy.getFullYear(),
            hoy.getMonth(),
            hoy.getDate()
        );

    const inicioFecha =
        new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate()
        );

    const diferenciaDias =
        Math.round(
            (
                inicioHoy -
                inicioFecha
            ) /
            86400000
        );

    if (diferenciaDias === 0) {
        return "Hoy";
    }

    if (diferenciaDias === 1) {
        return "Ayer";
    }

    return d.toLocaleDateString(
        "es-PE",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        }
    );
}


function estiloRiesgo(riesgo) {
    const r =
        String(riesgo || "")
            .toUpperCase();

    if (
        r === "CRITICO" ||
        r === "CRÍTICO"
    ) {
        return {
            texto: "text-fuchsia-300",
            fondo: "bg-fuchsia-500/10",
            borde: "border-fuchsia-500/25",
            punto: "bg-fuchsia-400",
        };
    }

    if (r === "ALTO") {
        return {
            texto: "text-rose-300",
            fondo: "bg-rose-500/10",
            borde: "border-rose-500/25",
            punto: "bg-rose-400",
        };
    }

    if (r === "MEDIO") {
        return {
            texto: "text-amber-300",
            fondo: "bg-amber-500/10",
            borde: "border-amber-500/25",
            punto: "bg-amber-400",
        };
    }

    return {
        texto: "text-emerald-300",
        fondo: "bg-emerald-500/10",
        borde: "border-emerald-500/25",
        punto: "bg-emerald-400",
    };
}


function TarjetaResumen({
    icon: Icon,
    label,
    valor,
    detalle,
    accent = "violet",
}) {
    const estilos = {
        violet:
            "border-violet-400/20 bg-violet-500/10 text-violet-300",
        lime:
            "border-lime-400/20 bg-lime-400/10 text-lime-300",
        cyan:
            "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
        rose:
            "border-rose-400/20 bg-rose-400/10 text-rose-300",
    };

    return (
        <article
            className="
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#0b1020]/80
                p-4
                shadow-[0_18px_50px_rgba(0,0,0,.16)]
            "
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <span
                        className="
                            text-[9px]
                            font-semibold
                            uppercase
                            tracking-[0.16em]
                            text-slate-500
                        "
                    >
                        {label}
                    </span>

                    <strong
                        className="
                            mt-4
                            block
                            text-3xl
                            font-semibold
                            tracking-[-0.04em]
                            text-white
                        "
                    >
                        {valor}
                    </strong>

                    <p
                        className="
                            mt-2
                            text-[10px]
                            leading-5
                            text-slate-500
                        "
                    >
                        {detalle}
                    </p>
                </div>

                <div
                    className={`
                        grid
                        h-9
                        w-9
                        shrink-0
                        place-items-center
                        rounded-xl
                        border
                        ${estilos[accent] || estilos.violet}
                    `}
                >
                    <Icon size={17} />
                </div>
            </div>
        </article>
    );
}


function FiltroSelect({
    value,
    onChange,
    children,
}) {
    return (
        <label className="relative block">
            <select
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                className="
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-[#070b15]
                    py-2.5
                    pl-3
                    pr-8
                    text-[10px]
                    text-slate-300
                    outline-none
                    transition
                    focus:border-violet-400/30
                "
            >
                {children}
            </select>

            <ChevronDown
                size={13}
                className="
                    pointer-events-none
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-700
                "
            />
        </label>
    );
}


function ModalDetalle({
    evento,
    onClose,
}) {
    if (!evento) {
        return null;
    }

    const riesgo =
        estiloRiesgo(
            evento.nivel_riesgo
        );

    return (
        <div
            className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                bg-black/70
                p-4
                backdrop-blur-sm
            "
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div
                className="
                    w-full
                    max-w-2xl
                    overflow-hidden
                    rounded-[24px]
                    border
                    border-white/[0.09]
                    bg-[#090e1b]
                    shadow-[0_30px_100px_rgba(0,0,0,.55)]
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
                                text-violet-300
                            "
                        >
                            Evento #{evento.id}
                        </span>

                        <h3
                            className="
                                mt-1
                                text-base
                                font-semibold
                                text-white
                            "
                        >
                            Detalle histórico
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            grid
                            h-9
                            w-9
                            place-items-center
                            rounded-xl
                            border
                            border-white/[0.07]
                            bg-white/[0.03]
                            text-slate-400
                            transition
                            hover:border-white/[0.15]
                            hover:text-white
                        "
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-5">
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
                                tracking-[0.16em]
                                text-slate-500
                            "
                        >
                            Clasificación registrada
                        </span>

                        <div
                            className="
                                mt-3
                                flex
                                flex-wrap
                                items-end
                                justify-between
                                gap-4
                            "
                        >
                            <strong
                                className="
                                    text-3xl
                                    font-semibold
                                    tracking-tight
                                    text-white
                                "
                            >
                                {nombreSonido(
                                    evento.tipo_sonido
                                )}
                            </strong>

                            <span
                                className="
                                    text-2xl
                                    font-light
                                    text-lime-300
                                "
                            >
                                {porcentajeTexto(
                                    evento.confianza
                                )}
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
                                            evento.confianza
                                        )}%`,
                                }}
                            />
                        </div>
                    </div>

                    <div
                        className="
                            mt-3
                            grid
                            gap-3
                            sm:grid-cols-2
                        "
                    >
                        <CampoDetalle
                            label="Fecha y hora"
                            value={
                                formatearFechaCompleta(
                                    evento.fecha
                                )
                            }
                        />

                        <CampoDetalle
                            label="Origen"
                            value={
                                evento.origen ||
                                "No indicado"
                            }
                        />

                        <CampoDetalle
                            label="Duración"
                            value={`${numero(
                                evento
                                    .duracion_segundos
                            ).toFixed(1)} s`}
                        />

                        <div
                            className="
                                rounded-xl
                                border
                                border-white/[0.06]
                                bg-white/[0.02]
                                p-4
                            "
                        >
                            <span
                                className="
                                    text-[8px]
                                    uppercase
                                    tracking-[0.15em]
                                    text-slate-600
                                "
                            >
                                Riesgo
                            </span>

                            <div className="mt-2">
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
                                        ${riesgo.texto}
                                        ${riesgo.fondo}
                                        ${riesgo.borde}
                                    `}
                                >
                                    <span
                                        className={`
                                            h-1.5
                                            w-1.5
                                            rounded-full
                                            ${riesgo.punto}
                                        `}
                                    />

                                    {evento.nivel_riesgo ||
                                        "bajo"}
                                </span>
                            </div>
                        </div>

                        {evento.puntuacion_riesgo !==
                            undefined && (
                                <CampoDetalle
                                    label="Puntuación de riesgo"
                                    value={numero(
                                        evento
                                            .puntuacion_riesgo
                                    ).toFixed(4)}
                                />
                            )}
                    </div>

                    {evento.tipo_sonido ===
                        "desconocido" && (
                            <div
                                className="
                                mt-4
                                flex
                                items-start
                                gap-3
                                rounded-2xl
                                border
                                border-amber-400/15
                                bg-amber-400/[0.04]
                                p-4
                            "
                            >
                                <AlertTriangle
                                    size={17}
                                    className="
                                    mt-0.5
                                    shrink-0
                                    text-amber-300
                                "
                                />

                                <div>
                                    <strong
                                        className="
                                        text-[10px]
                                        text-amber-200
                                    "
                                    >
                                        Evento registrado como desconocido
                                    </strong>

                                    <p
                                        className="
                                        mt-1
                                        text-[9px]
                                        leading-5
                                        text-amber-100/50
                                    "
                                    >
                                        El backend almacenó esta detección
                                        sin confirmar una clase porque no
                                        superó el umbral configurado.
                                    </p>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}


function CampoDetalle({
    label,
    value,
}) {
    return (
        <div
            className="
                rounded-xl
                border
                border-white/[0.06]
                bg-white/[0.02]
                p-4
            "
        >
            <span
                className="
                    text-[8px]
                    uppercase
                    tracking-[0.15em]
                    text-slate-600
                "
            >
                {label}
            </span>

            <strong
                className="
                    mt-2
                    block
                    text-xs
                    font-medium
                    text-slate-300
                "
            >
                {value}
            </strong>
        </div>
    );
}


export default function AdminHistory() {
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
        busqueda,
        setBusqueda,
    ] = useState("");

    const [
        sonido,
        setSonido,
    ] = useState("todos");

    const [
        riesgo,
        setRiesgo,
    ] = useState("todos");

    const [
        origen,
        setOrigen,
    ] = useState("todos");

    const [
        eventoSeleccionado,
        setEventoSeleccionado,
    ] = useState(null);


    const cargarHistorial =
        useCallback(
            async (
                silencioso = false
            ) => {
                try {
                    setError("");

                    if (silencioso) {
                        setActualizando(true);
                    } else {
                        setCargando(true);
                    }

                    const data =
                        await obtenerDetecciones();

                    setDetecciones(
                        obtenerLista(data)
                    );
                } catch (err) {
                    console.error(err);

                    if (err?.response) {
                        setError(
                            `Django respondió con error ${err.response.status}.`
                        );
                    } else {
                        setError(
                            "No se pudo conectar con el backend."
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
        cargarHistorial();

        const interval =
            window.setInterval(
                () => {
                    cargarHistorial(true);
                },
                15000
            );

        return () => {
            window.clearInterval(
                interval
            );
        };
    }, [cargarHistorial]);


    const ordenadas =
        useMemo(() => {
            return [...detecciones].sort(
                (a, b) => {
                    const fechaA =
                        obtenerFechaValida(
                            a?.fecha
                        )?.getTime() || 0;

                    const fechaB =
                        obtenerFechaValida(
                            b?.fecha
                        )?.getTime() || 0;

                    return fechaB - fechaA;
                }
            );
        }, [detecciones]);


    const sonidosDisponibles =
        useMemo(() => {
            return Array.from(
                new Set(
                    detecciones
                        .map(
                            (d) =>
                                d?.tipo_sonido
                        )
                        .filter(Boolean)
                )
            ).sort();
        }, [detecciones]);


    const origenesDisponibles =
        useMemo(() => {
            return Array.from(
                new Set(
                    detecciones
                        .map(
                            (d) =>
                                d?.origen
                        )
                        .filter(Boolean)
                )
            ).sort();
        }, [detecciones]);


    const filtradas =
        useMemo(() => {
            const termino =
                normalizarTexto(
                    busqueda
                );

            return ordenadas.filter(
                (d) => {
                    if (
                        sonido !==
                        "todos" &&
                        d?.tipo_sonido !==
                        sonido
                    ) {
                        return false;
                    }

                    if (
                        riesgo !==
                        "todos" &&
                        normalizarTexto(
                            d?.nivel_riesgo
                        ) !==
                        normalizarTexto(
                            riesgo
                        )
                    ) {
                        return false;
                    }

                    if (
                        origen !==
                        "todos" &&
                        d?.origen !==
                        origen
                    ) {
                        return false;
                    }

                    if (!termino) {
                        return true;
                    }

                    const texto = [
                        d?.id,
                        d?.tipo_sonido,
                        nombreSonido(
                            d?.tipo_sonido
                        ),
                        d?.nivel_riesgo,
                        d?.origen,
                        d?.fecha,
                    ]
                        .map(
                            normalizarTexto
                        )
                        .join(" ");

                    return texto.includes(
                        termino
                    );
                }
            );
        }, [
            ordenadas,
            busqueda,
            sonido,
            riesgo,
            origen,
        ]);


    const grupos =
        useMemo(() => {
            const mapa =
                new Map();

            filtradas.forEach(
                (evento) => {
                    const clave =
                        claveDia(
                            evento.fecha
                        );

                    if (
                        !mapa.has(
                            clave
                        )
                    ) {
                        mapa.set(
                            clave,
                            {
                                clave,
                                referencia:
                                    evento.fecha,
                                eventos: [],
                            }
                        );
                    }

                    mapa
                        .get(clave)
                        .eventos
                        .push(
                            evento
                        );
                }
            );

            return Array.from(
                mapa.values()
            );
        }, [filtradas]);


    const resumen =
        useMemo(() => {
            const total =
                detecciones.length;

            const desconocidos =
                detecciones.filter(
                    (d) =>
                        d?.tipo_sonido ===
                        "desconocido"
                ).length;

            const hoy =
                claveDia(
                    new Date()
                );

            const eventosHoy =
                detecciones.filter(
                    (d) =>
                        claveDia(
                            d?.fecha
                        ) === hoy
                ).length;

            const ultima =
                ordenadas[0] || null;

            return {
                total,
                desconocidos,
                eventosHoy,
                ultima,
            };
        }, [
            detecciones,
            ordenadas,
        ]);


    function limpiarFiltros() {
        setBusqueda("");
        setSonido(
            "todos"
        );
        setRiesgo(
            "todos"
        );
        setOrigen(
            "todos"
        );
    }


    return (
        <DashboardLayout
            title="Historial"
            subtitle="Línea de tiempo real de los eventos registrados por SoundGuard"
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
                                No se pudo cargar el historial
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
                        grid
                        grid-cols-1
                        gap-3
                        sm:grid-cols-2
                        xl:grid-cols-4
                    "
                >
                    <TarjetaResumen
                        icon={Database}
                        label="Eventos almacenados"
                        valor={
                            cargando
                                ? "..."
                                : resumen.total
                        }
                        detalle="Registros obtenidos directamente desde Django"
                        accent="violet"
                    />

                    <TarjetaResumen
                        icon={CalendarDays}
                        label="Eventos de hoy"
                        valor={
                            cargando
                                ? "..."
                                : resumen.eventosHoy
                        }
                        detalle="Actividad registrada durante la fecha actual"
                        accent="lime"
                    />

                    <TarjetaResumen
                        icon={AlertTriangle}
                        label="Desconocidos"
                        valor={
                            cargando
                                ? "..."
                                : resumen.desconocidos
                        }
                        detalle="Eventos que no superaron el umbral de clasificación"
                        accent="rose"
                    />

                    <TarjetaResumen
                        icon={Clock3}
                        label="Último evento"
                        valor={
                            cargando
                                ? "..."
                                : resumen.ultima
                                    ? formatearHora(
                                        resumen
                                            .ultima
                                            .fecha
                                    )
                                    : "—"
                        }
                        detalle={
                            resumen.ultima
                                ? nombreSonido(
                                    resumen
                                        .ultima
                                        .tipo_sonido
                                )
                                : "Aún no hay detecciones"
                        }
                        accent="cyan"
                    />
                </section>


                <section
                    className="
                        overflow-hidden
                        rounded-[24px]
                        border
                        border-white/[0.07]
                        bg-[#090e1b]
                        shadow-[0_20px_70px_rgba(0,0,0,.22)]
                    "
                >
                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            border-b
                            border-white/[0.06]
                            px-5
                            py-4
                            xl:flex-row
                            xl:items-center
                            xl:justify-between
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
                                <History
                                    size={13}
                                />

                                Línea de tiempo
                            </div>

                            <h2
                                className="
                                    mt-1
                                    text-base
                                    font-semibold
                                    text-white
                                "
                            >
                                Historial acústico
                            </h2>

                            <p
                                className="
                                    mt-1
                                    text-[10px]
                                    text-slate-500
                                "
                            >
                                {filtradas.length}
                                {" "}
                                evento
                                {filtradas.length === 1
                                    ? ""
                                    : "s"}
                                {" "}
                                coinciden con los filtros
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                cargarHistorial(
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
                    </div>


                    <div
                        className="
                            grid
                            gap-2
                            border-b
                            border-white/[0.05]
                            bg-white/[0.012]
                            p-4
                            md:grid-cols-2
                            xl:grid-cols-[1.7fr_1fr_1fr_1fr_auto]
                        "
                    >
                        <label className="relative block">
                            <Search
                                size={14}
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-600
                                "
                            />

                            <input
                                value={
                                    busqueda
                                }
                                onChange={(
                                    event
                                ) =>
                                    setBusqueda(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Buscar por ID, sonido, riesgo, origen..."
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-white/[0.07]
                                    bg-[#070b15]
                                    py-2.5
                                    pl-9
                                    pr-3
                                    text-[10px]
                                    text-slate-200
                                    outline-none
                                    transition
                                    placeholder:text-slate-700
                                    focus:border-violet-400/30
                                "
                            />
                        </label>


                        <FiltroSelect
                            value={
                                sonido
                            }
                            onChange={
                                setSonido
                            }
                        >
                            <option value="todos">
                                Todos los sonidos
                            </option>

                            {sonidosDisponibles.map(
                                (tipo) => (
                                    <option
                                        key={
                                            tipo
                                        }
                                        value={
                                            tipo
                                        }
                                    >
                                        {nombreSonido(
                                            tipo
                                        )}
                                    </option>
                                )
                            )}
                        </FiltroSelect>


                        <FiltroSelect
                            value={
                                riesgo
                            }
                            onChange={
                                setRiesgo
                            }
                        >
                            <option value="todos">
                                Todos los riesgos
                            </option>
                            <option value="bajo">
                                Bajo
                            </option>
                            <option value="medio">
                                Medio
                            </option>
                            <option value="alto">
                                Alto
                            </option>
                            <option value="critico">
                                Crítico
                            </option>
                        </FiltroSelect>


                        <FiltroSelect
                            value={
                                origen
                            }
                            onChange={
                                setOrigen
                            }
                        >
                            <option value="todos">
                                Todos los orígenes
                            </option>

                            {origenesDisponibles.map(
                                (item) => (
                                    <option
                                        key={
                                            item
                                        }
                                        value={
                                            item
                                        }
                                    >
                                        {item}
                                    </option>
                                )
                            )}
                        </FiltroSelect>


                        <button
                            type="button"
                            onClick={
                                limpiarFiltros
                            }
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-white/[0.07]
                                bg-white/[0.02]
                                px-4
                                py-2.5
                                text-[9px]
                                font-semibold
                                uppercase
                                tracking-wider
                                text-slate-500
                                transition
                                hover:text-white
                            "
                        >
                            <Filter
                                size={12}
                            />

                            Limpiar
                        </button>
                    </div>


                    <div className="p-5">
                        {cargando && (
                            <div
                                className="
                                    py-16
                                    text-center
                                    text-[10px]
                                    text-slate-600
                                "
                            >
                                Cargando historial desde
                                Django...
                            </div>
                        )}


                        {!cargando &&
                            grupos.length ===
                            0 && (
                                <div
                                    className="
                                        py-16
                                        text-center
                                    "
                                >
                                    <History
                                        size={28}
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
                                        No hay eventos para mostrar
                                    </strong>

                                    <p
                                        className="
                                            mt-1
                                            text-[9px]
                                            text-slate-600
                                        "
                                    >
                                        Cambia los filtros o
                                        realiza una nueva detección.
                                    </p>
                                </div>
                            )}


                        {!cargando &&
                            grupos.map(
                                (
                                    grupo,
                                    grupoIndex
                                ) => (
                                    <div
                                        key={
                                            grupo.clave
                                        }
                                        className={
                                            grupoIndex ===
                                                0
                                                ? ""
                                                : "mt-8"
                                        }
                                    >
                                        <div
                                            className="
                                                mb-4
                                                flex
                                                items-center
                                                gap-3
                                            "
                                        >
                                            <div
                                                className="
                                                    grid
                                                    h-8
                                                    w-8
                                                    place-items-center
                                                    rounded-xl
                                                    border
                                                    border-violet-400/15
                                                    bg-violet-500/[0.06]
                                                    text-violet-300
                                                "
                                            >
                                                <CalendarDays
                                                    size={14}
                                                />
                                            </div>

                                            <div>
                                                <strong
                                                    className="
                                                        block
                                                        text-xs
                                                        capitalize
                                                        text-slate-200
                                                    "
                                                >
                                                    {tituloDia(
                                                        grupo
                                                            .referencia
                                                    )}
                                                </strong>

                                                <span
                                                    className="
                                                        text-[9px]
                                                        text-slate-600
                                                    "
                                                >
                                                    {
                                                        grupo
                                                            .eventos
                                                            .length
                                                    }
                                                    {" "}
                                                    evento
                                                    {grupo
                                                        .eventos
                                                        .length ===
                                                        1
                                                        ? ""
                                                        : "s"}
                                                </span>
                                            </div>
                                        </div>


                                        <div
                                            className="
                                                relative
                                                ml-4
                                                border-l
                                                border-white/[0.06]
                                                pl-6
                                            "
                                        >
                                            {grupo.eventos.map(
                                                (
                                                    evento,
                                                    index
                                                ) => {
                                                    const estilo =
                                                        estiloRiesgo(
                                                            evento
                                                                .nivel_riesgo
                                                        );

                                                    const esDesconocido =
                                                        evento
                                                            .tipo_sonido ===
                                                        "desconocido";

                                                    return (
                                                        <article
                                                            key={
                                                                evento.id
                                                            }
                                                            className={`
                                                                relative
                                                                rounded-2xl
                                                                border
                                                                border-white/[0.06]
                                                                bg-white/[0.02]
                                                                p-4
                                                                transition
                                                                hover:border-white/[0.12]
                                                                hover:bg-white/[0.028]
                                                                ${index ===
                                                                    grupo
                                                                        .eventos
                                                                        .length -
                                                                    1
                                                                    ? ""
                                                                    : "mb-3"
                                                                }
                                                            `}
                                                        >
                                                            <span
                                                                className={`
                                                                    absolute
                                                                    -left-[31px]
                                                                    top-6
                                                                    h-2.5
                                                                    w-2.5
                                                                    rounded-full
                                                                    border-2
                                                                    border-[#090e1b]
                                                                    ${esDesconocido
                                                                        ? "bg-amber-300"
                                                                        : "bg-lime-300"
                                                                    }
                                                                `}
                                                            />

                                                            <div
                                                                className="
                                                                    flex
                                                                    flex-col
                                                                    gap-3
                                                                    lg:flex-row
                                                                    lg:items-center
                                                                    lg:justify-between
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
                                                                                text-sm
                                                                                font-semibold
                                                                                text-white
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
                                                                                px-2.5
                                                                                py-1
                                                                                text-[8px]
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

                                                                        {esDesconocido && (
                                                                            <span
                                                                                className="
                                                                                    rounded-full
                                                                                    border
                                                                                    border-amber-400/15
                                                                                    bg-amber-400/[0.04]
                                                                                    px-2.5
                                                                                    py-1
                                                                                    text-[8px]
                                                                                    font-semibold
                                                                                    uppercase
                                                                                    text-amber-300
                                                                                "
                                                                            >
                                                                                No confirmado
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <div
                                                                        className="
                                                                            mt-2
                                                                            flex
                                                                            flex-wrap
                                                                            gap-x-4
                                                                            gap-y-1
                                                                            text-[9px]
                                                                            text-slate-500
                                                                        "
                                                                    >
                                                                        <span
                                                                            className="
                                                                                inline-flex
                                                                                items-center
                                                                                gap-1.5
                                                                            "
                                                                        >
                                                                            <Clock3
                                                                                size={11}
                                                                            />

                                                                            {formatearHora(
                                                                                evento
                                                                                    .fecha
                                                                            )}
                                                                        </span>

                                                                        <span>
                                                                            Confianza{" "}
                                                                            <strong
                                                                                className="
                                                                                    font-medium
                                                                                    text-lime-300
                                                                                "
                                                                            >
                                                                                {porcentajeTexto(
                                                                                    evento
                                                                                        .confianza
                                                                                )}
                                                                            </strong>
                                                                        </span>

                                                                        <span>
                                                                            Duración{" "}
                                                                            {numero(
                                                                                evento
                                                                                    .duracion_segundos
                                                                            ).toFixed(
                                                                                1
                                                                            )}
                                                                            s
                                                                        </span>

                                                                        <span>
                                                                            Origen{" "}
                                                                            {evento.origen ||
                                                                                "—"}
                                                                        </span>

                                                                        <span>
                                                                            ID #{evento.id}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setEventoSeleccionado(
                                                                            evento
                                                                        )
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
                                                                    <Eye
                                                                        size={13}
                                                                    />

                                                                    Ver detalle
                                                                </button>
                                                            </div>
                                                        </article>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                    </div>
                </section>


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
                        SoundGuard AI · Historial real
                        de eventos
                    </span>

                    <span>
                        Django · PostgreSQL ·
                        Machine Learning
                    </span>
                </div>
            </div>


            <ModalDetalle
                evento={
                    eventoSeleccionado
                }
                onClose={() =>
                    setEventoSeleccionado(
                        null
                    )
                }
            />
        </DashboardLayout>
    );
}
