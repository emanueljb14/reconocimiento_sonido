import React, { createContext, useContext, useState, useEffect } from 'react';
import { normalizeRole } from '../utils/helpers';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('soundguard_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password, remember) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/usuarios/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { ok: false, error: data.non_field_errors?.[0] || 'Credenciales inválidas' };
      }

      // Estructurar el objeto usuario reconociendo el rol de Django
      const usuarioFormateado = {
        id: data.user_id,
        username: data.username,
        email: data.email,
        token: data.token,
        role: normalizeRole(data.rol), // Se convierte a "admin", "supervisor" o "user"
      };

      setUser(usuarioFormateado);

      if (remember) {
        localStorage.setItem('soundguard_user', JSON.stringify(usuarioFormateado));
        localStorage.setItem('token', data.token);
      }

      return { ok: true, user: usuarioFormateado };
    } catch (err) {
      return { ok: false, error: 'Error de conexión con el servidor backend' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('soundguard_user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);