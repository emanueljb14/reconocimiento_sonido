import React from "react";
import { NavLink } from "react-router-dom";
import {
  Activity, BarChart3, Brain, ChevronRight, Database,
  History, Home, LogOut, Mic, Settings, Shield, Users, Volume2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const items = {
  admin: [
    ["Inicio", "/admin/dashboard", Home],
    ["Usuarios", "/admin/usuarios", Users],
    ["Detecciones", "/admin/detecciones", Activity],
    ["Historial", "/admin/historial", History],
    ["Estadísticas", "/admin/estadisticas", BarChart3],
    ["Dataset de audio", "/admin/dataset", Database],
    ["Modelo IA", "/admin/modelo-ia", Brain],
    ["Asistente de voz", "/admin/asistente", Volume2],
    ["Configuración", "/admin/configuracion", Settings],
  ],
  supervisor: [
    ["Inicio", "/supervisor/dashboard", Home],
    ["Detecciones", "/supervisor/detecciones", Activity],
    ["Historial", "/supervisor/historial", History],
    ["Estadísticas", "/supervisor/estadisticas", BarChart3],
    ["Configuración", "/supervisor/configuracion", Settings],
  ],
  user: [
    ["Inicio", "/user/dashboard", Home],
    ["Detecciones", "/user/detecciones", Activity],
    ["Historial", "/user/historial", History],
    ["Estadísticas", "/user/estadisticas", BarChart3],
    ["Configuración", "/user/configuracion", Settings],
  ],
};

function nombreRol(role) {
  if (role === "admin") return "Administrador";
  if (role === "supervisor") return "Supervisor";
  return "Usuario";
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const menu = items[user?.role] || [];

  return (
    <aside className="hidden w-[218px] shrink-0 border-r border-slate-200 dark:border-sg-line bg-white dark:bg-[#061633] text-slate-800 dark:text-white lg:flex lg:flex-col transition-colors duration-200">
      
      {/* Header Logo */}
      <div className="border-b border-slate-200 dark:border-sg-line px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-sg-blue/20 text-sg-blue dark:text-sg-cyan">
            <Mic size={22} />
          </div>
          <div>
            <div className="text-base font-bold leading-none">
              SoundGuard <span className="text-sg-blue dark:text-sg-cyan">AI</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-500 dark:text-sg-muted">
              Intelligent Sound Detection
            </div>
          </div>
        </div>
      </div>

      {/* Info Usuario */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-sg-line px-4 py-4">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300">
          <Shield size={18} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
            {user?.name || "Usuario"}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-sg-muted">
            Rol: {nombreRol(user?.role)}
          </p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="scrollbar flex-1 space-y-1 overflow-y-auto p-3">
        {menu.map(([label, to, Icon]) => (
          <NavLink
            key={to}
            to={to}
            end={label === "Inicio"}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition ${
                isActive
                  ? "bg-sg-blue text-white shadow-md"
                  : "text-slate-600 dark:text-sg-muted hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
              }`
            }
          >
            <Icon size={17} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={13} className="opacity-40" />
          </NavLink>
        ))}
      </nav>

      {/* Botón Logout */}
      <button
        type="button"
        onClick={logout}
        className="m-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-slate-600 dark:text-sg-muted transition hover:bg-red-500/10 hover:text-sg-red"
      >
        <LogOut size={17} />
        Cerrar sesión
      </button>

    </aside>
  );
}