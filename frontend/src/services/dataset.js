import api from "./api";


export async function obtenerMuestrasDataset(
    filtros = {}
) {
    const params = {};

    if (filtros.clase) {
        params.clase = filtros.clase;
    }

    if (filtros.origen) {
        params.origen = filtros.origen;
    }

    const respuesta = await api.get(
        "inteligencia/dataset/",
        {
            params,
        }
    );

    return respuesta.data;
}


export async function obtenerMuestraDataset(id) {
    const respuesta = await api.get(
        `inteligencia/dataset/${id}/`
    );

    return respuesta.data;
}


export async function crearMuestraDataset({
    archivo,
    clase,
    origen = "archivo",
    descripcion = "",
}) {
    const formData = new FormData();

    formData.append(
        "audio",
        archivo
    );

    formData.append(
        "clase",
        clase
    );

    formData.append(
        "origen",
        origen
    );

    formData.append(
        "descripcion",
        descripcion
    );

    const respuesta = await api.post(
        "inteligencia/dataset/",
        formData
    );

    return respuesta.data;
}


export async function crearMuestraDesdeGrabacion({
    blob,
    clase,
    descripcion = "",
}) {
    const archivo = new File(
        [blob],
        `chrome_${clase}_${Date.now()}.wav`,
        {
            type: "audio/wav",
        }
    );

    return crearMuestraDataset({
        archivo,
        clase,
        origen: "microfono",
        descripcion,
    });
}


export async function eliminarMuestraDataset(id) {
    await api.delete(
        `inteligencia/dataset/${id}/`
    );

    return true;
}