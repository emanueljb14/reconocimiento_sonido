import React, {
    createContext,
    useContext,
    useState,
} from "react";

import {
    iniciarSesion,
    registrarUsuario,
} from "../services/usuarios";

const C = createContext(null);

const SESSION = "sg_session";

function readSession() {
    try {
        return JSON.parse(
            localStorage.getItem(SESSION) ||
            sessionStorage.getItem(SESSION) ||
            "null"
        );
    } catch {
        return null;
    }
}

function normalizarRol(rol) {
    const valor = String(rol || "").toUpperCase();

    if (valor === "ADMINISTRADOR" || valor === "ADMIN") {
        return "admin";
    }

    if (valor === "SUPERVISOR") {
        return "supervisor";
    }

    if (valor === "USUARIO" || valor === "USER") {
        return "user";
    }

    return null;
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

    return {
        ...source,
        id: source.id ?? source.pk ?? null,
        username: source.username || source.usuario || "",
        name: source.name || source.nombre || source.username || "Usuario",
        email: source.email || source.correo || "",
        role: normalizarRol(
            source.rol ||
            source.role ||
            payload?.rol ||
            payload?.role
        ),
    };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(readSession);

    const login = async (username, password, remember = true) => {
    try {
        const payload = await iniciarSesion({
            username,
            password,
        });

        const safe = normalizeUser(payload);

        if (!safe.role) {
            return {
                ok: false,
                error: "El servidor no devolvió un rol válido.",
            };
        }

        setUser(safe);

        localStorage.removeItem(SESSION);
        sessionStorage.removeItem(SESSION);

        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(SESSION, JSON.stringify(safe));

        if (payload.token || payload.access) {
            localStorage.setItem("token", payload.token || payload.access);
        }

        return {
            ok: true,
            user: safe,
        };
    } catch (error) {
        // Mapeo completo de las respuestas de error de Django REST Framework
        const res = error?.response?.data;
        
        let message = "Error al conectar con el servidor.";

        if (typeof res === "string") {
            message = res;
        } else if (res?.non_field_errors?.[0]) {
            message = res.non_field_errors[0];
        } else if (res?.detail) {
            message = res.detail;
        } else if (res?.username?.[0]) {
            message = res.username[0];
        } else if (res?.password?.[0]) {
            message = res.password[0];
        } else if (error?.message) {
            message = error.message;
        }

        return {
            ok: false,
            error: message,
        };
    }
};
    // NUEVO MÉTODO: Para login biométrico y externos
    const loginWithToken = (token, userPayload) => {
        const safe = normalizeUser(userPayload);

        if (token) {
            localStorage.setItem("token", token);
        }

        localStorage.setItem(SESSION, JSON.stringify(safe));
        setUser(safe);
        return safe;
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
                    error?.response?.data?.username?.[0] ||
                    error?.response?.data?.email?.[0] ||
                    error?.response?.data?.password?.[0] ||
                    error?.response?.data?.detail ||
                    "No se pudo registrar el usuario",
            };
        }
    };

    return (
        <C.Provider
            value={{
                user,
                users: [],
                login,
                loginWithToken,
                logout,
                register,
            }}
        >
            {children}
        </C.Provider>
    );
}

export const useAuth = () => useContext(C);