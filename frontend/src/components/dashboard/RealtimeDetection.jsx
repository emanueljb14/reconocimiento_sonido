import {
    Hammer,
    Mic,
    Volume2,
} from "lucide-react";

import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Waveform from "./Waveform";

import {
    useDetections,
} from "../../context/DetectionContext";

import {
    speak,
} from "../../utils/voice";


export default function RealtimeDetection() {
    const {
        latest,
        analyzing,
        analizarMicrofono,
        error,
    } = useDetections();


    async function detectar() {
        try {
            await analizarMicrofono();
        } catch {
            // El contexto ya controla
            // y muestra el error.
        }
    }


    if (!latest) {
        return (
            <Card className="p-4">
                <div className="flex min-h-[260px] flex-col items-center justify-center text-center">

                    <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-sg-cyan bg-sg-cyan/10 text-sg-cyan">
                        <Mic size={34} />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold">
                        Detector SoundGuard
                    </h3>

                    <p className="mt-2 max-w-sm text-xs text-sg-muted">
                        Presiona el botón para capturar
                        tres segundos de audio y enviarlos
                        al modelo de inteligencia artificial.
                    </p>

                    <Button
                        className="mt-5"
                        onClick={detectar}
                        disabled={analyzing}
                    >
                        <Mic
                            size={15}
                            className="mr-2 inline"
                        />

                        {analyzing
                            ? "Escuchando..."
                            : "Detectar sonido"}
                    </Button>

                    {error && (
                        <p className="mt-3 text-xs text-red-400">
                            {error}
                        </p>
                    )}

                </div>
            </Card>
        );
    }


    const textoVoz =
        `Se ha detectado ${latest.type}. ` +
        `Nivel de riesgo ${latest.risk.toLowerCase()}. ` +
        `Confianza del ${latest.confidence} por ciento.`;


    return (
        <Card className="p-4">

            <div className="grid gap-4 md:grid-cols-[1fr_170px]">

                <div>

                    <div className="flex items-center gap-3">

                        <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-sg-purple bg-sg-purple/10 text-sg-purple shadow-[0_0_28px_rgba(139,92,246,.15)]">
                            <Hammer size={34} />
                        </div>


                        <div>

                            <p className="text-sm font-bold uppercase">
                                {latest.type}
                            </p>


                            <div className="mt-1">

                                <Badge
                                    risk={latest.risk}
                                >
                                    RIESGO {latest.risk}
                                </Badge>

                            </div>


                            <p className="mt-2 text-xs text-sg-muted">
                                Confianza:{" "}

                                <b className="text-white">
                                    {latest.confidence}%
                                </b>
                            </p>


                            <p className="text-xs text-sg-muted">
                                Hora:{" "}

                                <b className="text-white">
                                    {latest.time}
                                </b>
                            </p>


                            <p className="text-xs text-sg-muted">
                                Duración:{" "}

                                <b className="text-white">
                                    {latest.duration}s
                                </b>
                            </p>

                        </div>

                    </div>


                    <div className="mt-4 flex flex-wrap gap-2">

                        <Button
                            onClick={detectar}
                            disabled={analyzing}
                        >
                            <Mic
                                size={15}
                                className="mr-2 inline"
                            />

                            {analyzing
                                ? "Escuchando..."
                                : "Detectar ahora"}
                        </Button>


                        <Button
                            variant="ghost"
                            onClick={() =>
                                speak(textoVoz)
                            }
                        >
                            <Volume2
                                size={15}
                                className="mr-2 inline"
                            />

                            Reproducir alerta
                        </Button>

                    </div>


                    {error && (
                        <p className="mt-3 text-xs text-red-400">
                            {error}
                        </p>
                    )}

                </div>


                <div className="rounded-lg border border-sg-line bg-[#04142f] p-3">

                    <Waveform
                        bars={20}
                    />

                    <p className="mt-2 text-[10px] text-sg-muted">
                        {analyzing
                            ? "Capturando audio del micrófono..."
                            : "Última detección registrada"}
                    </p>


                    <div className="mt-3 rounded-lg bg-black/20 p-2">

                        <p className="text-[10px] text-sg-muted">
                            Origen
                        </p>

                        <p className="text-xs font-semibold capitalize">
                            {latest.origin}
                        </p>

                    </div>

                </div>

            </div>

        </Card>
    );
}