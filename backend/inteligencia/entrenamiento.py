import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import sklearn

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support,
)

from .procesamiento import (
    cargar_y_preparar_audio,
    extraer_caracteristicas,
)


CLASES = [
    "golpe",
    "puerta",
    "alarma",
    "aplausos",
    "vidrio",
    "ruido_elevado",
]

EXTENSIONES = {".wav", ".flac", ".ogg"}

MINIMO_GRUPOS_POR_CLASE = 10
TEST_SIZE = 0.20
RANDOM_STATE = 42
UMBRAL_DESCONOCIDO = 0.55

RAIZ_PROYECTO = Path(__file__).resolve().parents[2]

RUTA_DATASET = (
    RAIZ_PROYECTO
    / "inteligencia-artificial"
    / "dataset"
)

RUTA_DATASET_LOCAL = (
    RAIZ_PROYECTO
    / "inteligencia-artificial"
    / "dataset_local"
)

RUTA_MODELOS = (
    Path(__file__).resolve().parent
    / "modelos"
)

RUTA_MODELO = (
    RUTA_MODELOS
    / "clasificador.joblib"
)

RUTA_METADATA = (
    RUTA_MODELOS
    / "metadata.json"
)


def listar_archivos(carpeta):
    if not carpeta.exists():
        return []

    return sorted([
        ruta
        for ruta in carpeta.rglob("*")
        if ruta.is_file()
        and ruta.suffix.lower() in EXTENSIONES
    ])


def quitar_prefijo_aumentacion(nombre):
    prefijos = (
        "aug_ruido__",
        "aug_distancia__",
        "aug_room__",
    )

    for prefijo in prefijos:
        if nombre.startswith(prefijo):
            return nombre[len(prefijo):]

    return None


def construir_registros():
    registros = []

    for clase in CLASES:
        carpeta_github = RUTA_DATASET / clase
        carpeta_local = RUTA_DATASET_LOCAL / clase

        archivos_github = listar_archivos(
            carpeta_github
        )

        archivos_local = listar_archivos(
            carpeta_local
        )

        for ruta in archivos_github:
            registros.append({
                "ruta": ruta,
                "clase": clase,
                "origen": "github_original",
                "tipo_grupo": "github",
                "grupo": (
                    f"{clase}|github|{ruta.stem}"
                ),
            })

        for ruta in archivos_local:
            original_stem = (
                quitar_prefijo_aumentacion(
                    ruta.stem
                )
            )

            if original_stem is not None:
                registros.append({
                    "ruta": ruta,
                    "clase": clase,
                    "origen": "aumentado",
                    "tipo_grupo": "github",
                    "grupo": (
                        f"{clase}|github|"
                        f"{original_stem}"
                    ),
                })
            else:
                registros.append({
                    "ruta": ruta,
                    "clase": clase,
                    "origen": "local_real",
                    "tipo_grupo": "local",
                    "grupo": (
                        f"{clase}|local|{ruta.stem}"
                    ),
                })

    return registros


def dividir_grupos(registros):
    informacion_grupo = {}

    for registro in registros:
        grupo = registro["grupo"]

        if grupo not in informacion_grupo:
            informacion_grupo[grupo] = {
                "clase": registro["clase"],
                "tipo_grupo": (
                    registro["tipo_grupo"]
                ),
            }

    grupos_por_bloque = defaultdict(list)

    for grupo, info in informacion_grupo.items():
        clave = (
            info["clase"],
            info["tipo_grupo"],
        )

        grupos_por_bloque[
            clave
        ].append(grupo)

    rng = np.random.default_rng(
        RANDOM_STATE
    )

    grupos_train = set()
    grupos_test = set()

    for clave in sorted(
        grupos_por_bloque.keys()
    ):
        grupos = sorted(
            grupos_por_bloque[clave]
        )

        grupos = list(
            rng.permutation(grupos)
        )

        cantidad = len(grupos)

        if cantidad < 2:
            grupos_train.update(grupos)
            continue

        cantidad_test = max(
            1,
            int(round(cantidad * TEST_SIZE)),
        )

        cantidad_test = min(
            cantidad_test,
            cantidad - 1,
        )

        grupos_test.update(
            grupos[:cantidad_test]
        )

        grupos_train.update(
            grupos[cantidad_test:]
        )

    if not grupos_train:
        raise ValueError(
            "No se generaron grupos de entrenamiento."
        )

    if not grupos_test:
        raise ValueError(
            "No se generaron grupos de prueba."
        )

    return grupos_train, grupos_test


def cargar_caracteristicas(registros):
    X = []
    y = []
    grupos = []
    origenes = []
    errores = []

    total = len(registros)

    for numero, registro in enumerate(
        registros,
        start=1,
    ):
        ruta = registro["ruta"]

        try:
            audio, _ = (
                cargar_y_preparar_audio(
                    ruta
                )
            )

            caracteristicas = (
                extraer_caracteristicas(
                    audio
                )
            )

            X.append(caracteristicas)
            y.append(registro["clase"])
            grupos.append(registro["grupo"])
            origenes.append(
                registro["origen"]
            )

            print(
                f"[{numero}/{total}] "
                f"{registro['clase']} | "
                f"{registro['origen']} | "
                f"{ruta.name}"
            )

        except Exception as error:
            errores.append({
                "archivo": str(ruta),
                "clase": registro["clase"],
                "origen": registro["origen"],
                "error": str(error),
            })

            print(
                f"[ERROR] "
                f"{ruta.name}: "
                f"{error}"
            )

    if not X:
        raise ValueError(
            "No fue posible procesar ningun audio."
        )

    return (
        np.vstack(X),
        np.array(y),
        np.array(grupos),
        np.array(origenes),
        errores,
    )


def validar_dataset(registros):
    grupos_por_clase = defaultdict(set)
    archivos_por_clase = Counter()
    origenes_por_clase = defaultdict(
        Counter
    )

    for registro in registros:
        clase = registro["clase"]

        archivos_por_clase[clase] += 1

        grupos_por_clase[
            clase
        ].add(
            registro["grupo"]
        )

        origenes_por_clase[
            clase
        ][
            registro["origen"]
        ] += 1

    for clase in CLASES:
        cantidad_grupos = len(
            grupos_por_clase[clase]
        )

        if (
            cantidad_grupos
            < MINIMO_GRUPOS_POR_CLASE
        ):
            raise ValueError(
                f"La clase '{clase}' solo tiene "
                f"{cantidad_grupos} grupos independientes. "
                f"Se necesitan al menos "
                f"{MINIMO_GRUPOS_POR_CLASE}."
            )

    print()
    print("RESUMEN DEL DATASET")
    print("=" * 70)

    for clase in CLASES:
        print(
            f"{clase:15} | "
            f"archivos: {archivos_por_clase[clase]:4} | "
            f"grupos: {len(grupos_por_clase[clase]):3} | "
            f"{dict(origenes_por_clase[clase])}"
        )

    print("=" * 70)


def calcular_metricas_por_origen(
    y_real,
    y_pred,
    origenes,
):
    resultado = {}

    for origen in sorted(
        set(origenes.tolist())
    ):
        mascara = (
            origenes == origen
        )

        cantidad = int(
            np.sum(mascara)
        )

        if cantidad == 0:
            continue

        resultado[origen] = {
            "muestras": cantidad,
            "accuracy": float(
                accuracy_score(
                    y_real[mascara],
                    y_pred[mascara],
                )
            ),
        }

    return resultado


def crear_modelo():
    return RandomForestClassifier(
        n_estimators=500,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        class_weight="balanced_subsample",
    )


def entrenar():
    print("=" * 70)
    print(
        "SOUNDGUARD AI - ENTRENAMIENTO AGRUPADO"
    )
    print("=" * 70)

    print("\nDataset original:")
    print(RUTA_DATASET)

    print("\nDataset local/aumentado:")
    print(RUTA_DATASET_LOCAL)

    registros = construir_registros()

    if not registros:
        raise ValueError(
            "No se encontraron audios para entrenar."
        )

    validar_dataset(registros)

    grupos_train, grupos_test = (
        dividir_grupos(registros)
    )

    print("\nProcesando audios...")

    (
        X,
        y,
        grupos,
        origenes,
        errores,
    ) = cargar_caracteristicas(
        registros
    )

    mascara_train = np.array([
        grupo in grupos_train
        for grupo in grupos
    ])

    mascara_test = np.array([
        grupo in grupos_test
        for grupo in grupos
    ])

    X_train = X[mascara_train]
    y_train = y[mascara_train]

    X_test = X[mascara_test]
    y_test = y[mascara_test]

    origenes_test = origenes[
        mascara_test
    ]

    if len(X_train) == 0:
        raise ValueError(
            "El conjunto de entrenamiento quedo vacio."
        )

    if len(X_test) == 0:
        raise ValueError(
            "El conjunto de prueba quedo vacio."
        )

    faltan_train = (
        set(CLASES)
        - set(y_train.tolist())
    )

    faltan_test = (
        set(CLASES)
        - set(y_test.tolist())
    )

    if faltan_train:
        raise ValueError(
            "Faltan clases en entrenamiento: "
            f"{sorted(faltan_train)}"
        )

    if faltan_test:
        raise ValueError(
            "Faltan clases en prueba: "
            f"{sorted(faltan_test)}"
        )

    print()
    print("DIVISION AGRUPADA")
    print("=" * 70)

    print(
        f"Grupos entrenamiento: "
        f"{len(grupos_train)}"
    )

    print(
        f"Grupos prueba: "
        f"{len(grupos_test)}"
    )

    print(
        f"Muestras entrenamiento: "
        f"{len(y_train)}"
    )

    print(
        f"Muestras prueba: "
        f"{len(y_test)}"
    )

    print(
        f"Caracteristicas por audio: "
        f"{X.shape[1]}"
    )

    print(
        "Distribucion train: "
        f"{dict(Counter(y_train.tolist()))}"
    )

    print(
        "Distribucion test: "
        f"{dict(Counter(y_test.tolist()))}"
    )

    print("=" * 70)

    print(
        "\nEntrenando modelo de evaluacion..."
    )

    modelo_evaluacion = crear_modelo()

    modelo_evaluacion.fit(
        X_train,
        y_train,
    )

    predicciones = (
        modelo_evaluacion.predict(
            X_test
        )
    )

    accuracy = accuracy_score(
        y_test,
        predicciones,
    )

    (
        precision,
        recall,
        f1,
        _,
    ) = precision_recall_fscore_support(
        y_test,
        predicciones,
        average="macro",
        zero_division=0,
    )

    reporte = classification_report(
        y_test,
        predicciones,
        labels=CLASES,
        output_dict=True,
        zero_division=0,
    )

    matriz = confusion_matrix(
        y_test,
        predicciones,
        labels=CLASES,
    )

    metricas_por_origen = (
        calcular_metricas_por_origen(
            y_test,
            predicciones,
            origenes_test,
        )
    )

    print()
    print(
        "RESULTADOS HOLDOUT AGRUPADO"
    )
    print("=" * 70)

    print(
        f"Accuracy: {accuracy:.4f}"
    )

    print(
        f"Precision macro: "
        f"{precision:.4f}"
    )

    print(
        f"Recall macro: "
        f"{recall:.4f}"
    )

    print(
        f"F1 macro: {f1:.4f}"
    )

    print(
        "\nMetricas por origen en prueba:"
    )

    for origen, valores in (
        metricas_por_origen.items()
    ):
        print(
            f"  {origen}: "
            f"{valores['accuracy']:.4f} "
            f"({valores['muestras']} muestras)"
        )

    print(
        "\nEntrenando modelo final "
        "con todas las muestras..."
    )

    modelo_final = crear_modelo()

    modelo_final.fit(
        X,
        y,
    )

    RUTA_MODELOS.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        modelo_final,
        RUTA_MODELO,
    )

    ahora = datetime.now(
        timezone.utc
    )

    distribucion_clases = {
        str(clase): int(cantidad)
        for clase, cantidad
        in Counter(
            y.tolist()
        ).items()
    }

    distribucion_origen = {
        str(origen): int(cantidad)
        for origen, cantidad
        in Counter(
            origenes.tolist()
        ).items()
    }

    reporte_limpio = {}

    for clave, valor in reporte.items():
        if isinstance(valor, dict):
            reporte_limpio[
                str(clave)
            ] = {
                str(k): float(v)
                for k, v
                in valor.items()
            }
        else:
            reporte_limpio[
                str(clave)
            ] = float(valor)

    metadata = {
        "estado": "entrenado",

        "version": ahora.strftime(
            "%Y%m%d-%H%M%S"
        ),

        "fecha_entrenamiento": (
            ahora.isoformat()
        ),

        "modelo": (
            "RandomForestClassifier"
        ),

        "scikit_learn": (
            sklearn.__version__
        ),

        "estrategia_validacion": (
            "holdout_agrupado_80_20"
        ),

        "descripcion_validacion": (
            "El audio original y sus aumentaciones "
            "permanecen en el mismo grupo para evitar "
            "fuga de datos."
        ),

        "modelo_final_entrenado_con_todas_muestras": True,

        "muestras_totales": int(
            len(y)
        ),

        "muestras_entrenamiento": int(
            len(y_train)
        ),

        "muestras_prueba": int(
            len(y_test)
        ),

        "grupos_totales": int(
            len(set(grupos.tolist()))
        ),

        "grupos_entrenamiento": int(
            len(grupos_train)
        ),

        "grupos_prueba": int(
            len(grupos_test)
        ),

        "caracteristicas": int(
            X.shape[1]
        ),

        "clases": CLASES,

        "distribucion_clases": (
            distribucion_clases
        ),

        "distribucion_origen": (
            distribucion_origen
        ),

        "metricas": {
            "accuracy": float(
                accuracy
            ),
            "precision_macro": float(
                precision
            ),
            "recall_macro": float(
                recall
            ),
            "f1_macro": float(
                f1
            ),
        },

        "metricas_prueba_por_origen": (
            metricas_por_origen
        ),

        "reporte_clasificacion": (
            reporte_limpio
        ),

        "matriz_confusion": {
            "clases": CLASES,
            "valores": (
                matriz.tolist()
            ),
        },

        "umbral_desconocido": (
            UMBRAL_DESCONOCIDO
        ),

        "errores_dataset": errores,
    }

    with open(
        RUTA_METADATA,
        "w",
        encoding="utf-8",
    ) as archivo:
        json.dump(
            metadata,
            archivo,
            ensure_ascii=False,
            indent=4,
        )

    print()
    print("=" * 70)
    print(
        "ENTRENAMIENTO TERMINADO"
    )
    print("=" * 70)

    print(
        f"\nModelo guardado en:\n"
        f"{RUTA_MODELO}"
    )

    print(
        f"\nMetadata guardada en:\n"
        f"{RUTA_METADATA}"
    )

    print(
        f"\nAudios con error: "
        f"{len(errores)}"
    )

    return metadata


if __name__ == "__main__":
    entrenar()
