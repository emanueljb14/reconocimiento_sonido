import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card'; // Utilizado si deseas envolver métricas o secciones
import { LineEvents, SoundBar, RiskPie } from '../../components/dashboard/Charts';

// Configuración o mock de los KPIs principales (fácilmente extraíble a un hook o API)
const INITIAL_STATS = [
  { value: '107', label: 'Total de eventos', change: '+12%', isPositive: true },
  { value: '91.7%', label: 'Precisión del modelo', change: '+0.5%', isPositive: true },
  { value: '89.4%', label: 'Confianza promedio', change: '-1.2%', isPositive: false },
  { value: '14', label: 'Eventos de riesgo alto', change: '+2', isPositive: false },
];

export default function AdminStatistics() {
  const [stats, setStats] = useState(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(false);

  // Ejemplo de estructura para consumo de API futura:
  /*
  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/statistics');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);
  */

  return (
    <DashboardLayout 
      title="Estadísticas" 
      subtitle="Analiza el comportamiento y rendimiento del sistema."
    >
      <div className="space-y-6">
        {/* Sección de Tarjetas KPI / Métricas */}
        <section aria-label="Métricas clave">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ value, label, change, isPositive }) => (
              <div 
                key={label} 
                className="glass rounded-xl p-5 border border-white/10 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold tracking-tight text-sg-text">{value}</p>
                  {change && (
                    <span 
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isPositive 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {change}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs font-medium text-sg-muted">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sección de Gráficos Principales */}
        <section className="grid gap-6 xl:grid-cols-2">
          <div className="glass rounded-xl p-4 border border-white/5">
            <LineEvents />
          </div>
          <div className="glass rounded-xl p-4 border border-white/5">
            <SoundBar />
          </div>
        </section>

        {/* Sección de Distribución de Riesgo */}
        <section className="glass rounded-xl p-4 border border-white/5">
          <RiskPie />
        </section>
      </div>
    </DashboardLayout>
  );
}