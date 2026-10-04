import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DetectionTable from '../../components/detection/DetectionTable';
import { ShieldAlert, ShieldCheck, Activity, Radio, Radar, Flame } from 'lucide-react';

export default function UserDetections() {
  const [stats] = useState({
    total: 24,
    altoRiesgo: 3,
    medioRiesgo: 8,
    efectividad: '98.5%'
  });

  return (
    <DashboardLayout 
      title="Mis Detecciones" 
      subtitle="Supervisión espectral e inferencias acústicas procesadas en tiempo real por la red neuronal."
    >
      <div className="space-y-6">
        
        {/* BANNER RADAR Y KPI SUPERIORES */}
        <div className="grid gap-4 lg:grid-cols-12">
          
          {/* TARJETA DE RADAR SÓNICO (GIMMICK CYBERPUNK) */}
          <div className="lg:col-span-4 relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0a1224] via-[#0d1b3a] to-[#080d1a] p-5 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex items-center justify-between">
            <div className="relative z-10 space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-950/80 px-3 py-1 border border-cyan-500/40 text-[10px] font-black font-mono text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" /> SÓNAR ACTIVO
              </div>
              <h3 className="text-lg font-black text-white tracking-wide">Escaneo en Vivo</h3>
              <p className="text-xs text-slate-400">Capturando frecuencias de 20Hz a 20kHz</p>
            </div>

            {/* Animación del Radar */}
            <div className="relative h-20 w-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
              <div className="absolute inset-2 rounded-full border border-cyan-500/40" />
              <div className="absolute inset-4 rounded-full border border-cyan-500/60" />
              <Radar className="h-10 w-10 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          </div>

          {/* CONTADORES KPI NEÓN */}
          <div className="lg:col-span-8 grid gap-4 sm:grid-cols-3">
            
            {/* TOTAL DETECCIONES */}
            <div className="group rounded-2xl border border-slate-800 bg-[#0a1224]/90 p-4 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Procesados Hoy</span>
                <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 group-hover:scale-110 transition-transform">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-white font-mono">{stats.total}</span>
                <span className="text-[10px] font-mono font-extrabold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700/50">
                  +12% vs ayer
                </span>
              </div>
            </div>

            {/* RIESGO ALTO */}
            <div className="group rounded-2xl border border-slate-800 bg-[#0a1224]/90 p-4 backdrop-blur-xl transition-all duration-300 hover:border-red-500/60 hover:shadow-[0_0_25px_rgba(239,68,68,0.25)]">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Alertas Críticas</span>
                <div className="p-2 rounded-xl bg-red-950/60 border border-red-800/50 text-red-400 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-red-400 font-mono">{stats.altoRiesgo}</span>
                <span className="text-[10px] font-mono font-extrabold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-700/50 flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Urgente
                </span>
              </div>
            </div>

            {/* PRECISIÓN */}
            <div className="group rounded-2xl border border-slate-800 bg-[#0a1224]/90 p-4 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Fiabilidad Modelo</span>
                <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-black text-emerald-400 font-mono">{stats.efectividad}</span>
                <span className="text-[10px] font-mono font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                  Óptimo
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* TABLA PRINCIPAL */}
        <DetectionTable title="Historial de Detecciones Acústicas" />
      </div>
    </DashboardLayout>
  );
}