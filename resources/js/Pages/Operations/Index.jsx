import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    Wrench,
    CalendarDays,
    Cpu,
    CheckCircle2,
    AlertTriangle,
    Plus,
    Save,
    RotateCcw,
    Coffee,
} from "lucide-react";

export default function OperationsIndex({
    equipments = [],
    totalCupsBrewed = 0,
    staffs = [],
    days = [],
    weeklyRoster = {},
    templates = [],
    tables = [],
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";

    const [activeTab, setActiveTab] = useState("machines"); // machines | roster
    const [rosterState, setRosterState] = useState(weeklyRoster);

    const [eqForm, setEqForm] = useState({
        name: "",
        category: "Mesin Espresso & Grinder",
        max_shots_limit: 500,
    });

    const [serviceModalEq, setServiceModalEq] = useState(null);
    const [serviceCost, setServiceCost] = useState(150000);
    const [serviceNotes, setServiceNotes] = useState(
        "Backflush cleaning, penggantian karet grouphead & kalibrasi",
    );

    const cardClass = isBrutal
        ? "bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        : isWood
          ? "bg-white border border-amber-200 text-stone-800 shadow-sm"
          : "bg-slate-900 border border-slate-800 text-slate-100";

    const inputClass = isBrutal
        ? "rounded-xl bg-yellow-100 border-2 border-black text-black font-bold text-xs"
        : isWood
          ? "rounded-xl bg-amber-50/50 border-stone-300 text-stone-800 text-xs"
          : "rounded-xl bg-slate-950 border-slate-800 text-white text-xs";

    const handleAddEquipment = (e) => {
        e.preventDefault();
        router.post(route("operations.equipments.store"), eqForm, {
            onSuccess: () =>
                setEqForm({
                    name: "",
                    category: "Mesin Espresso & Grinder",
                    max_shots_limit: 500,
                }),
        });
    };

    const handleConfirmMaintenance = (e) => {
        e.preventDefault();
        if (!serviceModalEq) return;
        router.post(
            route("operations.equipments.service"),
            {
                equipment_id: serviceModalEq.id,
                service_cost: serviceCost,
                notes: serviceNotes,
            },
            {
                onSuccess: () => setServiceModalEq(null),
            },
        );
    };

    const handleRosterChange = (staffId, day, shiftVal) => {
        setRosterState((prev) => ({
            ...prev,
            [staffId]: {
                ...(prev[staffId] || {}),
                [day]: shiftVal,
            },
        }));
    };

    const handleSaveRoster = () => {
        router.post(route("operations.roster.save"), { roster: rosterState });
    };

    const shiftOptions = [
        "PAGI (08:00 - 16:00)",
        "SORE (15:00 - 23:00)",
        "FULL / PEAK",
        "LIBUR (OFF)",
    ];

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Maintenance Mesin Kopi & Roster Shift - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Navigasi Tab */}
                <div className="flex flex-wrap justify-between items-center gap-4 border-b border-current/10 pb-4">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setActiveTab("machines")}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition ${
                                activeTab === "machines"
                                    ? "bg-emerald-500 text-slate-950 shadow-lg"
                                    : "bg-black/20 hover:bg-black/30"
                            }`}
                        >
                            <Wrench className="w-4 h-4" /> 1. MONITORING MESIN
                            KOPI & KALIBRASI ASET ({equipments.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("roster")}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition ${
                                activeTab === "roster"
                                    ? "bg-emerald-500 text-slate-950 shadow-lg"
                                    : "bg-black/20 hover:bg-black/30"
                            }`}
                        >
                            <CalendarDays className="w-4 h-4" /> 2. JADWAL SHIFT
                            ROSTER MINGGUAN STAF ({staffs.length})
                        </button>
                    </div>

                    <span className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-1.5">
                        <Coffee className="w-4 h-4" /> Total Cup Diseduh Mesin:{" "}
                        {totalCupsBrewed} Cup
                    </span>
                </div>

                {/* ================= TAB 1: MONITORING MESIN KOPI & MAINTENANCE ================= */}
                {activeTab === "machines" && (
                    <div className="grid grid-cols-12 gap-6">
                        <form
                            onSubmit={handleAddEquipment}
                            className={`col-span-12 lg:col-span-4 p-6 rounded-2xl space-y-4 h-fit ${cardClass}`}
                        >
                            <h2 className="font-extrabold text-base text-emerald-500 border-b border-current/10 pb-2 flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Registrasi Mesin /
                                Aset Barista
                            </h2>

                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Nama Mesin / Alat Kafe *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Victoria Arduino Eagle One"
                                    value={eqForm.name}
                                    onChange={(e) =>
                                        setEqForm({
                                            ...eqForm,
                                            name: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Kategori Aset
                                </label>
                                <select
                                    value={eqForm.category}
                                    onChange={(e) =>
                                        setEqForm({
                                            ...eqForm,
                                            category: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                >
                                    <option value="Mesin Utama Barista">
                                        Mesin Utama Barista
                                    </option>
                                    <option value="Grinder Biji Kopi">
                                        Grinder Biji Kopi
                                    </option>
                                    <option value="Pendingin & Ice Maker">
                                        Pendingin & Ice Maker
                                    </option>
                                    <option value="Water Filter & RO">
                                        Water Filter & RO
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Ambang Batas Servis / Backflush (Jumlah Cup)
                                    *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="50"
                                    value={eqForm.max_shots_limit}
                                    onChange={(e) =>
                                        setEqForm({
                                            ...eqForm,
                                            max_shots_limit: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 font-mono ${inputClass}`}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg"
                            >
                                + Tambahkan ke Telemetry Mesin
                            </button>
                        </form>

                        <div className="col-span-12 lg:col-span-8 space-y-4">
                            {equipments.map((eq) => (
                                <div
                                    key={eq.id}
                                    className={`p-5 rounded-2xl space-y-3 ${cardClass}`}
                                >
                                    <div className="flex flex-wrap justify-between items-start gap-3">
                                        <div>
                                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                                {eq.category}
                                            </span>
                                            <h3 className="font-black text-base mt-1">
                                                {eq.name}
                                            </h3>
                                            <p className="text-xs opacity-70">
                                                Servis & Kalibrasi Terakhir:{" "}
                                                <strong>
                                                    {eq.last_service}
                                                </strong>
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setServiceModalEq(eq)
                                            }
                                            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />{" "}
                                            Catat Servis / Reset Counter
                                        </button>
                                    </div>

                                    {/* Bar Indikator Beban Pakai Mesin (Shot Counter) */}
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span>
                                                Beban Pakai Sejak Servis:{" "}
                                                {eq.used_shots} /{" "}
                                                {eq.max_shots_limit} Cup
                                            </span>
                                            <span
                                                className={
                                                    eq.needs_maintenance
                                                        ? "text-rose-400 font-black"
                                                        : "text-emerald-400 font-black"
                                                }
                                            >
                                                {eq.usage_percent}% (
                                                {eq.needs_maintenance
                                                    ? "WAJIB KALIBRASI / CLEANING"
                                                    : "KONDISI PRIMA"}
                                                )
                                            </span>
                                        </div>
                                        <div className="w-full h-3 rounded-full bg-black/30 overflow-hidden p-0.5">
                                            <div
                                                style={{
                                                    width: `${Math.max(6, eq.usage_percent)}%`,
                                                }}
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    eq.needs_maintenance
                                                        ? "bg-gradient-to-r from-amber-500 to-rose-500"
                                                        : "bg-gradient-to-r from-emerald-500 to-teal-400"
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ================= TAB 2: JADWAL SHIFT ROSTER MINGGUAN STAF ================= */}
                {activeTab === "roster" && (
                    <div className={`p-6 rounded-2xl space-y-4 ${cardClass}`}>
                        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-current/10 pb-3">
                            <div>
                                <h2 className="font-extrabold text-base">
                                    Tabel Jadwal Shift Kerja Mingguan (Senin –
                                    Minggu)
                                </h2>
                                <p className="text-xs opacity-70">
                                    Atur pembagian jam kerja Pagi, Sore, Peak
                                    Hour, atau Libur untuk seluruh personel
                                    kafe.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleSaveRoster}
                                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg"
                            >
                                <Save className="w-4 h-4" /> Simpan Jadwal
                                Roster Mingguan
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="uppercase opacity-65 border-b border-current/10">
                                    <tr>
                                        <th className="py-3 pr-4">
                                            Personel & Role
                                        </th>
                                        {days.map((d) => (
                                            <th
                                                key={d}
                                                className="py-3 px-1.5 text-center"
                                            >
                                                {d}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-current/10">
                                    {staffs.map((st) => (
                                        <tr key={st.id}>
                                            <td className="py-3 pr-4">
                                                <p className="font-black text-sm">
                                                    {st.name}
                                                </p>
                                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black uppercase text-[9px]">
                                                    {st.role}
                                                </span>
                                            </td>
                                            {days.map((day) => {
                                                const val =
                                                    rosterState[st.id]?.[day] ||
                                                    "PAGI (08:00 - 16:00)";
                                                const isOff =
                                                    val.includes("LIBUR");
                                                return (
                                                    <td
                                                        key={day}
                                                        className="py-2.5 px-1"
                                                    >
                                                        <select
                                                            value={val}
                                                            onChange={(e) =>
                                                                handleRosterChange(
                                                                    st.id,
                                                                    day,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={`w-full rounded-xl text-[10px] font-bold py-1.5 px-2 border ${
                                                                isOff
                                                                    ? "bg-rose-500/15 border-rose-500/40 text-rose-300"
                                                                    : "bg-slate-950 border-slate-800 text-emerald-300"
                                                            }`}
                                                        >
                                                            {shiftOptions.map(
                                                                (opt) => (
                                                                    <option
                                                                        key={
                                                                            opt
                                                                        }
                                                                        value={
                                                                            opt
                                                                        }
                                                                    >
                                                                        {opt}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Catat Servis & Biaya Perawatan Mesin */}
            {serviceModalEq && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <form
                        onSubmit={handleConfirmMaintenance}
                        className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
                    >
                        <h3 className="text-base font-black text-emerald-400">
                            🔧 Catat Maintenance: {serviceModalEq.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                            Counter beban mesin akan di-reset kembali ke 0% dan
                            biaya perawatan otomatis dicatat ke Pengeluaran
                            Keuangan (/finance).
                        </p>

                        <div>
                            <label className="text-xs font-bold text-slate-300">
                                Biaya Servis / Suku Cadang (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                required
                                value={serviceCost}
                                onChange={(e) => setServiceCost(e.target.value)}
                                className="w-full mt-1 rounded-xl bg-slate-950 border-slate-800 text-sm font-mono text-amber-400"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-300">
                                Tindakan Perawatan yang Dilakukan
                            </label>
                            <input
                                type="text"
                                required
                                value={serviceNotes}
                                onChange={(e) =>
                                    setServiceNotes(e.target.value)
                                }
                                className="w-full mt-1 rounded-xl bg-slate-950 border-slate-800 text-xs text-white"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs"
                            >
                                Simpan & Reset Counter Mesin
                            </button>
                            <button
                                type="button"
                                onClick={() => setServiceModalEq(null)}
                                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </CaffeOSLayout>
    );
}
