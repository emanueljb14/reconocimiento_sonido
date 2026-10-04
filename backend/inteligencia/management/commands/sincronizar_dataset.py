import hashlib

from pathlib import Path

import soundfile as sf

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import IntegrityError

from inteligencia.models import MuestraAudio


CLASES_VALIDAS = {
    "golpe",
    "puerta",
    "alarma",
    "aplausos",
    "vidrio",
    "ruido_elevado",
}

EXTENSIONES = {
    ".wav",
    ".flac",
    ".ogg",
}


class Command(BaseCommand):
    help = (
        "Registra en PostgreSQL los audios que ya existen "
        "en inteligencia-artificial/dataset_local sin moverlos."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help=(
                "Muestra qué se importaría sin guardar "
                "registros en la base de datos."
            ),
        )

    def handle(self, *args, **options):
        dry_run = bool(
            options.get("dry_run")
        )

        dataset_local = (
            Path(settings.BASE_DIR)
            .resolve()
            .parent
            / "inteligencia-artificial"
            / "dataset_local"
        )

        self.stdout.write("")
        self.stdout.write(
            "=" * 70
        )
        self.stdout.write(
            "SOUNDGUARD - SINCRONIZACIÓN DE DATASET LOCAL"
        )
        self.stdout.write(
            "=" * 70
        )
        self.stdout.write(
            f"Ruta: {dataset_local}"
        )

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    "MODO DRY-RUN: no se guardarán cambios."
                )
            )

        if not dataset_local.exists():
            self.stderr.write(
                self.style.ERROR(
                    "No existe dataset_local."
                )
            )
            return

        total_archivos = 0
        importados = 0
        existentes = 0
        duplicados = 0
        errores = 0

        por_clase = {
            clase: {
                "total": 0,
                "importados": 0,
                "existentes": 0,
                "duplicados": 0,
                "errores": 0,
            }
            for clase in sorted(
                CLASES_VALIDAS
            )
        }

        for clase in sorted(
            CLASES_VALIDAS
        ):
            carpeta = (
                dataset_local
                / clase
            )

            if not carpeta.exists():
                self.stdout.write(
                    self.style.WARNING(
                        f"[{clase}] carpeta inexistente."
                    )
                )
                continue

            archivos = sorted(
                ruta
                for ruta
                in carpeta.rglob("*")
                if (
                    ruta.is_file()
                    and ruta.suffix.lower()
                    in EXTENSIONES
                )
            )

            self.stdout.write("")
            self.stdout.write(
                f"[{clase}] {len(archivos)} archivo(s)"
            )

            for ruta in archivos:
                total_archivos += 1
                por_clase[clase]["total"] += 1

                relativo = (
                    ruta
                    .relative_to(
                        dataset_local
                    )
                    .as_posix()
                )

                if (
                    MuestraAudio.objects
                    .filter(
                        archivo_relativo=relativo
                    )
                    .exists()
                ):
                    existentes += 1
                    por_clase[clase]["existentes"] += 1
                    continue

                try:
                    sha = hashlib.sha256()

                    with open(
                        ruta,
                        "rb",
                    ) as archivo:
                        while True:
                            bloque = (
                                archivo.read(
                                    1024 * 1024
                                )
                            )

                            if not bloque:
                                break

                            sha.update(
                                bloque
                            )

                    digest = (
                        sha.hexdigest()
                    )

                    duplicado = (
                        MuestraAudio.objects
                        .filter(
                            sha256=digest
                        )
                        .first()
                    )

                    if duplicado:
                        duplicados += 1
                        por_clase[clase]["duplicados"] += 1

                        self.stdout.write(
                            self.style.WARNING(
                                "  DUPLICADO "
                                f"{relativo} -> "
                                f"muestra #{duplicado.id}"
                            )
                        )
                        continue

                    info = sf.info(
                        str(ruta)
                    )

                    sample_rate = int(
                        info.samplerate
                    )

                    if sample_rate <= 0:
                        raise ValueError(
                            "sample rate inválido"
                        )

                    duracion = (
                        float(
                            info.frames
                        )
                        / float(
                            sample_rate
                        )
                    )

                    nombre = (
                        ruta.name.lower()
                    )

                    origen = (
                        "microfono"
                        if (
                            nombre.startswith(
                                "chrome_"
                            )
                            or nombre.startswith(
                                "real_"
                            )
                        )
                        else "archivo"
                    )

                    if dry_run:
                        self.stdout.write(
                            "  IMPORTARÍA "
                            f"{relativo} "
                            f"({duracion:.2f}s, "
                            f"{sample_rate} Hz, "
                            f"{origen})"
                        )

                        importados += 1
                        por_clase[clase]["importados"] += 1
                        continue

                    try:
                        MuestraAudio.objects.create(
                            clase=clase,
                            origen=origen,
                            nombre_archivo=(
                                ruta.name
                            ),
                            archivo_relativo=(
                                relativo
                            ),
                            descripcion=(
                                "Importado desde "
                                "dataset_local existente."
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
                                ruta.stat().st_size
                            ),
                            sha256=digest,
                            usuario=None,
                        )
                    except IntegrityError:
                        duplicados += 1
                        por_clase[clase]["duplicados"] += 1
                        continue

                    importados += 1
                    por_clase[clase]["importados"] += 1

                except Exception as error:
                    errores += 1
                    por_clase[clase]["errores"] += 1

                    self.stderr.write(
                        self.style.ERROR(
                            f"  ERROR {relativo}: {error}"
                        )
                    )

        self.stdout.write("")
        self.stdout.write(
            "=" * 70
        )
        self.stdout.write(
            "RESUMEN"
        )
        self.stdout.write(
            "=" * 70
        )

        for clase in sorted(
            por_clase
        ):
            datos = (
                por_clase[
                    clase
                ]
            )

            self.stdout.write(
                f"{clase:15} | "
                f"total={datos['total']:4} | "
                f"importados={datos['importados']:4} | "
                f"existentes={datos['existentes']:4} | "
                f"duplicados={datos['duplicados']:4} | "
                f"errores={datos['errores']:3}"
            )

        self.stdout.write("")
        self.stdout.write(
            f"Archivos encontrados: {total_archivos}"
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Importados: {importados}"
            )
        )
        self.stdout.write(
            f"Ya registrados: {existentes}"
        )
        self.stdout.write(
            f"Duplicados SHA256: {duplicados}"
        )

        if errores:
            self.stdout.write(
                self.style.ERROR(
                    f"Errores: {errores}"
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    "Errores: 0"
                )
            )

        if dry_run:
            self.stdout.write("")
            self.stdout.write(
                self.style.WARNING(
                    "No se modificó la base de datos "
                    "porque ejecutaste --dry-run."
                )
            )
