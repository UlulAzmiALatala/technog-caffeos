import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    ShieldAlert,
    Banknote,
    Printer,
    CheckCircle2,
    Eye,
    AlertTriangle,
    Activity,
    Lock,
    Users,
    Sparkles,
    X,
} from "lucide-react";

export default function GovernanceIndex({
    staffPayrolls = [],
    cctvLogs = [],
    templates = [],
    tables = [],
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";

    const [activeTab, setActiveTab] = useState("payroll"); // payroll | cctv
    const [cctvFilter, setCctvFilter] = useState("ALL");
    const [selectedPayslip, setSelectedPayslip] = useState(null);

    const cardClass = isBrutal
        ? "bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        : isWood
          ? "bg-white border border-amber-200 text-stone-800 shadow-sm"
          : "bg-slate-900 border border-slate-800 text-slate-100";

    const totalPayrollBudget = staffPayrolls.reduce(
        (sum, s) => sum + Number(s.take_home_pay),
        0,
    );
    const securityAlertsCount = cctvLogs.filter(
        (l) => l.severity === "danger" || l.severity === "warning",
    ).length;

    const filteredLogs = cctvLogs.filter(
        (log) => cctvFilter === "ALL" || log.category === cctvFilter,
    );

    const handleDisburseSalary = (staff) => {
        router.post(route("governance.pay-salary"), {
            staff_id: staff.id,
            amount: staff.take_home_pay,
            period_label: staff.period_label,
        });
    };

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Payroll Biometrik & Audit Trail (CCTV) - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* 3 Kartu Indikator Tata Kelola & Keamanan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Total Estimasi Payroll Bulan Ini</span>
                            <Banknote className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-black text-emerald-500 mt-2">
                            Rp {totalPayrollBudget.toLocaleString("id-ID")}
                        </p>
                        <p className="text-[11px] opacity-65 mt-1">
                            Otomatis dihitung dari Absensi Wajah & Komisi Order
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Total Staf Terdaftar</span>
                            <Users className="w-4 h-4 text-cyan-400" />
                        </div>
                        <p className="text-2xl font-black text-cyan-400 mt-2">
                            {staffPayrolls.length} Personel Aktif
                        </p>
                        <p className="text-[11px] opacity-65 mt-1">
                            Owner, Cashier & Barista
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Deteksi Anomali / Void di CCTV</span>
                            <ShieldAlert className="w-4 h-4 text-rose-500" />
                        </div>
                        <p className="text-2xl font-black text-rose-500 mt-2">
                            {securityAlertsCount} Peringatan Audit
                        </p>
                        <p className="text-[11px] opacity-65 mt-1">
                            Void struk, selisih laci kasir, atau waste gudang
                        </p>
                    </div>
                </div>

                {/* Navigasi Tab: Payroll Slip Gaji vs Audit Trail (CCTV) */}
                <div className="flex flex-wrap gap-3 border-b border-current/10 pb-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab("payroll")}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition ${
                            activeTab === "payroll"
                                ? "bg-emerald-500 text-slate-950 shadow-lg"
                                : "bg-slate-800/40 text-current opacity-80 hover:opacity-100"
                        }`}
                    >
                        <Banknote className="w-4 h-4" /> 1. AUTOMASI PAYROLL &
                        SLIP GAJI BIOMETRIK
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("cctv")}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition ${
                            activeTab === "cctv"
                                ? "bg-emerald-500 text-slate-950 shadow-lg"
                                : "bg-slate-800/40 text-current opacity-80 hover:opacity-100"
                        }`}
                    >
                        <ShieldAlert className="w-4 h-4" /> 2. AUDIT TRAIL (CCTV
                        REKAM JEJAK SISTEM) ({cctvLogs.length})
                    </button>
                </div>

                {/* ================= TAB 1: AUTOMASI PAYROLL & SLIP GAJI ================= */}
                {activeTab === "payroll" && (
                    <div className={`p-6 rounded-2xl space-y-4 ${cardClass}`}>
                        <div className="flex flex-wrap justify-between items-center gap-2 border-b border-current/10 pb-3">
                            <div>
                                <h2 className="font-extrabold text-base">
                                    Daftar Perhitungan Gaji Pokok, Tunjangan
                                    Absensi Wajah & Komisi Transaksi
                                </h2>
                                <p className="text-xs opacity-70">
                                    Setiap pencairan gaji otomatis tercatat
                                    sebagai pengeluaran di halaman Ledger
                                    Keuangan (/finance).
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="uppercase opacity-60 border-b border-current/10">
                                    <tr>
                                        <th className="py-3">
                                            Nama Staf & Role
                                        </th>
                                        <th className="py-3">Gaji Pokok</th>
                                        <th className="py-3">
                                            Tunjangan Wajah/GPS
                                        </th>
                                        <th className="py-3">
                                            Bonus Transaksi POS
                                        </th>
                                        <th className="py-3">
                                            Take Home Pay (THP)
                                        </th>
                                        <th className="py-3 text-right">
                                            Aksi Slip & Pencairan
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-current/10">
                                    {staffPayrolls.map((st) => (
                                        <tr key={st.id}>
                                            <td className="py-3.5">
                                                <p className="font-extrabold text-sm">
                                                    {st.name}
                                                </p>
                                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black uppercase text-[10px]">
                                                    {st.role}
                                                </span>
                                            </td>
                                            <td className="py-3.5 font-mono">
                                                Rp{" "}
                                                {Number(
                                                    st.base_salary,
                                                ).toLocaleString("id-ID")}
                                            </td>
                                            <td className="py-3.5">
                                                <span className="font-bold text-cyan-400 block">
                                                    +Rp{" "}
                                                    {Number(
                                                        st.attendance_allowance,
                                                    ).toLocaleString("id-ID")}
                                                </span>
                                                <span className="text-[10px] opacity-65">
                                                    ({st.present_days} Hari
                                                    Hadir Biometrik)
                                                </span>
                                            </td>
                                            <td className="py-3.5">
                                                <span className="font-bold text-purple-400 block">
                                                    +Rp{" "}
                                                    {Number(
                                                        st.transaction_bonus,
                                                    ).toLocaleString("id-ID")}
                                                </span>
                                                <span className="text-[10px] opacity-65">
                                                    ({st.orders_handled} Order
                                                    Ditangani)
                                                </span>
                                            </td>
                                            <td className="py-3.5 font-extrabold text-sm text-emerald-500">
                                                Rp{" "}
                                                {Number(
                                                    st.take_home_pay,
                                                ).toLocaleString("id-ID")}
                                            </td>
                                            <td className="py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedPayslip(
                                                                st,
                                                            )
                                                        }
                                                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1 transition"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />{" "}
                                                        Slip Gaji
                                                    </button>

                                                    {st.already_paid ? (
                                                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black flex items-center gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                                            Lunas (
                                                            {st.period_label})
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDisburseSalary(
                                                                    st,
                                                                )
                                                            }
                                                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center gap-1 transition shadow"
                                                        >
                                                            💸 Cairkan Gaji
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ================= TAB 2: AUDIT TRAIL (CCTV REKAM JEJAK SISTEM) ================= */}
                {activeTab === "cctv" && (
                    <div className={`p-6 rounded-2xl space-y-5 ${cardClass}`}>
                        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-current/10 pb-4">
                            <div>
                                <h2 className="font-extrabold text-base flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-emerald-500" />{" "}
                                    Audit Trail (CCTV Rekam Jejak Aktivitas
                                    Real-Time)
                                </h2>
                                <p className="text-xs opacity-70">
                                    Memantau seluruh aktivitas transaksi, Void
                                    struk, rekonsiliasi laci shift, mutasi stok,
                                    dan absensi biometrik.
                                </p>
                            </div>

                            {/* Filter Kategori CCTV */}
                            <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                                {[
                                    { id: "ALL", label: "Semua Log" },
                                    {
                                        id: "SECURITY_VOID",
                                        label: "🚨 Void / Batal",
                                    },
                                    {
                                        id: "CASH_DRAWER",
                                        label: "💵 Laci Shift",
                                    },
                                    {
                                        id: "BIOMETRIC_AUTH",
                                        label: "👤 Biometrik Wajah",
                                    },
                                    {
                                        id: "INVENTORY",
                                        label: "📦 Gudang & Waste",
                                    },
                                ].map((f) => (
                                    <button
                                        key={f.id}
                                        type="button"
                                        onClick={() => setCctvFilter(f.id)}
                                        className={`px-3 py-1.5 rounded-xl transition ${
                                            cctvFilter === f.id
                                                ? "bg-emerald-500 text-slate-950 font-black"
                                                : "bg-black/20 hover:bg-black/30"
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                            {filteredLogs.map((log) => {
                                const badgeColors = {
                                    danger: "bg-rose-500/20 border-rose-500/50 text-rose-400",
                                    warning:
                                        "bg-amber-500/20 border-amber-500/50 text-amber-300",
                                    success:
                                        "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
                                    info: "bg-indigo-500/20 border-indigo-500/50 text-indigo-300",
                                };

                                return (
                                    <div
                                        key={log.id}
                                        className="p-4 rounded-2xl bg-black/15 border border-current/10 flex flex-wrap justify-between items-center gap-4 text-xs"
                                    >
                                        <div className="flex items-start gap-3.5">
                                            <div
                                                className={`px-2.5 py-1 rounded-lg border font-mono font-black text-[10px] uppercase shrink-0 mt-0.5 ${
                                                    badgeColors[log.severity] ||
                                                    badgeColors.info
                                                }`}
                                            >
                                                {log.category.replace("_", " ")}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-extrabold text-sm">
                                                    {log.title}
                                                </p>
                                                <p className="opacity-80 leading-relaxed">
                                                    {log.description}
                                                </p>
                                                <p className="text-[11px] opacity-60">
                                                    Eksekutor:{" "}
                                                    <strong>{log.actor}</strong>{" "}
                                                    ({log.role.toUpperCase()})
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right font-mono text-[11px] opacity-75 shrink-0">
                                            {new Date(
                                                log.timestamp,
                                            ).toLocaleString("id-ID")}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL PREVIEW & CETAK SLIP GAJI RESMI (PRINTABLE PAYSLIP) */}
            {selectedPayslip && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white text-slate-950 rounded-3xl max-w-md w-full p-7 shadow-2xl space-y-5 font-sans">
                        <div className="flex justify-between items-center border-b pb-3 print:hidden">
                            <span className="font-black text-xs uppercase tracking-wider text-emerald-700">
                                Dokumen Slip Gaji Resmi (Official Payslip)
                            </span>
                            <button
                                onClick={() => setSelectedPayslip(null)}
                                className="p-1 rounded-lg hover:bg-slate-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="text-center border-b-2 border-slate-900 pb-4">
                            <h2 className="text-xl font-black uppercase">
                                {auth.cafe?.name || "TechnoG CaffeOS"}
                            </h2>
                            <p className="text-xs text-slate-500">
                                SLIP GAJI & INSENTIF KINERJA KARYAWAN
                            </p>
                            <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-slate-900 text-white text-xs font-bold">
                                Periode: {selectedPayslip.period_label}
                            </span>
                        </div>

                        <div className="space-y-1.5 text-xs border-b pb-4">
                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Nama Karyawan:
                                </span>
                                <span className="font-extrabold">
                                    {selectedPayslip.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Jabatan / Otoritas:
                                </span>
                                <span className="font-bold uppercase">
                                    {selectedPayslip.role}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Kehadiran Biometrik Wajah:
                                </span>
                                <span className="font-bold">
                                    {selectedPayslip.present_days} Hari Kerja
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">
                                    Total Order POS Ditangani:
                                </span>
                                <span className="font-bold">
                                    {selectedPayslip.orders_handled} Transaksi
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs border-b pb-4">
                            <div className="flex justify-between">
                                <span>1. Gaji Pokok Bulanan</span>
                                <span className="font-mono font-bold">
                                    Rp{" "}
                                    {Number(
                                        selectedPayslip.base_salary,
                                    ).toLocaleString("id-ID")}
                                </span>
                            </div>
                            <div className="flex justify-between text-emerald-700">
                                <span>
                                    2. Tunjangan Kehadiran Biometrik (
                                    {selectedPayslip.present_days}x)
                                </span>
                                <span className="font-mono font-bold">
                                    +Rp{" "}
                                    {Number(
                                        selectedPayslip.attendance_allowance,
                                    ).toLocaleString("id-ID")}
                                </span>
                            </div>
                            <div className="flex justify-between text-purple-700">
                                <span>
                                    3. Bonus Komisi Layanan POS (
                                    {selectedPayslip.orders_handled}x)
                                </span>
                                <span className="font-mono font-bold">
                                    +Rp{" "}
                                    {Number(
                                        selectedPayslip.transaction_bonus,
                                    ).toLocaleString("id-ID")}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-base font-black bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                            <span>TOTAL DITERIMA (THP)</span>
                            <span className="text-emerald-700">
                                Rp{" "}
                                {Number(
                                    selectedPayslip.take_home_pay,
                                ).toLocaleString("id-ID")}
                            </span>
                        </div>

                        <div className="flex gap-2 pt-2 print:hidden">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2"
                            >
                                <Printer className="w-4 h-4" /> Cetak Slip Gaji
                                (PDF / Print)
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedPayslip(null)}
                                className="px-4 py-3 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CaffeOSLayout>
    );
}
