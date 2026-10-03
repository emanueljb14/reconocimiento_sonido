import React, {
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    UserPlus,
} from "lucide-react";

import AuthShell from "./AuthShell";

import Input from "../../components/ui/Input";

import Button from "../../components/ui/Button";

import {
    useAuth,
} from "../../context/AuthContext";


export default function Register() {
    const {
        register,
    } = useAuth();

    const nav =
        useNavigate();


    const [
        f,
        setF,
    ] = useState({
        username: "",
        email: "",
        password: "",
        confirm: "",
    });


    const [
        err,
        setErr,
    ] = useState("");


    const [
        loading,
        setLoading,
    ] = useState(false);


    const set =
        (key) =>
        (event) => {
            setF({
                ...f,
                [key]:
                    event.target.value,
            });
        };


    const submit =
        async (event) => {
            event.preventDefault();

            setErr("");


            if (
                f.password !==
                f.confirm
            ) {
                setErr(
                    "Las contraseñas no coinciden"
                );
                return;
            }


            if (
                f.password.length < 8
            ) {
                setErr(
                    "La contraseña debe tener al menos 8 caracteres"
                );
                return;
            }


            setLoading(true);


            try {
                const result =
                    await register({
                        username:
                            f.username.trim(),

                        email:
                            f.email.trim(),

                        password:
                            f.password,
                    });


                if (!result.ok) {
                    setErr(
                        result.error
                    );
                    return;
                }


                nav(
                    "/login"
                );

            } finally {
                setLoading(false);
            }
        };


    return (
        <AuthShell
            title="Crear cuenta"
            subtitle="Registra un nuevo acceso para SoundGuard AI."
        >
            <form
                onSubmit={submit}
                className="space-y-3.5"
            >
                <Input
                    label="Usuario"
                    value={
                        f.username
                    }
                    onChange={
                        set("username")
                    }
                    placeholder="Ingresa tu usuario"
                    required
                />


                <Input
                    label="Correo electrónico"
                    type="email"
                    value={
                        f.email
                    }
                    onChange={
                        set("email")
                    }
                    required
                />


                <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                        label="Contraseña"
                        type="password"
                        value={
                            f.password
                        }
                        onChange={
                            set("password")
                        }
                        required
                    />

                    <Input
                        label="Confirmar contraseña"
                        type="password"
                        value={
                            f.confirm
                        }
                        onChange={
                            set("confirm")
                        }
                        required
                    />
                </div>


                {err && (
                    <p className="rounded-lg border border-sg-red/30 bg-sg-red/10 p-2 text-xs text-sg-red">
                        {err}
                    </p>
                )}


                <label className="flex items-center gap-2 text-xs text-sg-muted">
                    <input
                        type="checkbox"
                        required
                        className="accent-sg-cyan"
                    />

                    Acepto los términos y condiciones
                </label>


                <Button
                    className="w-full py-3"
                    type="submit"
                    disabled={loading}
                >
                    <UserPlus
                        size={15}
                        className="mr-2 inline"
                    />

                    {loading
                        ? "Creando cuenta..."
                        : "Crear cuenta"}
                </Button>
            </form>


            <p className="mt-6 text-center text-xs text-sg-muted">
                ¿Ya tienes una cuenta?{" "}

                <Link
                    to="/login"
                    className="text-sg-cyan"
                >
                    Iniciar sesión
                </Link>
            </p>
        </AuthShell>
    );
}