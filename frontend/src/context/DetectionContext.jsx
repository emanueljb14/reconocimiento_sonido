import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { obtenerDetecciones } from "../services/detecciones";
import { obtenerResumen } from "../services/estadisticas";
import { analizarGrabacion } from "../services/inteligencia";
import { grabarWav } from "../utils/grabarWav";


const DetectionContext = createContext(null);


const NOMBRES_SONIDOS = {
    golpe: "Golpe",
    puerta: "Puerta",
    alarma: "Alarma",
    aplausos: "Aplausos",
    vidrio: "Vidrio",
    ruido_elevado: "Ruido elevado",
    desconocido: "Desconocido",
};


function normalizarDeteccion(deteccion) {
    const fecha = deteccion.fecha
        ? new Date(deteccion.fecha)
        : null;

    const confianza = Number(
        deteccion.confianza || 0
    );

    return {
        id: deteccion.id,

        type:
            NOMBRES_SONIDOS[deteccion.tipo_sonido] ||
            deteccion.tipo_sonido ||
            "Desconocido",

        confidence: Number(
            (confianza * 100).toFixed(1)
        ),

        risk: String(
            deteccion.nivel_riesgo || "bajo"
        ).toUpperCase(),

        time: fecha
            ? fecha.toLocaleTimeString("es-PE", {
                hour12: false,
            })
            : "-",

        date: fecha
            ? fecha.toLocaleDateString("es-PE")
            : "-",

        duration: Number(
            deteccion.duracion_segundos || 0
        ).toFixed(1),

        origin:
            deteccion.origen || "microfono",

        raw: deteccion,
    };
}


export function DetectionProvider({
    children,
}) {
    const [
        detections,
        setDetections,
    ] = useState([]);

    const [
        resumen,
        setResumen,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        analyzing,
        setAnalyzing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    // Mantiene compatibilidad con componentes
    // existentes que puedan usar running.
    const [
        running,
        setRunning,
    ] = useState(true);

    const [
        tick,
        setTick,
    ] = useState(0);


    const refresh = useCallback(
        async () => {
            try {
                setError("");

                const [
                    historial,
                    estadisticas,
                ] = await Promise.all([
                    obtenerDetecciones(),
                    obtenerResumen(),
                ]);

                const lista =
                    Array.isArray(historial)
                        ? historial
                        : historial?.results || [];

                const normalizadas =
                    lista.map(
                        normalizarDeteccion
                    );

                setDetections(
                    normalizadas
                );

                setResumen(
                    estadisticas
                );

                setTick(
                    (actual) =>
                        actual + 1
                );
            } catch (err) {
                console.error(
                    "Error cargando detecciones:",
                    err
                );

                setError(
                    "No se pudieron cargar las detecciones del backend."
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );


    /*
     * Carga inicial.
     */
    useEffect(() => {
        refresh();
    }, [refresh]);


    /*
     * Actualización periódica.
     *
     * IMPORTANTE:
     * ya NO crea detecciones falsas.
     *
     * Solamente consulta Django para saber
     * si aparecieron detecciones nuevas.
     */
    useEffect(() => {
        if (!running) {
            return;
        }

        const interval = setInterval(
            () => {
                refresh();
            },
            3000
        );

        return () => {
            clearInterval(interval);
        };
    }, [running, refresh]);


    /*
     * Captura real desde micrófono.
     */
    const analizarMicrofono =
        useCallback(async () => {
            try {
                setAnalyzing(true);
                setError("");

                /*
                 * Captura WAV real durante
                 * tres segundos.
                 */
                const wav =
                    await grabarWav(3);

                /*
                 * Envía:
                 *
                 * React
                 *   ↓
                 * Django
                 *   ↓
                 * IA
                 */
                const resultado =
                    await analizarGrabacion(
                        wav
                    );

                /*
                 * Actualizamos historial
                 * y estadísticas después
                 * de que Django guarde
                 * la detección.
                 */
                await refresh();

                return resultado;
            } catch (err) {
                console.error(
                    "Error analizando micrófono:",
                    err
                );

                if (
                    err.name ===
                    "NotAllowedError"
                ) {
                    setError(
                        "Debes permitir el acceso al micrófono."
                    );
                } else if (
                    err.name ===
                    "NotFoundError"
                ) {
                    setError(
                        "No se encontró un micrófono."
                    );
                } else {
                    setError(
                        "No se pudo analizar el sonido."
                    );
                }

                throw err;
            } finally {
                setAnalyzing(false);
            }
        }, [refresh]);


    const latest =
        detections.length > 0
            ? detections[0]
            : null;


    const counts =
        useMemo(() => {
            return detections.reduce(
                (acumulador, deteccion) => {
                    acumulador[
                        deteccion.type
                    ] =
                        (
                            acumulador[
                            deteccion.type
                            ] || 0
                        ) + 1;

                    return acumulador;
                },
                {}
            );
        }, [detections]);


    const stats = {
        today:
            resumen?.detecciones_hoy ??
            0,

        high:
            resumen?.riesgos?.alto ??
            0,

        medium:
            resumen?.riesgos?.medio ??
            0,

        low:
            resumen?.riesgos?.bajo ??
            0,

        critical:
            resumen?.riesgos?.critico ??
            0,

        total:
            resumen?.total_detecciones ??
            detections.length,

        averageConfidence:
            resumen?.confianza_promedio ??
            0,
    };


    return (
        <DetectionContext.Provider
            value={{
                detections,

                setDetections,

                latest,

                counts,

                stats,

                resumen,

                loading,

                analyzing,

                error,

                running,

                setRunning,

                tick,

                refresh,

                analizarMicrofono,
            }}
        >
            {children}
        </DetectionContext.Provider>
    );
}


export function useDetections() {
    const contexto =
        useContext(
            DetectionContext
        );

    if (!contexto) {
        throw new Error(
            "useDetections debe utilizarse dentro de DetectionProvider"
        );
    }

    return contexto;
}