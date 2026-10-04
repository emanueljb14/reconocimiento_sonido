import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Download,
    Eye,
    Filter,
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


function formatearFechaCsv(fecha) {
    if (!fecha) {
        return "";
    }

    const d = new Date(fecha);

    if (Number.isNaN(d.getTime())) {
        return String(fecha);
    }

    return d.toISOString();
}


function estiloRiesgo(riesgo) {
    const r =
        String(riesgo || "")
            .toUpperCase();

    if (r === "CRITICO" || r === "CRÍTICO") {
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


function normalizarTexto(valor) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}


function csvSeguro(valor) {
    const texto = String(
        valor ?? ""
    );

    if (
        texto.includes(",") ||
        texto.includes('"') ||
        texto.includes("\n")
    ) {
        return `"${texto.replaceAll('"', '""')}"`;
    }

    return texto;
}


function Stat({
    icon: Icon,
    label,
    value,
    detail,
    accent = "violet",
}) {
    const estilos = {
        violet:
            "border-violet-400/20 bg-violet-500/10 text-violet-300",
        lime:
            "border-lime-400/20 bg-lime-400/10 text-lime-300",
        cyan:
            "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
        amber:
            "border-amber-400/20 bg-amber-400/10 text-amber-300",
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
                        {value}
                    </strong>

                    <span
                        className="
                            mt-2
                            block
                            text-[10px]
                            leading-5
                            text-slate-500
                        "
                    >
                        {detail}
                    </span>
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


function ModalDetalle({
    deteccion,
    onClose,
}) {
    if (!deteccion) {
        return null;
    }

    const riesgo =
        estiloRiesgo(
            deteccion?.nivel_riesgo
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
                            Registro #{deteccion.id}
                        </span>

                        <h3
                            className="
                                mt-1
                                text-base
                                font-semibold
                                text-white
                            "
                        >
                            Detalle de detección
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
                            grid
                            gap-3
                            sm:grid-cols-2
                        "
                    >
                        <div
                            className="
                                rounded-2xl
                                border
                                border-white/[0.06]
                                bg-white/[0.025]
                                p-4
                                sm:col-span-2
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
                                Sonido registrado
                            </span>

                            <div
                                className="
                                    mt-2
                                    flex
                                    flex-wrap
                                    items-end
                                    justify-between
                                    gap-3
                                "
                            >
                                <strong
                                    className="
                                        text-2xl
                                        font-semibold
                                        tracking-tight
                                        text-white
                                    "
                                >
                                    {nombreSonido(
                                        deteccion.tipo_sonido
                                    )}
                                </strong>

                                <span
                                    className="
                                        text-xl
                                        font-light
                                        text-lime-300
                                    "
                                >
                                    {porcentajeTexto(
                                        deteccion.confianza
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
                                                deteccion.confianza
                                            )}%`,
                                    }}
                                />
                            </div>
                        </div>

                        <DetalleCampo
                            label="Fecha"
                            value={formatearFecha(
                                deteccion.fecha
                            )}
                        />

                        <DetalleCampo
                            label="Origen"
                            value={
                                deteccion.origen ||
                                "No indicado"
                            }
                        />

                        <DetalleCampo
                            label="Duración"
                            value={`${numero(
                                deteccion
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
                                Nivel de riesgo
                            </span>

                            <div
                                className="
                                    mt-2
                                    flex
                                    items-center
                                "
                            >
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

                                    {deteccion.nivel_riesgo ||
                                        "bajo"}
                                </span>
                            </div>
                        </div>

                        {deteccion
                            .puntuacion_riesgo !==
                            undefined && (
                                <DetalleCampo
                                    label="Puntuación de riesgo"
                                    value={numero(
                                        deteccion
                                            .puntuacion_riesgo
                                    ).toFixed(4)}
                                />
                            )}
                    </div>

                    {deteccion.tipo_sonido ===
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
                                        Detección no confirmada
                                    </strong>

                                    <p
                                        className="
                                        mt-1
                                        text-[9px]
                                        leading-5
                                        text-amber-100/50
                                    "
                                    >
                                        El backend registró este
                                        evento como desconocido
                                        porque la predicción no
                                        alcanzó el umbral mínimo
                                        configurado.
                                    </p>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}


function DetalleCampo({
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


export default function AdminDetections() {
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
        filtroSonido,
        setFiltroSonido,
    ] = useState("todos");

    const [
        filtroRiesgo,
        setFiltroRiesgo,
    ] = useState("todos");

    const [
        filtroOrigen,
        setFiltroOrigen,
    ] = useState("todos");

    const [
        seleccionada,
        setSeleccionada,
    ] = useState(null);

    const [
        pagina,
        setPagina,
    ] = useState(1);

    const POR_PAGINA = 15;


    const cargar =
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
        cargar();

        const interval =
            window.setInterval(
                () => {
                    cargar(true);
                },
                15000
            );

        return () => {
            window.clearInterval(
                interval
            );
        };
    }, [cargar]);


    useEffect(() => {
        setPagina(1);
    }, [
        busqueda,
        filtroSonido,
        filtroRiesgo,
        filtroOrigen,
    ]);


    const ordenadas =
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
                        filtroSonido !==
                        "todos" &&
                        d?.tipo_sonido !==
                        filtroSonido
                    ) {
                        return false;
                    }

                    if (
                        filtroRiesgo !==
                        "todos" &&
                        normalizarTexto(
                            d?.nivel_riesgo
                        ) !==
                        normalizarTexto(
                            filtroRiesgo
                        )
                    ) {
                        return false;
                    }

                    if (
                        filtroOrigen !==
                        "todos" &&
                        d?.origen !==
                        filtroOrigen
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
            filtroSonido,
            filtroRiesgo,
            filtroOrigen,
        ]);


    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                filtradas.length /
                POR_PAGINA
            )
        );


    useEffect(() => {
        if (
            pagina >
            totalPaginas
        ) {
            setPagina(
                totalPaginas
            );
        }
    }, [
        pagina,
        totalPaginas,
    ]);


    const paginaActual =
        useMemo(() => {
            const inicio =
                (pagina - 1) *
                POR_PAGINA;

            return filtradas.slice(
                inicio,
                inicio + POR_PAGINA
            );
        }, [
            filtradas,
            pagina,
        ]);


    const estadisticas =
        useMemo(() => {
            const total =
                detecciones.length;

            const desconocidas =
                detecciones.filter(
                    (d) =>
                        d?.tipo_sonido ===
                        "desconocido"
                ).length;

            const confirmadas =
                total - desconocidas;

            const promedio =
                total > 0
                    ? detecciones.reduce(
                        (acum, d) =>
                            acum +
                            porcentaje(
                                d?.confianza
                            ),
                        0
                    ) / total
                    : 0;

            return {
                total,
                confirmadas,
                desconocidas,
                promedio,
            };
        }, [detecciones]);


    function limpiarFiltros() {
        setBusqueda("");
        setFiltroSonido(
            "todos"
        );
        setFiltroRiesgo(
            "todos"
        );
        setFiltroOrigen(
            "todos"
        );
    }


    function exportarCsv() {
        const encabezado = [
            "ID",
            "Fecha",
            "Sonido",
            "Confianza",
            "Riesgo",
            "Duracion_segundos",
            "Origen",
            "Puntuacion_riesgo",
        ];

        const filas =
            filtradas.map(
                (d) => [
                    d?.id,
                    formatearFechaCsv(
                        d?.fecha
                    ),
                    d?.tipo_sonido,
                    numero(
                        d?.confianza
                    ),
                    d?.nivel_riesgo,
                    numero(
                        d?.duracion_segundos
                    ),
                    d?.origen,
                    d?.puntuacion_riesgo ??
                    "",
                ]
            );

        const contenido = [
            encabezado,
            ...filas,
        ]
            .map(
                (fila) =>
                    fila
                        .map(csvSeguro)
                        .join(",")
            )
            .join("\n");

        const blob =
            new Blob(
                [contenido],
                {
                    type:
                        "text/csv;charset=utf-8;",
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const enlace =
            document.createElement(
                "a"
            );

        enlace.href = url;
        enlace.download =
            `soundguard_detecciones_${new Date()
                .toISOString()
                .slice(0, 10)}.csv`;

        document.body.appendChild(
            enlace
        );

        enlace.click();
        enlace.remove();

        URL.revokeObjectURL(
            url
        );
    }


    return (
        <DashboardLayout
            title="Registro de detecciones"
            subtitle="Consulta los eventos acústicos almacenados realmente en Django"
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
                                el registro
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
                    <Stat
                        icon={Activity}
                        label="Total registros"
                        value={
                            cargando
                                ? "..."
                                : estadisticas.total
                        }
                        detail="Eventos devueltos por /api/detecciones/"
                        accent="violet"
                    />

                    <Stat
                        icon={CheckCircle2}
                        label="Confirmados"
                        value={
                            cargando
                                ? "..."
                                : estadisticas.confirmadas
                        }
                        detail="Clasificaciones que no quedaron como desconocido"
                        accent="lime"
                    />

                    <Stat
                        icon={AlertTriangle}
                        label="Desconocidos"
                        value={
                            cargando
                                ? "..."
                                : estadisticas.desconocidas
                        }
                        detail="Predicciones que no superaron el umbral"
                        accent="amber"
                    />

                    <Stat
                        icon={Clock3}
                        label="Confianza promedio"
                        value={
                            cargando
                                ? "..."
                                : `${estadisticas.promedio.toFixed(
                                    1
                                )}%`
                        }
                        detail="Promedio calculado sobre los registros cargados"
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
                            <span
                                className="
                                    text-[9px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.18em]
                                    text-violet-300
                                "
                            >
                                Base de datos real
                            </span>

                            <h2
                                className="
                                    mt-1
                                    text-base
                                    font-semibold
                                    text-white
                                "
                            >
                                Detecciones acústicas
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
                                resultado
                                {filtradas.length === 1
                                    ? ""
                                    : "s"}
                                {" "}
                                con los filtros actuales
                            </p>
                        </div>

                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                            "
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    cargar(true)
                                }
                                disabled={
                                    actualizando
                                }
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-white/[0.07]
                                    bg-white/[0.025]
                                    px-3.5
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

                            <button
                                type="button"
                                onClick={
                                    exportarCsv
                                }
                                disabled={
                                    filtradas.length ===
                                    0
                                }
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-lime-400/15
                                    bg-lime-400/[0.05]
                                    px-3.5
                                    py-2.5
                                    text-[9px]
                                    font-semibold
                                    uppercase
                                    tracking-wider
                                    text-lime-300
                                    transition
                                    hover:border-lime-300/30
                                    hover:bg-lime-400/[0.08]
                                    disabled:opacity-40
                                "
                            >
                                <Download
                                    size={13}
                                />

                                Exportar CSV
                            </button>
                        </div>
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
                        <label
                            className="
                                relative
                                block
                            "
                        >
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
                                filtroSonido
                            }
                            onChange={
                                setFiltroSonido
                            }
                            icon={Filter}
                        >
                            <option value="todos">
                                Todos los sonidos
                            </option>

                            {sonidosDisponibles.map(
                                (tipo) => (
                                    <option
                                        value={
                                            tipo
                                        }
                                        key={
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
                                filtroRiesgo
                            }
                            onChange={
                                setFiltroRiesgo
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
                                filtroOrigen
                            }
                            onChange={
                                setFiltroOrigen
                            }
                        >
                            <option value="todos">
                                Todos los orígenes
                            </option>

                            {origenesDisponibles.map(
                                (origen) => (
                                    <option
                                        key={
                                            origen
                                        }
                                        value={
                                            origen
                                        }
                                    >
                                        {origen}
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
                            Limpiar
                        </button>
                    </div>


                    <div className="overflow-x-auto">
                        <table
                            className="
                                w-full
                                min-w-[930px]
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
                                    <th className="px-5 py-3 text-right">
                                        Acción
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginaActual.map(
                                    (d) => {
                                        const riesgo =
                                            estiloRiesgo(
                                                d
                                                    ?.nivel_riesgo
                                            );

                                        const desconocido =
                                            d
                                                ?.tipo_sonido ===
                                            "desconocido";

                                        return (
                                            <tr
                                                key={
                                                    d.id
                                                }
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
                                                        font-mono
                                                        text-slate-600
                                                    "
                                                >
                                                    #
                                                    {
                                                        d.id
                                                    }
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

                                                <td className="px-5 py-3.5">
                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                        "
                                                    >
                                                        <span
                                                            className={`
                                                                h-1.5
                                                                w-1.5
                                                                rounded-full
                                                                ${desconocido
                                                                    ? "bg-amber-300"
                                                                    : "bg-lime-300"
                                                                }
                                                            `}
                                                        />

                                                        <span
                                                            className="
                                                                font-medium
                                                                text-slate-200
                                                            "
                                                        >
                                                            {nombreSonido(
                                                                d
                                                                    .tipo_sonido
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-3.5">
                                                    <div className="w-28">
                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                justify-between
                                                                gap-2
                                                            "
                                                        >
                                                            <span
                                                                className="
                                                                    text-lime-300
                                                                "
                                                            >
                                                                {porcentajeTexto(
                                                                    d
                                                                        .confianza
                                                                )}
                                                            </span>
                                                        </div>

                                                        <div
                                                            className="
                                                                mt-1.5
                                                                h-1
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
                                                                        `${porcentaje(
                                                                            d
                                                                                .confianza
                                                                        )}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
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
                                                            ${riesgo.texto}
                                                            ${riesgo.fondo}
                                                            ${riesgo.borde}
                                                        `}
                                                    >
                                                        <span
                                                            className={`
                                                                h-1
                                                                w-1
                                                                rounded-full
                                                                ${riesgo.punto}
                                                            `}
                                                        />

                                                        {d
                                                            .nivel_riesgo ||
                                                            "bajo"}
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
                                                        d
                                                            .duracion_segundos
                                                    ).toFixed(
                                                        1
                                                    )}
                                                    s
                                                </td>

                                                <td
                                                    className="
                                                        px-5
                                                        py-3.5
                                                        text-slate-500
                                                    "
                                                >
                                                    {d.origen ||
                                                        "—"}
                                                </td>

                                                <td
                                                    className="
                                                        px-5
                                                        py-3.5
                                                        text-right
                                                    "
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSeleccionada(
                                                                d
                                                            )
                                                        }
                                                        className="
                                                            inline-grid
                                                            h-8
                                                            w-8
                                                            place-items-center
                                                            rounded-lg
                                                            border
                                                            border-violet-400/10
                                                            bg-violet-400/[0.04]
                                                            text-violet-300
                                                            transition
                                                            hover:border-violet-300/30
                                                            hover:bg-violet-400/[0.08]
                                                        "
                                                        title="Ver detalle"
                                                    >
                                                        <Eye
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>


                        {!cargando &&
                            paginaActual.length ===
                            0 && (
                                <div
                                    className="
                                        py-16
                                        text-center
                                    "
                                >
                                    <Activity
                                        size={26}
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
                                        para mostrar
                                    </strong>

                                    <p
                                        className="
                                            mt-1
                                            text-[9px]
                                            text-slate-600
                                        "
                                    >
                                        Cambia los filtros o
                                        realiza una nueva
                                        detección.
                                    </p>
                                </div>
                            )}


                        {cargando && (
                            <div
                                className="
                                    py-16
                                    text-center
                                    text-[10px]
                                    text-slate-600
                                "
                            >
                                Cargando registros desde
                                Django...
                            </div>
                        )}
                    </div>


                    <div
                        className="
                            flex
                            flex-col
                            gap-3
                            border-t
                            border-white/[0.05]
                            px-5
                            py-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >
                        <span
                            className="
                                text-[9px]
                                text-slate-600
                            "
                        >
                            Página {pagina} de{" "}
                            {totalPaginas} ·{" "}
                            {filtradas.length} registros
                        </span>

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setPagina(
                                        (actual) =>
                                            Math.max(
                                                1,
                                                actual -
                                                1
                                            )
                                    )
                                }
                                disabled={
                                    pagina <= 1
                                }
                                className="
                                    inline-flex
                                    items-center
                                    gap-1
                                    rounded-lg
                                    border
                                    border-white/[0.07]
                                    bg-white/[0.02]
                                    px-3
                                    py-2
                                    text-[9px]
                                    text-slate-400
                                    transition
                                    hover:text-white
                                    disabled:cursor-not-allowed
                                    disabled:opacity-30
                                "
                            >
                                <ChevronLeft
                                    size={13}
                                />
                                Anterior
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setPagina(
                                        (actual) =>
                                            Math.min(
                                                totalPaginas,
                                                actual +
                                                1
                                            )
                                    )
                                }
                                disabled={
                                    pagina >=
                                    totalPaginas
                                }
                                className="
                                    inline-flex
                                    items-center
                                    gap-1
                                    rounded-lg
                                    border
                                    border-white/[0.07]
                                    bg-white/[0.02]
                                    px-3
                                    py-2
                                    text-[9px]
                                    text-slate-400
                                    transition
                                    hover:text-white
                                    disabled:cursor-not-allowed
                                    disabled:opacity-30
                                "
                            >
                                Siguiente
                                <ChevronRight
                                    size={13}
                                />
                            </button>
                        </div>
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
                        SoundGuard AI · Registro real
                        de detecciones
                    </span>

                    <span>
                        Django · PostgreSQL ·
                        Machine Learning
                    </span>
                </div>
            </div>


            <ModalDetalle
                deteccion={
                    seleccionada
                }
                onClose={() =>
                    setSeleccionada(null)
                }
            />
        </DashboardLayout>
    );
}


function FiltroSelect({
    value,
    onChange,
    children,
    icon: Icon,
}) {
    return (
        <label className="relative block">
            {Icon && (
                <Icon
                    size={13}
                    className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-600
                    "
                />
            )}

            <select
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                className={`
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-[#070b15]
                    py-2.5
                    pr-8
                    text-[10px]
                    text-slate-300
                    outline-none
                    transition
                    focus:border-violet-400/30
                    ${Icon
                        ? "pl-9"
                        : "pl-3"
                    }
                `}
            >
                {children}
            </select>

            <ChevronRight
                size={12}
                className="
                    pointer-events-none
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    rotate-90
                    text-slate-700
                "
            />
        </label>
    );
}
