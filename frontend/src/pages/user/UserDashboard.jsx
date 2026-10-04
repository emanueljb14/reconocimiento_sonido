import React from "react";
import { Mic, AlertTriangle, Volume2, ShieldCheck } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useDetections } from "../../context/DetectionContext";
import { SoundBar } from "../../components/dashboard/Charts";
import VoiceCard from "../../components/dashboard/VoiceCard";

export default function UserDashboard() {
  const { latest, detections } = useDetections();

  const probabilities = latest?.raw?.probabilidades
    ? Object.entries(latest.raw.probabilidades).sort(([, a], [, b]) => Number(b) - Number(a))
    : [];

  return (
    <DashboardLayout
      title="Panel de Usuario"
      subtitle="Visualiza las detecciones y tu actividad en el sistema."
    >
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <Card className="border-sg-green/30 bg-sg-green/5 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-sg-green/15 text-sg-green">
                <Mic />
              </div>
              <div>
                <p className="font-semibold">Escuchando sonidos...</p>
                <p className="text-xs text-sg-muted">Micrófono activo para detectar eventos.</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex justify-between text-xs">
              <span className="text-sg-muted">Nivel de sonido</span>
              <b>--</b>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div className="h-full w-0 rounded-full bg-sg-cyan" />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
          <Card className="border-sg-red/30 p-4">
            {latest ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-sg-red/15 text-sg-red">
                    <AlertTriangle />
                  </div>
                  <div>
                    <p className="text-xs text-sg-muted">Última detección</p>
                    <p className="font-bold">{latest.type}</p>
                    <p className="text-xs text-sg-muted">
                      Confianza: <b className="text-white">{latest.confidence}%</b>
                    </p>
                    <p className="text-xs text-sg-muted">
                      Riesgo: <Badge risk={latest.risk}>{latest.risk}</Badge>
                    </p>
                    <p className="mt-1 text-[10px] text-sg-muted">Hora: {latest.time}</p>
                  </div>
                </div>

                <button
                  className="mt-4 w-full rounded-lg bg-sg-blue py-2 text-xs"
                  onClick={() =>
                    window.speechSynthesis?.speak(
                      new SpeechSynthesisUtterance(
                        `Alerta ${latest.type}, riesgo ${latest.risk}`
                      )
                    )
                  }
                >
                  <Volume2 size={14} className="mr-2 inline" />
                  Reproducir alerta
                </button>
              </>
            ) : (
              <div className="flex min-h-[180px] items-center justify-center text-center">
                <div>
                  <AlertTriangle className="mx-auto text-sg-muted" />
                  <p className="mt-3 text-sm font-semibold">Sin detecciones</p>
                  <p className="mt-1 text-xs text-sg-muted">
                    Aquí aparecerá la última detección enviada por el backend.
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card title="Probabilidad por clase" className="p-4">
            {probabilities.length === 0 ? (
              <div className="flex min-h-[150px] items-center justify-center text-xs text-sg-muted">
                Sin datos del backend.
              </div>
            ) : (
              <div className="space-y-2.5">
                {probabilities.map(([name, value]) => {
                  const porcentaje = Number(value) <= 1 ? Number(value) * 100 : Number(value);
                  return (
                    <div key={name}>
                      <div className="mb-1 flex justify-between text-[10px]">
                        <span>{name}</span>
                        <span className="text-sg-muted">{porcentaje.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-sg-cyan"
                          style={{ width: `${Math.max(0, Math.min(100, porcentaje))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title="Eventos recientes" className="p-4">
            {detections.length === 0 ? (
              <div className="flex min-h-[150px] items-center justify-center text-xs text-sg-muted">
                Sin datos del backend.
              </div>
            ) : (
              <div className="space-y-2">
                {detections.slice(0, 5).map((event) => (
                  <div
                    className="flex justify-between rounded-md border border-sg-line bg-[#04142f] px-2 py-2 text-[10px]"
                    key={event.id}
                  >
                    <span>{event.time} {event.type}</span>
                    <span>{event.confidence}% {event.risk}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_330px]">
          <SoundBar />
          <VoiceCard />
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-sg-purple" />
            <div>
              <p className="font-semibold">Tu seguridad también se escucha</p>
              <p className="text-xs text-sg-muted">
                SoundGuard AI detecta los sonidos importantes por ti.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
