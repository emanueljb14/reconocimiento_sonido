const FRECUENCIA_DESTINO = 22050;


function combinarBuffers(buffers) {
    const longitudTotal = buffers.reduce(
        (total, buffer) => total + buffer.length,
        0
    );

    const resultado =
        new Float32Array(longitudTotal);

    let posicion = 0;

    for (const buffer of buffers) {
        resultado.set(
            buffer,
            posicion
        );

        posicion += buffer.length;
    }

    return resultado;
}


function remuestrear(
    audio,
    frecuenciaOriginal,
    frecuenciaDestino
) {
    if (
        frecuenciaOriginal ===
        frecuenciaDestino
    ) {
        return audio;
    }

    const relacion =
        frecuenciaOriginal /
        frecuenciaDestino;

    const nuevaLongitud =
        Math.round(
            audio.length / relacion
        );

    const resultado =
        new Float32Array(
            nuevaLongitud
        );

    for (
        let i = 0;
        i < nuevaLongitud;
        i++
    ) {
        const posicionOriginal =
            i * relacion;

        const indiceInferior =
            Math.floor(
                posicionOriginal
            );

        const indiceSuperior =
            Math.min(
                indiceInferior + 1,
                audio.length - 1
            );

        const fraccion =
            posicionOriginal -
            indiceInferior;

        resultado[i] =
            audio[indiceInferior] *
            (1 - fraccion) +
            audio[indiceSuperior] *
            fraccion;
    }

    return resultado;
}


function escribirTexto(
    view,
    offset,
    texto
) {
    for (
        let i = 0;
        i < texto.length;
        i++
    ) {
        view.setUint8(
            offset + i,
            texto.charCodeAt(i)
        );
    }
}


function crearWav(
    audio,
    sampleRate
) {
    const canales = 1;
    const bitsPorMuestra = 16;
    const bytesPorMuestra = 2;

    const tamanoDatos =
        audio.length *
        bytesPorMuestra;

    const buffer =
        new ArrayBuffer(
            44 + tamanoDatos
        );

    const view =
        new DataView(buffer);


    escribirTexto(
        view,
        0,
        "RIFF"
    );

    view.setUint32(
        4,
        36 + tamanoDatos,
        true
    );

    escribirTexto(
        view,
        8,
        "WAVE"
    );

    escribirTexto(
        view,
        12,
        "fmt "
    );

    view.setUint32(
        16,
        16,
        true
    );

    view.setUint16(
        20,
        1,
        true
    );

    view.setUint16(
        22,
        canales,
        true
    );

    view.setUint32(
        24,
        sampleRate,
        true
    );

    view.setUint32(
        28,
        sampleRate *
        canales *
        bytesPorMuestra,
        true
    );

    view.setUint16(
        32,
        canales *
        bytesPorMuestra,
        true
    );

    view.setUint16(
        34,
        bitsPorMuestra,
        true
    );

    escribirTexto(
        view,
        36,
        "data"
    );

    view.setUint32(
        40,
        tamanoDatos,
        true
    );


    let offset = 44;

    for (
        let i = 0;
        i < audio.length;
        i++
    ) {
        const muestra =
            Math.max(
                -1,
                Math.min(
                    1,
                    audio[i]
                )
            );

        const valor =
            muestra < 0
                ? muestra * 32768
                : muestra * 32767;

        view.setInt16(
            offset,
            valor,
            true
        );

        offset += 2;
    }


    return new Blob(
        [buffer],
        {
            type: "audio/wav",
        }
    );
}


function descargarWav(wav) {
    const url =
        URL.createObjectURL(wav);

    const enlace =
        document.createElement("a");

    enlace.href = url;

    enlace.download =
        `prueba_microfono_${Date.now()}.wav`;

    document.body.appendChild(
        enlace
    );

    enlace.click();

    enlace.remove();

    setTimeout(
        () => {
            URL.revokeObjectURL(
                url
            );
        },
        1000
    );
}


export async function grabarWav(
    duracionSegundos = 3
) {
    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {
        throw new Error(
            "El navegador no permite acceder al micrófono."
        );
    }


    const stream =
        await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,

                echoCancellation: false,

                noiseSuppression: false,

                autoGainControl: false,
            },
        });


    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContextClass) {
        stream
            .getTracks()
            .forEach(
                (track) =>
                    track.stop()
            );

        throw new Error(
            "AudioContext no está disponible en este navegador."
        );
    }


    const contexto =
        new AudioContextClass();


    if (
        contexto.state ===
        "suspended"
    ) {
        await contexto.resume();
    }


    const frecuenciaOriginal =
        contexto.sampleRate;


    const fuente =
        contexto.createMediaStreamSource(
            stream
        );


    const procesador =
        contexto.createScriptProcessor(
            4096,
            1,
            1
        );


    const buffers = [];


    procesador.onaudioprocess = (
        evento
    ) => {
        const datos =
            evento.inputBuffer
                .getChannelData(0);

        buffers.push(
            new Float32Array(datos)
        );
    };


    fuente.connect(
        procesador
    );

    procesador.connect(
        contexto.destination
    );


    try {
        await new Promise(
            (resolve) => {
                setTimeout(
                    resolve,
                    duracionSegundos *
                    1000
                );
            }
        );
    } finally {
        procesador.disconnect();

        fuente.disconnect();

        stream
            .getTracks()
            .forEach(
                (track) =>
                    track.stop()
            );

        await contexto.close();
    }


    if (
        buffers.length === 0
    ) {
        throw new Error(
            "No se pudo capturar audio."
        );
    }


    const audioCompleto =
        combinarBuffers(
            buffers
        );


    const audioRemuestreado =
        remuestrear(
            audioCompleto,
            frecuenciaOriginal,
            FRECUENCIA_DESTINO
        );


    const wav =
        crearWav(
            audioRemuestreado,
            FRECUENCIA_DESTINO
        );


    descargarWav(
        wav
    );


    return wav;
}