import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Triangle,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import {
  LineEvents,
  RiskPie,
} from "../../components/dashboard/Charts";
import RecentEvents from "../../components/dashboard/RecentEvents";
import VoiceCard from "../../components/dashboard/VoiceCard";
import Card from "../../components/ui/Card";

import {
  obtenerResumen,
  obtenerPorHora,
  obtenerPorRiesgo,
} from "../../services/estadisticas";

export default function SupervisorDashboard() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [porHora, setPorHora] = useState([]);
  const [porRiesgo, setPorRiesgo] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarDashboard() {
      try {
        setCargando(true);
        setError("");

        const [
          resumenData,
          horaData,
          riesgoData,
        ] = await Promise.all([
          obtenerResumen(),
          obtenerPorHora(),
          obtenerPorRiesgo(),
        ]);

        if (!activo) return;

        setEstadisticas(resumenData);
        setPorHora(horaData);
        setPorRiesgo(riesgoData);
      } catch (err) {
        console.error(
          "Error obteniendo estadísticas:",
          err
        );

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

    cargarDashboard();

    return () => {
      activo = false;
    };
  }, []);

  const eventosHoy =
    estadisticas?.detecciones_hoy ?? "--";

  const riesgoAlto =
    (estadisticas?.riesgos?.alto || 0) +
    (estadisticas?.riesgos?.critico || 0);

  const riesgoMedio =
    estadisticas?.riesgos?.medio ?? "--";

  const riesgoBajo =
    estadisticas?.riesgos?.bajo ?? "--";

  const confianzaPromedio =
    estadisticas?.confianza_promedio != null
      ? `${(
          Number(estadisticas.confianza_promedio) * 100
        ).toFixed(1)}%`
      : "--";

  return (
    <DashboardLayout
      title="Panel de Supervisor"
      subtitle="Monitorea las detecciones y revisa el comportamiento del sistema."
    >
      <div className="space-y-4">

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* TARJETAS PRINCIPALES */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={Activity}
            label="Eventos hoy"
            value={
              cargando
                ? "..."
                : eventosHoy
            }
          />

          <StatCard
            icon={AlertTriangle}
            label="Riesgo alto"
            value={
              cargando
                ? "..."
                : riesgoAlto
            }
            iconClass="bg-sg-red/15 text-sg-red"
          />

          <StatCard
            icon={Triangle}
            label="Riesgo medio"
            value={
              cargando
                ? "..."
                : riesgoMedio
            }
            iconClass="bg-sg-yellow/15 text-sg-yellow"
          />

          <StatCard
            icon={ShieldCheck}
            label="Riesgo bajo"
            value={
              cargando
                ? "..."
                : riesgoBajo
            }
            iconClass="bg-sg-green/15 text-sg-green"
          />

        </div>

        {/* GRÁFICOS */}
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <LineEvents data={porHora} />
          <RiskPie data={porRiesgo} />
        </div>

        {/* EVENTOS RECIENTES + VOZ */}
        <div className="grid gap-4 xl:grid-cols-[1fr_330px]">
          <RecentEvents />
          <VoiceCard />
        </div>

        {/* MODELO DE IA */}
        <Card
          title="Modelo de IA"
          className="p-4"
        >
          <div className="grid gap-3 md:grid-cols-4">

            <div className="rounded-lg border border-sg-line bg-[#04142f] p-4">
              <p className="text-2xl font-bold">
                {cargando
                  ? "..."
                  : confianzaPromedio}
              </p>

              <p className="text-xs text-sg-muted">
                Confianza promedio
              </p>
            </div>

            <div className="rounded-lg border border-sg-line bg-[#04142f] p-4">
              <p className="text-2xl font-bold">
                --
              </p>
              <p className="text-xs text-sg-muted">
                Precision
              </p>
            </div>

            <div className="rounded-lg border border-sg-line bg-[#04142f] p-4">
              <p className="text-2xl font-bold">
                --
              </p>
              <p className="text-xs text-sg-muted">
                Recall
              </p>
            </div>

            <div className="rounded-lg border border-sg-line bg-[#04142f] p-4">
              <p className="text-2xl font-bold">
                --
              </p>
              <p className="text-xs text-sg-muted">
                F1 Score
              </p>
            </div>

          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}