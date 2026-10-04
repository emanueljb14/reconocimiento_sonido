import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ScanFace, ArrowLeft, User } from "lucide-react";
import AuthShell from "./AuthShell";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function FaceLoginStep1() {
    const [dni, setDni] = useState("");
    const navigate = useNavigate();

    const handleNext = (e) => {
        e.preventDefault();
        if (!dni.trim()) return alert("Por favor ingrese su DNI o Usuario");
        // Redirige a la ventana completa pasando el DNI mediante estado
        navigate("/login-facial/escanear", { state: { dni: dni.trim() } });
    };

    return (
        <AuthShell
            title="Escaneo Facial Biométrico"
            subtitle="Ingresa tu identificación para iniciar el proceso de escaneo."
        >
            <form onSubmit={handleNext} className="space-y-5">
                <Input
                    label="DNI / Usuario"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="Ingresa tu DNI registrado"
                    type="text"
                    required
                />

                <Button 
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-950/50 border-none flex items-center justify-center gap-2" 
                    type="submit"
                >
                    <ScanFace size={18} />
                    Continuar al Escáner
                </Button>
            </form>

            <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-sg-muted hover:text-white transition-colors">
                    <ArrowLeft size={14} /> Volver al login tradicional
                </Link>
            </div>
        </AuthShell>
    );
}