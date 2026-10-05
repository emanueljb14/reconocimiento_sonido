import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import * as faceapi from "@vladmandic/face-api";
import { 
    Camera, 
    ArrowLeft, 
    ShieldCheck, 
    CheckCircle2, 
    AlertCircle, 
    RefreshCw, 
    Info,
    User,
    UserCheck
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { roleHome } from "../../utils/helpers";

export default function RegisterFace() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Rol actual del usuario logueado
    const currentRole = user?.role || user?.rol || "user";
    
    // Tipo de DNI a registrar ('usuario' o 'supervisor')
    const [tipoRegistro, setTipoRegistro] = useState(
        currentRole === "supervisor" || currentRole === "admin" ? "supervisor" : "usuario"
    );
    
    // DNI
    const [dni, setDni] = useState("");
    
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [faceBox, setFaceBox] = useState(null);
    const [modelLoaded, setModelLoaded] = useState(false);

    const webcamRef = useRef(null);

    // Carga del modelo desde CDN
    useEffect(() => {
        const loadModels = async () => {
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri(
                    "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/"
                );
                setModelLoaded(true);
            } catch (err) {
                console.error("Error al cargar modelo biométrico desde CDN:", err);
            }
        };
        loadModels();
    }, []);

    // Detección facial continua con cuadro expandido
    useEffect(() => {
        let interval;
        if (modelLoaded) {
            interval = setInterval(async () => {
                if (
                    webcamRef.current &&
                    webcamRef.current.video &&
                    webcamRef.current.video.readyState === 4
                ) {
                    const video = webcamRef.current.video;
                    const videoWidth = video.videoWidth;
                    const videoHeight = video.videoHeight;

                    const detection = await faceapi.detectSingleFace(
                        video,
                        new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 })
                    );

                    if (detection && videoWidth > 0 && videoHeight > 0) {
                        const { x, y, width, height } = detection.box;
                        
                        const mirroredX = videoWidth - x - width;

                        const extraWidth = width * 0.70;
                        const extraHeight = height * 0.35;

                        const newWidth = width + extraWidth;
                        const newHeight = height + extraHeight;

                        const expandedX = Math.max(0, mirroredX - extraWidth / 2);
                        const expandedY = Math.max(0, y - extraHeight / 2);

                        setFaceBox({
                            left: `${(expandedX / videoWidth) * 100}%`,
                            top: `${(expandedY / videoHeight) * 100}%`,
                            width: `${(Math.min(videoWidth - expandedX, newWidth) / videoWidth) * 100}%`,
                            height: `${(Math.min(videoHeight - expandedY, newHeight) / videoHeight) * 100}%`,
                        });
                    } else {
                        setFaceBox(null);
                    }
                }
            }, 40);
        }
        return () => clearInterval(interval);
    }, [modelLoaded]);

    const handleRegister = async (e) => {
        e.preventDefault();
        
        const regexDni = /^[0-9]{8}$/;
        const imageSrc = webcamRef.current?.getScreenshot();

        if (!imageSrc) {
            setMensaje({ type: "error", text: "No se pudo obtener la captura de la cámara." });
            return;
        }

        const rolLabel = tipoRegistro === "supervisor" ? "Administrador" : "Usuario";

        if (!regexDni.test(dni.trim())) {
            setMensaje({ 
                type: "error", 
                text: `Ingrese un DNI válido de 8 dígitos para el ${rolLabel}.` 
            });
            return;
        }

        setCargando(true);
        setMensaje(null);

        try {
            const endpoint = "/inteligencia/registro-facial/";
            const payload = {
                dni: dni.trim(),
                tipo_rol: tipoRegistro,
                image: imageSrc
            };

            const response = await api.post(endpoint, payload);
            const data = response.data;

            setMensaje({
                type: "success",
                text: data.detail || data.message || "¡Rostro registrado exitosamente!",
            });

            setTimeout(() => {
                const dashboardPath = roleHome ? roleHome(currentRole) : `/${currentRole}/dashboard`;
                navigate(dashboardPath);
            }, 1800);
        } catch (error) {
            console.error("Error al registrar rostro:", error);
            const errorText = error?.response?.data?.detail || error?.response?.data?.message || "Error de comunicación con el servidor de biometría.";
            setMensaje({
                type: "error",
                text: errorText,
            });
        } finally {
            setCargando(false);
        }
    };

    const dashboardPath = roleHome ? roleHome(currentRole) : `/${currentRole}/dashboard`;

    // Etiquetas dinámicas según el tipo de registro
    const labelDniText = tipoRegistro === "supervisor" ? "DNI DEL ADMINISTRADOR" : "DNI DEL USUARIO";
    const placeholderDniText = tipoRegistro === "supervisor" 
        ? "Ingrese DNI del Administrador (8 dígitos)..." 
        : "Ingrese DNI del Usuario (8 dígitos)...";

    return (
        <DashboardLayout
            title="Registro Biométrico Facial"
            subtitle="Asocie su identidad facial mediante su número de DNI registrado"
        >
            <div className="mx-auto max-w-[1450px] space-y-8 pb-8">
                {/* BOTÓN VOLVER */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(dashboardPath)}
                        className="flex items-center gap-2 rounded-xl border border-sg-line bg-[#061633] px-4 py-2.5 text-xs font-semibold text-sg-muted transition hover:border-purple-500/50 hover:text-white cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        Volver al Dashboard
                    </button>
                </div>

                {/* CONTENIDO PRINCIPAL */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
                    
                    {/* PANEL IZQUIERDO: WEBCAM Y FORMULARIO */}
                    <div className="lg:col-span-8 overflow-hidden rounded-[24px] border border-sg-line bg-[#061633] p-6 md:p-8 shadow-2xl space-y-6">
                        <form onSubmit={handleRegister} className="space-y-6">
                            
                            {/* SOLO SI ES ADMIN O SUPERVISOR SE MUESTRA EL SELECTOR DE TIPO */}
                            {(currentRole === "admin" || currentRole === "supervisor") && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                                        Seleccionar Rol del DNI a Registrar
                                    </label>
                                    <div className="flex gap-4 items-center">
                                        <label className="flex items-center gap-2 text-xs font-semibold text-sg-muted cursor-pointer">
                                            <input
                                                type="radio"
                                                name="tipo_ind"
                                                value="usuario"
                                                checked={tipoRegistro === "usuario"}
                                                onChange={() => setTipoRegistro("usuario")}
                                                className="accent-purple-500"
                                            />
                                            Usuario Regular
                                        </label>
                                        <label className="flex items-center gap-2 text-xs font-semibold text-sg-muted cursor-pointer">
                                            <input
                                                type="radio"
                                                name="tipo_ind"
                                                value="supervisor"
                                                checked={tipoRegistro === "supervisor"}
                                                onChange={() => setTipoRegistro("supervisor")}
                                                className="accent-purple-500"
                                            />
                                            Supervisor / Admin
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* CAMPO DNI CON ETIQUETA Y PLACEHOLDER DINÁMICOS */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                                    {tipoRegistro === "supervisor" ? <UserCheck size={14} /> : <User size={14} />}
                                    {labelDniText}
                                </label>
                                <input
                                    type="text"
                                    maxLength={8}
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                                    placeholder={placeholderDniText}
                                    className="w-full rounded-xl border border-sg-line bg-black/40 px-4 py-3.5 text-sm text-white placeholder-sg-muted/50 focus:border-purple-500 focus:outline-none transition tracking-wide"
                                    required
                                />
                            </div>

                            {/* CÁMARA */}
                            <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-black flex justify-center items-center h-[460px] md:h-[520px] shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    mirrored={true}
                                    screenshotFormat="image/jpeg"
                                    className="h-full w-full object-cover"
                                />

                                {faceBox && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: faceBox.left,
                                            top: faceBox.top,
                                            width: faceBox.width,
                                            height: faceBox.height,
                                            transition: "all 0.04s ease-out",
                                        }}
                                        className="pointer-events-none border-2 border-purple-500 rounded-2xl bg-purple-500/10 shadow-[0_0_25px_rgba(168,85,247,0.7)]"
                                    >
                                        <div className="absolute -left-1 -top-1 h-4 w-4 border-l-2 border-t-2 border-purple-300 rounded-tl z-10" />
                                        <div className="absolute -right-1 -top-1 h-4 w-4 border-r-2 border-t-2 border-purple-300 rounded-tr z-10" />
                                        <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-purple-300 rounded-bl z-10" />
                                        <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-purple-300 rounded-br z-10" />
                                    </div>
                                )}
                            </div>

                            {mensaje && (
                                <div
                                    className={`flex items-center gap-3 rounded-xl p-4 text-xs font-medium border ${
                                        mensaje.type === "success"
                                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                            : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                                    }`}
                                >
                                    {mensaje.type === "success" ? (
                                        <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                                    ) : (
                                        <AlertCircle size={18} className="shrink-0 text-rose-400" />
                                    )}
                                    <span>{mensaje.text}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={cargando}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-purple-950/50 transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {cargando ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        Guardando Biometría...
                                    </>
                                ) : (
                                    <>
                                        <Camera size={18} />
                                        Capturar y Registrar Rostro
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* PANEL DERECHO: RECOMENDACIONES */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="rounded-[24px] border border-sg-line bg-[#061633] p-6 md:p-8 space-y-6 shadow-2xl">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-purple-300 border-b border-white/10 pb-4">
                                <ShieldCheck size={20} />
                                Recomendaciones de Registro
                            </h3>
                            <ul className="space-y-4 text-xs leading-relaxed text-sg-muted">
                                <li className="flex items-start gap-3">
                                    <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
                                    <span>Ingrese el DNI correspondiente a una cuenta activa en el sistema.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
                                    <span>El recuadro morado rastreará su rostro en tiempo real para verificar la posición adecuada.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
                                    <span>Mantenga una buena iluminación frontal para asegurar una captura biométrica de alta nitidez.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
                                    <span>Evite el uso de lentes oscuros, gorras o accesorios que cubran los rasgos faciales principales.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}