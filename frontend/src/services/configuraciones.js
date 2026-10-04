import api from "./api";


export async function obtenerConfiguracion() {
    const respuesta = await api.get(
        "configuraciones/me/"
    );

    return respuesta.data;
}


export async function actualizarConfiguracion(
    datos
) {
    const respuesta = await api.patch(
        "configuraciones/me/",
        datos
    );

    return respuesta.data;
}