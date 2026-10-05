import React, { useEffect, useState } from "react";
import {
  Mic,
  AlertTriangle,
  Volume2,
  ShieldCheck,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { SoundBar } from "../../components/dashboard/Charts";
import VoiceCard from "../../components/dashboard/VoiceCard";

import { obtenerDetecciones } from "../../services/detecciones";
import { obtenerPorSonido } from "../../services/estadisticas";

const NOMBRES_SONIDOS = {
  golpe: "Golpe",
  puerta: "Puerta",
  alarma: "Alarma",
  aplausos: "Aplausos",
  vidrio: "Vidrio",
  ruido_elevado: "Ruido elevado",
  desconocido: "Desconocido",
};

function normalizarDeteccion(deteccion) {
  const fecha = deteccion.fecha
    ? new Date(deteccion.fecha)
    : null;

  const confianza = Number(
    deteccion.confianza || 0
  );

  return {
    id: deteccion.id,

    type:
      NOMBRES_SONIDOS[
        String(
          deteccion.tipo_sonido || ""
        ).toLowerCase()
      ] ||
      deteccion.tipo_sonido ||
      "Desconocido",

    confidence: Number(
      (confianza * 100).toFixed(1)
    ),

    risk: String(
      deteccion.nivel_riesgo || "bajo"
    ).toUpperCase(),

    time: fecha
      ? fecha.toLocaleTimeString(
          "es-PE",
          {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }
        )
      : "-",

    date: fecha
      ? fecha.toLocaleDateString("es-PE")
      : "-",

    raw: deteccion,
  };
}

export default function UserDashboard() {
  const [detections, setDetections] =
    useState([]);

  const [porSonido, setPorSonido] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      try {
        setError("");

        const [
          deteccionesData,
          sonidoData,
        ] = await Promise.all([
          obtenerDetecciones(),
          obtenerPorSonido(),
        ]);

        if (!activo) return;

        const lista =
          Array.isArray(deteccionesData)
            ? deteccionesData
            : deteccionesData?.results || [];

        setDetections(
          lista.map(normalizarDeteccion)
        );

        setPorSonido(
          Array.isArray(sonidoData)
            ? sonidoData
            : []
        );
      } catch (err) {
        console.error(
          "Error cargando dashboard de usuario:",
          err
        );

        if (activo) {
          setError(
            err?.response?.data?.detail ||
              "No se pudieron cargar los datos del backend."
          );
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    }

    cargarDatos();

    const intervalo = setInterval(
      cargarDatos,
      5000
    );

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  const latest =
    detections.length > 0
      ? detections[0]
      : null;

  const totalEventos =
    porSonido.reduce(
      (total, item) =>
        total + Number(item.total || 0),
      0
    );

  const distribucionSonidos =
    porSonido.map((item) => {
      const cantidad = Number(
        item.total || 0
      );

      const porcentaje =
        totalEventos > 0
          ? (cantidad / totalEventos) * 100
          : 0;

      return {
        nombre:
          NOMBRES_SONIDOS[
            String(
              item.tipo_sonido || ""
            ).toLowerCase()
          ] ||
          item.tipo_sonido ||
          "Desconocido",

        cantidad,

        porcentaje,
      };
    });

  const reproducirAlerta = () => {
    if (!latest) return;

    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const mensaje =
      new SpeechSynthesisUtterance(
        `Alerta ${latest.type}, riesgo ${latest.risk}`
      );

    mensaje.lang = "es-ES";

    window.speechSynthesis.speak(
      mensaje
    );
  };

  return (
    <DashboardLayout
      title="Panel de Usuario"
      subtitle="Visualiza las detecciones y tu actividad en el sistema."
    >
      <div className="space-y-4">

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ESTADO */}
        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">

          <Card className="border-sg-green/30 bg-sg-green/5 p-4">
            <div className="flex items-center gap-3">

              <div className="grid h-12 w-12 place-items-center rounded-full bg-sg-green/15 text-sg-green">
                <Mic />
              </div>

              <div>
                <p className="font-semibold">
                  Sistema activo
                </p>

                <p className="text-xs text-sg-muted">
                  Consultando detecciones registradas en el backend.
                </p>
              </div>

            </div>
          </Card>

          <Card className="p-4">

            <div className="flex justify-between text-xs">
              <span className="text-sg-muted">
                Confianza última detección
              </span>

              <b>
                {loading
                  ? "..."
                  : latest
                  ? `${latest.confidence}%`
                  : "--"}
              </b>
            </div>

            <div className="mt-3 h-2 rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-sg-cyan transition-all"
                style={{
                  width: latest
                    ? `${Math.max(
                        0,
                        Math.min(
                          100,
                          latest.confidence
                        )
                      )}%`
                    : "0%",
                }}
              />

            </div>

          </Card>

        </div>

        {/* INFORMACIÓN PRINCIPAL */}
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">

          {/* ÚLTIMA DETECCIÓN */}
          <Card className="border-sg-red/30 p-4">

            {loading ? (
              <div className="flex min-h-[180px] items-center justify-center text-xs text-sg-muted">
                Cargando detecciones...
              </div>
            ) : latest ? (
              <>
                <div className="flex items-center gap-3">

                  <div className="grid h-14 w-14 place-items-center rounded-full bg-sg-red/15 text-sg-red">
                    <AlertTriangle />
                  </div>

                  <div>

                    <p className="text-xs text-sg-muted">
                      Última detección
                    </p>

                    <p className="font-bold">
                      {latest.type}
                    </p>

                    <p className="text-xs text-sg-muted">
                      Confianza:{" "}
                      <b className="text-white">
                        {latest.confidence}%
                      </b>
                    </p>

                    <div className="mt-1 text-xs text-sg-muted">
                      Riesgo:{" "}
                      <Badge risk={latest.risk}>
                        {latest.risk}
                      </Badge>
                    </div>

                    <p className="mt-1 text-[10px] text-sg-muted">
                      Hora: {latest.time}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-lg bg-sg-blue py-2 text-xs"
                  onClick={reproducirAlerta}
                >
                  <Volume2
                    size={14}
                    className="mr-2 inline"
                  />
                  Reproducir alerta
                </button>
              </>
            ) : (
              <div className="flex min-h-[180px] items-center justify-center text-center">
                <div>
                  <AlertTriangle className="mx-auto text-sg-muted" />

                  <p className="mt-3 text-sm font-semibold">
                    Sin detecciones
                  </p>

                  <p className="mt-1 text-xs text-sg-muted">
                    No existen detecciones registradas.
                  </p>
                </div>
              </div>
            )}

          </Card>

          {/* DISTRIBUCIÓN POR CLASE */}
          <Card
            title="Distribución por clase"
            className="p-4"
          >

            {loading ? (
              <div className="flex min-h-[150px] items-center justify-center text-xs text-sg-muted">
                Cargando...
              </div>
            ) : distribucionSonidos.length === 0 ? (
              <div className="flex min-h-[150px] items-center justify-center text-xs text-sg-muted">
                Sin datos del backend.
              </div>
            ) : (
              <div className="space-y-3">

                {distribucionSonidos.map(
                  (item) => (
                    <div key={item.nombre}>

                      <div className="mb-1 flex justify-between text-[10px]">

                        <span>
                          {item.nombre}
                        </span>

                        <span className="text-sg-muted">
                          {item.cantidad} eventos ·{" "}
                          {item.porcentaje.toFixed(
                            1
                          )}
                          %
                        </span>

                      </div>

                      <div className="h-1.5 rounded-full bg-slate-800">

                        <div
                          className="h-full rounded-full bg-sg-cyan"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(
                                100,
                                item.porcentaje
                              )
                            )}%`,
                          }}
                        />

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </Card>

          {/* EVENTOS RECIENTES */}
          <Card
            title="Eventos recientes"
            className="p-4"
          >

            {loading ? (
              <div className="flex min-h-[150px] items-center justify-center text-xs text-sg-muted">
                Cargando eventos...
              </div>
            ) : detections.length === 0 ? (
              <div className="flex min-h-[150px] items-center justify-center text-xs text-sg-muted">
                Sin datos del backend.
              </div>
            ) : (
              <div className="space-y-2">

                {detections
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      className="flex items-center justify-between rounded-md border border-sg-line bg-[#04142f] px-2 py-2 text-[10px]"
                      key={event.id}
                    >

                      <div>
                        <span className="text-sg-muted">
                          {event.time}
                        </span>{" "}
                        <span>
                          {event.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span>
                          {event.confidence}%
                        </span>

                        <Badge
                          risk={event.risk}
                        >
                          {event.risk}
                        </Badge>
                      </div>

                    </div>
                  ))}

              </div>
            )}

          </Card>

        </div>

        {/* GRÁFICO + VOZ */}
        <div className="grid gap-4 xl:grid-cols-[1fr_330px]">

          <SoundBar data={porSonido} />

          <VoiceCard />

        </div>

        {/* MENSAJE */}
        <Card className="p-4">

          <div className="flex items-center gap-3">

            <ShieldCheck className="text-sg-purple" />

            <div>
              <p className="font-semibold">
                Tu seguridad también se escucha
              </p>

              <p className="text-xs text-sg-muted">
                SoundGuard AI detecta los sonidos importantes por ti.
              </p>
            </div>

          </div>

        </Card>

      </div>
    </DashboardLayout>
  );
}