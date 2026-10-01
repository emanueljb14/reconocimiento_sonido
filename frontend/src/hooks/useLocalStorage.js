import { useCallback, useState } from "react";

export function useLocalStorage(clave, valorInicial) {
  const [valor, setValorEstado] = useState(() => {
    try {
      const almacenado = localStorage.getItem(clave);

      if (almacenado === null) {
        return typeof valorInicial === "function"
          ? valorInicial()
          : valorInicial;
      }

      return JSON.parse(almacenado);
    } catch (error) {
      console.error(
        `Error leyendo localStorage "${clave}":`,
        error
      );

      return typeof valorInicial === "function"
        ? valorInicial()
        : valorInicial;
    }
  });

  const setValor = useCallback(
    (nuevoValor) => {
      try {
        setValorEstado((valorAnterior) => {
          const valorFinal =
            typeof nuevoValor === "function"
              ? nuevoValor(valorAnterior)
              : nuevoValor;

          localStorage.setItem(
            clave,
            JSON.stringify(valorFinal)
          );

          return valorFinal;
        });
      } catch (error) {
        console.error(
          `Error guardando localStorage "${clave}":`,
          error
        );
      }
    },
    [clave]
  );

  const eliminar = useCallback(() => {
    try {
      localStorage.removeItem(clave);
    } catch (error) {
      console.error(
        `Error eliminando localStorage "${clave}":`,
        error
      );
    }
  }, [clave]);

  return [valor, setValor, eliminar];
}

export default useLocalStorage;