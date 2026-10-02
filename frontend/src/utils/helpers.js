export const roleLabel = (role) => {
    return (
        {
            admin: "Administrador",
            supervisor: "Supervisor",
            user: "Usuario",
        }[role] || role
    );
};


export const roleHome = (role) => {
    return (
        {
            admin: "/admin/dashboard",
            supervisor: "/supervisor/dashboard",
            user: "/user/dashboard",
        }[role] || "/login"
    );
};


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