import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { ScanFace, ArrowLeft, Sun, Sliders, CheckCircle2, AlertCircle } from "lucide-react";
import AuthShell from "./AuthShell";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { roleHome } from "../../utils/helpers";

export default function FaceLogin() {
    const webcamRef = useRef(null);
    const nav = useNavigate();
    const { loginWithToken } = useAuth?.() || {};

    const [dni, setDni] = useState("");
    const [brillo, setBrillo] = useState(100);
    const [contraste, setContraste] = useState(100);
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState(null);

    const escanearRostro = async (e) => {
        e.preventDefault();
        if (!dni.trim()) return alert("Por favor ingrese su DNI o Usuario");

        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return alert("No se pudo capturar la imagen de la cámara");

        setLoading(true);
        setResultado(null);

        try {
            const response = await fetch("http://localhost:8000/api/inteligencia/login-facial/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dni: dni.trim(), image: imageSrc }),
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                setResultado({
                    exito: true,
                    mensaje: data.message,
                    similitud: data.similitud,
                    distancia: data.distancia,
                    tolerancia: 0.42,
                });

                if (loginWithToken) {
                    loginWithToken(data.token, data.user);
                } else {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                }

                setTimeout(() => {
                    nav(roleHome(data.user?.rol || "user"), { replace: true });
                }, 1800);
            } else {
                setResultado({
                    exito: false,
                    mensaje: data.detail || "Verificación fallida",
                    similitud: data.similitud || 0,
                    distancia: data.distancia || 1.0,
                    tolerancia: 0.42,
                });
            }
        } catch (error) {
            setResultado({
                exito: false,
                mensaje: "Error al conectar con el servidor.",
                similitud: 0,
                distancia: 1.0,
                tolerancia: 0.42,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Escaneo Facial Biométrico"
            subtitle="Identifícate mediante la cámara para acceder directamente a tu panel."
        >
            <form onSubmit={escanearRostro} className="space-y-4">
                <Input
                    label="DNI / Usuario"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="Ingresa tu DNI registrado"
                    type="text"
                    required
                />

                {/* Visor de Cámara */}
                <div className="relative overflow-hidden rounded-xl border border-sg-line bg-[#04132d]">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ width: 400, height: 300, facingMode: "user" }}
                        style={{
                            filter: `brightness(${brillo}%) contrast(${contraste}%)`,
                            width: "100%",
                            height: "240px",
                            objectFit: "cover",
                        }}
                    />
                </div>

                {/* Controles de Adaptación de Brillo/Contraste */}
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-sg-line bg-[#04132d]/60 p-2.5 text-xs">
                    <div className="space-y-1">
                        <div className="flex justify-between text-sg-muted">
                            <span className="flex items-center gap-1"><Sun size={12} /> Brillo</span>
                            <span>{brillo}%</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="200"
                            value={brillo}
                            onChange={(e) => setBrillo(e.target.value)}
                            className="w-full accent-sg-cyan cursor-pointer"
                        />
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sg-muted">
                            <span className="flex items-center gap-1"><Sliders size={12} /> Contraste</span>
                            <span>{contraste}%</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="200"
                            value={contraste}
                            onChange={(e) => setContraste(e.target.value)}
                            className="w-full accent-sg-cyan cursor-pointer"
                        />
                    </div>
                </div>

                <Button className="w-full py-3" type="submit" disabled={loading}>
                    <ScanFace size={18} className="mr-2 inline" />
                    {loading ? "Validando rostro..." : "Escanear y Validar"}
                </Button>
            </form>

            {/* Panel Metrológico (Barra de similitud, distancia y umbral) */}
            {resultado && (
                <div className={`mt-4 rounded-lg border p-3 text-xs space-y-2 ${resultado.exito ? 'border-green-500/30 bg-green-500/10 text-green-300' : 'border-sg-red/30 bg-sg-red/10 text-sg-red'}`}>
                    <div className="flex items-center gap-2 font-bold">
                        {resultado.exito ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span>{resultado.mensaje}</span>
                    </div>

                    <div>
                        <div className="flex justify-between text-[11px] mb-1">
                            <span>Similitud Facial:</span>
                            <span className="font-bold">{resultado.similitud}%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-[#04132d] overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${resultado.exito ? 'bg-green-400' : 'bg-sg-red'}`}
                                style={{ width: `${resultado.similitud}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-1.5 text-[10px] text-sg-muted">
                        <div>Distancia: <b className="text-white">{resultado.distancia}</b></div>
                        <div>Umbral Estricto: <b className="text-white">{resultado.tolerancia}</b></div>
                    </div>
                </div>
            )}

            <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-sg-muted hover:text-sg-cyan">
                    <ArrowLeft size={14} /> Volver al login tradicional
                </Link>
            </div>
        </AuthShell>
    );
}