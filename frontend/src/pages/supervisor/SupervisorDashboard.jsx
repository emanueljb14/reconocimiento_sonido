import React from "react";
import { Activity, AlertTriangle, ShieldCheck, Triangle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import { LineEvents, RiskPie } from "../../components/dashboard/Charts";
import RecentEvents from "../../components/dashboard/RecentEvents";
import VoiceCard from "../../components/dashboard/VoiceCard";
import Card from "../../components/ui/Card";

export default function SupervisorDashboard() {
  return (
    <DashboardLayout
      title="Panel de Supervisor"
      subtitle="Monitorea las detecciones y revisa el comportamiento del sistema."
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Activity} label="Eventos hoy" value="--" />
          <StatCard icon={AlertTriangle} label="Riesgo alto" value="--" iconClass="bg-sg-red/15 text-sg-red" />
          <StatCard icon={Triangle} label="Riesgo medio" value="--" iconClass="bg-sg-yellow/15 text-sg-yellow" />
          <StatCard icon={ShieldCheck} label="Riesgo bajo" value="--" iconClass="bg-sg-green/15 text-sg-green" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <LineEvents />
          <RiskPie />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_330px]">
          <RecentEvents />
          <VoiceCard />
        </div>

        <Card title="Modelo de IA" className="p-4">
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ["--", "Precisión general"],
              ["--", "Precision"],
              ["--", "Recall"],
              ["--", "F1 Score"],
            ].map(([value, label]) => (
              <div className="rounded-lg border border-sg-line bg-[#04142f] p-4" key={label}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-sg-muted">{label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
