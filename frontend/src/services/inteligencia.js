import api from "./api";


export async function analizarAudio(
    archivo,
    origen = "archivo"
) {
    const formData = new FormData();

    formData.append("audio", archivo);
    formData.append("origen", origen);

    const respuesta = await api.post(
        "inteligencia/analizar/",
        formData
    );

    return respuesta.data;
}


export async function analizarGrabacion(blob) {
    const archivo = new File(
        [blob],
        `soundguard_${Date.now()}.wav`,
        {
            type: "audio/wav",
        }
    );

    return analizarAudio(
        archivo,
        "microfono"
    );
}


export async function obtenerEstadoModelo() {
    const respuesta = await api.get(
        "inteligencia/estado-modelo/"
    );

    return respuesta.data;
}


export async function obtenerMetricasModelo() {
    const respuesta = await api.get(
        "inteligencia/metricas-modelo/"
    );

    return respuesta.data;
}