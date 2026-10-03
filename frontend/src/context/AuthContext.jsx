import React, { createContext, useContext, useState } from "react";
import { iniciarSesion, registrarUsuario } from "../services/usuarios";
import { normalizeRole } from "../utils/helpers";

const AuthContext = createContext(null);
const SESSION = "sg_session";

function readSession() {
  try {
    return JSON.parse(
      localStorage.getItem(SESSION) || sessionStorage.getItem(SESSION) || "null"
    );
  } catch {
    return null;
  }
}

function normalizeUser(payload) {
  const source =
    payload?.user ||
    payload?.usuario ||
    payload?.data?.user ||
    payload?.data?.usuario ||
    payload?.data ||
    payload ||
    {};

  const rawRole = source.role || source.rol || payload?.role || payload?.rol;

  return {
    ...source,
    id: source.id ?? source.pk ?? source.user_id ?? null,
    name: source.name || source.nombre || source.username || "Usuario",
    username: source.username || "",
    email: source.email || source.correo || "",
    token: payload?.token || source.token || "",
    role: rawRole ? normalizeRole(rawRole) : null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession);

  const login = async (username, password, remember = true) => {
    try {
      const payload = await iniciarSesion({ username, password });
      const safe = normalizeUser(payload);

      if (!safe.role) {
        return {
          ok: false,
          error: "El servidor no devolvió el rol del usuario.",
        };
      }

      setUser(safe);

      localStorage.removeItem(SESSION);
      sessionStorage.removeItem(SESSION);

      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(SESSION, JSON.stringify(safe));
      if (safe.token) {
        localStorage.setItem("token", safe.token);
      }

      return { ok: true, user: safe };
    } catch (error) {
      const message =
        error?.response?.data?.non_field_errors?.[0] ||
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Usuario o contraseña incorrectos";

      return { ok: false, error: message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION);
    sessionStorage.removeItem(SESSION);
    localStorage.removeItem("token");
  };

  const register = async (data) => {
    try {
      await registrarUsuario(data);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error:
          error?.response?.data?.detail ||
          error?.response?.data?.error ||
          "No se pudo registrar el usuario",
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, users: [], login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);