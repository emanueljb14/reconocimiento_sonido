import {
    useMemo,
    useState,
} from "react";

import {
    Eye,
    Search,
    Filter,
    Download,
} from "lucide-react";

import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

import {
    useDetections,
} from "../../context/DetectionContext";


export default function DetectionTable({
    title = "Detecciones",
}) {
    const {
        detections,
        loading,
        refresh,
    } = useDetections();


    const [
        q,
        setQ,
    ] = useState("");

    const [
        risk,
        setRisk,
    ] = useState("TODOS");

    const [
        selected,
        setSelected,
    ] = useState(null);


    const rows =
        useMemo(() => {
            return detections.filter(
                (d) => {
                    const cumpleRiesgo =
                        risk === "TODOS" ||
                        d.risk === risk;

                    const texto =
                        `${d.type} ${d.time} ${d.date}`
                            .toLowerCase();

                    const cumpleBusqueda =
                        texto.includes(
                            q.toLowerCase()
                        );

                    return (
                        cumpleRiesgo &&
                        cumpleBusqueda
                    );
                }
            );
        }, [
            detections,
            q,
            risk,
        ]);


    function exportCsv() {
        const cabecera =
            "ID,Fecha,Hora,Sonido,Confianza,Riesgo,Duracion,Origen";

        const filas =
            rows.map((d) =>
                [
                    d.id,
                    d.date,
                    d.time,
                    d.type,
                    d.confidence,
                    d.risk,
                    d.duration,
                    d.origin,
                ].join(",")
            );


        const csv =
            [
                cabecera,
                ...filas,
            ].join("\n");


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8",
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const a =
            document.createElement(
                "a"
            );


        a.href = url;

        a.download =
            "soundguard-detecciones.csv";

        a.click();


        URL.revokeObjectURL(
            url
        );
    }


    return (
        <Card
            title={title}
            action={
                <div className="flex gap-2">

                    <Button
                        variant="ghost"
                        onClick={refresh}
                    >
                        Actualizar
                    </Button>


                    <Button
                        variant="ghost"
                        onClick={exportCsv}
                    >
                        <Download
                            size={14}
                            className="mr-1 inline"
                        />

                        Exportar
                    </Button>

                </div>
            }
        >

            <div className="flex flex-wrap gap-2 border-b border-sg-line p-3">

                <div className="relative flex-1">

                    <Search
                        size={15}
                        className="absolute left-3 top-2.5 text-sg-muted"
                    />


                    <input
                        value={q}
                        onChange={(e) =>
                            setQ(
                                e.target.value
                            )
                        }
                        placeholder="Buscar detección..."
                        className="w-full rounded-lg border border-sg-line bg-[#04142f] py-2 pl-9 pr-3 text-xs outline-none focus:border-sg-cyan"
                    />

                </div>


                <div className="flex items-center gap-1 rounded-lg border border-sg-line bg-[#04142f] px-2">

                    <Filter
                        size={14}
                        className="text-sg-muted"
                    />


                    <select
                        value={risk}
                        onChange={(e) =>
                            setRisk(
                                e.target.value
                            )
                        }
                        className="bg-transparent py-2 text-xs outline-none"
                    >
                        <option>
                            TODOS
                        </option>

                        <option>
                            CRITICO
                        </option>

                        <option>
                            ALTO
                        </option>

                        <option>
                            MEDIO
                        </option>

                        <option>
                            BAJO
                        </option>

                    </select>

                </div>

            </div>


            {loading ? (
                <p className="p-4 text-xs text-sg-muted">
                    Cargando detecciones...
                </p>
            ) : (
                <div className="overflow-x-auto">

                    <table className="w-full min-w-[780px] text-left text-xs">

                        <thead className="bg-white/[.02] text-[10px] text-sg-muted">

                            <tr>
                                <th className="px-4 py-3">
                                    ID
                                </th>

                                <th>
                                    Fecha
                                </th>

                                <th>
                                    Hora
                                </th>

                                <th>
                                    Sonido
                                </th>

                                <th>
                                    Confianza
                                </th>

                                <th>
                                    Riesgo
                                </th>

                                <th>
                                    Duración
                                </th>

                                <th>
                                    Origen
                                </th>

                                <th>
                                    Acciones
                                </th>
                            </tr>

                        </thead>


                        <tbody>

                            {rows
                                .slice(0, 30)
                                .map((d) => (

                                    <tr
                                        className="border-t border-sg-line/60"
                                        key={d.id}
                                    >

                                        <td className="px-4 py-3 text-sg-muted">
                                            #{d.id}
                                        </td>

                                        <td>
                                            {d.date}
                                        </td>

                                        <td>
                                            {d.time}
                                        </td>

                                        <td className="font-medium">
                                            {d.type}
                                        </td>

                                        <td>
                                            {d.confidence}%
                                        </td>

                                        <td>
                                            <Badge risk={d.risk}>
                                                {d.risk}
                                            </Badge>
                                        </td>

                                        <td>
                                            {d.duration}s
                                        </td>

                                        <td className="capitalize">
                                            {d.origin}
                                        </td>

                                        <td>

                                            <button
                                                onClick={() =>
                                                    setSelected(d)
                                                }
                                                className="rounded p-1.5 text-sg-cyan hover:bg-sg-cyan/10"
                                            >
                                                <Eye size={15} />
                                            </button>

                                        </td>

                                    </tr>
                                ))}

                        </tbody>

                    </table>

                </div>
            )}


            <Modal
                open={Boolean(selected)}
                onClose={() =>
                    setSelected(null)
                }
                title="Detalle de detección"
            >

                {selected && (
                    <div className="space-y-3 text-sm">

                        <div className="grid grid-cols-2 gap-3">

                            {[
                                [
                                    "Sonido",
                                    selected.type,
                                ],
                                [
                                    "Confianza",
                                    `${selected.confidence}%`,
                                ],
                                [
                                    "Riesgo",
                                    selected.risk,
                                ],
                                [
                                    "Hora",
                                    selected.time,
                                ],
                                [
                                    "Fecha",
                                    selected.date,
                                ],
                                [
                                    "Duración",
                                    `${selected.duration}s`,
                                ],
                                [
                                    "Origen",
                                    selected.origin,
                                ],
                            ].map(
                                ([titulo, valor]) => (

                                    <div
                                        className="rounded-lg border border-sg-line bg-[#04142f] p-3"
                                        key={titulo}
                                    >

                                        <p className="text-[10px] text-sg-muted">
                                            {titulo}
                                        </p>

                                        <p className="mt-1 font-semibold">
                                            {valor}
                                        </p>

                                    </div>

                                )
                            )}

                        </div>

                    </div>
                )}

            </Modal>

        </Card>
    );
}