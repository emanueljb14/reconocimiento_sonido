import React, {
  useEffect,
  useState,
} from "react";

import {
  Mic,
  ShieldCheck,
  Activity,
} from "lucide-react";

import {
  obtenerResumenPublico,
} from "../../services/estadisticas";


export default function AuthShell({
  children,
  title,
  subtitle,
}) {
  const [
    estadisticas,
    setEstadisticas,
  ] = useState(null);

  const [
    cargando,
    setCargando,
  ] = useState(true);


  useEffect(() => {
    let activo = true;


    async function cargarEstadisticas() {
      try {
        const datos =
          await obtenerResumenPublico();

        if (!activo) {
          return;
        }

        setEstadisticas(
          datos
        );

      } catch (error) {
        console.error(
          "Error cargando estadísticas públicas:",
          error
        );

      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }


    cargarEstadisticas();


    const intervalo = setInterval(
      cargarEstadisticas,
      10000
    );


    return () => {
      activo = false;

      clearInterval(
        intervalo
      );
    };

  }, []);


  const totalDetecciones =
    estadisticas?.total_detecciones ?? "--";


  const precisionIA =
    estadisticas?.precision_ia != null
      ? `${Number(
          estadisticas.precision_ia
        ).toFixed(2)}%`
      : "--";


  const riesgoAlto =
    estadisticas?.riesgo_alto ?? "--";


  const tarjetas = [
    [
      cargando
        ? "..."
        : totalDetecciones,

      "Total detecciones",
    ],

    [
      cargando
        ? "..."
        : precisionIA,

      "Precisión IA",
    ],

    [
      cargando
        ? "..."
        : riesgoAlto,

      "Riesgo alto",
    ],
  ];


  return (
    <div className="grid min-h-screen bg-sg-bg lg:grid-cols-2">

      {/* PANEL IZQUIERDO */}
      <div className="grid-bg hidden p-10 lg:flex lg:flex-col lg:justify-center">

        <div className="mx-auto max-w-xl">

          {/* LOGO */}
          <div className="flex items-center gap-3">

            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sg-blue/20 text-sg-cyan">
              <Mic size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                SoundGuard{" "}
                <span className="text-sg-cyan">
                  AI
                </span>
              </h1>

              <p className="text-xs text-sg-muted">
                Detección Inteligente de Sonidos
              </p>
            </div>

          </div>


          {/* TITULO */}
          <h2 className="mt-16 text-5xl font-black leading-tight">

            Protección inteligente

            <br />

            <span className="text-sg-cyan">
              basada en sonido.
            </span>

          </h2>


          <p className="mt-5 max-w-lg text-sg-muted">

            Monitorea eventos acústicos en tiempo real
            con una interfaz de supervisión diseñada
            para equipos de seguridad.

          </p>


          {/* ESTADISTICAS */}
          <div className="mt-10 grid grid-cols-3 gap-3">

            {tarjetas.map(
              ([value, label]) => (

                <div
                  className="glass rounded-xl p-4"
                  key={label}
                >

                  <Activity
                    size={17}
                    className="text-sg-cyan"
                  />

                  <p className="mt-3 text-xl font-bold">
                    {value}
                  </p>

                  <p className="text-[10px] text-sg-muted">
                    {label}
                  </p>

                </div>

              )
            )}

          </div>

        </div>

      </div>


      {/* PANEL DERECHO */}
      <div className="flex items-center justify-center p-5">

        <div className="w-full max-w-md">

          {/* LOGO MOVIL */}
          <div className="mb-6 text-center lg:hidden">

            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sg-blue/20 text-sg-cyan">
              <Mic />
            </div>

            <h1 className="mt-2 text-2xl font-bold">

              SoundGuard{" "}

              <span className="text-sg-cyan">
                AI
              </span>

            </h1>

          </div>


          {/* FORMULARIO */}
          <div className="glass rounded-2xl p-6 md:p-8">

            <div className="mb-6">

              <h2 className="text-2xl font-bold">
                {title}
              </h2>

              <p className="mt-1 text-sm text-sg-muted">
                {subtitle}
              </p>

            </div>


            {children}

          </div>


          {/* SEGURIDAD */}
          <div className="mt-5 flex justify-center gap-2 text-[10px] text-sg-muted">

            <ShieldCheck
              size={13}
            />

            Plataforma de monitoreo segura

          </div>

        </div>

      </div>

    </div>
  );
}