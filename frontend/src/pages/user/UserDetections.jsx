import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Activity, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  History, 
  Radio, 
  Inbox 
} from 'lucide-react';

export default function UserDetection() {
  const [isListening, setIsListening] = useState(true);

  // Historial de detecciones vacío
  const recentDetections = [];

  return (
    <DashboardLayout
      title="Detección en Tiempo Real"
      subtitle="Monitoreo acústico activo y registro de últimas capturas del sistema."
    >
      <div className="space-y-6 max-w-7xl">
        
        {/* PANEL PRINCIPAL DE MONITOREO Y ESPECTRO */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* ESTADO DEL MICRÓFONO / CAPTURA */}
          <div className="rounded-2xl border border-slate-800 bg-[#0a1224]/90 p-6 backdrop-blur-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Radio className={`w-4 h-4 ${isListening ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
                Sensor Acústico
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isListening ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60' : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}>
                {isListening ? 'EN VIVO' : 'PAUSADO'}
              </span>
            </div>

            <div className="my-8 text-center space-y-4">
              <div className="relative inline-block">
                <div className={`p-6 rounded-full border-2 transition-all duration-500 ${
                  isListening 
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]' 
                    : 'border-slate-800 bg-slate-900 text-slate-600'
                }`}>
                  {isListening ? <Mic className="w-12 h-12 animate-bounce" /> : <MicOff className="w-12 h-12" />}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">
                  {isListening ? 'Escuchando ambiente...' : 'Captura Suspendida'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isListening ? 'Análisis espectral mediante IA activo' : 'Presiona el botón para reanudar el análisis'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsListening(!isListening)}
              className={`w-full py-3 rounded-xl font-bold text-xs font-mono transition-all duration-300 flex items-center justify-center gap-2 ${
                isListening
                  ? 'bg-red-950/80 text-red-400 border border-red-700/60 hover:bg-red-900/60'
                  : 'bg-cyan-500 text-black border border-cyan-400 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
              }`}
            >
              {isListening ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isListening ? 'PAUSAR DETECCIÓN' : 'INICIAR MONITOREO'}</span>
            </button>
          </div>

          {/* VISUALIZADOR ESPECTRAL (ONDA VIVA) */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#0a1224]/90 p-6 backdrop-blur-2xl flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Espectrómetro de Frecuencias
              </span>
              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
                <span>Ganancia: <strong className="text-cyan-400">+12 dB</strong></span>
                <span>Ruido base: <strong className="text-slate-200">34 dB</strong></span>
              </div>
            </div>

            {/* ONDA DE FRECUENCIA SIMULADA */}
            <div className="my-6 h-40 flex items-end gap-1.5 px-2 justify-between">
              {[30, 45, 25, 60, 80, 40, 95, 70, 50, 100, 85, 40, 65, 30, 90, 75, 50, 35, 80, 60, 40, 90, 100, 65, 45, 30, 70, 85, 40, 20].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    style={{ height: isListening ? `${Math.floor(Math.random() * 80) + 15}%` : '8%' }}
                    className={`w-full rounded-t transition-all duration-200 ${
                      isListening
                        ? val > 80
                          ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                          : val > 50
                          ? 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                          : 'bg-blue-600/60'
                        : 'bg-slate-800'
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-slate-800/80 pt-4 text-center">
              <div className="bg-[#0d1830] p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-mono">Nivel de Entrada</span>
                <span className="text-sm font-black text-cyan-400 font-mono">58.4 dB</span>
              </div>
              <div className="bg-[#0d1830] p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-mono">Pico Máximo</span>
                <span className="text-sm font-black text-slate-500 font-mono">-- dB</span>
              </div>
              <div className="bg-[#0d1830] p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-mono">Estado IA</span>
                <span className="text-sm font-black text-emerald-400 font-mono">Procesando</span>
              </div>
            </div>
          </div>

        </div>

        {/* CONTENEDOR DE DETECCIONES RECIENTES VACÍO */}
        <div className="rounded-2xl border border-slate-800 bg-[#0a1224]/90 backdrop-blur-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-black text-white tracking-wide">
                Detecciones Recientes
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Capturas registradas durante esta sesión
            </span>
          </div>

          {/* ESTADO VACÍO CLEAN NEÓN */}
          <div className="p-10 text-center rounded-xl border border-dashed border-slate-800/80 bg-[#070d19]/50 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
            <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-600">
              <Inbox className="w-6 h-6 text-slate-500" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono font-bold text-slate-400">
                No hay detecciones registradas en este momento
              </p>
              <p className="text-[11px] text-slate-600">
                Los eventos anómalos o de pánico detectados por el micrófono aparecerán aquí automáticamente.
              </p>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}