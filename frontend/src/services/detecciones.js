import api from "./api";


export async function obtenerDetecciones() {
    const respuesta = await api.get(
        "detecciones/"
    );

    return respuesta.data;
}


export async function obtenerDeteccionesPorTipo(tipo) {
    const respuesta = await api.get(
        "detecciones/",
        {
            params: {
                tipo_sonido: tipo,
            },
        }
    );

    return respuesta.data;
}


export async function obtenerDeteccionesPorRiesgo(riesgo) {
    const respuesta = await api.get(
        "detecciones/",
        {
            params: {
                nivel_riesgo: riesgo,
            },
        }
    );

    return respuesta.data;
}