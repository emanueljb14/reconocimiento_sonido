PESOS_RIESGO = {
    "alarma": 1.0,
    "vidrio": 1.0,
    "golpe": 0.8,
    "ruido_elevado": 0.7,
    "puerta": 0.4,
    "aplausos": 0.2,
    "desconocido": 0.3,
}


def calcular_riesgo(tipo_sonido, confianza):

    peso = PESOS_RIESGO.get(
        tipo_sonido,
        0.3,
    )

    puntuacion = confianza * peso

    if puntuacion >= 0.85:
        return "critico"

    if puntuacion >= 0.65:
        return "alto"

    if puntuacion >= 0.35:
        return "medio"

    return "bajo"