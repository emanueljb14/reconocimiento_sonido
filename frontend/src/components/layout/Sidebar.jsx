import React from "react";

import {
    NavLink,
} from "react-router-dom";

import {
    Activity,
    BarChart3,
    Brain,
    Camera,
    ChevronRight,
    Database,
    History,
    Home,
    LogOut,
    Mic,
    Settings,
    Shield,
    Users,
    Volume2,
} from "lucide-react";

import {
    useAuth,
} from "../../context/AuthContext";


const items = {
    admin: [
        [
            "Inicio",
            "/admin/dashboard",
            Home,
        ],
        [
            "Usuarios",
            "/admin/usuarios",
            Users,
        ],
        [
            "Registro Facial",
            "/admin/registro-facial",
            Camera,
        ],
        [
            "Detecciones",
            "/admin/detecciones",
            Activity,
        ],
        [
            "Historial",
            "/admin/historial",
            History,
        ],
        [
            "Estadísticas",
            "/admin/estadisticas",
            BarChart3,
        ],
        [
            "Dataset de audio",
            "/admin/dataset",
            Database,
        ],
        [
            "Modelo IA",
            "/admin/modelo-ia",
            Brain,
        ],
        [
            "Asistente de voz",
            "/admin/asistente",
            Volume2,
        ],
        [
            "Configuración",
            "/admin/configuracion",
            Settings,
        ],
    ],

    supervisor: [
        [
            "Inicio",
            "/supervisor/dashboard",
            Home,
        ],
        [
            "Registro Facial",
            "/supervisor/registro-facial",
            Camera,
        ],
        [
            "Detecciones",
            "/supervisor/detecciones",
            Activity,
        ],
        [
            "Historial",
            "/supervisor/historial",
            History,
        ],
        [
            "Estadísticas",
            "/supervisor/estadisticas",
            BarChart3,
        ],
        [
            "Configuración",
            "/supervisor/configuracion",
            Settings,
        ],
    ],

    user: [
        [
            "Inicio",
            "/user/dashboard",
            Home,
        ],
        [
            "Registro Facial",
            "/user/registro-facial",
            Camera,
        ],
        [
            "Detecciones",
            "/user/detecciones",
            Activity,
        ],
        [
            "Historial",
            "/user/historial",
            History,
        ],
        [
            "Estadísticas",
            "/user/estadisticas",
            BarChart3,
        ],
        [
            "Configuración",
            "/user/configuracion",
            Settings,
        ],
    ],
};


function nombreRol(role) {
    if (role === "admin") {
        return "Administrador";
    }

    if (role === "supervisor") {
        return "Supervisor";
    }

    return "Usuario";
}


export default function Sidebar() {
    const {
        user,
        logout,
    } = useAuth();

    const menu =
        items[user?.role] || [];

    return (
        <aside
            className="
                hidden
                w-[218px]
                shrink-0
                border-r
                border-sg-line
                bg-[#061633]
                lg:sticky
                lg:top-0
                lg:flex
                lg:h-screen
                lg:self-start
                lg:flex-col
            "
        >

            {/* LOGO */}
            <div className="shrink-0 border-b border-sg-line px-4 py-4">

                <div className="flex items-center gap-2">

                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-sg-blue/20 text-sg-cyan">
                        <Mic size={22} />
                    </div>

                    <div>

                        <div className="text-base font-bold leading-none">
                            SoundGuard{" "}
                            <span className="text-sg-cyan">
                                AI
                            </span>
                        </div>

                        <div className="mt-1 text-[10px] text-sg-muted">
                            Intelligent Sound Detection
                        </div>

                    </div>

                </div>

            </div>


            {/* USUARIO */}
            <div className="shrink-0 flex items-center gap-3 border-b border-sg-line px-4 py-4">

                <div className="grid h-9 w-9 place-items-center rounded-full bg-purple-500/20 text-purple-300">
                    <Shield size={18} />
                </div>

                <div className="min-w-0">

                    <p className="truncate text-xs font-semibold">
                        {user?.name || "Usuario"}
                    </p>

                    <p className="text-[10px] text-sg-muted">
                        Rol: {nombreRol(user?.role)}
                    </p>

                </div>

            </div>


            {/* MENÚ */}
            <nav className="scrollbar shrink-0 space-y-1 overflow-y-auto p-3">

                {menu.map(
                    ([
                        label,
                        to,
                        Icon,
                    ]) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={
                                label === "Inicio"
                            }
                            className={({
                                isActive,
                            }) =>
                                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition ${
                                    isActive
                                        ? "bg-sg-blue text-white shadow-lg shadow-blue-950/40"
                                        : "text-sg-muted hover:bg-white/5 hover:text-white"
                                }`
                            }
                        >

                            <Icon size={17} />

                            <span className="flex-1">
                                {label}
                            </span>

                            <ChevronRight
                                size={13}
                                className="opacity-40"
                            />

                        </NavLink>
                    )
                )}

            </nav>


            {/* CERRAR SESIÓN */}
            <div className="shrink-0 px-3 pt-2">

                <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-sg-muted transition hover:bg-sg-red/10 hover:text-sg-red"
                >
                    <LogOut size={17} />

                    <span>
                        Cerrar sesión
                    </span>
                </button>

            </div>


            {/* ESPACIO LIBRE */}
            <div className="flex-1" />

        </aside>
    );
}