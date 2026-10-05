import api from "./api";


export async function obtenerResumenPublico() {
  const respuesta = await api.get(
    "estadisticas/publico/"
  );

  return respuesta.data;
}


export async function obtenerResumen() {
  const respuesta = await api.get(
    "estadisticas/resumen/"
  );

  return respuesta.data;
}


export async function obtenerPorSonido() {
  const respuesta = await api.get(
    "estadisticas/por-sonido/"
  );

  return respuesta.data;
}


export async function obtenerPorRiesgo() {
  const respuesta = await api.get(
    "estadisticas/por-riesgo/"
  );

  return respuesta.data;
}


export async function obtenerPorHora() {
  const respuesta = await api.get(
    "estadisticas/por-hora/"
  );

  return respuesta.data;
}


export async function obtenerPorDia(
  dias = 7
) {
  const respuesta = await api.get(
    "estadisticas/por-dia/",
    {
      params: {
        dias,
      },
    }
  );

  return respuesta.data;
}