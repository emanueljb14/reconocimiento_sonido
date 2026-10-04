import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import { LineEvents, SoundBar, RiskPie } from "../../components/dashboard/Charts";

export default function AdminStatistics() {
  return (
    <DashboardLayout
      title="Estadísticas"
      subtitle="Analiza el comportamiento y rendimiento del sistema."
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["--", "Total de eventos"],
            ["--", "Precisión del modelo"],
            ["--", "Confianza promedio"],
            ["--", "Eventos de riesgo alto"],
          ].map(([value, label]) => (
            <div className="glass rounded-xl p-4" key={label}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-sg-muted">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <LineEvents />
          <SoundBar />
        </div>

        <RiskPie />
      </div>
    </DashboardLayout>
  );
}
