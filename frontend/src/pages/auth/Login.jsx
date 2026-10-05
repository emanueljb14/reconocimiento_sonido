import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, ScanFace } from "lucide-react";
import AuthShell from "./AuthShell";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { roleHome } from "../../utils/helpers";

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [remember, setRemember] = useState(true);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    // Rellena el campo usuario si proviene de la validación biométrica
    useEffect(() => {
        if (location.state?.recognizedUsername) {
            setUsername(location.state.recognizedUsername);
        }
    }, [location.state]);

    const submit = async (event) => {
        event.preventDefault();
        setErr("");
        setLoading(true);

        try {
            const result = await login(username.trim(), password, remember);

            if (!result.ok) {
                setErr(result.error);
                return;
            }

            nav(roleHome(result.user.role), { replace: true });
        } catch (error) {
            setErr("No se pudo conectar con el servidor. Verifica que Django esté ejecutándose.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Bienvenido de nuevo"
            subtitle="Inicia sesión para entrar a tu panel de SoundGuard AI."
        >
            <form onSubmit={submit} className="space-y-4">
                <Input
                    label="Usuario"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Ingresa tu usuario"
                    type="text"
                    required
                />

                <div>
                    <label className="block space-y-1.5">
                        <span className="text-xs text-sg-muted">Contraseña</span>
                        <div className="relative">
                            <input
                                className="w-full rounded-lg border border-sg-line bg-[#04132d] px-3 py-2.5 pr-10 text-sm outline-none focus:border-sg-cyan"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                type={show ? "text" : "password"}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShow(!show)}
                                className="absolute right-3 top-2.5 text-sg-muted"
                                aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {show ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>
                    </label>
                </div>

                {err && (
                    <p className="rounded-lg border border-sg-red/30 bg-sg-red/10 p-2 text-xs text-sg-red">
                        {err}
                    </p>
                )}

                <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 text-sg-muted">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(event) => setRemember(event.target.checked)}
                            className="accent-sg-cyan"
                        />
                        Recordarme
                    </label>
                    <Link to="/forgot-password" className="text-sg-cyan hover:underline">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                <Button className="w-full py-3" type="submit" disabled={loading}>
                    <Lock size={15} className="mr-2 inline" />
                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                    {!loading && <ArrowRight size={15} className="ml-2 inline" />}
                </Button>
            </form>

            {/* SEPARADOR DE MÉTODOS DE AUTENTICACIÓN */}
            <div className="my-6 flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-sg-line" />
                <span className="text-[11px] font-medium text-sg-muted uppercase tracking-wider">O accede con</span>
                <div className="h-[1px] flex-1 bg-sg-line" />
            </div>

            {/* BOTÓN DE ACCESO BIOMÉTRICO FACIAL */}
            <button
                type="button"
                onClick={() => nav("/login-facial")}
                className="w-full py-3 px-4 rounded-xl border border-purple-500/40 bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-purple-900/30 hover:from-purple-800/40 hover:to-indigo-800/40 text-purple-200 hover:text-white font-semibold text-xs transition flex items-center justify-center gap-2.5 shadow-lg shadow-purple-950/30 group cursor-pointer"
            >
                <ScanFace size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
                Iniciar sesión con Reconocimiento Facial
            </button>

            <p className="mt-6 text-center text-xs text-sg-muted">
                ¿No tienes una cuenta?{" "}
                <Link to="/register" className="font-semibold text-sg-cyan">
                    Crear una cuenta
                </Link>
            </p>
        </AuthShell>
    );
}