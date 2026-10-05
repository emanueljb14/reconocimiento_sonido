import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Card from "../ui/Card";

const SOUND_NAMES = {
  golpe: "Golpes",
  puerta: "Puertas",
  alarma: "Alarmas",
  aplausos: "Aplausos",
  vidrio: "Vidrios",
  ruido_elevado: "Ruido elevado",
  desconocido: "Desconocido",
};

const RISK_NAMES = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
  critico: "Crítico",
};

const RISK_COLORS = [
  "#12d8a0",
  "#ffc928",
  "#ff405c",
  "#8b5cf6",
];

function formatearHora(fecha) {
  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return fecha;
  }

  return date.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function SoundBar({ data = [] }) {
  const types = data.map((item) => ({
    name:
      SOUND_NAMES[String(item.tipo_sonido || "").toLowerCase()] ||
      item.tipo_sonido ||
      "Desconocido",
    value: Number(item.total || 0),
  }));

  return (
    <Card title="Eventos por tipo de sonido" className="p-4">
      <div className="h-64">
        {types.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-sg-muted">
            Sin datos del backend.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={types}
              layout="vertical"
              margin={{ left: 5, right: 10 }}
            >
              <CartesianGrid
                stroke="#123b70"
                strokeDasharray="3 3"
              />

              <XAxis
                type="number"
                stroke="#617c9e"
                fontSize={10}
                allowDecimals={false}
              />

              <YAxis
                dataKey="name"
                type="category"
                stroke="#8fa8c7"
                fontSize={10}
                width={90}
              />

              <Tooltip
                contentStyle={{
                  background: "#071c40",
                  border: "1px solid #123b70",
                  borderRadius: 8,
                }}
              />

              <Bar
                dataKey="value"
                name="Eventos"
                fill="#8b5cf6"
                radius={[0, 5, 5, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export function LineEvents({ data = [] }) {
  const chart24 = data.map((item) => ({
    time: formatearHora(item.hora),
    eventos: Number(item.total || 0),
  }));

  return (
    <Card
      title="Gráfico de eventos (últimas 24 horas)"
      className="p-4"
    >
      <div className="h-64">
        {chart24.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-sg-muted">
            Sin datos del backend.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart24}>
              <CartesianGrid
                stroke="#123b70"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="time"
                stroke="#617c9e"
                fontSize={9}
              />

              <YAxis
                stroke="#617c9e"
                fontSize={9}
                allowDecimals={false}
              />

              <Tooltip
                contentStyle={{
                  background: "#071c40",
                  border: "1px solid #123b70",
                  borderRadius: 8,
                }}
              />

              <Line
                type="monotone"
                dataKey="eventos"
                name="Eventos"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export function RiskPie({ data = [] }) {
  const risk = data.map((item) => ({
    name:
      RISK_NAMES[String(item.nivel_riesgo || "").toLowerCase()] ||
      item.nivel_riesgo ||
      "Desconocido",
    value: Number(item.total || 0),
  }));

  return (
    <Card title="Distribución de riesgos" className="p-4">
      <div className="h-64">
        {risk.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-sg-muted">
            Sin datos del backend.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={risk}
                dataKey="value"
                nameKey="name"
                cx="45%"
                cy="50%"
                innerRadius={55}
                outerRadius={83}
                paddingAngle={2}
              >
                {risk.map((_, index) => (
                  <Cell
                    key={`risk-${index}`}
                    fill={RISK_COLORS[index % RISK_COLORS.length]}
                  />
                ))}
              </Pie>

              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                iconSize={8}
                wrapperStyle={{
                  fontSize: 10,
                  color: "#8fa8c7",
                }}
              />

              <Tooltip
                contentStyle={{
                  background: "#071c40",
                  border: "1px solid #123b70",
                  borderRadius: 8,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}