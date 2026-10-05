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
    CheckCircle2,
    Database,
    Gauge,
    GitBranch,
    Layers3,
    RefreshCcw,
    Server,
    ShieldCheck,
    Table2,
    Target,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
    obtenerEstadoModelo,
    obtenerMetricasModelo,
} from "../../services/inteligencia";

const NOMBRES_CLASES = {
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
    return Number.isFinite(n) ? n : null;
}

function porcentaje(valor) {
    const n = numero(valor);
    if (n === null) return null;
    const final = n <= 1 ? n * 100 : n;
    return Math.max(0, Math.min(100, final));
}

function porcentajeTexto(valor, decimales = 2) {
    const p = porcentaje(valor);
    if (p === null) return "—";
    return `${p.toFixed(decimales)}%`;
}

function nombreClase(valor) {
    return (
        NOMBRES_CLASES[valor] ||
        String(valor || "")
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letra) => letra.toUpperCase()) ||
        "Sin identificar"
    );
}

function formatearFecha(valor) {
    if (!valor) return "—";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return String(valor);

    return fecha.toLocaleString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}

function extraerBloqueMetricas(estado, metricas) {
    return metricas?.metricas || estado?.metricas || metricas || {};
}

function obtenerClases(estado, metricas) {
    if (Array.isArray(metricas?.clases)) return metricas.clases;
    if (Array.isArray(estado?.clases)) return estado.clases;
    const desdeMatriz = metricas?.matriz_confusion?.clases;
    if (Array.isArray(desdeMatriz)) return desdeMatriz;
    return [];
}

function obtenerMatriz(estado, metricas) {
    const candidata = metricas?.matriz_confusion || estado?.matriz_confusion || null;

    if (!candidata) {
        return { clases: [], valores: [] };
    }

    if (Array.isArray(candidata)) {
        return {
            clases: obtenerClases(estado, metricas),
            valores: candidata,
        };
    }

    return {
        clases: Array.isArray(candidata.clases)
            ? candidata.clases
            : obtenerClases(estado, metricas),
        valores: Array.isArray(candidata.valores) ? candidata.valores : [],
    };
}

function obtenerReporte(estado, metricas) {
    return metricas?.reporte_clasificacion || estado?.reporte_clasificacion || {};
}

function obtenerDistribucion(estado, metricas, clave) {
    const valor = metricas?.[clave] || estado?.[clave] || {};
    if (!valor || typeof valor !== "object" || Array.isArray(valor)) return [];

    return Object.entries(valor)
        .map(([nombre, cantidad]) => ({
            nombre,
            cantidad: Number(cantidad) || 0,
        }))
        .sort((a, b) => b.cantidad - a.cantidad);
}

function MetricCard({ icon: Icon, label, value, detail, accent = "violet" }) {
    const estilos = {
        violet: "border-violet-400/20 bg-violet-500/10 text-violet-300",
        lime: "border-lime-400/20 bg-lime-400/10 text-lime-300",
        cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
        rose: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    };

    return (
        <article className="rounded-2xl border border-white/[0.07] bg-[#0b1020]/80 p-4 shadow-[0_18px_50px_rgba(0,0,0,.16)]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {label}
                    </span>
                    <strong className="mt-4 block text-3xl font-semibold tracking-[-0.04em] text-white">
                        {value}
                    </strong>
                    <p className="mt-2 text-[10px] leading-5 text-slate-500">{detail}</p>
                </div>
                <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${
                        estilos[accent] || estilos.violet
                    }`}
                >
                    <Icon size={17} />
                </div>
            </div>
        </article>
    );
}

function Panel({ eyebrow, title, icon: Icon, children, footer }) {
    return (
        <article className="overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#090e1b] shadow-[0_20px_70px_rgba(0,0,0,.20)]">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
                <div>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                        {eyebrow}
                    </span>
                    <h3 className="mt-1 text-sm font-semibold text-white">{title}</h3>
                </div>
                {Icon && <Icon size={18} className="text-slate-600" />}
            </div>
            <div className="p-5">{children}</div>
            {footer && (
                <div className="border-t border-white/[0.05] px-5 py-3 text-[9px] leading-5 text-slate-600">
                    {footer}
                </div>
            )}
        </article>
    );
}

function Barra({ label, value, max, helper }) {
    const ancho =
        max > 0 ? Math.max(2, Math.min(100, (Number(value) / max) * 100)) : 0;

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                    <span className="text-[10px] text-slate-300">{label}</span>
                    {helper && (
                        <span className="ml-2 text-[8px] text-slate-600">{helper}</span>
                    )}
                </div>
                <strong className="text-[10px] text-white">{value}</strong>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.04]">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-lime-300"
                    style={{ width: `${ancho}%` }}
                />
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex flex-col gap-1 border-b border-white/[0.05] py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[9px] uppercase tracking-[0.14em] text-slate-600">
                {label}
            </span>
            <strong className="break-all text-[10px] font-medium text-slate-300">
                {value ?? "—"}
            </strong>
        </div>
    );
}

function MiniDato({ label, value }) {
    return (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <span className="text-[8px] uppercase tracking-[0.14em] text-slate-600">
                {label}
            </span>
            <strong className="mt-2 block text-lg font-semibold text-white">
                {value ?? "—"}
            </strong>
        </div>
    );
}

function EmptyState({ texto }) {
    return (
        <div className="grid min-h-[220px] place-items-center text-center">
            <div>
                <BrainCircuit size={28} className="mx-auto text-slate-700" />
                <p className="mt-3 max-w-sm text-[10px] leading-5 text-slate-600">
                    {texto}
                </p>
            </div>
        </div>
    );
}

export default function AIModel() {
    const [estadoModelo, setEstadoModelo] = useState(null);
    const [metricasModelo, setMetricasModelo] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [actualizando, setActualizando] = useState(false);
    const [error, setError] = useState("");

    const cargarModelo = useCallback(async (silencioso = false) => {
        try {
            setError("");
            if (silencioso) setActualizando(true);
            else setCargando(true);

            const [estadoResultado, metricasResultado] = await Promise.allSettled([
                obtenerEstadoModelo(),
                obtenerMetricasModelo(),
            ]);

            if (estadoResultado.status === "fulfilled") {
                setEstadoModelo(estadoResultado.value);
            } else {
                throw estadoResultado.reason;
            }

            if (metricasResultado.status === "fulfilled") {
                setMetricasModelo(metricasResultado.value);
            } else {
                setMetricasModelo(null);
            }
        } catch (err) {
            console.error(err);
            setEstadoModelo(null);
            setMetricasModelo(null);
            setError(
                err?.response?.data?.detail ||
                err?.response?.data?.error ||
                err?.message ||
                "No se pudo conectar con el backend de inteligencia."
            );
        } finally {
            setCargando(false);
            setActualizando(false);
        }
    }, []);

    useEffect(() => {
        cargarModelo();
        const interval = window.setInterval(() => {
            cargarModelo(true);
        }, 30000);

        return () => window.clearInterval(interval);
    }, [cargarModelo]);

    const datos = useMemo(() => {
        const estado = estadoModelo || {};
        const metricas = metricasModelo || {};
        const bloque = extraerBloqueMetricas(estado, metricas);
        const clases = obtenerClases(estado, metricas);
        const matriz = obtenerMatriz(estado, metricas);
        const reporte = obtenerReporte(estado, metricas);

        const distribucionClases = obtenerDistribucion(estado, metricas, "distribucion_clases");
        const distribucionOrigen = obtenerDistribucion(estado, metricas, "distribucion_origen");
        const metricasOrigen = metricas?.metricas_prueba_por_origen || estado?.metricas_prueba_por_origen || {};

        const disponible = Boolean(
            estado.modelo_disponible ??
            estado.disponible ??
            estado.activo ??
            estado.cargado ??
            (estado.estado === "entrenado")
        );

        return {
            disponible,
            estado: estado.estado || (disponible ? "entrenado" : "sin_entrenar"),
            modelo: metricas.modelo || estado.modelo || "—",
            version: metricas.version || estado.version || "—",
            fecha: metricas.fecha_entrenamiento || estado.fecha_entrenamiento || null,
            scikit: metricas.scikit_learn || estado.scikit_learn || "—",
            estrategia: metricas.estrategia_validacion || estado.estrategia_validacion || "—",
            descripcionValidacion: metricas.descripcion_validacion || estado.descripcion_validacion || "",
            umbral: metricas.umbral_desconocido ?? estado.umbral_desconocido,
            muestrasTotales: metricas.muestras_totales ?? estado.muestras_totales,
            muestrasTrain: metricas.muestras_entrenamiento ?? estado.muestras_entrenamiento,
            muestrasTest: metricas.muestras_prueba ?? estado.muestras_prueba,
            gruposTotales: metricas.grupos_totales ?? estado.grupos_totales,
            gruposTrain: metricas.grupos_entrenamiento ?? estado.grupos_entrenamiento,
            gruposTest: metricas.grupos_prueba ?? estado.grupos_prueba,
            caracteristicas: metricas.caracteristicas ?? estado.caracteristicas,
            accuracy: bloque.accuracy,
            precision: bloque.precision_macro,
            recall: bloque.recall_macro,
            f1: bloque.f1_macro,
            clases,
            matriz,
            reporte,
            distribucionClases,
            distribucionOrigen,
            metricasOrigen,
            finalTodasMuestras:
                metricas.modelo_final_entrenado_con_todas_muestras ??
                estado.modelo_final_entrenado_con_todas_muestras,
            errores: Array.isArray(metricas.errores_dataset)
                ? metricas.errores_dataset
                : Array.isArray(estado.errores_dataset)
                ? estado.errores_dataset
                : [],
        };
    }, [estadoModelo, metricasModelo]);

    const filasReporte = useMemo(() => {
        return datos.clases
            .map((clase) => {
                const fila = datos.reporte?.[clase];
                if (!fila || typeof fila !== "object") return null;

                return {
                    clase,
                    precision: fila.precision,
                    recall: fila.recall,
                    f1: fila["f1-score"] ?? fila.f1_score ?? fila.f1,
                    soporte: fila.support,
                };
            })
            .filter(Boolean);
    }, [datos]);

    const maxDistribucion = Math.max(1, ...datos.distribucionClases.map((item) => item.cantidad));
    const matrizMax = Math.max(1, ...datos.matriz.valores.flat().map((item) => Number(item) || 0));

    return (
        <DashboardLayout
            title="Modelo de IA"
            subtitle="Estado real, métricas de validación y estructura del clasificador acústico"
        >
            <div className="mx-auto max-w-[1500px] space-y-5">
                {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/[0.07] p-4">
                        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-300" />
                        <div>
                            <strong className="text-xs text-rose-200">
                                No se pudo cargar la información del modelo
                            </strong>
                            <p className="mt-1 text-[10px] text-rose-300/70">{error}</p>
                        </div>
                    </div>
                )}

                <section className="flex flex-col gap-4 rounded-[24px] border border-white/[0.07] bg-[#090e1b] px-5 py-4 shadow-[0_20px_70px_rgba(0,0,0,.20)] lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                            <BrainCircuit size={21} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-lg font-semibold text-white">
                                    {cargando ? "Cargando modelo..." : datos.modelo}
                                </h2>
                                {!cargando && (
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-semibold uppercase ${
                                            datos.disponible
                                                ? "border-lime-400/20 bg-lime-400/[0.06] text-lime-300"
                                                : "border-rose-400/20 bg-rose-400/[0.06] text-rose-300"
                                        }`}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                datos.disponible ? "bg-lime-300" : "bg-rose-300"
                                            }`}
                                        />
                                        {datos.disponible ? "Modelo disponible" : "Modelo no disponible"}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 max-w-3xl text-[10px] leading-5 text-slate-500">
                                Esta vista consulta directamente /api/inteligencia/estado-modelo/ y /api/inteligencia/metricas-modelo/.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => cargarModelo(true)}
                        disabled={actualizando}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400 transition hover:border-violet-400/30 hover:text-white disabled:opacity-40"
                    >
                        <RefreshCcw size={13} className={actualizando ? "animate-spin" : ""} />
                        Actualizar
                    </button>
                </section>

                <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        icon={Target}
                        label="Accuracy"
                        value={cargando ? "..." : porcentajeTexto(datos.accuracy)}
                        detail="Acierto global en el holdout de validación"
                        accent="violet"
                    />
                    <MetricCard
                        icon={Gauge}
                        label="Precisión macro"
                        value={cargando ? "..." : porcentajeTexto(datos.precision)}
                        detail="Promedio de precisión entre las clases"
                        accent="lime"
                    />
                    <MetricCard
                        icon={Activity}
                        label="Recall macro"
                        value={cargando ? "..." : porcentajeTexto(datos.recall)}
                        detail="Promedio de sensibilidad entre las clases"
                        accent="cyan"
                    />
                    <MetricCard
                        icon={ShieldCheck}
                        label="F1 macro"
                        value={cargando ? "..." : porcentajeTexto(datos.f1)}
                        detail="Balance global entre precisión y recall"
                        accent="rose"
                    />
                </section>

                <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                    <Panel
                        eyebrow="Configuración del modelo"
                        title="Información técnica"
                        icon={Server}
                        footer={datos.descripcionValidacion || "Información proporcionada por la metadata del modelo."}
                    >
                        <div>
                            <InfoRow label="Estado" value={datos.estado} />
                            <InfoRow label="Versión" value={datos.version} />
                            <InfoRow label="Entrenado" value={formatearFecha(datos.fecha)} />
                            <InfoRow label="Scikit-learn" value={datos.scikit} />
                            <InfoRow label="Estrategia de validación" value={datos.estrategia} />
                            <InfoRow label="Características por audio" value={datos.caracteristicas ?? "—"} />
                            <InfoRow
                                label="Umbral desconocido"
                                value={datos.umbral !== undefined ? porcentajeTexto(datos.umbral) : "—"}
                            />
                            <InfoRow
                                label="Modelo final"
                                value={
                                    datos.finalTodasMuestras === true
                                        ? "Reentrenado con todas las muestras"
                                        : datos.finalTodasMuestras === false
                                        ? "No"
                                        : "—"
                                }
                            />
                        </div>
                    </Panel>

                    <Panel
                        eyebrow="Dataset"
                        title="Muestras y grupos de validación"
                        icon={Database}
                        footer="Los grupos permiten separar familias de audios relacionadas y reducir fuga de datos entre entrenamiento y prueba."
                    >
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <MiniDato label="Muestras totales" value={datos.muestrasTotales} />
                            <MiniDato label="Muestras train" value={datos.muestrasTrain} />
                            <MiniDato label="Muestras test" value={datos.muestrasTest} />
                            <MiniDato label="Grupos totales" value={datos.gruposTotales} />
                            <MiniDato label="Grupos train" value={datos.gruposTrain} />
                            <MiniDato label="Grupos test" value={datos.gruposTest} />
                        </div>

                        {datos.distribucionClases.length > 0 && (
                            <div className="mt-5 space-y-4">
                                <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                                    <Layers3 size={12} />
                                    Distribución por clase
                                </div>
                                {datos.distribucionClases.map((item) => (
                                    <Barra
                                        key={item.nombre}
                                        label={nombreClase(item.nombre)}
                                        value={item.cantidad}
                                        max={maxDistribucion}
                                    />
                                ))}
                            </div>
                        )}
                    </Panel>
                </section>

                <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <Panel
                        eyebrow="Evaluación multiclase"
                        title="Matriz de confusión"
                        icon={Table2}
                        footer="Filas: clase real. Columnas: clase predicha. Los valores pertenecen al conjunto de prueba guardado en la metadata."
                    >
                        {datos.matriz.valores.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[650px] border-separate border-spacing-1 text-center">
                                    <thead>
                                        <tr>
                                            <th className="px-2 py-2 text-left text-[8px] uppercase tracking-wider text-slate-700">
                                                Real / Pred.
                                            </th>
                                            {datos.matriz.clases.map((clase) => (
                                                <th key={clase} className="px-2 py-2 text-[8px] font-medium text-slate-500">
                                                    {nombreClase(clase)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {datos.matriz.valores.map((fila, filaIndex) => (
                                            <tr key={filaIndex}>
                                                <th className="px-2 py-2 text-left text-[9px] font-medium text-slate-400">
                                                    {nombreClase(datos.matriz.clases[filaIndex])}
                                                </th>
                                                {fila.map((valor, colIndex) => {
                                                    const intensidad = Math.max(
                                                        0.05,
                                                        (Number(valor) || 0) / matrizMax
                                                    );
                                                    const diagonal = filaIndex === colIndex;

                                                    return (
                                                        <td
                                                            key={colIndex}
                                                            className={`rounded-lg border px-3 py-3 text-[10px] font-semibold ${
                                                                diagonal
                                                                    ? "border-lime-400/15 text-lime-200"
                                                                    : "border-violet-400/10 text-violet-200"
                                                            }`}
                                                            style={{
                                                                background: diagonal
                                                                    ? `rgba(163, 230, 53, ${intensidad * 0.2})`
                                                                    : `rgba(139, 92, 246, ${intensidad * 0.17})`,
                                                            }}
                                                        >
                                                            {valor}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState texto="El backend no devolvió una matriz de confusión." />
                        )}
                    </Panel>

                    <Panel
                        eyebrow="Desempeño por clase"
                        title="Reporte de clasificación"
                        icon={Target}
                        footer="Precision, recall y F1 se muestran por clase cuando están disponibles en reporte_clasificacion."
                    >
                        {filasReporte.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[520px] text-left">
                                    <thead className="text-[8px] uppercase tracking-[0.13em] text-slate-700">
                                        <tr>
                                            <th className="pb-3">Clase</th>
                                            <th className="pb-3">Precision</th>
                                            <th className="pb-3">Recall</th>
                                            <th className="pb-3">F1</th>
                                            <th className="pb-3 text-right">Soporte</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filasReporte.map((fila) => (
                                            <tr key={fila.clase} className="border-t border-white/[0.05] text-[9px]">
                                                <td className="py-3 font-medium text-slate-300">
                                                    {nombreClase(fila.clase)}
                                                </td>
                                                <td className="py-3 text-lime-300">
                                                    {porcentajeTexto(fila.precision, 1)}
                                                </td>
                                                <td className="py-3 text-cyan-300">
                                                    {porcentajeTexto(fila.recall, 1)}
                                                </td>
                                                <td className="py-3 text-violet-300">
                                                    {porcentajeTexto(fila.f1, 1)}
                                                </td>
                                                <td className="py-3 text-right text-slate-500">
                                                    {numero(fila.soporte) ?? "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState texto="El backend no devolvió métricas por clase." />
                        )}
                    </Panel>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <Panel
                        eyebrow="Procedencia del dataset"
                        title="Distribución por origen"
                        icon={GitBranch}
                        footer="Muestra cuántos archivos del modelo proceden de audio original, audio aumentado o muestras locales."
                    >
                        {datos.distribucionOrigen.length > 0 ? (
                            <div className="space-y-4">
                                {datos.distribucionOrigen.map((item) => (
                                    <Barra
                                        key={item.nombre}
                                        label={item.nombre
                                            .replaceAll("_", " ")
                                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                                        value={item.cantidad}
                                        max={Math.max(
                                            1,
                                            ...datos.distribucionOrigen.map((d) => d.cantidad)
                                        )}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState texto="No hay distribución por origen en la metadata." />
                        )}
                    </Panel>

                    <Panel
                        eyebrow="Prueba agrupada"
                        title="Métricas de prueba por origen"
                        icon={CheckCircle2}
                        footer="Estas métricas corresponden al subconjunto de prueba definido durante el entrenamiento."
                    >
                        {Object.keys(datos.metricasOrigen || {}).length > 0 ? (
                            <div className="space-y-3">
                                {Object.entries(datos.metricasOrigen).map(([origen, valor]) => (
                                    <div
                                        key={origen}
                                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <strong className="text-[10px] capitalize text-slate-300">
                                                {origen.replaceAll("_", " ")}
                                            </strong>
                                            <span className="text-sm font-semibold text-lime-300">
                                                {porcentajeTexto(valor?.accuracy, 2)}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-[9px] text-slate-600">
                                            {Number(valor?.muestras) || 0} muestras en prueba
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState texto="No hay métricas separadas por origen en la metadata." />
                        )}
                    </Panel>
                </section>

                <section className="rounded-[24px] border border-white/[0.07] bg-[#090e1b] p-5">
                    <div className="flex items-start gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.05] text-cyan-300">
                            <Layers3 size={16} />
                        </div>
                        <div>
                            <strong className="text-xs text-slate-200">
                                Cómo interpretar esta pantalla
                            </strong>
                            <p className="mt-1 max-w-5xl text-[9px] leading-5 text-slate-600">
                                Las métricas mostradas pertenecen a la validación almacenada por el backend durante el entrenamiento.
                            </p>
                            {datos.errores.length > 0 && (
                                <p className="mt-2 text-[9px] text-amber-300/70">
                                    El entrenamiento registró {datos.errores.length} archivo(s) con error de procesamiento.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <div className="flex flex-col gap-2 pb-3 text-[8px] uppercase tracking-[0.15em] text-slate-700 sm:flex-row sm:items-center sm:justify-between">
                    <span>SoundGuard AI · Modelo acústico real</span>
                    <span>Random Forest · Holdout agrupado · Django</span>
                </div>
            </div>
        </DashboardLayout>
    );
}