export const roleLabel = (role) => {
    return (
        {
            admin: "Administrador",
            supervisor: "Supervisor",
            user: "Usuario",
        }[role] || role
    );
};

export function normalizeRole(rol) {
  if (!rol) return 'user';
  const r = rol.toString().toUpperCase();
  if (r === 'ADMINISTRADOR' || r === 'ADMIN') return 'admin';
  if (r === 'SUPERVISOR') return 'supervisor';
  return 'user';
}

export function roleHome(rol) {
  const norm = normalizeRole(rol);
  if (norm === 'admin') return '/admin/dashboard';
  if (norm === 'supervisor') return '/supervisor/dashboard';
  return '/user/dashboard';
}


export const cn = (...values) => {
    return values.filter(Boolean).join(" ");
};


export const riskClass = (risk) => {
    if (risk === "CRITICO") {
        return "bg-red-700/15 text-red-400 border-red-700/30";
    }

    if (risk === "ALTO") {
        return "bg-sg-red/15 text-sg-red border-sg-red/30";
    }

    if (risk === "MEDIO") {
        return "bg-sg-yellow/15 text-sg-yellow border-sg-yellow/30";
    }

    return "bg-sg-green/15 text-sg-green border-sg-green/30";
};