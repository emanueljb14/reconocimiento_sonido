from pathlib import Path
import time

import sounddevice as sd
import soundfile as sf


FRECUENCIA = 22050
DURACION = 3
CANALES = 1

RAIZ = (
    Path(__file__).resolve().parent.parent
    / "inteligencia-artificial"
    / "dataset"
)

CLASES = [
    "golpe",
    "puerta",
    "alarma",
    "aplausos",
    "vidrio",
    "ruido_elevado",
]


def grabar(clase, numero):
    carpeta = RAIZ / clase
    carpeta.mkdir(
        parents=True,
        exist_ok=True,
    )

    ruta = (
        carpeta
        / f"real_{clase}_{numero:03d}.wav"
    )

    print()
    print(
        f"Preparando {clase} "
        f"#{numero}"
    )
    print(
        "Haz el sonido cuando aparezca "
        "'GRABANDO'."
    )

    for valor in [3, 2, 1]:
        print(valor)
        time.sleep(1)

    print("GRABANDO...")

    audio = sd.rec(
        int(
            DURACION
            * FRECUENCIA
        ),
        samplerate=FRECUENCIA,
        channels=CANALES,
        dtype="float32",
    )

    sd.wait()

    sf.write(
        ruta,
        audio,
        FRECUENCIA,
        subtype="PCM_16",
    )

    print(
        f"Guardado: {ruta.name}"
    )


def main():
    print("=" * 60)
    print("SOUNDGUARD AI - CAPTURA DE DATASET REAL")
    print("=" * 60)

    print("\nClases:")

    for indice, clase in enumerate(
        CLASES,
        start=1,
    ):
        print(
            f"{indice}. {clase}"
        )

    opcion = input(
        "\nSelecciona clase: "
    ).strip()

    try:
        indice = int(opcion) - 1
        clase = CLASES[indice]
    except (
        ValueError,
        IndexError,
    ):
        print(
            "Clase incorrecta."
        )
        return

    cantidad = int(
        input(
            "Cantidad de grabaciones "
            "(recomiendo 20): "
        )
    )

    existentes = list(
        (RAIZ / clase).glob(
            f"real_{clase}_*.wav"
        )
    )

    inicio = (
        len(existentes)
        + 1
    )

    for numero in range(
        inicio,
        inicio + cantidad,
    ):
        grabar(
            clase,
            numero,
        )

        if numero < (
            inicio
            + cantidad
            - 1
        ):
            input(
                "\nENTER para "
                "la siguiente..."
            )

    print(
        "\nGrabaciones terminadas."
    )


if __name__ == "__main__":
    main()