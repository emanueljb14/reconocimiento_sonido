import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import * as faceapi from "@vladmandic/face-api";
import { ScanFace, ArrowLeft, Sun, Sliders, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import AuthShell from "./AuthShell";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { roleHome } from "../../utils/helpers";
import api from "../../services/api";

export default function FaceLogin() {
    const webcamRef = useRef(null);
    const nav = useNavigate();
    const { loginWithToken } = useAuth?.() || {};

    const [dni, setDni] = useState("");
    const [dniError, setDniError] = useState(""); // Estado para mensaje de DNI inválido
    const [brillo, setBrillo] = useState(100);
    const [contraste, setContraste] = useState(100);
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [faceBox, setFaceBox] = useState(null);
    const [modelLoaded, setModelLoaded] = useState(false);

    // Carga del modelo CDN
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

    // Bucle de detección y cuadro dinámico
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
                        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
                    );

                    if (detection) {
                        const { x, y, width, height } = detection.box;
                        setFaceBox({
                            left: `${(x / videoWidth) * 100}%`,
                            top: `${(y / videoHeight) * 100}%`,
                            width: `${(width / videoWidth) * 100}%`,
                            height: `${(height / videoHeight) * 100}%`,
                        });
                    } else {
                        setFaceBox(null);
                    }
                }
            }, 80);
        }
        return () => clearInterval(interval);
    }, [modelLoaded]);

    const escanearRostro = async (e) => {
        e.preventDefault();
        setDniError("");

        // VALIDACIÓN DE DNI: Debe ser exactamente de 8 dígitos numéricos
        const dniClean = dni.trim();
        const regexDni = /^[0-9]{8}$/;

        if (!dniClean || !regexDni.test(dniClean)) {
            setDniError("DNI inválido. Debe ingresar exactamente 8 dígitos numéricos.");
            return;
        }

        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return alert("No se pudo capturar la imagen de la cámara");

        setLoading(true);
        setResultado(null);

        try {
            let data;
            let ok = false;

            try {
                const res = await api.post("/inteligencia/login-facial/", {
                    dni: dniClean,
                    image: imageSrc,
                });
                data = res.data;
                ok = res.status === 200 || res.status === 201;
            } catch (errApi) {
                const response = await fetch("http://localhost:8000/api/inteligencia/login-facial/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ dni: dniClean, image: imageSrc }),
                });
                data = await response.json();
                ok = response.ok;
            }

            if (ok && (data.status === "success" || data.token)) {
                setResultado({
                    exito: true,
                    mensaje: data.message || "¡Autenticación biométrica exitosa!",
                    similitud: data.similitud || 100,
                    distancia: data.distancia || 0.1,
                    tolerancia: 0.42,
                });

                if (loginWithToken) {
                    loginWithToken(data.token, data.user);
                } else {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                }

                setTimeout(() => {
                    nav(roleHome(data.user?.rol || data.user?.role || "user"), { replace: true });
                }, 1800);
            } else {
                setResultado({
                    exito: false,
                    mensaje: data.detail || data.message || "DNI inválido o no encontrado.",
                    similitud: data.similitud || 0,
                    distancia: data.distancia || 1.0,
                    tolerancia: 0.42,
                });
            }
        } catch (error) {
            console.error("Error al autenticar rostro:", error);
            setResultado({
                exito: false,
                mensaje: "Error al conectar con el servidor de biometría.",
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
                <div>
                    <Input
                        label="DNI"
                        value={dni}
                        onChange={(e) => {
                            setDni(e.target.value);
                            if (dniError) setDniError("");
                        }}
                        placeholder="Ingresa tus 8 dígitos de DNI"
                        type="text"
                        maxLength={8}
                        required
                    />
                    {dniError && (
                        <p className="text-xs text-rose-400 mt-1 font-medium flex items-center gap-1">
                            <AlertCircle size={12} /> {dniError}
                        </p>
                    )}
                </div>

                {/* VISOR DE CÁMARA */}
                <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-black flex justify-center items-center shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ width: 400, height: 300, facingMode: "user" }}
                        style={{
                            filter: `brightness(${brillo}%) contrast(${contraste}%)`,
                            width: "100%",
                            height: "260px",
                            objectFit: "cover",
                        }}
                    />

                    {faceBox && (
                        <div
                            style={{
                                position: "absolute",
                                left: faceBox.left,
                                top: faceBox.top,
                                width: faceBox.width,
                                height: faceBox.height,
                                transition: "all 0.08s ease-out",
                            }}
                            className="pointer-events-none border-2 border-purple-500 rounded-2xl bg-purple-500/10 shadow-[0_0_25px_rgba(168,85,247,0.7)]"
                        >
                            <div className="absolute -left-1 -top-1 h-3.5 w-3.5 border-l-2 border-t-2 border-purple-300 rounded-tl" />
                            <div className="absolute -right-1 -top-1 h-3.5 w-3.5 border-r-2 border-t-2 border-purple-300 rounded-tr" />
                            <div className="absolute -bottom-1 -left-1 h-3.5 w-3.5 border-b-2 border-l-2 border-purple-300 rounded-bl" />
                            <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 border-b-2 border-r-2 border-purple-300 rounded-br" />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl border border-sg-line bg-[#04132d]/60 p-2.5 text-xs">
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

                <Button 
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-950/50 border-none flex items-center justify-center gap-2" 
                    type="submit" 
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <RefreshCw size={18} className="animate-spin" />
                            Validando rostro...
                        </>
                    ) : (
                        <>
                            <ScanFace size={18} />
                            Escanear y Validar
                        </>
                    )}
                </Button>
            </form>

            {resultado && (
                <div className={`mt-4 rounded-xl border p-3.5 text-xs space-y-2.5 transition-all ${resultado.exito ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'}`}>
                    <div className="flex items-center gap-2 font-bold">
                        {resultado.exito ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                        <span>{resultado.mensaje}</span>
                    </div>

                    <div>
                        <div className="flex justify-between text-[11px] mb-1">
                            <span>Similitud Facial:</span>
                            <span className="font-bold">{resultado.similitud}%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-[#04132d] overflow-hidden border border-white/5">
                            <div
                                className={`h-full transition-all duration-500 ${resultado.exito ? 'bg-emerald-400' : 'bg-rose-500'}`}
                                style={{ width: `${resultado.similitud}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-2 text-[10px] text-sg-muted">
                        <div>Distancia: <b className="text-white">{resultado.distancia}</b></div>
                        <div>Umbral Estricto: <b className="text-white">{resultado.tolerancia}</b></div>
                    </div>
                </div>
            )}

            <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-sg-muted hover:text-white transition-colors">
                    <ArrowLeft size={14} /> Volver al login tradicional
                </Link>
            </div>
        </AuthShell>
    );
}