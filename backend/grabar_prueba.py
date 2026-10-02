from pathlib import Path

import sounddevice as sd
from scipy.io.wavfile import write


FRECUENCIA = 22050
DURACION = 3


def grabar(nombre):
    carpeta = Path("pruebas_audio")
    carpeta.mkdir(exist_ok=True)

    ruta = carpeta / f"{nombre}.wav"

    print()
    print("=" * 50)
    print("SOUNDGUARD AI - GRABACIÓN DE PRUEBA")
    print("=" * 50)

    input(
        "\nPresiona ENTER y luego produce el sonido..."
    )

    print(
        f"\nGrabando durante {DURACION} segundos..."
    )

    audio = sd.rec(
        int(DURACION * FRECUENCIA),
        samplerate=FRECUENCIA,
        channels=1,
        dtype="float32",
    )

    sd.wait()

    print("Grabación terminada.")

    write(
        ruta,
        FRECUENCIA,
        audio,
    )

    print(f"\nAudio guardado en:\n{ruta.resolve()}")


if __name__ == "__main__":
    nombre = input(
        "Nombre de la prueba "
        "(ejemplo: golpe_real): "
    ).strip()

    if not nombre:
        nombre = "prueba"

    grabar(nombre)