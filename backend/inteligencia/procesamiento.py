import librosa
import numpy as np


FRECUENCIA_MUESTREO = 22050
DURACION_SEGUNDOS = 3.0

MUESTRAS_OBJETIVO = int(
    FRECUENCIA_MUESTREO * DURACION_SEGUNDOS
)


def cargar_y_preparar_audio(ruta_audio):
    audio, _ = librosa.load(
        ruta_audio,
        sr=FRECUENCIA_MUESTREO,
        mono=True,
    )

    if audio.size == 0:
        raise ValueError("El archivo de audio está vacío.")

    duracion_original = librosa.get_duration(
        y=audio,
        sr=FRECUENCIA_MUESTREO,
    )

    # Quitar silencios largos del inicio/final.
    audio, _ = librosa.effects.trim(
        audio,
        top_db=35,
    )

    if audio.size == 0:
        raise ValueError(
            "No se encontró señal de audio utilizable."
        )

    # Normalización de amplitud.
    pico = np.max(np.abs(audio))

    if pico > 0:
        audio = audio / pico

    # Todos los audios deben tener la misma longitud.
    if len(audio) < MUESTRAS_OBJETIVO:
        audio = np.pad(
            audio,
            (
                0,
                MUESTRAS_OBJETIVO - len(audio),
            ),
        )

    else:
        audio = audio[:MUESTRAS_OBJETIVO]

    return (
        audio.astype(np.float32),
        float(duracion_original),
    )


def _media_desviacion(matriz):
    return np.concatenate([
        np.mean(matriz, axis=1),
        np.std(matriz, axis=1),
    ])


def extraer_caracteristicas(audio):
    mfcc = librosa.feature.mfcc(
        y=audio,
        sr=FRECUENCIA_MUESTREO,
        n_mfcc=20,
    )

    delta_mfcc = librosa.feature.delta(
        mfcc
    )

    chroma = librosa.feature.chroma_stft(
        y=audio,
        sr=FRECUENCIA_MUESTREO,
    )

    centroide = librosa.feature.spectral_centroid(
        y=audio,
        sr=FRECUENCIA_MUESTREO,
    )

    rolloff = librosa.feature.spectral_rolloff(
        y=audio,
        sr=FRECUENCIA_MUESTREO,
    )

    zcr = librosa.feature.zero_crossing_rate(
        audio
    )

    rms = librosa.feature.rms(
        y=audio
    )

    caracteristicas = np.concatenate([
        _media_desviacion(mfcc),
        _media_desviacion(delta_mfcc),
        _media_desviacion(chroma),
        _media_desviacion(centroide),
        _media_desviacion(rolloff),
        _media_desviacion(zcr),
        _media_desviacion(rms),
    ])

    return caracteristicas.astype(
        np.float32
    )