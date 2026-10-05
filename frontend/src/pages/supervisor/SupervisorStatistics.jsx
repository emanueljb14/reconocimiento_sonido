import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { LineEvents, SoundBar, RiskPie } from "../../components/dashboard/Charts";
import {
  obtenerResumen,
  obtenerPorSonido,
  obtenerPorRiesgo,
  obtenerPorHora,
} from "../../services/estadisticas";

export default function SupervisorStatistics() {
  const [resumen, setResumen] = useState(null);
  const [porSonido, setPorSonido] = useState([]);
  const [porRiesgo, setPorRiesgo] = useState([]);
  const [porHora, setPorHora] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarEstadisticas() {
      try {
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
        setPorSonido(sonidoData);
        setPorRiesgo(riesgoData);
        setPorHora(horaData);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);

        if (activo) {
          setError(
            err?.response?.data?.detail ||
              "No se pudieron cargar las estadísticas."
          );
        }
      }
    }

    cargarEstadisticas();

    return () => {
      activo = false;
    };
  }, []);

  const confianza =
    resumen?.confianza_promedio != null
      ? `${(Number(resumen.confianza_promedio) * 100).toFixed(2)}%`
      : "--";

  const riesgoAlto =
    (resumen?.riesgos?.alto || 0) +
    (resumen?.riesgos?.critico || 0);

  return (
    <DashboardLayout
      title="Estadísticas"
      subtitle="Analiza el comportamiento y rendimiento del sistema."
    >
      <div className="space-y-4">

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <div className="glass rounded-xl p-4">
            <p className="text-2xl font-bold">
              {resumen?.total_detecciones ?? "--"}
            </p>
            <p className="text-xs text-sg-muted">
              Total de eventos
            </p>
          </div>

          <div className="glass rounded-xl p-4">
            <p className="text-2xl font-bold">
              {confianza}
            </p>
            <p className="text-xs text-sg-muted">
              Confianza promedio
            </p>
          </div>

          <div className="glass rounded-xl p-4">
            <p className="text-2xl font-bold">
              {resumen?.detecciones_hoy ?? "--"}
            </p>
            <p className="text-xs text-sg-muted">
              Eventos hoy
            </p>
          </div>

          <div className="glass rounded-xl p-4">
            <p className="text-2xl font-bold">
              {riesgoAlto}
            </p>
            <p className="text-xs text-sg-muted">
              Eventos de riesgo alto
            </p>
          </div>

        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <LineEvents data={porHora} />
          <SoundBar data={porSonido} />
        </div>

        <RiskPie data={porRiesgo} />

      </div>
    </DashboardLayout>
  );
}