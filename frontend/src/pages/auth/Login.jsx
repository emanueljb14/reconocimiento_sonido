import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthShell from './AuthShell';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { roleHome } from '../../utils/helpers';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [e, setE] = useState('');
  const [p, setP] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (x) => {
    x.preventDefault();
    setErr('');
    setLoading(true);

    const r = await login(e, p, remember);
    setLoading(false);

    if (!r.ok) {
      setErr(r.error);
    } else {
      nav(roleHome(r.user.role));
    }
  };

  return (
    <AuthShell title="Bienvenido de nuevo" subtitle="Inicia sesión para entrar a tu panel de SoundGuard AI.">
      <form onSubmit={submit} className="space-y-4">
        <Input 
          label="Usuario / Correo" 
          value={e} 
          onChange={(x) => setE(x.target.value)} 
          placeholder="nombre_usuario" 
          type="text"
        />
        <div>
          <label className="block space-y-1.5">
            <span className="text-xs text-sg-muted">Contraseña</span>
            <div className="relative">
              <input 
                className="w-full rounded-lg border border-sg-line bg-[#04132d] px-3 py-2.5 pr-10 text-sm outline-none focus:border-sg-cyan" 
                value={p} 
                onChange={(x) => setP(x.target.value)} 
                type={show ? 'text' : 'password'}
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-sg-muted">
                {show ? <EyeOff size={17}/> : <Eye size={17}/>}
              </button>
            </div>
          </label>
        </div>

        {err && <p className="rounded-lg border border-sg-red/30 bg-sg-red/10 p-2 text-xs text-sg-red">{err}</p>}

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-sg-muted">
            <input type="checkbox" checked={remember} onChange={(x) => setRemember(x.target.checked)} className="accent-sg-cyan"/>
            Recordarme
          </label>
          <Link to="/forgot-password" className="text-sg-cyan hover:underline">¿Olvidaste tu contraseña?</Link>
        </div>

        <Button className="w-full py-3" type="submit" disabled={loading}>
          <Lock size={15} className="mr-2 inline"/>
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          <ArrowRight size={15} className="ml-2 inline"/>
        </Button>
      </form>
      <p className="mt-6 text-center text-xs text-sg-muted">
        ¿No tienes una cuenta? <Link to="/register" className="font-semibold text-sg-cyan">Crear una cuenta</Link>
      </p>
    </AuthShell>
  );
}