import React, { useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  
  const [settings, setSettings] = useLocalStorage('sg_settings', {
    notifications: true,
    mic: true,
    highRisk: true,
    autoStart: true,
  });

  const [theme, setTheme] = useLocalStorage('sg_theme', 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const patch = (k) => setSettings({ ...settings, [k]: !settings[k] });

  return (
    <DashboardLayout title="Configuración" subtitle="Personaliza tu experiencia y las alertas del sistema.">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Perfil + Selector de Tema integrado */}
        <Card title="Perfil y Apariencia" className="p-5">
          <div className="space-y-4">
            <Input label="Nombre" defaultValue={user?.name} />
            <Input label="Correo" defaultValue={user?.email} disabled />
            
            {/* Botones de Tema */}
            <div className="pt-2 border-t border-sg-line">
              <label className="text-xs font-semibold text-sg-muted block mb-2">Tema del sistema</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition ${
                    theme === 'dark'
                      ? 'border-sg-green bg-sg-green/10 text-sg-green'
                      : 'border-sg-line bg-slate-100 dark:bg-[#04142f] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  🌙 Modo Oscuro
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition ${
                    theme === 'light'
                      ? 'border-sg-green bg-sg-green/10 text-sg-green'
                      : 'border-sg-line bg-slate-100 dark:bg-[#04142f] text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ☀️ Modo Claro
                </button>
              </div>
            </div>

            <Button>Guardar cambios</Button>
          </div>
        </Card>

        {/* Notificaciones y alertas */}
        <Card title="Notificaciones y alertas" className="p-5">
          <div className="space-y-2">
            {[
              ['notifications', 'Notificaciones del sistema'],
              ['highRisk', 'Alertas de riesgo alto'],
              ['autoStart', 'Iniciar detección automáticamente'],
              ['mic', 'Permitir acceso al micrófono'],
            ].map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => patch(k)}
                className="flex w-full items-center justify-between rounded-lg border border-sg-line bg-slate-50 dark:bg-[#04142f] p-3 text-left transition-colors"
              >
                <span className="text-sm">{l}</span>
                <span
                  className={`relative h-5 w-9 rounded-full ${
                    settings[k] ? 'bg-sg-green' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                      settings[k] ? 'left-4' : 'left-0.5'
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Micrófono */}
        <Card title="Micrófono" className="p-5">
          <p className="text-sm font-semibold">Micrófono del navegador</p>
          <p className="mt-1 text-xs text-sg-muted">
            La aplicación solicitará permiso solo cuando se inicie una captura real de audio.
          </p>
          <div className="mt-4 rounded-lg border border-sg-green/20 bg-sg-green/5 p-3 text-xs text-sg-green">
            Estado: preparado
          </div>
        </Card>

        {/* Seguridad */}
        <Card title="Seguridad" className="p-5">
          <p className="text-sm">Sesión protegida con almacenamiento local para esta demo.</p>
          <p className="mt-1 text-xs text-sg-muted">
            En producción, reemplaza este mecanismo por sesiones seguras de backend.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}