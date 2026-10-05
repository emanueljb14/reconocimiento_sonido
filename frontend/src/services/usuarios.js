import api from "./api";

export async function registrarUsuario(datos) {
    const respuesta = await api.post(
        "usuarios/registro/",
        datos
    );

    return respuesta.data;
}

export async function iniciarSesion(datos) {
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
    localStorage.removeItem("token");
}

export async function obtenerUsuarios() {
    const respuesta = await api.get(
        "usuarios/"
    );

    return respuesta.data;
}

export async function crearUsuario(datos) {
    const respuesta = await api.post(
        "usuarios/",
        datos
    );

    return respuesta.data;
}

export async function actualizarUsuario(id, datos) {
    const respuesta = await api.patch(
        `usuarios/${id}/`,
        datos
    );

    return respuesta.data;
}

export async function eliminarUsuario(id) {
    const respuesta = await api.delete(
        `usuarios/${id}/`
    );

    return respuesta.data;
}