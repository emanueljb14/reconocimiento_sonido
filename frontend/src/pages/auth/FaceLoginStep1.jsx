import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ScanFace, ArrowLeft, AlertCircle } from "lucide-react";
import AuthShell from "./AuthShell";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function FaceLoginStep1() {
    const [dni, setDni] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleNext = (e) => {
        e.preventDefault();
        const cleanDni = dni.trim();
        const regexDni = /^[0-9]{8}$/;

        if (!regexDni.test(cleanDni)) {
            setError("Por favor, ingrese un DNI válido de 8 dígitos numéricos.");
            return;
        }

        setError("");
        // Redirige al escáner facial pasando el DNI mediante estado de React Router
        navigate("/login-facial/escanear", { state: { dni: cleanDni } });
    };

    return (
        <AuthShell
            title="Autenticación Facial Biométrica"
            subtitle="Ingresa tu DNI registrado para iniciar el proceso de verificación."
        >
            <form onSubmit={handleNext} className="space-y-4">
                <div>
                    <Input
                        label="DNI del Usuario"
                        value={dni}
                        onChange={(e) => {
                            setDni(e.target.value.replace(/\D/g, ""));
                            if (error) setError("");
                        }}
                        placeholder="Ejemplo: 73829104"
                        type="text"
                        maxLength={8}
                        required
                    />
                    {error && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-400">
                            <AlertCircle size={13} /> {error}
                        </p>
                    )}
                </div>

                <Button 
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-950/50 border-none flex items-center justify-center gap-2 cursor-pointer" 
                    type="submit"
                >
                    <ScanFace size={18} />
                    Continuar al Escáner Facial
                </Button>
            </form>

            <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-sg-muted hover:text-white transition-colors">
                    <ArrowLeft size={14} /> Volver al inicio de sesión tradicional
                </Link>
            </div>
        </AuthShell>
    );
}