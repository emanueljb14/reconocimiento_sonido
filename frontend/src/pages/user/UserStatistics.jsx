import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  LineEvents,
  SoundBar,
  RiskPie,
} from "../../components/dashboard/Charts";
import {
  obtenerResumen,
  obtenerPorSonido,
  obtenerPorRiesgo,
  obtenerPorHora,
} from "../../services/estadisticas";

export default function UserStatistics() {
  const [resumen, setResumen] = useState(null);
  const [porSonido, setPorSonido] = useState([]);
  const [porRiesgo, setPorRiesgo] = useState([]);
  const [porHora, setPorHora] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarEstadisticas() {
      try {
        setCargando(true);
        setError("");

        const [
          resumenData,
          sonidoData,
          riesgoData,
          horaData,
        ] = await Promise.all([
          obtenerResumen(),
          obtenerPorSonido(),
          obtenerPorRiesgo(),
          obtenerPorHora(),
        ]);

        if (!activo) return;

        setResumen(resumenData);
        setPorSonido(Array.isArray(sonidoData) ? sonidoData : []);
        setPorRiesgo(Array.isArray(riesgoData) ? riesgoData : []);
        setPorHora(Array.isArray(horaData) ? horaData : []);
      } catch (err) {
        console.error("Error cargando estadísticas del usuario:", err);
        if (activo) {
          setError(
            err?.response?.data?.detail ||
              "No se pudieron cargar las estadísticas."
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarEstadisticas();
    const intervalo = setInterval(cargarEstadisticas, 5000);

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  const confianzaPromedio =
    resumen?.confianza_promedio != null
      ? `${(Number(resumen.confianza_promedio) * 100).toFixed(2)}%`
      : "--";

  const riesgoAlto =
    Number(resumen?.riesgos?.alto || 0) +
    Number(resumen?.riesgos?.critico || 0);

  return (
    <DashboardLayout
      title="Estadísticas"
      subtitle="Analiza el comportamiento y rendimiento del sistema."
    >
      <div className="space-y-4">

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* TARJETAS */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="glass rounded-xl p-4 border border-white/10">
            <p className="text-2xl font-bold">
              {cargando ? "..." : resumen?.total_detecciones ?? 0}
            </p>
            <p className="text-xs text-sg-muted">Total de eventos</p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <p className="text-2xl font-bold">
              {cargando ? "..." : resumen?.detecciones_hoy ?? 0}
            </p>
            <p className="text-xs text-sg-muted">Eventos hoy</p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <p className="text-2xl font-bold">
              {cargando ? "..." : confianzaPromedio}
            </p>
            <p className="text-xs text-sg-muted">Confianza promedio</p>
          </div>

          <div className="glass rounded-xl p-4 border border-white/10">
            <p className="text-2xl font-bold">
              {cargando ? "..." : riesgoAlto}
            </p>
            <p className="text-xs text-sg-muted">Eventos de riesgo alto</p>
          </div>
        </div>

        {/* GRÁFICOS */}
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="glass rounded-xl p-4 border border-white/5">
            <LineEvents data={porHora} />
          </div>
          <div className="glass rounded-xl p-4 border border-white/5">
            <SoundBar data={porSonido} />
          </div>
        </div>

        <div className="glass rounded-xl p-4 border border-white/5">
          <RiskPie data={porRiesgo} />
        </div>

      </div>
    </DashboardLayout>
  );
}