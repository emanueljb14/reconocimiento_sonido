import React, { useEffect, useState, useRef } from 'react';
import { Bell, ChevronDown, Mic, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { roleLabel } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function Header({ title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // Cerrar el desplegable si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-sg-line bg-[#04112a]/80 px-4 py-3 backdrop-blur md:px-6">
      <div>
        <h1 className="text-lg font-bold">{title}</h1>
        {subtitle && <p className="text-xs text-sg-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full border border-sg-green/20 bg-sg-green/10 px-3 py-1.5 text-[10px] text-sg-green sm:flex">
          <ShieldCheck size={13} /> Sistema activo
        </span>

        <span className="hidden items-center gap-1.5 rounded-full border border-sg-cyan/20 bg-sg-cyan/10 px-3 py-1.5 text-[10px] text-sg-cyan md:flex">
          <Mic size={13} /> Micrófono conectado
        </span>

        <div className="hidden text-right sm:block">
          <p className="text-[10px] text-sg-muted">05 de octubre de 2025</p>
          <p className="text-xs font-semibold">
            {now.toLocaleTimeString('es-PE', { hour12: false })}
          </p>
        </div>

        <button className="relative rounded-lg p-2 text-sg-muted hover:bg-white/5 hover:text-white">
          <Bell size={19} />
          <i className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-sg-red" />
        </button>

        {/* Menú Desplegable de Usuario */}
        <div className="relative border-l border-sg-line pl-3" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-white/5 transition-colors focus:outline-none"
          >
            <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-300 text-xs font-bold text-slate-700">
              {user?.username?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold">{user?.username || user?.name || 'Usuario'}</p>
              <p className="text-[10px] text-sg-muted">{roleLabel(user?.role)}</p>
            </div>
            <ChevronDown
              size={14}
              className={`text-sg-muted transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Menú Flotante */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-sg-line bg-[#04112a] p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-sg-line sm:hidden">
                <p className="text-xs font-semibold">{user?.username || user?.name || 'Usuario'}</p>
                <p className="text-[10px] text-sg-muted">{roleLabel(user?.role)}</p>
              </div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}