import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Volume2, Mic2, Play } from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { speak } from "../../utils/voice";

export default function VoiceAssistant() {
  const [enabled, setEnabled] = useLocalStorage("sg_voice", true);
  const [volume, setVolume] = useLocalStorage("sg_volume", 68);

  const [rate, setRate] = useState(1);

  const [text, setText] = useState(
    "Se ha detectado un golpe. Nivel de riesgo medio. Con una confianza del 92 por ciento."
  );

  const probarVoz = () => {
    if (!enabled) return;

    speak(text, rate, volume / 100);
  };

  return (
    <DashboardLayout
      title="Asistente de voz"
      subtitle="Configura y prueba las alertas habladas del sistema."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {/* CONFIGURACIÓN */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-sg-cyan/10 text-sg-cyan">
                <Volume2 size={24} />
              </div>

              <div>
                <p className="font-semibold">Asistente de voz</p>

                <p className="text-xs text-sg-muted">
                  Usa Web Speech API cuando esté disponible.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`rounded-full px-3 py-1 text-xs ${
                enabled
                  ? "bg-sg-green/10 text-sg-green"
                  : "bg-white/5 text-sg-muted"
              }`}
            >
              {enabled ? "Activado" : "Desactivado"}
            </button>
          </div>

          <div className="mt-6 space-y-5">
            {/* VOLUMEN */}
            <label className="block">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-sg-muted">Volumen</span>

                <span>{volume}%</span>
              </div>

              <input
                className="w-full accent-sg-cyan"
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
            </label>

            {/* VELOCIDAD */}
            <label className="block">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-sg-muted">Velocidad</span>

                <span>{rate}x</span>
              </div>

              <input
                className="w-full accent-sg-cyan"
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
              />
            </label>

            {/* IDIOMA */}
            <label className="block text-xs text-sg-muted">
              Idioma

              <select
                className="mt-1 w-full rounded-lg border border-sg-line bg-[#04142f] p-2.5 text-white"
                defaultValue="es-ES"
              >
                <option value="es-ES">
                  Español (España)
                </option>

                <option value="es-MX">
                  Español (Latinoamérica)
                </option>

                <option value="en-US">
                  English
                </option>
              </select>
            </label>

            {/* BOTÓN */}
            <Button
              className="w-full"
              onClick={probarVoz}
              disabled={!enabled}
            >
              <Play
                size={14}
                className="mr-2 inline"
              />

              Probar voz
            </Button>
          </div>
        </Card>

        {/* ÚLTIMA ALERTA */}
        <Card
          title="Última alerta hablada"
          className="p-5"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-40 w-full rounded-lg border border-sg-line bg-[#04142f] p-3 text-sm outline-none focus:border-sg-cyan"
            placeholder="Escribe el mensaje que quieres reproducir..."
          />

          <div className="mt-4 rounded-lg border border-sg-line bg-white/[.02] p-3 text-xs text-sg-muted">
            <Mic2
              size={15}
              className="mr-2 inline text-sg-cyan"
            />

            La voz se genera localmente en el navegador.
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}