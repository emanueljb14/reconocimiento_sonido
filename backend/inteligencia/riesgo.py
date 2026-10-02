PESOS_RIESGO = {
    "alarma": 1.00,
    "vidrio": 0.95,
    "golpe": 0.75,
    "ruido_elevado": 0.65,
    "puerta": 0.45,
    "aplausos": 0.25,
    "desconocido": 0.10,
}


def calcular_riesgo(
    tipo_sonido,
    confianza,
):
    peso = PESOS_RIESGO.get(
        tipo_sonido,
        0.10,
    )

    puntuacion = (
        float(confianza)
        * peso
    )

    if puntuacion >= 0.85:
        nivel = "critico"

    elif puntuacion >= 0.65:
        nivel = "alto"

    elif puntuacion >= 0.35:
        nivel = "medio"

    else:
        nivel = "bajo"

    return {
        "nivel": nivel,
        "puntuacion": round(
            puntuacion,
            4,
        ),
    }