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
    Info 
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

export default function RegisterFace() {
    const [dni, setDni] = useState("");
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [faceBox, setFaceBox] = useState(null);
    const [modelLoaded, setModelLoaded] = useState(false);

    const webcamRef = useRef(null);
    const navigate = useNavigate();

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
                        
                        // Corrección para la cámara en modo Espejo
                        const mirroredX = videoWidth - x - width;

                        // Expansión horizontal y vertical
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
        
        const dniLimpio = dni.trim();
        const regexDni = /^[0-9]{8}$/;

        if (!regexDni.test(dniLimpio)) {
            setMensaje({ type: "error", text: "Ingrese un DNI válido de 8 dígitos numéricos." });
            return;
        }

        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) {
            setMensaje({ type: "error", text: "No se pudo obtener la captura de la cámara." });
            return;
        }

        setCargando(true);
        setMensaje(null);

        try {
            let data;
            let ok = false;
            const payload = { dni: dniLimpio, image: imageSrc };

            try {
                const response = await api.post("/inteligencia/registro-facial/", payload);
                data = response.data;
                ok = response.status === 200 || response.status === 201;
            } catch (errApi) {
                const token = localStorage.getItem("token");
                const headers = { "Content-Type": "application/json" };
                if (token) headers["Authorization"] = `Bearer ${token}`;

                const res = await fetch("http://localhost:8000/api/inteligencia/registro-facial/", {
                    method: "POST",
                    headers,
                    body: JSON.stringify(payload),
                });
                data = await res.json();
                ok = res.ok;
            }

            if (ok && (data.status === "success" || data.message)) {
                setMensaje({
                    type: "success",
                    text: data.message || "¡Rostro registrado con éxito!",
                });

                setTimeout(() => {
                    navigate("/admin/dashboard");
                }, 1500);
            } else {
                setMensaje({
                    type: "error",
                    text: data.detail || data.message || "No se pudo registrar el rostro.",
                });
            }
        } catch (error) {
            console.error("Error al registrar rostro:", error);
            setMensaje({
                type: "error",
                text: "Error de comunicación con el servidor de biometría.",
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <DashboardLayout
            title="Registro Biométrico Facial"
            subtitle="Asocie la identidad facial de un usuario mediante su DNI"
        >
            <div className="mx-auto max-w-[1450px] space-y-8 pb-8">
                {/* BOTÓN VOLVER */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate("/admin/dashboard")}
                        className="flex items-center gap-2 rounded-xl border border-sg-line bg-[#061633] px-4 py-2.5 text-xs font-semibold text-sg-muted transition hover:border-purple-500/50 hover:text-white cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        Volver al Dashboard
                    </button>
                </div>

                {/* CONTENIDO PRINCIPAL HOLGADO */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
                    
                    {/* PANEL IZQUIERDO: WEBCAM Y FORMULARIO */}
                    <div className="lg:col-span-8 overflow-hidden rounded-[24px] border border-sg-line bg-[#061633] p-6 md:p-8 shadow-2xl space-y-6">
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300">
                                    DNI o Identificador de Usuario
                                </label>
                                <input
                                    type="text"
                                    maxLength={8}
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                                    placeholder="Ingrese el DNI registrado (8 dígitos)..."
                                    className="w-full rounded-xl border border-sg-line bg-black/40 px-4 py-3.5 text-sm text-white placeholder-sg-muted/50 focus:border-purple-500 focus:outline-none transition tracking-wide"
                                    required
                                />
                            </div>

                            {/* CÁMARA ESPACIOSA Y AMPLIADA */}
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
                                disabled={cargando || dni.length !== 8}
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

                    {/* PANEL DERECHO: RECOMENDACIONES ESPACIOSAS */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="rounded-[24px] border border-sg-line bg-[#061633] p-6 md:p-8 space-y-6 shadow-2xl">
                            <h3 className="flex items-center gap-2 text-sm font-bold text-purple-300 border-b border-white/10 pb-4">
                                <ShieldCheck size={20} />
                                Recomendaciones de Registro
                            </h3>
                            <ul className="space-y-4 text-xs leading-relaxed text-sg-muted">
                                <li className="flex items-start gap-3">
                                    <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
                                    <span>Asegúrese de que el usuario esté correctamente registrado en el sistema con su DNI.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
                                    <span>El recuadro morado rastreará su rostro en tiempo real para verificar la posición.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
                                    <span>Mantenga una buena iluminación frontal para asegurar una captura biométrica nítida.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Info size={16} className="text-purple-400 shrink-0 mt-0.5" />
                                    <span>Evite el uso de lentes oscuros, gorras o elementos que cubran partes del rostro.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}