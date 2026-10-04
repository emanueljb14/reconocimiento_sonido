import api from "./api";


<<<<<<< HEAD
export async function registrarUsuario(
    datos
) {
=======
export async function registrarUsuario(datos) {
>>>>>>> 7928f69916d0abdf3d464c34d8040db02462f9a0
    const respuesta = await api.post(
        "usuarios/registro/",
        datos
    );

    return respuesta.data;
}


<<<<<<< HEAD
export async function iniciarSesion(
    datos
) {
=======
export async function iniciarSesion(datos) {
>>>>>>> 7928f69916d0abdf3d464c34d8040db02462f9a0
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
<<<<<<< HEAD
    localStorage.removeItem(
        "token"
    );
=======
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


export async function actualizarUsuario(
    id,
    datos
) {
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
>>>>>>> 7928f69916d0abdf3d464c34d8040db02462f9a0
}