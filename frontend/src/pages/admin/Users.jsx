import React, {
    useEffect,
    useState,
} from "react";

import {
    Plus,
    Trash2,
    Edit3,
    Users as UsersIcon,
} from "lucide-react";

import DashboardLayout
    from "../../components/layout/DashboardLayout";

import Card
    from "../../components/ui/Card";

import Button
    from "../../components/ui/Button";

import Modal
    from "../../components/ui/Modal";

import Input
    from "../../components/ui/Input";

import {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
} from "../../services/usuarios";

import {
    roleLabel,
} from "../../utils/helpers";


const ROL_FRONTEND = {
    admin: "ADMINISTRADOR",
    supervisor: "SUPERVISOR",
    user: "USUARIO",
};


const ROL_BACKEND = {
    ADMINISTRADOR: "admin",
    SUPERVISOR: "supervisor",
    USUARIO: "user",
};


function normalizarUsuario(usuario) {
    return {
        ...usuario,

        name:
            usuario.username ||
            "Sin nombre",

        role:
            ROL_BACKEND[usuario.rol] ||
            "user",

        status:
            usuario.is_active
                ? "Activo"
                : "Inactivo",

        lastAccess:
            usuario.last_login
                ? new Date(
                    usuario.last_login
                ).toLocaleString(
                    "es-PE"
                )
                : "Nunca",

        createdAt:
            usuario.date_joined
                ? new Date(
                    usuario.date_joined
                ).toLocaleDateString(
                    "es-PE"
                )
                : "-",
    };
}


const FORM_INICIAL = {
    username: "",
    email: "",
    password: "",
    role: "user",
};


export default function Users() {

    const [
        users,
        setUsers,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const [
        open,
        setOpen,
    ] = useState(false);

    const [
        editing,
        setEditing,
    ] = useState(null);

    const [
        form,
        setForm,
    ] = useState(
        FORM_INICIAL
    );


    async function cargarUsuarios() {
        try {
            setLoading(true);
            setError("");

            const data =
                await obtenerUsuarios();

            const lista =
                Array.isArray(data)
                    ? data
                    : data?.results || [];

            setUsers(
                lista.map(
                    normalizarUsuario
                )
            );

        } catch (err) {

            console.error(
                "Error cargando usuarios:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "No se pudieron cargar los usuarios."
            );

        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        cargarUsuarios();
    }, []);


    function cambiarCampo(
        campo,
        valor
    ) {
        setForm(
            actual => ({
                ...actual,
                [campo]: valor,
            })
        );
    }


    function abrirNuevo() {
        setEditing(null);

        setForm({
            ...FORM_INICIAL,
        });

        setOpen(true);
    }


    function abrirEditar(usuario) {
        setEditing(usuario);

        setForm({
            username:
                usuario.username || "",

            email:
                usuario.email || "",

            password: "",

            role:
                usuario.role || "user",
        });

        setOpen(true);
    }


    async function guardar(e) {
        e.preventDefault();

        try {
            setError("");

            const datos = {
                username:
                    form.username,

                email:
                    form.email,

                rol:
                    ROL_FRONTEND[
                        form.role
                    ],

                is_active:
                    true,
            };


            if (
                !editing ||
                form.password
            ) {
                if (form.password) {
                    datos.password =
                        form.password;
                }
            }


            if (editing) {

                const actualizado =
                    await actualizarUsuario(
                        editing.id,
                        datos
                    );

                setUsers(
                    actual =>
                        actual.map(
                            usuario =>
                                usuario.id ===
                                editing.id
                                    ? normalizarUsuario(
                                        actualizado
                                    )
                                    : usuario
                        )
                );

            } else {

                if (!form.password) {
                    throw new Error(
                        "La contraseña es obligatoria."
                    );
                }

                const creado =
                    await crearUsuario({
                        ...datos,
                        password:
                            form.password,
                    });

                setUsers(
                    actual => [
                        normalizarUsuario(
                            creado
                        ),
                        ...actual,
                    ]
                );
            }


            setOpen(false);

            setEditing(null);

            setForm({
                ...FORM_INICIAL,
            });

        } catch (err) {

            console.error(
                "Error guardando usuario:",
                err
            );

            const data =
                err?.response?.data;

            setError(
                data?.username?.[0] ||
                data?.email?.[0] ||
                data?.password?.[0] ||
                data?.rol?.[0] ||
                data?.detail ||
                err.message ||
                "No se pudo guardar el usuario."
            );
        }
    }


    async function borrar(usuario) {

        if (
            !window.confirm(
                `¿Eliminar al usuario ${usuario.username}?`
            )
        ) {
            return;
        }

        try {

            setError("");

            await eliminarUsuario(
                usuario.id
            );

            setUsers(
                actual =>
                    actual.filter(
                        item =>
                            item.id !==
                            usuario.id
                    )
            );

        } catch (err) {

            console.error(
                "Error eliminando usuario:",
                err
            );

            setError(
                err?.response?.data?.detail ||
                "No se pudo eliminar el usuario."
            );
        }
    }


    const supervisores =
        users.filter(
            usuario =>
                usuario.role ===
                "supervisor"
        ).length;


    const usuariosFinales =
        users.filter(
            usuario =>
                usuario.role ===
                "user"
        ).length;


    return (
        <DashboardLayout
            title="Usuarios"
            subtitle="Administra las cuentas y permisos de SoundGuard AI."
        >

            {error && (
                <div className="mb-4 rounded-lg border border-sg-red/30 bg-sg-red/10 p-3 text-xs text-sg-red">
                    {error}
                </div>
            )}


            <Card
                title="Usuarios del sistema"
                action={
                    <Button
                        onClick={abrirNuevo}
                    >
                        <Plus
                            size={14}
                            className="mr-1 inline"
                        />

                        Nuevo usuario
                    </Button>
                }
            >

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[760px] text-left text-xs">

                        <thead className="text-[10px] text-sg-muted">

                            <tr>
                                <th className="px-4 py-3">
                                    Usuario
                                </th>

                                <th className="px-4 py-3">
                                    Email
                                </th>

                                <th className="px-4 py-3">
                                    Rol
                                </th>

                                <th className="px-4 py-3">
                                    Estado
                                </th>

                                <th className="px-4 py-3">
                                    Último acceso
                                </th>

                                <th className="px-4 py-3">
                                    Registro
                                </th>

                                <th className="px-4 py-3">
                                    Acciones
                                </th>
                            </tr>

                        </thead>


                        <tbody>

                            {loading && (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-4 py-8 text-center text-sg-muted"
                                    >
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            )}


                            {!loading &&
                                users.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-4 py-8 text-center text-sg-muted"
                                        >
                                            No hay usuarios registrados.
                                        </td>
                                    </tr>
                                )}


                            {!loading &&
                                users.map(
                                    usuario => (
                                        <tr
                                            className="border-t border-sg-line/60"
                                            key={usuario.id}
                                        >

                                            <td className="px-4 py-3 font-semibold">
                                                {usuario.username}
                                            </td>

                                            <td className="px-4 py-3">
                                                {usuario.email || "-"}
                                            </td>

                                            <td className="px-4 py-3">
                                                {roleLabel(
                                                    usuario.role
                                                )}
                                            </td>

                                            <td className="px-4 py-3">

                                                <span
                                                    className={
                                                        usuario.status ===
                                                        "Activo"
                                                            ? "text-sg-green"
                                                            : "text-sg-red"
                                                    }
                                                >
                                                    ●{" "}
                                                    {
                                                        usuario.status
                                                    }
                                                </span>

                                            </td>

                                            <td className="px-4 py-3">
                                                {
                                                    usuario.lastAccess
                                                }
                                            </td>

                                            <td className="px-4 py-3">
                                                {
                                                    usuario.createdAt
                                                }
                                            </td>

                                            <td className="px-4 py-3">

                                                <button
                                                    onClick={() =>
                                                        abrirEditar(
                                                            usuario
                                                        )
                                                    }
                                                    className="mr-3 text-sg-cyan"
                                                >
                                                    <Edit3
                                                        size={15}
                                                    />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        borrar(
                                                            usuario
                                                        )
                                                    }
                                                    className="text-sg-red"
                                                >
                                                    <Trash2
                                                        size={15}
                                                    />
                                                </button>

                                            </td>

                                        </tr>
                                    )
                                )}

                        </tbody>

                    </table>

                </div>

            </Card>


            <div className="mt-4 grid gap-3 sm:grid-cols-3">

                <div className="glass rounded-xl p-4">

                    <UsersIcon
                        className="text-sg-cyan"
                    />

                    <p className="mt-2 text-2xl font-bold">
                        {users.length}
                    </p>

                    <p className="text-xs text-sg-muted">
                        Usuarios registrados
                    </p>

                </div>


                <div className="glass rounded-xl p-4">

                    <p className="text-2xl font-bold">
                        {supervisores}
                    </p>

                    <p className="text-xs text-sg-muted">
                        Supervisores
                    </p>

                </div>


                <div className="glass rounded-xl p-4">

                    <p className="text-2xl font-bold">
                        {usuariosFinales}
                    </p>

                    <p className="text-xs text-sg-muted">
                        Usuarios finales
                    </p>

                </div>

            </div>


            <Modal
                open={open}
                onClose={() =>
                    setOpen(false)
                }
                title={
                    editing
                        ? "Editar usuario"
                        : "Nuevo usuario"
                }
            >

                <form
                    onSubmit={guardar}
                    className="space-y-3"
                >

                    <Input
                        label="Usuario"
                        value={
                            form.username
                        }
                        onChange={e =>
                            cambiarCampo(
                                "username",
                                e.target.value
                            )
                        }
                        required
                    />


                    <Input
                        label="Email"
                        value={
                            form.email
                        }
                        onChange={e =>
                            cambiarCampo(
                                "email",
                                e.target.value
                            )
                        }
                        type="email"
                        required
                    />


                    <Input
                        label="Contraseña"
                        value={
                            form.password
                        }
                        onChange={e =>
                            cambiarCampo(
                                "password",
                                e.target.value
                            )
                        }
                        type="password"
                        required={!editing}
                    />


                    <label className="block text-xs text-sg-muted">

                        Rol

                        <select
                            value={
                                form.role
                            }
                            onChange={e =>
                                cambiarCampo(
                                    "role",
                                    e.target.value
                                )
                            }
                            className="mt-1 w-full rounded-lg border border-sg-line bg-[#04142f] p-2.5 text-white"
                        >

                            <option value="user">
                                Usuario
                            </option>

                            <option value="supervisor">
                                Supervisor
                            </option>

                            <option value="admin">
                                Administrador
                            </option>

                        </select>

                    </label>


                    <Button className="w-full">
                        Guardar usuario
                    </Button>

                </form>

            </Modal>

        </DashboardLayout>
    );
}