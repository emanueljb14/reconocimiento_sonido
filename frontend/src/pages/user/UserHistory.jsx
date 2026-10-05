import React from 'react';
import { Clock3 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useDetections } from '../../context/DetectionContext';

export default function AdminHistory() {
  const { detections } = useDetections();

  // Historial con datos cargados por defecto
  const defaultHistory = [
    { id: 'REC-1092', type: 'Alarma de Pánico', risk: 'ALTO', date: '2026-10-04', time: '19:42:10', confidence: 98.5, duration: 4.2 },
    { id: 'REC-1091', type: 'Grito Detectado', risk: 'ALTO', date: '2026-10-04', time: '18:15:02', confidence: 95.1, duration: 2.8 },
    { id: 'REC-1090', type: 'Vidrio Roto / Golpe', risk: 'MEDIO', date: '2026-10-04', time: '15:30:45', confidence: 89.0, duration: 1.5 },
    { id: 'REC-1089', type: 'Apertura Forzada', risk: 'MEDIO', date: '2026-10-04', time: '11:20:12', confidence: 86.3, duration: 5.0 },
    { id: 'REC-1088', type: 'Ruido Anómalo Fuerte', risk: 'BAJO', date: '2026-10-03', time: '22:05:19', confidence: 72.8, duration: 3.1 },
  ];

  const historyList = detections && detections.length > 0 ? detections : defaultHistory;

  return (
    <DashboardLayout 
      title="Historial" 
      subtitle="Consulta la actividad detectada de tu cuenta."
    >
      <Card title="Historial reciente" className="p-4">
        <div className="space-y-3">
          {historyList.map((d) => (
            <div key={d.id} className="flex gap-3 rounded-lg border border-sg-line bg-[#04142f] p-3 hover:bg-[#06193b] transition">
              <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sg-blue/15 text-sg-cyan">
                <Clock3 size={15} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">{d.type}</p>
                  <Badge risk={d.risk}>{d.risk}</Badge>
                </div>
                <p className="mt-1 text-xs text-sg-muted">
                  {d.date} · {d.time} · Confianza {d.confidence}% · Duración {d.duration}s
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}