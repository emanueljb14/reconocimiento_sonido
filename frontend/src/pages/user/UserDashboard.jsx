<<<<<<< HEAD
import React from 'react';
import { Mic, AlertTriangle, Volume2, ShieldCheck, Activity, Radio, Sparkles, ChevronRight, Zap } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useDetections } from '../../context/DetectionContext';
import { SoundBar } from '../../components/dashboard/Charts';
import VoiceCard from '../../components/dashboard/VoiceCard';

export default function UserDashboard() {
  const { latest } = useDetections();
  
  const d = latest || {
    type: 'Alarma de Pánico',
    confidence: 96.8,
    risk: 'ALTO',
    time: '20:31:42'
  };

  const probs = [
    ['Alarma de Pánico', '96.8%'],
    ['Impacto / Golpe', '2.1%'],
    ['Apertura de Puerta', '1.0%'],
    ['Rotura de Vidrio', '0.8%'],
    ['Aplausos', '0.3%'],
    ['Ruido elevado', '0.2%']
  ];

  const eventosRecientes = [
    { time: '20:42', event: 'Impacto Estructural', confidence: '92%', risk: 'MEDIO', border: 'border-amber-500/40 text-amber-400 bg-amber-950/20', pulse: 'bg-amber-400' },
    { time: '20:38', event: 'Apertura Forzada', confidence: '87%', risk: 'BAJO', border: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20', pulse: 'bg-emerald-400' },
    { time: '20:31', event: 'Alarma de Pánico', confidence: '96%', risk: 'ALTO', border: 'border-red-500/40 text-red-400 bg-red-950/20', pulse: 'bg-red-500 animate-ping' },
    { time: '20:25', event: 'Rotura de Vidrio', confidence: '94%', risk: 'ALTO', border: 'border-red-500/40 text-red-400 bg-red-950/20', pulse: 'bg-red-500 animate-ping' },
    { time: '20:20', event: 'Anomalía Sonora', confidence: '88%', risk: 'BAJO', border: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20', pulse: 'bg-emerald-400' }
  ];

  return (
    <DashboardLayout title="Panel de Control de Usuario" subtitle="Inferencia acústica en tiempo real e historial analítico.">
      <div className="space-y-5">

        {/* BANNERS SUPERIORES */}
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          
          {/* Card Captura Activa (con destello verde de pulso) */}
          <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-[#0a1224] via-[#0d1830] to-[#0a1224] p-4.5 transition-all duration-300 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-0.5">
            <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none animate-pulse" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative grid h-13 w-13 place-items-center rounded-xl bg-emerald-950/90 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-105 transition-transform">
                <Mic className="h-6 w-6 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
                    Nodo de Captura Activo
                  </h3>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-500/40 animate-pulse">
                    EN LÍNEA
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">DSP Audio Core v2.4 • Escucha continua a 22.05 kHz</p>
              </div>
            </div>
          </div>

          {/* Card Amplitud / Signal Bar (con barra parpadeante) */}
          <div className="group rounded-2xl border border-slate-800 bg-[#0a1224] p-4.5 transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:-translate-y-0.5 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} /> AMPLITUD DE SEÑAL
              </span>
              <span className="text-cyan-400 font-bold font-mono bg-cyan-950/80 px-2.5 py-0.5 rounded-md border border-cyan-800/50 text-[11px] animate-pulse">
                68 %
              </span>
            </div>
            <div className="my-2.5 h-2.5 w-full rounded-full bg-slate-950 border border-slate-800/80 overflow-hidden p-0.5 relative">
              <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 transition-all duration-500 animate-pulse" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-60 dB</span>
              <span className="text-cyan-400/80 font-bold animate-pulse">-20 dB</span>
              <span>0 dB</span>
            </div>
          </div>

        </div>

        {/* MAIN PANEL GRID */}
        <div className="grid gap-5 xl:grid-cols-[1fr_1fr_1fr]">

          {/* 1. Evento Acústico Dominante (alerta en rojo parpadeante estilo emergencia) */}
          <div className="group relative overflow-hidden rounded-2xl border border-red-500/40 bg-gradient-to-b from-[#140a12] via-[#0e1629] to-[#0a1224] p-5 transition-all duration-300 hover:border-red-400 hover:shadow-[0_0_35px_rgba(239,68,68,0.35)] hover:-translate-y-0.5 flex flex-col justify-between">
            <div className="absolute top-0 right-0 h-20 w-20 bg-red-500/10 rounded-full blur-xl animate-ping pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-red-400 font-bold text-[11px] tracking-wider uppercase flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Evento Acústico Dominante
                </span>
                <span className="text-red-400 font-mono text-[10px] bg-red-950/80 px-2 py-0.5 rounded border border-red-800/50 animate-pulse">
                  {d.time}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="relative grid h-13 w-13 place-items-center rounded-xl bg-red-950/80 text-red-500 border border-red-500/50 shrink-0 group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                  <AlertTriangle className="h-7 w-7 animate-bounce" style={{ animationDuration: '2s' }} />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
                    {d.type}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Confianza de IA: <b className="text-cyan-400 font-mono font-bold text-sm animate-pulse">{d.confidence}%</b>
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-slate-400 font-medium">Nivel de Riesgo:</span>
                    <Badge risk={d.risk}>{d.risk}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-600 bg-[length:200%_auto] hover:bg-right py-3 text-xs font-black text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.98] flex items-center justify-center gap-2 border border-cyan-400/30 group-hover:border-cyan-400"
              onClick={() => window.speechSynthesis?.speak(new SpeechSynthesisUtterance(`Alerta ${d.type}, nivel de riesgo ${d.risk}`))}
            >
              <Volume2 size={16} className="animate-pulse" /> REPRODUCIR ALERTA VOCAL
            </button>
          </div>

          {/* 2. Red Neuronal de Desglose (con destellos en las barras) */}
          <div className="group rounded-2xl border border-slate-800 bg-[#0a1224] p-5 transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" /> RED NEURONAL DE DESGLOSE
              </h3>
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>

            <div className="space-y-3">
              {probs.map(([nombre, porcentaje], idx) => (
                <div key={nombre} className="group/item">
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className="text-slate-300 group-hover/item:text-cyan-300 font-medium transition-colors">{nombre}</span>
                    <span className={`font-mono font-bold ${idx === 0 ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`}>{porcentaje}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-900">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ${idx === 0 ? 'animate-pulse' : ''}`}
                      style={{ width: porcentaje }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Registro Operativo en Vivo (eventos con indicador parpadeante) */}
          <div className="group rounded-2xl border border-slate-800 bg-[#0a1224] p-5 transition-all duration-300 hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.25)] hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400 animate-bounce" style={{ animationDuration: '3s' }} /> REGISTRO OPERATIVO EN VIVO
              </h3>
              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 animate-pulse">
                5 Eventos
              </span>
            </div>

            <div className="space-y-2">
              {eventosRecientes.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-[#0d1830]/60 p-2.5 text-[11px] transition-all duration-200 hover:border-cyan-400 hover:bg-[#122040] hover:translate-x-1 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer group/row"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${item.pulse}`} />
                    <span className="font-mono text-slate-400 text-[10px]">{item.time}</span>
                  </div>
                  <span className="font-semibold text-slate-200 flex-1 px-3 truncate group-hover/row:text-cyan-300 transition-colors">{item.event}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[10px]">{item.confidence}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${item.border}`}>
                      {item.risk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CHARTS & VOICE ASSISTANT */}
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
=======
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
>>>>>>> 7928f69916d0abdf3d464c34d8040db02462f9a0
          <SoundBar />
          <VoiceCard />
        </div>

<<<<<<< HEAD
        {/* FOOTER ENTERPRISE CON RESPLANDOR */}
        <div className="group rounded-2xl border border-indigo-900/40 bg-gradient-to-r from-[#0a1224] via-[#0e172e] to-[#0a1224] p-4 transition-all duration-300 hover:border-indigo-400 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-indigo-950/80 text-indigo-400 rounded-xl border border-indigo-800/50 group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <ShieldCheck className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-white text-xs tracking-wide flex items-center gap-2">
                Sistema de Protección Acústica Empresarial
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
              </p>
              <p className="text-[11px] text-slate-400">Algoritmos Deep Learning procesando patrones sonoros en tiempo real.</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
        </div>

      </div>
    </DashboardLayout>
  );
}
=======
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
>>>>>>> 7928f69916d0abdf3d464c34d8040db02462f9a0
