import api from "./api";


export async function registrarUsuario(
    datos
) {
    const respuesta = await api.post(
        "usuarios/registro/",
        datos
    );

    return respuesta.data;
}


export async function iniciarSesion(
    datos
) {
    const respuesta = await api.post(
        "usuarios/login/",
        datos
    );

    if (respuesta.data.token) {
        localStorage.setItem(
            "token",
            respuesta.data.token
        );
    }

    return respuesta.data;
}


export function cerrarSesion() {
    localStorage.removeItem(
        "token"
    );
}