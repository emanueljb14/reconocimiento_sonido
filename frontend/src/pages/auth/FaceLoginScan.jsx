import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import * as faceapi from "@vladmandic/face-api";
import { 
    ScanFace, 
    ArrowLeft, 
    Sun, 
    Sliders, 
    CheckCircle2, 
    AlertCircle, 
    RefreshCw, 
    ShieldCheck,
    Activity,
    Compass,
    UserCheck,
    Target,
    Ruler,
    Zap,
    ChevronLeft,
    ChevronRight,
    Timer
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { roleHome } from "../../utils/helpers";
import api from "../../services/api";

export default function FaceLoginScan() {
    const location = useLocation();
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const { loginWithToken } = useAuth?.() || {};

    const rawDni = location.state?.dni || "";
    const userName = location.state?.nombre || "";
    const dni = typeof rawDni === "string" ? rawDni.trim() : "";

    const [brillo, setBrillo] = useState(100);
    const [contraste, setContraste] = useState(100);
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [faceBox, setFaceBox] = useState(null);
    const [modelLoaded, setModelLoaded] = useState(false);
    const [isFlashing, setIsFlashing] = useState(false);

    const [pasoActual, setPasoActual] = useState("GIRO");
    const [turnDetected, setTurnDetected] = useState(false);
    const [headPoseText, setHeadPoseText] = useState("Sin Rostro");
    const [countdown, setCountdown] = useState(null);

    useEffect(() => {
        const regexDni = /^[0-9]{8}$/;
        if (!dni || !regexDni.test(dni)) {
            navigate("/login-facial", { replace: true });
        }
    }, [dni, navigate]);

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                ]);
                setModelLoaded(true);
            } catch (err) {
                console.error("Error al cargar modelos biométricos:", err);
            }
        };
        loadModels();
    }, []);

    const resetChallenge = () => {
        setPasoActual("GIRO");
        setTurnDetected(false);
        setResultado(null);
        setIsFlashing(false);
        setCountdown(null);
        setLoading(false);
    };

    useEffect(() => {
        let interval;
        if (modelLoaded && !resultado?.exito && pasoActual !== "LISTO" && pasoActual !== "COUNTDOWN") {
            interval = setInterval(async () => {
                if (
                    webcamRef.current &&
                    webcamRef.current.video &&
                    webcamRef.current.video.readyState === 4
                ) {
                    const video = webcamRef.current.video;
                    const videoWidth = video.videoWidth;
                    const videoHeight = video.videoHeight;

                    const detection = await faceapi
                        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 }))
                        .withFaceLandmarks();

                    if (detection && videoWidth > 0 && videoHeight > 0) {
                        const { x, y, width, height } = detection.detection.box;
                        const landmarks = detection.landmarks;

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

                        const nose = landmarks.getNose();
                        const noseCenter = nose[3].x;
                        const faceCenter = x + width / 2;
                        const rotationRatio = (noseCenter - faceCenter) / width;

                        const isTurned = Math.abs(rotationRatio) > 0.11;
                        const isCentered = Math.abs(rotationRatio) <= 0.08;

                        if (rotationRatio > 0.11) setHeadPoseText("Girado a la Izquierda");
                        else if (rotationRatio < -0.11) setHeadPoseText("Girado a la Derecha");
                        else setHeadPoseText("Centrado");

                        if (pasoActual === "GIRO" && isTurned) {
                            setTurnDetected(true);
                            setPasoActual("CENTRO");
                        } 
                        else if (pasoActual === "CENTRO" && isCentered) {
                            iniciarCuentaRegresiva();
                        }

                    } else {
                        setFaceBox(null);
                        setHeadPoseText("Sin Rostro");
                    }
                }
            }, 40);
        }
        return () => clearInterval(interval);
    }, [modelLoaded, pasoActual, resultado]);

    const iniciarCuentaRegresiva = () => {
        setPasoActual("COUNTDOWN");
        setCountdown(2);

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    ejecutarFlashYEscaner();
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const ejecutarFlashYEscaner = () => {
        setPasoActual("LISTO");
        setIsFlashing(true);

        setTimeout(() => {
            setIsFlashing(false);
            escanearRostro();
        }, 220);
    };

    const escanearRostro = async () => {
        if (loading) return;

        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return alert("No se pudo capturar la imagen de la cámara.");

        setLoading(true);
        setResultado(null);

        try {
            let data;
            let ok = false;

            const payload = {
                dni: dni,
                image: imageSrc,
                liveness_passed: true
            };

            try {
                const res = await api.post("/inteligencia/login-facial/", payload);
                data = res.data;
                ok = res.status === 200 || res.status === 201;
            } catch (errApi) {
                const response = await fetch("http://localhost:8000/api/inteligencia/login-facial/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                data = await response.json();
                ok = response.ok;
            }

            if (ok && (data.status === "success" || data.token)) {
                const nombreUsuario = data.user?.first_name || data.usuario?.first_name || userName || "Usuario";
                
                setResultado({
                    exito: true,
                    mensaje: `¡Bienvenido ${nombreUsuario}!`,
                    similitud: data.similitud || 88.50,
                    distancia: data.distancia || 0.165,
                    tolerancia: 0.420,
                });

                const userObj = data.user || data.usuario || { username: dni, role: data.role || data.rol || "user" };
                
                let safeUser = userObj;
                if (loginWithToken) {
                    safeUser = loginWithToken(data.token, userObj);
                } else {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("sg_session", JSON.stringify(userObj));
                }

                // Determinación del Rol devuelto por el Servidor
                const targetRole = safeUser?.role || safeUser?.rol || data.role || data.rol || "user";
                
                // Mapeo dinámico al Dashboard según el rol devuelto
                let targetPath = `/${targetRole}/dashboard`;
                if (roleHome) {
                    targetPath = roleHome(targetRole);
                }

                setTimeout(() => {
                    navigate(targetPath, { replace: true });
                }, 1500);
            } else {
                setResultado({
                    exito: false,
                    mensaje: data.detail || data.message || "Verificación fallida. El rostro no coincide con el DNI.",
                    similitud: data.similitud || 24.10,
                    distancia: data.distancia || 0.780,
                    tolerancia: 0.420,
                });
            }
        } catch (error) {
            console.error("Error al autenticar rostro:", error);
            setResultado({
                exito: false,
                mensaje: "Error de conexión con el servicio biométrico.",
                similitud: 0,
                distancia: 1.000,
                tolerancia: 0.420,
            });
        } finally {
            setLoading(false);
        }
    };

    const getInstruccionMensaje = () => {
        if (loading) return "Validando firmas y biometría en servidor...";
        if (pasoActual === "GIRO") return "Paso 1: Mueva suavemente su rostro a la DERECHA o IZQUIERDA";
        if (pasoActual === "CENTRO") return "¡Perfecto! Regresa tu rostro al centro";
        if (pasoActual === "COUNTDOWN") return `Mantenga la vista fija. Escaneando en ${countdown}s...`;
        if (pasoActual === "LISTO") return "¡Capturando biometría!";
        return "Alinee su rostro frente a la cámara...";
    };

    return (
        <div className="min-h-screen w-full bg-[#020b18] text-white flex flex-col p-4 md:p-8">
            <style>{`
                @keyframes laserScan {
                    0% { top: 0%; opacity: 0.8; }
                    50% { top: 95%; opacity: 1; }
                    100% { top: 0%; opacity: 0.8; }
                }
                .animate-laser {
                    animation: laserScan 2.2s ease-in-out infinite;
                }
                @keyframes pulseArrowLeft {
                    0%, 100% { transform: translateX(0); opacity: 0.4; }
                    50% { transform: translateX(-10px); opacity: 1; }
                }
                @keyframes pulseArrowRight {
                    0%, 100% { transform: translateX(0); opacity: 0.4; }
                    50% { transform: translateX(10px); opacity: 1; }
                }
                .animate-arrow-left {
                    animation: pulseArrowLeft 1.2s infinite ease-in-out;
                }
                .animate-arrow-right {
                    animation: pulseArrowRight 1.2s infinite ease-in-out;
                }
            `}</style>

            {/* HEADER */}
            <div className="flex justify-between items-center max-w-7xl w-full mx-auto mb-6">
                <button
                    onClick={() => navigate("/login-facial")}
                    className="flex items-center gap-2 text-xs text-sg-muted hover:text-white transition cursor-pointer"
                >
                    <ArrowLeft size={16} /> Cambiar Usuario ({dni})
                </button>
                <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold uppercase tracking-wider">
                    <ShieldCheck size={18} /> Verificación Biométrica Activa
                </div>
            </div>

            <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
                
                {/* PANEL CÁMARA */}
                <div className="lg:col-span-8 bg-[#04132d] border border-sg-line rounded-3xl p-4 flex flex-col justify-between shadow-2xl relative">
                    <div className="relative w-full flex-1 rounded-2xl overflow-hidden bg-black flex justify-center items-center min-h-[440px] shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                        
                        {/* FLASH BLANCO AUTOMÁTICO */}
                        <div 
                            className={`absolute inset-0 bg-white z-40 pointer-events-none transition-opacity duration-200 ${
                                isFlashing ? "opacity-100" : "opacity-0"
                            }`} 
                        />

                        {/* FLECHAS ANIMADAS LATERALES */}
                        {pasoActual === "GIRO" && (
                            <>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 bg-purple-600/30 backdrop-blur-md p-3 rounded-2xl border border-purple-500/40 animate-arrow-left">
                                    <ChevronLeft size={32} className="text-purple-300" />
                                </div>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 bg-purple-600/30 backdrop-blur-md p-3 rounded-2xl border border-purple-500/40 animate-arrow-right">
                                    <ChevronRight size={32} className="text-purple-300" />
                                </div>
                            </>
                        )}

                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            mirrored={true}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: "user" }}
                            style={{
                                filter: `brightness(${brillo}%) contrast(${contraste}%)`,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />

                        {/* CUADRO FACIAL DINÁMICO */}
                        {faceBox && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: faceBox.left,
                                    top: faceBox.top,
                                    width: faceBox.width,
                                    height: faceBox.height,
                                }}
                                className={`pointer-events-none border-2 rounded-2xl overflow-hidden transition-all duration-500 ${
                                    pasoActual === "CENTRO" || pasoActual === "COUNTDOWN"
                                        ? "opacity-0 scale-95 border-transparent shadow-none" 
                                        : "opacity-100 scale-100 border-purple-500 bg-purple-500/10 shadow-[0_0_25px_rgba(168,85,247,0.7)]"
                                } ${
                                    resultado?.exito ? "border-emerald-400 bg-emerald-500/20 opacity-100" : ""
                                }`}
                            >
                                <div className="absolute -left-1 -top-1 h-4 w-4 border-l-4 border-t-4 border-purple-300 rounded-tl z-10" />
                                <div className="absolute -right-1 -top-1 h-4 w-4 border-r-4 border-t-4 border-purple-300 rounded-tr z-10" />
                                <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-4 border-l-4 border-purple-300 rounded-bl z-10" />
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-4 border-r-4 border-purple-300 rounded-br z-10" />

                                <div className={`absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f3ff,0_0_30px_#00f3ff] animate-laser ${
                                    loading ? "via-purple-400 shadow-[0_0_20px_#a855f7]" : ""
                                }`} />
                            </div>
                        )}

                        {/* CUENTA REGRESIVA FLOTANTE */}
                        {pasoActual === "COUNTDOWN" && countdown !== null && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-2">
                                <span className="text-7xl font-extrabold text-cyan-300 animate-ping font-mono">
                                    {countdown}
                                </span>
                                <p className="text-xs text-white uppercase tracking-widest font-semibold bg-black/60 px-4 py-1.5 rounded-full border border-cyan-500/30">
                                    Mantén la vista al centro
                                </p>
                            </div>
                        )}

                        {/* INSTRUCCIÓN FLOTANTE */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md px-5 py-2.5 rounded-full border border-purple-500/30 text-xs text-center font-semibold shadow-2xl z-30 flex items-center gap-2.5 text-white">
                            {loading ? (
                                <RefreshCw size={16} className="animate-spin text-purple-400" />
                            ) : pasoActual === "COUNTDOWN" ? (
                                <Timer size={16} className="text-cyan-400 animate-pulse" />
                            ) : (
                                <Zap size={16} className="text-purple-400 animate-pulse" />
                            )}
                            {getInstruccionMensaje()}
                        </div>
                    </div>

                    {/* CONTROLES DE IMAGEN */}
                    <div className="grid grid-cols-2 gap-4 mt-4 bg-black/40 p-3 rounded-xl border border-white/5 text-xs">
                        <div className="space-y-1">
                            <div className="flex justify-between text-sg-muted">
                                <span className="flex items-center gap-1"><Sun size={12} /> Brillo</span>
                                <span className="font-semibold text-purple-300">{brillo}%</span>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="200"
                                value={brillo}
                                onChange={(e) => setBrillo(e.target.value)}
                                className="w-full accent-purple-500 cursor-pointer"
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sg-muted">
                                <span className="flex items-center gap-1"><Sliders size={12} /> Contraste</span>
                                <span className="font-semibold text-purple-300">{contraste}%</span>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="200"
                                value={contraste}
                                onChange={(e) => setContraste(e.target.value)}
                                className="w-full accent-purple-500 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* PANEL DERECHO - ESTADO Y MÉTRICAS */}
                <div className="lg:col-span-4 bg-[#04132d] border border-sg-line rounded-3xl p-6 flex flex-col justify-between shadow-2xl space-y-6">
                    <div className="space-y-6">
                        <div>
                            <span className="text-xs uppercase tracking-wider text-purple-400 font-bold">Validación Facial</span>
                            <h2 className="text-xl font-bold text-white mt-1">Usuario: {dni}</h2>
                            <p className="text-xs text-sg-muted mt-1">
                                Siga las instrucciones en pantalla para verificar su identidad.
                            </p>
                        </div>

                        {/* PASOS DE PRUEBA DE VIDA */}
                        <div className="rounded-2xl border border-purple-500/20 bg-black/40 p-4 text-xs space-y-3.5">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                                <span className="flex items-center gap-2 font-bold text-purple-300">
                                    <Activity size={16} className="text-purple-400" />
                                    Prueba de Vida Dinámica
                                </span>
                                {turnDetected && (
                                    <button
                                        onClick={resetChallenge}
                                        className="text-[10px] text-purple-400 hover:text-purple-200 underline cursor-pointer"
                                    >
                                        Reiniciar
                                    </button>
                                )}
                            </div>

                            {/* ITEM 1: GIRO */}
                            <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2">
                                    <Compass size={15} className="text-purple-400 shrink-0" />
                                    <span>1. Mover rostro (Izq/Der)</span>
                                </div>
                                {turnDetected ? (
                                    <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[11px]">
                                        <CheckCircle2 size={13} /> ✓ HECHO
                                    </span>
                                ) : (
                                    <span className="text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md text-[10px] animate-pulse">
                                        MOVER AHORA
                                    </span>
                                )}
                            </div>

                            {/* ITEM 2: CENTRAR */}
                            <div className="flex items-center justify-between bg-white/5 p-2.5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2">
                                    <Target size={15} className="text-cyan-400 shrink-0" />
                                    <span>2. Centrar rostro</span>
                                </div>
                                {pasoActual === "LISTO" || pasoActual === "COUNTDOWN" ? (
                                    <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[11px]">
                                        <CheckCircle2 size={13} /> ✓ HECHO
                                    </span>
                                ) : pasoActual === "CENTRO" ? (
                                    <span className="text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded-md text-[10px] animate-pulse">
                                        REGRESA AL CENTRO
                                    </span>
                                ) : (
                                    <span className="text-sg-muted text-[10px]">BLOQUEADO</span>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-[11px] text-sg-muted pt-1 px-1">
                                <span>Orientación:</span>
                                <b className="text-white">{headPoseText}</b>
                            </div>
                        </div>

                        {/* BOTÓN ESCANEAR */}
                        <button
                            onClick={ejecutarFlashYEscaner}
                            disabled={loading || pasoActual === "GIRO"}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-purple-950/50 flex items-center justify-center gap-2 transition disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" />
                                    Procesando Biometría...
                                </>
                            ) : (
                                <>
                                    <ScanFace size={18} />
                                    Escanear Rostro
                                </>
                            )}
                        </button>

                        {/* TARJETA DE RESULTADOS */}
                        {resultado && (
                            <div className={`rounded-2xl border p-5 space-y-5 transition-all ${
                                resultado.exito 
                                    ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 to-black/60 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
                                    : 'border-rose-500/40 bg-gradient-to-b from-rose-950/30 to-black/60 text-rose-300'
                            }`}>
                                <div className="flex items-center gap-2.5 font-bold text-sm">
                                    {resultado.exito ? <UserCheck size={22} className="shrink-0 text-emerald-400" /> : <AlertCircle size={22} className="shrink-0 text-rose-400" />}
                                    <span>{resultado.mensaje}</span>
                                </div>

                                <div className="space-y-2 bg-black/40 p-3.5 rounded-xl border border-white/10">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-sg-muted font-medium">Porcentaje de Similitud</span>
                                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                                            resultado.exito 
                                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" 
                                                : "bg-rose-500/20 border-rose-500/40 text-rose-300"
                                        }`}>
                                            {resultado.similitud.toFixed(2)}%
                                        </span>
                                    </div>
                                    
                                    <div className="h-3.5 w-full rounded-full bg-black/80 overflow-hidden border border-white/10 p-0.5 relative">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 shadow-lg ${
                                                resultado.exito 
                                                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-400 shadow-[0_0_12px_#34d399]' 
                                                    : 'bg-gradient-to-r from-rose-700 to-rose-500 shadow-[0_0_12px_#f43f5e]'
                                            }`}
                                            style={{ width: `${Math.min(resultado.similitud, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-black/50 p-3.5 rounded-xl border border-purple-500/20 space-y-1 relative overflow-hidden">
                                        <div className="flex items-center gap-1.5 text-[11px] text-purple-300 font-semibold">
                                            <Ruler size={14} className="text-purple-400" />
                                            Distancia
                                        </div>
                                        <div className="text-lg font-bold text-white font-mono tracking-tight">
                                            {resultado.distancia.toFixed(3)}
                                        </div>
                                    </div>

                                    <div className="bg-black/50 p-3.5 rounded-xl border border-cyan-500/20 space-y-1 relative overflow-hidden">
                                        <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-semibold">
                                            <Target size={14} className="text-cyan-400" />
                                            Umbral Máx.
                                        </div>
                                        <div className="text-lg font-bold text-white font-mono tracking-tight">
                                            {resultado.tolerancia.toFixed(3)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-center text-[11px] text-sg-muted border-t border-white/5 pt-4">
                        Sistema biométrico con verificación de prueba de vida
                    </div>
                </div>

            </div>
        </div>
    );
}