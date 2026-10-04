import hashlib
import uuid

from pathlib import Path

import soundfile as sf

from django.conf import settings
from django.db import transaction
from django.utils.text import slugify

from .models import MuestraAudio


DATASET_LOCAL = (
    Path(
        settings.BASE_DIR
    )
    .resolve()
    .parent
    / "inteligencia-artificial"
    / "dataset_local"
)


def _nombre_seguro(
    nombre_original,
    clase,
    origen,
):
    ruta = Path(
        nombre_original
    )

    extension = (
        ruta.suffix.lower()
    )

    stem = (
        slugify(
            ruta.stem
        )
        or "audio"
    )

    prefijo = (
        "chrome"
        if origen == "microfono"
        else "local"
    )

    identificador = (
        uuid.uuid4()
        .hex[:12]
    )

    return (
        f"{prefijo}_"
        f"{clase}_"
        f"{identificador}_"
        f"{stem}"
        f"{extension}"
    )


def _ruta_absoluta_segura(
    archivo_relativo,
):
    base = (
        DATASET_LOCAL
        .resolve()
    )

    destino = (
        base
        / archivo_relativo
    ).resolve()

    if (
        destino != base
        and base
        not in destino.parents
    ):
        raise ValueError(
            "Ruta de dataset inválida."
        )

    return destino


def guardar_muestra_dataset(
    *,
    archivo,
    clase,
    origen,
    descripcion="",
    usuario=None,
):
    DATASET_LOCAL.mkdir(
        parents=True,
        exist_ok=True,
    )

    carpeta_clase = (
        DATASET_LOCAL
        / clase
    )

    carpeta_clase.mkdir(
        parents=True,
        exist_ok=True,
    )

    nombre_archivo = (
        _nombre_seguro(
            archivo.name,
            clase,
            origen,
        )
    )

    archivo_relativo = (
        Path(clase)
        / nombre_archivo
    )

    destino = (
        _ruta_absoluta_segura(
            archivo_relativo
        )
    )

    sha = hashlib.sha256()
    tamano = 0

    try:
        with open(
            destino,
            "wb",
        ) as salida:
            for bloque in archivo.chunks():
                salida.write(
                    bloque
                )

                sha.update(
                    bloque
                )

                tamano += len(
                    bloque
                )

        digest = (
            sha.hexdigest()
        )

        existente = (
            MuestraAudio.objects
            .filter(
                sha256=digest
            )
            .first()
        )

        if existente:
            destino.unlink(
                missing_ok=True
            )

            raise ValueError(
                "Este audio ya fue registrado "
                f"como muestra #{existente.id}."
            )

        try:
            info = sf.info(
                str(destino)
            )
        except Exception as error:
            destino.unlink(
                missing_ok=True
            )

            raise ValueError(
                "El archivo no contiene un "
                "audio válido o está dañado."
            ) from error

        sample_rate = int(
            info.samplerate
        )

        if sample_rate <= 0:
            destino.unlink(
                missing_ok=True
            )

            raise ValueError(
                "Sample rate de audio inválido."
            )

        duracion = (
            float(info.frames)
            / float(sample_rate)
        )

        if duracion < 0.20:
            destino.unlink(
                missing_ok=True
            )

            raise ValueError(
                "El audio es demasiado corto. "
                "Debe durar al menos 0.20 segundos."
            )

        if duracion > 30:
            destino.unlink(
                missing_ok=True
            )

            raise ValueError(
                "El audio es demasiado largo. "
                "El máximo permitido es 30 segundos."
            )

        with transaction.atomic():
            muestra = (
                MuestraAudio.objects.create(
                    clase=clase,
                    origen=origen,
                    nombre_archivo=(
                        nombre_archivo
                    ),
                    archivo_relativo=(
                        archivo_relativo
                        .as_posix()
                    ),
                    descripcion=(
                        descripcion or ""
                    ),
                    duracion_segundos=(
                        round(
                            duracion,
                            4,
                        )
                    ),
                    sample_rate=(
                        sample_rate
                    ),
                    tamano_bytes=(
                        tamano
                    ),
                    sha256=digest,
                    usuario=usuario,
                )
            )

        return muestra

    except Exception:
        if destino.exists():
            # Si la BD falló después de escribir
            # el archivo, evitamos dejar basura.
            if not MuestraAudio.objects.filter(
                archivo_relativo=(
                    archivo_relativo
                    .as_posix()
                )
            ).exists():
                destino.unlink(
                    missing_ok=True
                )

        raise


def eliminar_muestra_dataset(
    muestra,
):
    destino = (
        _ruta_absoluta_segura(
            muestra.archivo_relativo
        )
    )

    with transaction.atomic():
        muestra.delete()

    destino.unlink(
        missing_ok=True
    )
