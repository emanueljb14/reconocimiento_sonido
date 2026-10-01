export function speak(
  texto,
  velocidad = 1,
  volumen = 1
) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    console.warn(
      "La API de síntesis de voz no está disponible."
    );

    return;
  }

  window.speechSynthesis.cancel();

  const mensaje = new SpeechSynthesisUtterance(texto);

  mensaje.lang = "es-ES";
  mensaje.rate = velocidad;
  mensaje.volume = volumen;
  mensaje.pitch = 1;

  window.speechSynthesis.speak(mensaje);
}