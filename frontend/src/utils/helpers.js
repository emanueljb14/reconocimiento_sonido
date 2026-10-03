export const roleLabel = (
    role
) => {
    return {
        admin: "Administrador",
        supervisor: "Supervisor",
        user: "Usuario",
    }[role] || role;
};

export function normalizeRole(rol) {
  if (!rol) return 'user';
  const r = rol.toString().toUpperCase();
  if (r === 'ADMINISTRADOR' || r === 'ADMIN') return 'admin';
  if (r === 'SUPERVISOR') return 'supervisor';
  return 'user';
}

export const roleHome = (
    role
) => {
    return {
        admin:
            "/admin/dashboard",

        supervisor:
            "/supervisor/dashboard",

        user:
            "/user/dashboard",
    }[role] || "/login";
};


export const cn = (
    ...values
) => {
    return values
        .filter(Boolean)
        .join(" ");
};


export const riskClass = (
    risk
) => {
    const valor =
        String(
            risk || ""
        ).toUpperCase();


    if (
        valor === "CRITICO"
    ) {
        return "bg-red-700/15 text-red-400 border-red-700/30";
    }


    if (
        valor === "ALTO"
    ) {
        return "bg-sg-red/15 text-sg-red border-sg-red/30";
    }


    if (
        valor === "MEDIO"
    ) {
        return "bg-sg-yellow/15 text-sg-yellow border-sg-yellow/30";
    }


    return "bg-sg-green/15 text-sg-green border-sg-green/30";
};