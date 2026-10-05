from pathlib import Path

import librosa
import numpy as np
import soundfile as sf


# =========================================================
# CONFIGURACIÓN
# =========================================================

FRECUENCIA = 22050

SEMILLA = 42

CLASES = [
    "alarma",
    "aplausos",
    "golpe",
    "puerta",
    "ruido_elevado",
    "vidrio",
]

EXTENSIONES = {
    ".wav",
    ".flac",
    ".ogg",
}


BASE = Path(__file__).resolve().parent

DATASET = BASE / "dataset"

DATASET_LOCAL = BASE / "dataset_local"


rng = np.random.default_rng(
    SEMILLA
)


# =========================================================
# UTILIDADES
# =========================================================

def limitar_audio(audio):
    """
    Evita clipping.
    """

    audio = np.nan_to_num(
        audio,
        nan=0.0,
        posinf=0.0,
        neginf=0.0,
    )

    pico = np.max(
        np.abs(audio)
    )

    if pico > 0.98:
        audio = (
            audio /
            pico *
            0.98
        )

    return audio.astype(
        np.float32
    )


def rms(audio):
    return float(
        np.sqrt(
            np.mean(
                audio ** 2
            ) +
            1e-12
        )
    )


# =========================================================
# AUMENTACIÓN 1
# RUIDO DE FONDO
# =========================================================

def agregar_ruido(audio):
    """
    Simula ruido ambiental suave.

    SNR aleatorio:
    aproximadamente 20-30 dB.
    """

    nivel_senal = rms(
        audio
    )

    if nivel_senal < 1e-7:
        return audio.copy()

    ruido = rng.normal(
        0,
        1,
        len(audio),
    ).astype(
        np.float32
    )

    nivel_ruido = rms(
        ruido
    )

    snr_db = rng.uniform(
        20,
        30,
    )

    nivel_objetivo = (
        nivel_senal /
        (
            10 **
            (
                snr_db /
                20
            )
        )
    )

    ruido *= (
        nivel_objetivo /
        max(
            nivel_ruido,
            1e-12,
        )
    )

    resultado = (
        audio +
        ruido
    )

    return limitar_audio(
        resultado
    )


# =========================================================
# AUMENTACIÓN 2
# DISTANCIA / VOLUMEN / DESPLAZAMIENTO
# =========================================================

def cambiar_distancia(audio):
    """
    Simula que el sonido ocurrió
    más cerca o más lejos del micrófono.
    """

    ganancia_db = rng.uniform(
        -7.0,
        2.0,
    )

    factor = (
        10 **
        (
            ganancia_db /
            20
        )
    )

    resultado = (
        audio *
        factor
    )


    # Desplazamiento temporal
    # máximo de unos 120 ms.

    max_shift = int(
        FRECUENCIA *
        0.12
    )

    shift = int(
        rng.integers(
            -max_shift,
            max_shift + 1,
        )
    )

    desplazado = np.zeros_like(
        resultado
    )

    if shift > 0:
        desplazado[
            shift:
        ] = resultado[
            :-shift
        ]

    elif shift < 0:
        desplazado[
            :shift
        ] = resultado[
            -shift:
        ]

    else:
        desplazado[:] = (
            resultado
        )


    # Un poquito de ruido realista.

    desplazado = (
        agregar_ruido(
            desplazado
        )
    )

    return limitar_audio(
        desplazado
    )


# =========================================================
# AUMENTACIÓN 3
# HABITACIÓN / REVERBERACIÓN
# =========================================================

def agregar_reverberacion(audio):
    """
    Reverberación pequeña para simular
    paredes y distancia real.

    No intenta convertirlo en un efecto
    musical; es una perturbación suave.
    """

    duracion_impulso = int(
        FRECUENCIA *
        0.18
    )

    impulso = np.zeros(
        duracion_impulso,
        dtype=np.float32,
    )

    impulso[0] = 1.0


    ecos = [
        (
            0.022,
            rng.uniform(
                0.22,
                0.35,
            ),
        ),
        (
            0.047,
            rng.uniform(
                0.12,
                0.22,
            ),
        ),
        (
            0.081,
            rng.uniform(
                0.06,
                0.14,
            ),
        ),
        (
            0.125,
            rng.uniform(
                0.025,
                0.08,
            ),
        ),
    ]


    for tiempo, amplitud in ecos:

        posicion = int(
            tiempo *
            FRECUENCIA
        )

        if (
            posicion <
            len(impulso)
        ):
            impulso[
                posicion
            ] = amplitud


    reverberado = np.convolve(
        audio,
        impulso,
        mode="full",
    )[:len(audio)]


    mezcla = rng.uniform(
        0.16,
        0.28,
    )


    resultado = (
        audio *
        (1 - mezcla)
        +
        reverberado *
        mezcla
    )


    # Simular un poco la distancia

    ganancia = rng.uniform(
        0.72,
        1.0,
    )

    resultado *= ganancia


    resultado = agregar_ruido(
        resultado
    )

    return limitar_audio(
        resultado
    )


# =========================================================
# CARGAR AUDIO
# =========================================================

def cargar_audio(ruta):

    audio, _ = librosa.load(
        ruta,
        sr=FRECUENCIA,
        mono=True,
    )

    if len(audio) == 0:
        raise ValueError(
            "Audio vacío."
        )

    return limitar_audio(
        audio
    )


# =========================================================
# GUARDAR
# =========================================================

def guardar(
    ruta,
    audio,
):

    ruta.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    sf.write(
        ruta,
        audio,
        FRECUENCIA,
        subtype="PCM_16",
    )


# =========================================================
# PROCESAR UNA CLASE
# =========================================================

def procesar_clase(
    clase,
):

    origen = (
        DATASET /
        clase
    )

    destino = (
        DATASET_LOCAL /
        clase /
        "augmentadas"
    )


    if not origen.exists():

        print(
            f"[ERROR] "
            f"No existe: "
            f"{origen}"
        )

        return 0


    archivos = sorted([
        archivo
        for archivo
        in origen.rglob("*")
        if (
            archivo.is_file()
            and
            archivo.suffix.lower()
            in EXTENSIONES
        )
    ])


    print()
    print(
        "=" * 60
    )

    print(
        f"CLASE: {clase}"
    )

    print(
        f"Originales: "
        f"{len(archivos)}"
    )

    print(
        "=" * 60
    )


    generados = 0


    for indice, ruta in enumerate(
        archivos,
        start=1,
    ):

        try:

            audio = cargar_audio(
                ruta
            )


            nombre = (
                ruta.stem
            )


            # -----------------------------------------
            # 1. Ruido
            # -----------------------------------------

            audio_ruido = (
                agregar_ruido(
                    audio
                )
            )

            guardar(
                destino /
                (
                    f"aug_ruido__"
                    f"{nombre}.wav"
                ),
                audio_ruido,
            )


            # -----------------------------------------
            # 2. Distancia
            # -----------------------------------------

            audio_distancia = (
                cambiar_distancia(
                    audio
                )
            )

            guardar(
                destino /
                (
                    f"aug_distancia__"
                    f"{nombre}.wav"
                ),
                audio_distancia,
            )


            # -----------------------------------------
            # 3. Habitación
            # -----------------------------------------

            audio_room = (
                agregar_reverberacion(
                    audio
                )
            )

            guardar(
                destino /
                (
                    f"aug_room__"
                    f"{nombre}.wav"
                ),
                audio_room,
            )


            generados += 3


            print(
                f"[{indice}/"
                f"{len(archivos)}] "
                f"{ruta.name} "
                f"-> 3 aumentados"
            )


        except Exception as error:

            print(
                f"[ERROR] "
                f"{ruta.name}: "
                f"{error}"
            )


    return generados


# =========================================================
# PRINCIPAL
# =========================================================

def main():

    print()
    print(
        "=" * 65
    )

    print(
        "SOUNDGUARD - PREPARACIÓN "
        "DE DATASET LOCAL"
    )

    print(
        "=" * 65
    )

    print(
        f"Dataset original:"
    )

    print(
        DATASET
    )

    print()

    print(
        f"Dataset aumentado:"
    )

    print(
        DATASET_LOCAL
    )

    print()


    total = 0


    for clase in CLASES:

        cantidad = (
            procesar_clase(
                clase
            )
        )

        total += cantidad


    print()
    print(
        "=" * 65
    )

    print(
        "PROCESO TERMINADO"
    )

    print(
        f"Audios aumentados "
        f"generados: {total}"
    )

    print(
        "=" * 65
    )

    print()

    print(
        "Los originales NO fueron "
        "modificados."
    )

    print()

    print(
        "Los archivos generados "
        "están dentro de:"
    )

    print(
        DATASET_LOCAL
    )

    print()


if __name__ == "__main__":
    main()