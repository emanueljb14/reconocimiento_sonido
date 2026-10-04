import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Database,
    FileAudio,
    Filter,
    Gauge,
    HardDrive,
    LoaderCircle,
    Mic2,
    Plus,
    RefreshCcw,
    Search,
    Trash2,
    Upload,
    Waves,
    X,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
    crearMuestraDataset,
    crearMuestraDesdeGrabacion,
    eliminarMuestraDataset,
    obtenerMuestrasDataset,
} from "../../services/dataset";

import {
    grabarWav,
} from "../../utils/grabarWav";


const CLASES = [
    {
        value: "golpe",
        label: "Golpe",
    },
    {
        value: "puerta",
        label: "Puerta",
    },
    {
        value: "alarma",
        label: "Alarma",
    },
    {
        value: "aplausos",
        label: "Aplausos",
    },
    {
        value: "vidrio",
        label: "Vidrio",
    },
    {
        value: "ruido_elevado",
        label: "Ruido elevado",
    },
];

const POR_PAGINA = 20;


function nombreClase(
    value
) {
    return (
        CLASES.find(
            (item) =>
                item.value === value
        )?.label ||
        value ||
        "Sin clase"
    );
}


function listaDesdeRespuesta(
    data
) {
    if (
        Array.isArray(data)
    ) {
        return data;
    }

    if (
        Array.isArray(
            data?.resultados
        )
    ) {
        return data.resultados;
    }

    if (
        Array.isArray(
            data?.results
        )
    ) {
        return data.results;
    }

    if (
        Array.isArray(
            data?.items
        )
    ) {
        return data.items;
    }

    return [];
}


function formatearFecha(
    fecha
) {
    if (!fecha) {
        return "Sin fecha";
    }

    const valor =
        new Date(fecha);

    if (
        Number.isNaN(
            valor.getTime()
        )
    ) {
        return fecha;
    }

    return valor.toLocaleString(
        "es-PE",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }
    );
}


function formatearBytes(
    bytes
) {
    const valor =
        Number(bytes);

    if (
        !Number.isFinite(valor) ||
        valor < 0
    ) {
        return "—";
    }

    if (
        valor < 1024
    ) {
        return `${valor} B`;
    }

    if (
        valor < 1024 * 1024
    ) {
        return `${(
            valor / 1024
        ).toFixed(1)} KB`;
    }

    return `${(
        valor /
        (1024 * 1024)
    ).toFixed(2)} MB`;
}


function obtenerMensajeError(
    error
) {
    const data =
        error?.response?.data;

    if (
        typeof data?.detail ===
        "string"
    ) {
        return data.detail;
    }

    if (
        typeof data?.audio?.[0] ===
        "string"
    ) {
        return data.audio[0];
    }

    if (
        typeof data?.clase?.[0] ===
        "string"
    ) {
        return data.clase[0];
    }

    if (
        typeof data?.origen?.[0] ===
        "string"
    ) {
        return data.origen[0];
    }

    return (
        error?.message ||
        "Ocurrió un error inesperado."
    );
}


function TarjetaResumen({
    icono: Icono,
    etiqueta,
    valor,
    detalle,
}) {
    return (
        <article
            className="
                rounded-2xl
                border
                border-white/[0.07]
                bg-[#090f1d]
                p-4
                shadow-[0_18px_60px_rgba(0,0,0,.16)]
            "
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                        {etiqueta}
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                        {valor}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                        {detalle}
                    </p>
                </div>

                <div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06] text-cyan-300">
                    <Icono size={18} />
                </div>
            </div>
        </article>
    );
}


function BadgeClase({
    clase,
}) {
    return (
        <span
            className="
                inline-flex
                items-center
                rounded-full
                border
                border-cyan-400/15
                bg-cyan-400/[0.06]
                px-2.5
                py-1
                text-[11px]
                font-medium
                text-cyan-200
            "
        >
            {nombreClase(clase)}
        </span>
    );
}


function ModalNuevaMuestra({
    abierto,
    onCerrar,
    onGuardado,
}) {
    const [
        modo,
        setModo,
    ] = useState(
        "archivo"
    );

    const [
        clase,
        setClase,
    ] = useState(
        "golpe"
    );

    const [
        descripcion,
        setDescripcion,
    ] = useState("");

    const [
        archivo,
        setArchivo,
    ] = useState(null);

    const [
        grabacion,
        setGrabacion,
    ] = useState(null);

    const [
        grabando,
        setGrabando,
    ] = useState(false);

    const [
        segundos,
        setSegundos,
    ] = useState(0);

    const [
        guardando,
        setGuardando,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        exito,
        setExito,
    ] = useState("");

    const previewUrl =
        useMemo(() => {
            const fuente =
                modo === "archivo"
                    ? archivo
                    : grabacion;

            if (!fuente) {
                return "";
            }

            return URL.createObjectURL(
                fuente
            );
        }, [
            archivo,
            grabacion,
            modo,
        ]);


    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(
                    previewUrl
                );
            }
        };
    }, [previewUrl]);


    useEffect(() => {
        if (!abierto) {
            setError("");
            setExito("");
            setArchivo(null);
            setGrabacion(null);
            setDescripcion("");
            setGrabando(false);
            setSegundos(0);
        }
    }, [abierto]);


    if (!abierto) {
        return null;
    }


    async function grabar() {
        if (grabando) {
            return;
        }

        let intervalo;

        try {
            setError("");
            setExito("");
            setGrabacion(null);
            setGrabando(true);
            setSegundos(3);

            intervalo =
                setInterval(() => {
                    setSegundos(
                        (actual) =>
                            Math.max(
                                0,
                                actual - 1
                            )
                    );
                }, 1000);

            const blob =
                await grabarWav(3);

            setGrabacion(
                blob
            );

        } catch (err) {
            if (
                err?.name ===
                "NotAllowedError"
            ) {
                setError(
                    "Debes permitir el acceso al micrófono."
                );
            } else {
                setError(
                    obtenerMensajeError(
                        err
                    )
                );
            }

        } finally {
            clearInterval(
                intervalo
            );

            setGrabando(false);
            setSegundos(0);
        }
    }


    async function guardar() {
        if (guardando) {
            return;
        }

        if (
            modo === "archivo" &&
            !archivo
        ) {
            setError(
                "Selecciona un archivo de audio."
            );
            return;
        }

        if (
            modo === "microfono" &&
            !grabacion
        ) {
            setError(
                "Primero realiza una grabación."
            );
            return;
        }

        try {
            setGuardando(true);
            setError("");
            setExito("");

            if (
                modo === "archivo"
            ) {
                await crearMuestraDataset({
                    archivo,
                    clase,
                    origen: "archivo",
                    descripcion,
                });
            } else {
                await crearMuestraDesdeGrabacion({
                    blob: grabacion,
                    clase,
                    descripcion,
                });
            }

            setExito(
                "La muestra fue registrada correctamente."
            );

            await onGuardado();

            setTimeout(() => {
                onCerrar();
            }, 450);

        } catch (err) {
            setError(
                obtenerMensajeError(
                    err
                )
            );

        } finally {
            setGuardando(false);
        }
    }


    return (
        <div
            className="
                fixed
                inset-0
                z-[80]
                grid
                place-items-center
                bg-black/70
                p-4
                backdrop-blur-sm
            "
        >
            <section
                className="
                    max-h-[92vh]
                    w-full
                    max-w-2xl
                    overflow-y-auto
                    rounded-[24px]
                    border
                    border-white/[0.08]
                    bg-[#080e1b]
                    shadow-[0_30px_100px_rgba(0,0,0,.55)]
                "
            >
                <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-5 md:px-6">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                            Dataset local
                        </p>

                        <h2 className="mt-1 text-xl font-semibold text-white">
                            Registrar nueva muestra
                        </h2>

                        <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                            El audio se guardará en dataset_local y quedará registrado en PostgreSQL.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCerrar}
                        className="grid h-9 w-9 place-items-center rounded-xl border border-white/[0.07] text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
                    >
                        <X size={17} />
                    </button>
                </div>


                <div className="space-y-5 p-5 md:p-6">
                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.06] bg-black/20 p-1">
                        <button
                            type="button"
                            onClick={() =>
                                setModo(
                                    "archivo"
                                )
                            }
                            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition ${modo === "archivo"
                                    ? "bg-cyan-400/10 text-cyan-200"
                                    : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            <Upload size={15} />
                            Subir archivo
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setModo(
                                    "microfono"
                                )
                            }
                            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition ${modo === "microfono"
                                    ? "bg-cyan-400/10 text-cyan-200"
                                    : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            <Mic2 size={15} />
                            Grabar micrófono
                        </button>
                    </div>


                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                            <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                                Clase real del sonido
                            </span>

                            <select
                                value={clase}
                                onChange={(event) =>
                                    setClase(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-white/[0.08] bg-[#0c1424] px-3 py-3 text-sm text-slate-200 outline-none transition focus:border-cyan-400/30"
                            >
                                {CLASES.map(
                                    (item) => (
                                        <option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </option>
                                    )
                                )}
                            </select>
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                                Origen
                            </span>

                            <div className="flex h-[46px] items-center rounded-xl border border-white/[0.08] bg-[#0c1424] px-3 text-sm text-slate-300">
                                {modo === "archivo"
                                    ? "Archivo"
                                    : "Micrófono"}
                            </div>
                        </label>
                    </div>


                    {modo === "archivo" ? (
                        <label
                            className="
                                flex
                                min-h-[150px]
                                cursor-pointer
                                flex-col
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-dashed
                                border-white/[0.12]
                                bg-white/[0.02]
                                p-5
                                text-center
                                transition
                                hover:border-cyan-400/25
                                hover:bg-cyan-400/[0.025]
                            "
                        >
                            <FileAudio
                                size={28}
                                className="text-cyan-300"
                            />

                            <p className="mt-3 text-sm font-medium text-slate-200">
                                {archivo
                                    ? archivo.name
                                    : "Seleccionar WAV, FLAC u OGG"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Máximo 15 MB. El backend validará el audio.
                            </p>

                            <input
                                type="file"
                                accept=".wav,.flac,.ogg,audio/wav,audio/flac,audio/ogg"
                                className="hidden"
                                onChange={(event) => {
                                    setError("");
                                    setArchivo(
                                        event.target
                                            .files?.[0] ||
                                        null
                                    );
                                }}
                            />
                        </label>
                    ) : (
                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-center">
                            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-violet-400/15 bg-violet-400/[0.07] text-violet-200">
                                {grabando ? (
                                    <Waves
                                        size={25}
                                        className="animate-pulse"
                                    />
                                ) : (
                                    <Mic2 size={25} />
                                )}
                            </div>

                            <p className="mt-3 text-sm font-medium text-slate-200">
                                {grabando
                                    ? `Grabando… ${segundos}s`
                                    : grabacion
                                        ? "Grabación lista"
                                        : "Captura de 3 segundos"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Se utilizará la misma captura WAV del detector.
                            </p>

                            <button
                                type="button"
                                disabled={grabando}
                                onClick={grabar}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/[0.08] px-4 py-2.5 text-xs font-medium text-violet-100 transition hover:bg-violet-400/[0.13] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {grabando ? (
                                    <LoaderCircle
                                        size={15}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Mic2 size={15} />
                                )}

                                {grabando
                                    ? "Capturando"
                                    : grabacion
                                        ? "Grabar nuevamente"
                                        : "Iniciar grabación"}
                            </button>
                        </div>
                    )}


                    {previewUrl && (
                        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                Vista previa
                            </p>

                            <audio
                                controls
                                src={previewUrl}
                                className="w-full"
                            />
                        </div>
                    )}


                    <label className="block">
                        <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                            Descripción opcional
                        </span>

                        <textarea
                            value={descripcion}
                            onChange={(event) =>
                                setDescripcion(
                                    event.target.value
                                )
                            }
                            maxLength={1000}
                            rows={3}
                            placeholder="Ej.: golpe grabado a dos metros del micrófono..."
                            className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#0c1424] px-3 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-cyan-400/30"
                        />
                    </label>


                    {error && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-3 py-3 text-xs leading-5 text-red-200">
                            <AlertTriangle
                                size={16}
                                className="mt-0.5 shrink-0"
                            />
                            {error}
                        </div>
                    )}

                    {exito && (
                        <div className="flex items-start gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-3 text-xs leading-5 text-emerald-200">
                            <CheckCircle2
                                size={16}
                                className="mt-0.5 shrink-0"
                            />
                            {exito}
                        </div>
                    )}


                    <div className="flex flex-col-reverse gap-2 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onCerrar}
                            className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            disabled={guardando}
                            onClick={guardar}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-[#03121d] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {guardando ? (
                                <LoaderCircle
                                    size={15}
                                    className="animate-spin"
                                />
                            ) : (
                                <Database size={15} />
                            )}

                            {guardando
                                ? "Registrando…"
                                : "Registrar muestra"}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}


export default function AdminDataset() {
    const [
        muestras,
        setMuestras,
    ] = useState([]);

    const [
        totalBackend,
        setTotalBackend,
    ] = useState(0);

    const [
        cargando,
        setCargando,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const [
        busqueda,
        setBusqueda,
    ] = useState("");

    const [
        clase,
        setClase,
    ] = useState("");

    const [
        origen,
        setOrigen,
    ] = useState("");

    const [
        pagina,
        setPagina,
    ] = useState(1);

    const [
        modalAbierto,
        setModalAbierto,
    ] = useState(false);

    const [
        eliminandoId,
        setEliminandoId,
    ] = useState(null);


    const cargar =
        useCallback(
            async (
                silencioso = false
            ) => {
                try {
                    if (!silencioso) {
                        setCargando(true);
                    }

                    setError("");

                    const data =
                        await obtenerMuestrasDataset();

                    const lista =
                        listaDesdeRespuesta(
                            data
                        );

                    setMuestras(
                        lista
                    );

                    setTotalBackend(
                        Number(
                            data?.total ??
                            lista.length
                        )
                    );

                } catch (err) {
                    setError(
                        obtenerMensajeError(
                            err
                        )
                    );

                } finally {
                    if (!silencioso) {
                        setCargando(false);
                    }
                }
            },
            []
        );


    useEffect(() => {
        cargar();

        const intervalo =
            setInterval(
                () =>
                    cargar(true),
                30000
            );

        return () =>
            clearInterval(
                intervalo
            );
    }, [cargar]);


    useEffect(() => {
        setPagina(1);
    }, [
        busqueda,
        clase,
        origen,
    ]);


    const conteoClases =
        useMemo(() => {
            const mapa = {};

            for (
                const item of muestras
            ) {
                mapa[item.clase] =
                    (mapa[item.clase] || 0) +
                    1;
            }

            return mapa;
        }, [muestras]);


    const origenes =
        useMemo(() => {
            let archivo = 0;
            let microfono = 0;

            for (
                const item of muestras
            ) {
                if (
                    item.origen ===
                    "microfono"
                ) {
                    microfono += 1;
                } else {
                    archivo += 1;
                }
            }

            return {
                archivo,
                microfono,
            };
        }, [muestras]);


    const filtradas =
        useMemo(() => {
            const texto =
                busqueda
                    .trim()
                    .toLowerCase();

            return muestras.filter(
                (item) => {
                    if (
                        clase &&
                        item.clase !== clase
                    ) {
                        return false;
                    }

                    if (
                        origen &&
                        item.origen !== origen
                    ) {
                        return false;
                    }

                    if (!texto) {
                        return true;
                    }

                    const bolsa = [
                        item.nombre_archivo,
                        item.archivo_relativo,
                        item.descripcion,
                        item.clase,
                        nombreClase(
                            item.clase
                        ),
                        item.origen,
                        item.sha256,
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return bolsa.includes(
                        texto
                    );
                }
            );
        }, [
            muestras,
            busqueda,
            clase,
            origen,
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


    const visibles =
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


    async function eliminar(
        muestra
    ) {
        const confirmar =
            window.confirm(
                `¿Eliminar definitivamente "${muestra.nombre_archivo}"?\n\n` +
                "También se eliminará el archivo físico de dataset_local."
            );

        if (!confirmar) {
            return;
        }

        try {
            setEliminandoId(
                muestra.id
            );

            setError("");

            await eliminarMuestraDataset(
                muestra.id
            );

            await cargar(true);

        } catch (err) {
            setError(
                obtenerMensajeError(
                    err
                )
            );

        } finally {
            setEliminandoId(
                null
            );
        }
    }


    return (
        <DashboardLayout
            title="Dataset de audio"
            subtitle="Gestión de muestras acústicas registradas para SoundGuard"
        >
            <div className="mx-auto max-w-[1500px] space-y-5">


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
                        shadow-[0_20px_80px_rgba(0,0,0,.25)]
                        md:px-7
                    "
                >
                    <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-cyan-500/[0.07] blur-[90px]" />

                    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                                <Database size={14} />
                                Repositorio de entrenamiento
                            </div>

                            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                                Dataset acústico local
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Las muestras mostradas provienen del endpoint real de Django.
                                Los archivos nuevos se almacenan en dataset_local y quedan
                                registrados en PostgreSQL.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={() =>
                                    cargar()
                                }
                                disabled={cargando}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-50"
                            >
                                <RefreshCcw
                                    size={15}
                                    className={
                                        cargando
                                            ? "animate-spin"
                                            : ""
                                    }
                                />
                                Actualizar
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setModalAbierto(
                                        true
                                    )
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-[#03121d] transition hover:bg-cyan-300"
                            >
                                <Plus size={16} />
                                Nueva muestra
                            </button>
                        </div>
                    </div>
                </section>


                {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-400/[0.055] px-4 py-3 text-xs leading-5 text-red-200">
                        <AlertTriangle
                            size={17}
                            className="mt-0.5 shrink-0"
                        />
                        {error}
                    </div>
                )}


                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <TarjetaResumen
                        icono={Database}
                        etiqueta="Muestras registradas"
                        valor={
                            cargando
                                ? "…"
                                : totalBackend.toLocaleString(
                                    "es-PE"
                                )
                        }
                        detalle="Registros devueltos por Django"
                    />

                    <TarjetaResumen
                        icono={Mic2}
                        etiqueta="Capturas de micrófono"
                        valor={
                            origenes.microfono.toLocaleString(
                                "es-PE"
                            )
                        }
                        detalle="Muestras marcadas como microfono"
                    />

                    <TarjetaResumen
                        icono={HardDrive}
                        etiqueta="Archivos"
                        valor={
                            origenes.archivo.toLocaleString(
                                "es-PE"
                            )
                        }
                        detalle="Muestras de origen archivo"
                    />

                    <TarjetaResumen
                        icono={Gauge}
                        etiqueta="Clases"
                        valor={
                            Object.keys(
                                conteoClases
                            ).filter(
                                (key) =>
                                    conteoClases[key] >
                                    0
                            ).length
                        }
                        detalle="Categorías presentes en el dataset"
                    />
                </section>


                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                    {CLASES.map(
                        (item) => (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() =>
                                    setClase(
                                        clase === item.value
                                            ? ""
                                            : item.value
                                    )
                                }
                                className={`rounded-2xl border p-4 text-left transition ${clase === item.value
                                        ? "border-cyan-400/25 bg-cyan-400/[0.07]"
                                        : "border-white/[0.06] bg-[#090f1d] hover:border-white/[0.11]"
                                    }`}
                            >
                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                    {item.label}
                                </p>

                                <p className="mt-2 text-xl font-semibold text-white">
                                    {(
                                        conteoClases[
                                        item.value
                                        ] || 0
                                    ).toLocaleString(
                                        "es-PE"
                                    )}
                                </p>
                            </button>
                        )
                    )}
                </section>


                <section className="rounded-[22px] border border-white/[0.07] bg-[#090f1d] shadow-[0_18px_70px_rgba(0,0,0,.18)]">
                    <div className="border-b border-white/[0.06] p-4 md:p-5">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <FileAudio
                                        size={17}
                                        className="text-cyan-300"
                                    />
                                    <h2 className="text-sm font-semibold text-white">
                                        Inventario de muestras
                                    </h2>
                                </div>

                                <p className="mt-1 text-xs text-slate-500">
                                    {filtradas.length.toLocaleString(
                                        "es-PE"
                                    )} resultado(s) con los filtros actuales.
                                </p>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[720px]">
                                <div className="relative">
                                    <Search
                                        size={15}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                                    />

                                    <input
                                        value={busqueda}
                                        onChange={(event) =>
                                            setBusqueda(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Buscar archivo, descripción..."
                                        className="w-full rounded-xl border border-white/[0.07] bg-[#0c1424] py-2.5 pl-9 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-700 focus:border-cyan-400/25"
                                    />
                                </div>

                                <div className="relative">
                                    <Filter
                                        size={14}
                                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                                    />

                                    <select
                                        value={clase}
                                        onChange={(event) =>
                                            setClase(
                                                event.target.value
                                            )
                                        }
                                        className="w-full appearance-none rounded-xl border border-white/[0.07] bg-[#0c1424] py-2.5 pl-9 pr-3 text-xs text-slate-300 outline-none focus:border-cyan-400/25"
                                    >
                                        <option value="">
                                            Todas las clases
                                        </option>

                                        {CLASES.map(
                                            (item) => (
                                                <option
                                                    key={item.value}
                                                    value={item.value}
                                                >
                                                    {item.label}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <select
                                    value={origen}
                                    onChange={(event) =>
                                        setOrigen(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-white/[0.07] bg-[#0c1424] px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-cyan-400/25"
                                >
                                    <option value="">
                                        Todos los orígenes
                                    </option>
                                    <option value="archivo">
                                        Archivo
                                    </option>
                                    <option value="microfono">
                                        Micrófono
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>


                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1050px] text-left">
                            <thead>
                                <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.12em] text-slate-600">
                                    <th className="px-5 py-3 font-semibold">
                                        Muestra
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Clase
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Origen
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Duración
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Sample rate
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Tamaño
                                    </th>
                                    <th className="px-4 py-3 font-semibold">
                                        Registro
                                    </th>
                                    <th className="px-5 py-3 text-right font-semibold">
                                        Acción
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {cargando ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-16 text-center"
                                        >
                                            <LoaderCircle
                                                size={24}
                                                className="mx-auto animate-spin text-cyan-300"
                                            />

                                            <p className="mt-3 text-xs text-slate-500">
                                                Cargando dataset real…
                                            </p>
                                        </td>
                                    </tr>
                                ) : visibles.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-16 text-center text-xs text-slate-500"
                                        >
                                            No hay muestras que coincidan con los filtros.
                                        </td>
                                    </tr>
                                ) : (
                                    visibles.map(
                                        (item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-white/[0.045] transition last:border-0 hover:bg-white/[0.018]"
                                            >
                                                <td className="max-w-[320px] px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-slate-400">
                                                            <FileAudio size={16} />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p
                                                                className="truncate text-xs font-medium text-slate-200"
                                                                title={item.nombre_archivo}
                                                            >
                                                                {item.nombre_archivo}
                                                            </p>

                                                            <p
                                                                className="mt-1 truncate text-[10px] text-slate-600"
                                                                title={item.archivo_relativo}
                                                            >
                                                                {item.archivo_relativo}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <BadgeClase
                                                        clase={item.clase}
                                                    />
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className="text-xs text-slate-400">
                                                        {item.origen ===
                                                            "microfono"
                                                            ? "Micrófono"
                                                            : "Archivo"}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                        <Clock3 size={13} />
                                                        {Number(
                                                            item.duracion_segundos
                                                        ).toFixed(2)} s
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 text-xs text-slate-400">
                                                    {item.sample_rate
                                                        ? `${Number(
                                                            item.sample_rate
                                                        ).toLocaleString(
                                                            "es-PE"
                                                        )} Hz`
                                                        : "—"}
                                                </td>

                                                <td className="px-4 py-4 text-xs text-slate-400">
                                                    {formatearBytes(
                                                        item.tamano_bytes
                                                    )}
                                                </td>

                                                <td className="px-4 py-4 text-[11px] text-slate-500">
                                                    {formatearFecha(
                                                        item.fecha_creacion
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            eliminandoId ===
                                                            item.id
                                                        }
                                                        onClick={() =>
                                                            eliminar(
                                                                item
                                                            )
                                                        }
                                                        title="Eliminar muestra"
                                                        className="inline-grid h-8 w-8 place-items-center rounded-lg border border-red-400/10 text-red-300/70 transition hover:bg-red-400/[0.07] hover:text-red-200 disabled:opacity-40"
                                                    >
                                                        {eliminandoId ===
                                                            item.id ? (
                                                            <LoaderCircle
                                                                size={14}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Trash2 size={14} />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>


                    {!cargando && (
                        <div className="flex flex-col gap-3 border-t border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[11px] text-slate-600">
                                Página {pagina} de {totalPaginas} ·{" "}
                                {filtradas.length.toLocaleString(
                                    "es-PE"
                                )} muestras filtradas
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={
                                        pagina <= 1
                                    }
                                    onClick={() =>
                                        setPagina(
                                            (actual) =>
                                                Math.max(
                                                    1,
                                                    actual - 1
                                                )
                                        )
                                    }
                                    className="rounded-lg border border-white/[0.07] px-3 py-2 text-[11px] text-slate-400 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    Anterior
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        pagina >=
                                        totalPaginas
                                    }
                                    onClick={() =>
                                        setPagina(
                                            (actual) =>
                                                Math.min(
                                                    totalPaginas,
                                                    actual + 1
                                                )
                                        )
                                    }
                                    className="rounded-lg border border-white/[0.07] px-3 py-2 text-[11px] text-slate-400 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </section>


                <section className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-2xl border border-white/[0.06] bg-[#090f1d] p-4">
                        <div className="flex items-start gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400/[0.07] text-amber-300">
                                <AlertTriangle size={16} />
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-slate-200">
                                    Eliminación real
                                </h3>

                                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                    Eliminar una muestra desde esta pantalla borra el registro
                                    de PostgreSQL y el archivo correspondiente de dataset_local.
                                    Esto cambia el material disponible para futuros entrenamientos.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/[0.06] bg-[#090f1d] p-4">
                        <div className="flex items-start gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/[0.07] text-cyan-300">
                                <Database size={16} />
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-slate-200">
                                    Registro, no entrenamiento automático
                                </h3>

                                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                    Agregar una muestra al dataset no modifica el modelo activo.
                                    El modelo solo cambiará cuando ejecutes un nuevo entrenamiento
                                    y se guarde una nueva versión.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>


                <ModalNuevaMuestra
                    abierto={modalAbierto}
                    onCerrar={() =>
                        setModalAbierto(
                            false
                        )
                    }
                    onGuardado={() =>
                        cargar(true)
                    }
                />

            </div>
        </DashboardLayout>
    );
}
