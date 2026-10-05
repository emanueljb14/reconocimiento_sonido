import React, { useEffect, useState } from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { obtenerDetecciones } from "../../services/detecciones";

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

    time: fecha
      ? fecha.toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      : "-",

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
  };
}

export default function RecentEvents() {
  const [detections, setDetections] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let activo = true;

    async function cargarDetecciones() {
      try {
        setError("");

        const respuesta =
          await obtenerDetecciones();

        const lista =
          Array.isArray(respuesta)
            ? respuesta
            : respuesta?.results || [];

        if (!activo) return;

        setDetections(
          lista.map(normalizarDeteccion)
        );
      } catch (err) {
        console.error(
          "Error cargando últimos eventos:",
          err
        );

        if (activo) {
          setError(
            "No se pudieron cargar los eventos."
          );
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    }

    cargarDetecciones();

    const intervalo = setInterval(
      cargarDetecciones,
      5000
    );

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  return (
    <Card
      title="Últimos eventos"
      action={
        <span className="text-[10px] text-sg-cyan">
          Ver todos →
        </span>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[440px] text-left text-xs">

          <thead className="text-[10px] text-sg-muted">
            <tr>
              <th className="px-4 py-2">
                Hora
              </th>

              <th className="py-2">
                Sonido
              </th>

              <th className="py-2">
                Confianza
              </th>

              <th className="py-2">
                Riesgo
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-6 text-center text-sg-muted"
                >
                  Cargando eventos...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-6 text-center text-red-400"
                >
                  {error}
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              detections.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-6 text-center text-sg-muted"
                  >
                    No hay eventos registrados.
                  </td>
                </tr>
              )}

            {!loading &&
              !error &&
              detections
                .slice(0, 5)
                .map((deteccion) => (
                  <tr
                    key={deteccion.id}
                    className="border-t border-sg-line/60"
                  >
                    <td className="px-4 py-2.5 text-sg-muted">
                      {deteccion.time}
                    </td>

                    <td>
                      {deteccion.type}
                    </td>

                    <td>
                      {deteccion.confidence}%
                    </td>

                    <td>
                      <Badge
                        risk={deteccion.risk}
                      >
                        {deteccion.risk}
                      </Badge>
                    </td>
                  </tr>
                ))}
          </tbody>

        </table>
      </div>
    </Card>
  );
}