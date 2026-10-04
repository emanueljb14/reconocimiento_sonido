function combinarBuffers(buffers) {
    const longitudTotal =
        buffers.reduce(
            (total, buffer) =>
                total + buffer.length,
            0
        );

    const resultado =
        new Float32Array(
            longitudTotal
        );

    let posicion = 0;

    for (const buffer of buffers) {
        resultado.set(
            buffer,
            posicion
        );

        posicion +=
            buffer.length;
    }

    return resultado;
}


function ajustarLongitud(
    audio,
    longitudObjetivo
) {
    if (
        audio.length ===
        longitudObjetivo
    ) {
        return audio;
    }

    const resultado =
        new Float32Array(
            longitudObjetivo
        );

    const cantidad =
        Math.min(
            audio.length,
            longitudObjetivo
        );

    resultado.set(
        audio.subarray(
            0,
            cantidad
        )
    );

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

    const bitsPorMuestra =
        16;

    const bytesPorMuestra =
        bitsPorMuestra / 8;

    const tamanoDatos =
        audio.length *
        bytesPorMuestra;

    const buffer =
        new ArrayBuffer(
            44 +
            tamanoDatos
        );

    const view =
        new DataView(
            buffer
        );


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


export async function grabarWav(
    duracionSegundos = 3
) {
    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
            .getUserMedia
    ) {
        throw new Error(
            "El navegador no permite acceder al micrófono."
        );
    }


    const stream =
        await navigator
            .mediaDevices
            .getUserMedia({
                audio: {
                    channelCount: 1,

                    echoCancellation:
                        false,

                    noiseSuppression:
                        false,

                    autoGainControl:
                        false,
                },
            });


    const pista =
        stream
            .getAudioTracks()[0];


    /*
        IMPORTANTE:
        Esto muestra lo que Chrome
        realmente está usando.
    */
    console.log(
        "Configuración real del micrófono:"
    );

    console.table(
        pista.getSettings()
    );


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
            "AudioContext no está disponible."
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


    /*
        NO forzamos 22050 aquí.

        Dejamos que Chrome grabe
        en la frecuencia real
        del dispositivo.

        Django/librosa hará
        después el remuestreo
        a 22050.
    */
    const frecuenciaReal =
        contexto.sampleRate;


    console.log(
        "Sample rate de AudioContext:",
        frecuenciaReal
    );


    const fuente =
        contexto
            .createMediaStreamSource(
                stream
            );


    const procesador =
        contexto
            .createScriptProcessor(
                4096,
                1,
                1
            );


    /*
        Lo conectamos a un gain
        en cero para mantener
        activo el procesamiento
        sin escuchar el micrófono
        por los parlantes.
    */
    const silenciador =
        contexto.createGain();

    silenciador.gain.value =
        0;


    const buffers = [];


    procesador.onaudioprocess =
        (evento) => {
            const datos =
                evento
                    .inputBuffer
                    .getChannelData(
                        0
                    );

            buffers.push(
                new Float32Array(
                    datos
                )
            );
        };


    fuente.connect(
        procesador
    );

    procesador.connect(
        silenciador
    );

    silenciador.connect(
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
        silenciador.disconnect();

        stream
            .getTracks()
            .forEach(
                (track) =>
                    track.stop()
            );
    }


    if (
        buffers.length === 0
    ) {
        await contexto.close();

        throw new Error(
            "No se capturó audio."
        );
    }


    const audioCompleto =
        combinarBuffers(
            buffers
        );


    /*
        Dejamos EXACTAMENTE
        la cantidad de muestras
        correspondiente a 3 segundos.

        Si Chrome produjo un poco
        menos, rellena con cero.

        Si produjo un poco más,
        recorta.
    */
    const muestrasObjetivo =
        Math.round(
            frecuenciaReal *
            duracionSegundos
        );


    const audioExacto =
        ajustarLongitud(
            audioCompleto,
            muestrasObjetivo
        );


    console.log(
        "Duración enviada:",
        (
            audioExacto.length /
            frecuenciaReal
        ).toFixed(3),
        "segundos"
    );


    console.log(
        "Muestras enviadas:",
        audioExacto.length
    );


    console.log(
        "Frecuencia enviada:",
        frecuenciaReal
    );


    const wav =
        crearWav(
            audioExacto,
            frecuenciaReal
        );


    await contexto.close();


    return wav;
}