import csv
import shutil
from pathlib import Path


RAIZ = Path(__file__).resolve().parents[1]

ESC50 = RAIZ / "esc50"
AUDIO_ESC50 = ESC50 / "audio"
CSV_ESC50 = ESC50 / "meta" / "esc50.csv"

DESTINO = (
    RAIZ
    / "inteligencia-artificial"
    / "dataset"
)


MAPEO = {
    "door_wood_knock": "golpe",
    "door_wood_creaks": "puerta",
    "siren": "alarma",
    "clapping": "aplausos",
    "glass_breaking": "vidrio",
    "chainsaw": "ruido_elevado",
}


def preparar():
    if not CSV_ESC50.exists():
        raise FileNotFoundError(
            f"No existe: {CSV_ESC50}"
        )

    for clase in MAPEO.values():
        (DESTINO / clase).mkdir(
            parents=True,
            exist_ok=True,
        )

    contadores = {
        clase: 0
        for clase in MAPEO.values()
    }

    with open(
        CSV_ESC50,
        newline="",
        encoding="utf-8",
    ) as archivo:

        lector = csv.DictReader(
            archivo
        )

        for fila in lector:

            categoria = fila["category"]

            if categoria not in MAPEO:
                continue

            clase_destino = MAPEO[
                categoria
            ]

            nombre = fila["filename"]

            origen = (
                AUDIO_ESC50
                / nombre
            )

            destino = (
                DESTINO
                / clase_destino
                / nombre
            )

            shutil.copy2(
                origen,
                destino,
            )

            contadores[
                clase_destino
            ] += 1

    print(
        "\nDataset preparado:\n"
    )

    for clase, total in contadores.items():
        print(
            f"{clase}: {total} audios"
        )


if __name__ == "__main__":
    preparar()