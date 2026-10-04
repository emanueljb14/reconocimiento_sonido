import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Activity,
    AlertTriangle,
    BarChart3,
    BrainCircuit,
    CalendarDays,
    Clock3,
    Database,
    RefreshCcw,
    ShieldCheck,
    Waves,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
    obtenerResumen,
    obtenerPorSonido,
    obtenerPorRiesgo,
    obtenerPorHora,
    obtenerPorDia,
} from "../../services/estadisticas";


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


function nombreSonido(valor) {
    return (
        NOMBRES_SONIDOS[valor] ||
        String(valor || "")
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letra) =>
                letra.toUpperCase()
            ) ||
        "Sin identificar"
    );
}


function obtenerArray(data) {
    if (Array.isArray(data)) {
        return data;
    }

    if (!data || typeof data !== "object") {
        return [];
    }

    const candidatos = [
        data.results,
        data.datos,
        data.items,
        data.data,
        data.resultados,
    ];

    const encontrado =
        candidatos.find(
            Array.isArray
        );

    if (encontrado) {
        return encontrado;
    }

    const interno =
        Object.values(data).find(
            Array.isArray
        );

    return interno || [];
}


function extraerValor(
    objeto,
    claves,
    fallback = 0
) {
    for (const clave of claves) {
        if (
            objeto &&
            objeto[clave] !== undefined &&
            objeto[clave] !== null
        ) {
            return objeto[clave];
        }
    }

    return fallback;
}


function normalizarCategoria(
    data,
    {
        clavesNombre = [],
        clavesValor = [],
        nombreFallback = "Sin nombre",
    } = {}
) {
    if (!data) {
        return [];
    }

    const filas =
        obtenerArray(data);

    if (filas.length > 0) {
        return filas.map(
            (fila) => {
                const nombre =
                    extraerValor(
                        fila,
                        clavesNombre,
                        nombreFallback
                    );

                const valor =
                    extraerValor(
                        fila,
                        clavesValor,
                        0
                    );

                return {
                    nombre,
                    valor: numero(valor),
                };
            }
        );
    }

    if (
        typeof data === "object"
    ) {
        return Object
            .entries(data)
            .filter(
                ([, value]) =>
                    typeof value ===
                    "number"
            )
            .map(
                ([key, value]) => ({
                    nombre: key,
                    valor: numero(value),
                })
            );
    }

    return [];
}


function normalizarPorSonido(data) {
    return normalizarCategoria(
        data,
        {
            clavesNombre: [
                "tipo_sonido",
                "sonido",
                "tipo",
                "nombre",
                "categoria",
            ],
            clavesValor: [
                "total",
                "cantidad",
                "conteo",
                "count",
                "valor",
                "value",
            ],
        }
    )
        .map(
            (item) => ({
                ...item,
                nombre:
                    nombreSonido(
                        item.nombre
                    ),
            })
        )
        .sort(
            (a, b) =>
                b.valor -
                a.valor
        );
}


function normalizarPorRiesgo(data) {
    return normalizarCategoria(
        data,
        {
            clavesNombre: [
                "nivel_riesgo",
                "riesgo",
                "nivel",
                "nombre",
                "categoria",
            ],
            clavesValor: [
                "total",
                "cantidad",
                "conteo",
                "count",
                "valor",
                "value",
            ],
        }
    )
        .map(
            (item) => ({
                ...item,
                nombre:
                    String(
                        item.nombre ||
                        "Sin nivel"
                    ).toUpperCase(),
            })
        )
        .sort(
            (a, b) =>
                b.valor -
                a.valor
        );
}


function normalizarPorHora(data) {
    return normalizarCategoria(
        data,
        {
            clavesNombre: [
                "hora",
                "hour",
                "franja",
                "periodo",
                "nombre",
            ],
            clavesValor: [
                "total",
                "cantidad",
                "conteo",
                "count",
                "valor",
                "value",
            ],
        }
    )
        .map(
            (item) => {
                let etiqueta =
                    String(
                        item.nombre
                    );

                if (
                    /^\d{1,2}$/.test(
                        etiqueta
                    )
                ) {
                    etiqueta =
                        `${etiqueta.padStart(
                            2,
                            "0"
                        )}:00`;
                }

                return {
                    ...item,
                    nombre: etiqueta,
                };
            }
        );
}


function normalizarPorDia(data) {
    return normalizarCategoria(
        data,
        {
            clavesNombre: [
                "fecha",
                "dia",
                "date",
                "periodo",
                "nombre",
            ],
            clavesValor: [
                "total",
                "cantidad",
                "conteo",
                "count",
                "valor",
                "value",
            ],
        }
    );
}


function formatearDia(valor) {
    if (!valor) {
        return "Sin fecha";
    }

    const d = new Date(valor);

    if (
        Number.isNaN(
            d.getTime()
        )
    ) {
        return String(valor);
    }

    return d.toLocaleDateString(
        "es-PE",
        {
            day: "2-digit",
            month: "short",
        }
    );
}


function riesgoEstilo(riesgo) {
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
            barra: "bg-fuchsia-400",
        };
    }

    if (r === "ALTO") {
        return {
            texto: "text-rose-300",
            fondo: "bg-rose-500/10",
            borde: "border-rose-500/25",
            barra: "bg-rose-400",
        };
    }

    if (r === "MEDIO") {
        return {
            texto: "text-amber-300",
            fondo: "bg-amber-500/10",
            borde: "border-amber-500/25",
            barra: "bg-amber-400",
        };
    }

    return {
        texto: "text-emerald-300",
        fondo: "bg-emerald-500/10",
        borde: "border-emerald-500/25",
        barra: "bg-emerald-400",
    };
}


function StatCard({
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
            <div
                className="
                    flex
                    items-start
                    justify-between
                    gap-4
                "
            >
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

                    <p
                        className="
                            mt-2
                            text-[10px]
                            leading-5
                            text-slate-500
                        "
                    >
                        {detail}
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


function Panel({
    eyebrow,
    title,
    icon: Icon,
    children,
    footer,
}) {
    return (
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
                        {eyebrow}
                    </span>

                    <h3
                        className="
                            mt-1
                            text-sm
                            font-semibold
                            text-white
                        "
                    >
                        {title}
                    </h3>
                </div>

                {Icon && (
                    <Icon
                        size={19}
                        className="
                            text-slate-600
                        "
                    />
                )}
            </div>

            <div className="p-5">
                {children}
            </div>

            {footer && (
                <div
                    className="
                        border-t
                        border-white/[0.05]
                        px-5
                        py-3
                        text-[9px]
                        text-slate-600
                    "
                >
                    {footer}
                </div>
            )}
        </article>
    );
}


function EmptyState({
    texto = "No hay datos suficientes.",
}) {
    return (
        <div
            className="
                grid
                min-h-[220px]
                place-items-center
                text-center
            "
        >
            <div>
                <BarChart3
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
                    {texto}
                </p>
            </div>
        </div>
    );
}


function BarrasHorizontales({
    datos,
    tipo = "sonido",
}) {
    const maximo =
        Math.max(
            1,
            ...datos.map(
                (item) =>
                    numero(
                        item.valor
                    )
            )
        );

    if (
        datos.length ===
        0
    ) {
        return (
            <EmptyState />
        );
    }

    return (
        <div className="space-y-4">
            {datos.map(
                (
                    item,
                    index
                ) => {
                    const ancho =
                        Math.max(
                            2,
                            (
                                numero(
                                    item.valor
                                ) /
                                maximo
                            ) *
                            100
                        );

                    const estilo =
                        tipo ===
                            "riesgo"
                            ? riesgoEstilo(
                                item.nombre
                            )
                            : null;

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
                                    gap-3
                                "
                            >
                                <span
                                    className={`
                                        text-[10px]
                                        ${estilo
                                            ? estilo.texto
                                            : "text-slate-400"
                                        }
                                    `}
                                >
                                    {
                                        item.nombre
                                    }
                                </span>

                                <strong
                                    className="
                                        text-[10px]
                                        text-white
                                    "
                                >
                                    {
                                        item.valor
                                    }
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
                                    className={`
                                        h-full
                                        rounded-full
                                        ${estilo
                                            ? estilo.barra
                                            : "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-lime-300"
                                        }
                                    `}
                                    style={{
                                        width:
                                            `${ancho}%`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                }
            )}
        </div>
    );
}


function GraficoColumnas({
    datos,
    formatearEtiqueta = (
        valor
    ) => valor,
}) {
    const maximo =
        Math.max(
            1,
            ...datos.map(
                (item) =>
                    numero(
                        item.valor
                    )
            )
        );

    if (
        datos.length ===
        0
    ) {
        return (
            <EmptyState />
        );
    }

    return (
        <div
            className="
                overflow-x-auto
                pb-2
            "
        >
            <div
                className="
                    flex
                    min-h-[250px]
                    min-w-[620px]
                    items-end
                    gap-2
                    pt-7
                "
            >
                {datos.map(
                    (
                        item,
                        index
                    ) => {
                        const alto =
                            Math.max(
                                3,
                                (
                                    numero(
                                        item.valor
                                    ) /
                                    maximo
                                ) *
                                100
                            );

                        return (
                            <div
                                key={`${item.nombre}-${index}`}
                                className="
                                    flex
                                    min-w-0
                                    flex-1
                                    flex-col
                                    items-center
                                    justify-end
                                "
                            >
                                <span
                                    className="
                                        mb-2
                                        text-[8px]
                                        font-semibold
                                        text-slate-500
                                    "
                                >
                                    {
                                        item.valor
                                    }
                                </span>

                                <div
                                    className="
                                        flex
                                        h-[175px]
                                        w-full
                                        max-w-10
                                        items-end
                                        overflow-hidden
                                        rounded-t-lg
                                        bg-white/[0.025]
                                    "
                                >
                                    <div
                                        className="
                                            w-full
                                            rounded-t-lg
                                            bg-gradient-to-t
                                            from-violet-600
                                            via-fuchsia-500
                                            to-lime-300
                                            transition-all
                                            duration-500
                                        "
                                        style={{
                                            height:
                                                `${alto}%`,
                                        }}
                                    />
                                </div>

                                <span
                                    className="
                                        mt-2
                                        max-w-[68px]
                                        truncate
                                        text-[8px]
                                        text-slate-600
                                    "
                                    title={
                                        String(
                                            item.nombre
                                        )
                                    }
                                >
                                    {formatearEtiqueta(
                                        item.nombre
                                    )}
                                </span>
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
}


export default function AdminStatistics() {
    const [
        resumen,
        setResumen,
    ] = useState(null);

    const [
        porSonido,
        setPorSonido,
    ] = useState([]);

    const [
        porRiesgo,
        setPorRiesgo,
    ] = useState([]);

    const [
        porHora,
        setPorHora,
    ] = useState([]);

    const [
        porDia,
        setPorDia,
    ] = useState([]);

    const [
        dias,
        setDias,
    ] = useState(7);

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


    const cargarDatos =
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

                    const [
                        resumenData,
                        sonidoData,
                        riesgoData,
                        horaData,
                        diaData,
                    ] =
                        await Promise.all([
                            obtenerResumen(),
                            obtenerPorSonido(),
                            obtenerPorRiesgo(),
                            obtenerPorHora(),
                            obtenerPorDia(
                                dias
                            ),
                        ]);

                    setResumen(
                        resumenData
                    );

                    setPorSonido(
                        normalizarPorSonido(
                            sonidoData
                        )
                    );

                    setPorRiesgo(
                        normalizarPorRiesgo(
                            riesgoData
                        )
                    );

                    setPorHora(
                        normalizarPorHora(
                            horaData
                        )
                    );

                    setPorDia(
                        normalizarPorDia(
                            diaData
                        )
                    );
                } catch (err) {
                    console.error(err);

                    if (err?.response) {
                        setError(
                            `Django respondió con error ${err.response.status}.`
                        );
                    } else {
                        setError(
                            "No se pudo conectar con el backend de estadísticas."
                        );
                    }
                } finally {
                    setCargando(false);
                    setActualizando(false);
                }
            },
            [dias]
        );


    useEffect(() => {
        cargarDatos();

        const interval =
            window.setInterval(
                () => {
                    cargarDatos(true);
                },
                20000
            );

        return () => {
            window.clearInterval(
                interval
            );
        };
    }, [cargarDatos]);


    const totalRiesgos =
        useMemo(
            () =>
                porRiesgo.reduce(
                    (
                        suma,
                        item
                    ) =>
                        suma +
                        numero(
                            item.valor
                        ),
                    0
                ),
            [porRiesgo]
        );


    const riesgoPrincipal =
        porRiesgo[0] ||
        null;


    const sonidoPrincipal =
        porSonido[0] ||
        null;


    return (
        <DashboardLayout
            title="Estadísticas"
            subtitle="Análisis real de las detecciones registradas en SoundGuard"
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
                                No se pudieron cargar
                                las estadísticas
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
                            Analítica acústica
                        </span>

                        <h2
                            className="
                                mt-1
                                text-lg
                                font-semibold
                                text-white
                            "
                        >
                            Comportamiento del sistema
                        </h2>

                        <p
                            className="
                                mt-1
                                max-w-2xl
                                text-[10px]
                                leading-5
                                text-slate-500
                            "
                        >
                            Los valores de esta vista se obtienen
                            de los endpoints estadísticos de Django.
                            No se generan eventos ni porcentajes
                            artificiales en el frontend.
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
                        <label
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-white/[0.07]
                                bg-white/[0.025]
                                px-3
                                py-2.5
                            "
                        >
                            <CalendarDays
                                size={13}
                                className="
                                    text-slate-600
                                "
                            />

                            <span
                                className="
                                    text-[9px]
                                    text-slate-500
                                "
                            >
                                Tendencia:
                            </span>

                            <select
                                value={dias}
                                onChange={(
                                    event
                                ) =>
                                    setDias(
                                        Number(
                                            event
                                                .target
                                                .value
                                        )
                                    )
                                }
                                className="
                                    bg-transparent
                                    text-[9px]
                                    font-semibold
                                    text-slate-300
                                    outline-none
                                "
                            >
                                <option value={7}>
                                    7 días
                                </option>
                                <option value={14}>
                                    14 días
                                </option>
                                <option value={30}>
                                    30 días
                                </option>
                            </select>
                        </label>

                        <button
                            type="button"
                            onClick={() =>
                                cargarDatos(
                                    true
                                )
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
                </section>


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
                                : numero(
                                    resumen
                                        ?.total_detecciones
                                )
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
                                : numero(
                                    resumen
                                        ?.detecciones_hoy
                                )
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
                                : numero(
                                    resumen
                                        ?.ultimas_24_horas
                                )
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
                                    resumen
                                        ?.confianza_promedio
                                )
                        }
                        detail="Promedio histórico calculado por el backend"
                        accent="rose"
                    />
                </section>


                <section
                    className="
                        grid
                        gap-4
                        xl:grid-cols-2
                    "
                >
                    <Panel
                        eyebrow="Distribución acústica"
                        title="Eventos por tipo de sonido"
                        icon={Waves}
                        footer={
                            sonidoPrincipal
                                ? `Clase con mayor número de registros: ${sonidoPrincipal.nombre} (${sonidoPrincipal.valor}).`
                                : "No hay una clase dominante disponible."
                        }
                    >
                        <BarrasHorizontales
                            datos={
                                porSonido
                            }
                        />
                    </Panel>


                    <Panel
                        eyebrow="Seguridad acústica"
                        title="Distribución por nivel de riesgo"
                        icon={ShieldCheck}
                        footer={
                            riesgoPrincipal
                                ? `${riesgoPrincipal.nombre}: ${riesgoPrincipal.valor} de ${totalRiesgos} registros clasificados por riesgo.`
                                : "No hay datos de riesgo disponibles."
                        }
                    >
                        <BarrasHorizontales
                            datos={
                                porRiesgo
                            }
                            tipo="riesgo"
                        />
                    </Panel>
                </section>


                <section
                    className="
                        grid
                        gap-4
                        xl:grid-cols-2
                    "
                >
                    <Panel
                        eyebrow="Actividad horaria"
                        title="Detecciones por hora"
                        icon={Clock3}
                        footer="Distribución temporal devuelta por /estadisticas/por-hora/."
                    >
                        <GraficoColumnas
                            datos={
                                porHora
                            }
                        />
                    </Panel>


                    <Panel
                        eyebrow="Tendencia temporal"
                        title={`Detecciones de los últimos ${dias} días`}
                        icon={CalendarDays}
                        footer={`Ventana solicitada al backend: ${dias} días.`}
                    >
                        <GraficoColumnas
                            datos={
                                porDia
                            }
                            formatearEtiqueta={
                                formatearDia
                            }
                        />
                    </Panel>
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
                                border-lime-400/15
                                bg-lime-400/[0.05]
                                text-lime-300
                            "
                        >
                            <BarChart3
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
                                Lectura de las métricas
                            </strong>

                            <p
                                className="
                                    mt-1
                                    max-w-4xl
                                    text-[9px]
                                    leading-5
                                    text-slate-600
                                "
                            >
                                Esta sección describe el historial
                                operativo de SoundGuard. La confianza
                                promedio corresponde a las detecciones
                                almacenadas y no debe confundirse con
                                la exactitud general del modelo de
                                machine learning. Las métricas de
                                entrenamiento y validación pertenecen
                                al módulo Modelo IA.
                            </p>
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

                    </span>

                    <span>

                    </span>
                </div>
            </div>
        </DashboardLayout>
    );
}
