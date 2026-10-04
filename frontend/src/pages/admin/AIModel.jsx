import React from "react";
import { Brain, CheckCircle2, RefreshCw } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { LineEvents } from "../../components/dashboard/Charts";

export default function AIModel() {
  return (
    <DashboardLayout
      title="Modelo de IA"
      subtitle="Estado, métricas y clases reconocidas por SoundGuard AI."
    >
      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-sg-purple/15 text-sg-purple">
                <Brain size={28} />
              </div>
              <div>
                <p className="text-lg font-bold">Modelo de IA</p>
                <p className="text-xs text-sg-muted">
                  Información disponible cuando el backend entregue los datos.
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1.5 rounded-full bg-sg-green/10 px-3 py-1.5 text-xs text-sg-green">
              <CheckCircle2 size={14} /> Sin datos
            </span>
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["--", "Accuracy"],
            ["--", "Precision"],
            ["--", "Recall"],
            ["--", "F1 Score"],
          ].map(([value, label]) => (
            <div className="glass rounded-xl p-4" key={label}>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-sg-muted">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
          <LineEvents />

          <Card title="Clases detectadas" className="p-4">
            <div className="flex min-h-[220px] items-center justify-center text-xs text-sg-muted">
              Sin datos del backend.
            </div>

            <Button className="mt-4 w-full">
              <RefreshCw size={14} className="mr-2 inline" />
              Ver rendimiento
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
