import librosa
import numpy as np


FRECUENCIA_MUESTREO = 22050
DURACION_SEGUNDOS = 3


def preparar_audio(ruta_audio):

    audio, _ = librosa.load(
        ruta_audio,
        sr=FRECUENCIA_MUESTREO,
        mono=True,
    )

    muestras_necesarias = (
        FRECUENCIA_MUESTREO * DURACION_SEGUNDOS
    )

    if len(audio) < muestras_necesarias:

        audio = np.pad(
            audio,
            (0, muestras_necesarias - len(audio)),
        )

    else:

        audio = audio[:muestras_necesarias]

    return audio.astype(np.float32)


def extraer_caracteristicas(audio):

    mfcc = librosa.feature.mfcc(
        y=audio,
        sr=FRECUENCIA_MUESTREO,
        n_mfcc=20,
    )

    media = np.mean(
        mfcc,
        axis=1,
    )

    desviacion = np.std(
        mfcc,
        axis=1,
    )

    caracteristicas = np.concatenate([
        media,
        desviacion,
    ])

    return caracteristicas.astype(np.float32)