import React, { useState } from "react";
import { router } from "@inertiajs/react";
import {
    Lock,
    Unlock,
    Wallet,
    AlertTriangle,
    CheckCircle2,
    History,
    X,
    ArrowRight,
} from "lucide-react";

export default function ShiftModal({
    isOpen,
    onClose,
    activeShift,
    shiftStats,
    shiftHistory = [],
}) {
    const [tab, setTab] = useState(activeShift ? "close" : "open"); // open | close | history
    const [openingCash, setOpeningCash] = useState("");
    const [actualCash, setActualCash] = useState("");
    const [notes, setNotes] = useState("");

    if (!isOpen) return null;

    const expectedCash = Number(shiftStats?.expected_cash || 0);
    const actualCashNum = Number(actualCash || 0);
    const difference = actualCash !== "" ? actualCashNum - expectedCash : 0;

    // 1. Submit Buka Shift Baru
    const handleOpenShift = (e) => {
        e.preventDefault();
        router.post(
            route("pos.shift.open"),
            {
                opening_cash: openingCash,
                notes,
            },
            {
                onSuccess: () => {
                    setOpeningCash("");
                    setNotes("");
                    onClose();
                },
            },
        );
    };

    // 2. Submit Tutup Shift & Rekap Selisih
    const handleCloseShift = (e) => {
        e.preventDefault();
        router.post(
            route("pos.shift.close"),
            {
                actual_cash: actualCash,
                notes,
            },
            {
                onSuccess: () => {
                    setActualCash("");
                    setNotes("");
                    onClose();
                },
            },
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
                {/* Header Modal */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">
                                Manajemen Shift Kasir & Petty Cash
                            </h2>
                            <p className="text-xs text-slate-400">
                                Kontrol Modal Awal Laci, Rekonsiliasi Tunai &
                                Audit Selisih
                            </p>
                        </div>
                    </div>

                    {activeShift && (
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Navigasi Tab di Dalam Modal */}
                <div className="flex gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
                    {!activeShift ? (
                        <button
                            type="button"
                            onClick={() => setTab("open")}
                            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 ${
                                tab === "open"
                                    ? "bg-emerald-500 text-slate-950"
                                    : "bg-slate-800 text-slate-300"
                            }`}
                        >
                            <Unlock className="w-4 h-4" /> Buka Shift Kasir Baru
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setTab("close")}
                            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 ${
                                tab === "close"
                                    ? "bg-amber-500 text-slate-950"
                                    : "bg-slate-800 text-slate-300"
                            }`}
                        >
                            <Lock className="w-4 h-4" /> Tutup Shift & Hitung
                            Uang Laci
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setTab("history")}
                        className={`px-4 py-2 rounded-xl flex items-center gap-1.5 ${
                            tab === "history"
                                ? "bg-indigo-500 text-white"
                                : "bg-slate-800 text-slate-300"
                        }`}
                    >
                        <History className="w-4 h-4" /> Riwayat Audit Shift (
                        {shiftHistory.length})
                    </button>
                </div>

                {/* ================= TAB 1: BUKA SHIFT BARU ================= */}
                {tab === "open" && !activeShift && (
                    <form onSubmit={handleOpenShift} className="space-y-4">
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed">
                            ⚠️ <strong>Perhatian Kasir:</strong> Anda wajib
                            membuka shift dan memasukkan jumlah uang kembalian
                            (Modal Awal / Petty Cash) yang ada di laci sebelum
                            dapat memproses transaksi pesanan.
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-300">
                                Modal Awal Uang Tunai di Laci (Rp) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                placeholder="Contoh: 200000"
                                value={openingCash}
                                onChange={(e) => setOpeningCash(e.target.value)}
                                className="w-full mt-1.5 rounded-xl bg-slate-950 border-slate-700 text-lg font-extrabold text-emerald-400"
                            />
                        </div>

                        {/* Pintasan Nominal Modal Awal */}
                        <div className="flex flex-wrap gap-2">
                            {[100000, 200000, 300000, 500000].map((nom) => (
                                <button
                                    key={nom}
                                    type="button"
                                    onClick={() => setOpeningCash(nom)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/40 text-xs font-mono text-emerald-300"
                                >
                                    Rp {nom.toLocaleString("id-ID")}
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="text-xs text-slate-400">
                                Catatan Buka Shift (Opsional)
                            </label>
                            <input
                                type="text"
                                placeholder="Misal: Pecahan Rp 5.000 dan Rp 10.000 lengkap"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full mt-1 rounded-xl bg-slate-950 border-slate-800 text-sm text-white"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                        >
                            <Unlock className="w-4 h-4" /> Buka Shift Kasir
                            Sekarang <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                )}

                {/* ================= TAB 2: TUTUP SHIFT & HITUNG SELISIH ================= */}
                {tab === "close" && activeShift && (
                    <form onSubmit={handleCloseShift} className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                                <span className="text-slate-400 block">
                                    Modal Awal Laci
                                </span>
                                <span className="text-sm font-bold text-white mt-1 block">
                                    Rp{" "}
                                    {Number(
                                        activeShift.opening_cash,
                                    ).toLocaleString("id-ID")}
                                </span>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                                <span className="text-slate-400 block">
                                    + Transaksi Tunai
                                </span>
                                <span className="text-sm font-bold text-emerald-400 mt-1 block">
                                    Rp{" "}
                                    {Number(
                                        shiftStats?.cash_sales || 0,
                                    ).toLocaleString("id-ID")}
                                </span>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                                <span className="text-slate-400 block">
                                    Transaksi QRIS/Online
                                </span>
                                <span className="text-sm font-bold text-cyan-400 mt-1 block">
                                    Rp{" "}
                                    {Number(
                                        shiftStats?.qris_sales || 0,
                                    ).toLocaleString("id-ID")}
                                </span>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40">
                                <span className="text-emerald-300 font-semibold block">
                                    Uang Seharusnya di Laci
                                </span>
                                <span className="text-base font-extrabold text-emerald-400 mt-1 block">
                                    Rp {expectedCash.toLocaleString("id-ID")}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-300">
                                Hitung & Masukkan Total Uang Fisik Aktual di
                                Laci Saat Ini (Rp) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                placeholder={`Seharusnya: ${expectedCash}`}
                                value={actualCash}
                                onChange={(e) => setActualCash(e.target.value)}
                                className="w-full mt-1.5 rounded-xl bg-slate-950 border-slate-700 text-lg font-extrabold text-amber-400"
                            />
                        </div>

                        {/* Indikator Otomatis Balance / Minus / Surplus */}
                        {actualCash !== "" && (
                            <div
                                className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                                    difference === 0
                                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300"
                                        : difference < 0
                                          ? "bg-red-500/15 border-red-500/50 text-red-300"
                                          : "bg-blue-500/15 border-blue-500/50 text-blue-300"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {difference === 0 ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5" />
                                    )}
                                    <span>
                                        {difference === 0
                                            ? "STATUS LACI: BALANCE (Uang Fisik Sesuai Sistem)"
                                            : difference < 0
                                              ? "STATUS LACI: MINUS / KURANG SETOR"
                                              : "STATUS LACI: SURPLUS / LEBIH"}
                                    </span>
                                </div>
                                <span className="text-sm font-extrabold font-mono">
                                    Selisih: {difference > 0 ? "+" : ""}Rp{" "}
                                    {difference.toLocaleString("id-ID")}
                                </span>
                            </div>
                        )}

                        <div>
                            <label className="text-xs text-slate-400">
                                Catatan Penutupan Shift / Keterangan Selisih
                            </label>
                            <input
                                type="text"
                                placeholder="Misal: Semua uang pecahan sesuai dan disetor ke brankas Owner"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full mt-1 rounded-xl bg-slate-950 border-slate-800 text-sm text-white"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2"
                        >
                            <Lock className="w-4 h-4" /> Konfirmasi Tutup Shift
                            & Simpan Laporan Laci
                        </button>
                    </form>
                )}

                {/* ================= TAB 3: RIWAYAT AUDIT SHIFT ================= */}
                {tab === "history" && (
                    <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                        {shiftHistory.length === 0 ? (
                            <p className="text-center text-xs text-slate-500 py-8">
                                Belum ada riwayat shift kasir yang tercatat.
                            </p>
                        ) : (
                            shiftHistory.map((sh) => (
                                <div
                                    key={sh.id}
                                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap justify-between items-center gap-3 text-xs"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-emerald-400">
                                                Kasir: {sh.user?.name || "Staf"}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 rounded uppercase text-[10px] font-bold ${
                                                    sh.status === "open"
                                                        ? "bg-emerald-500/20 text-emerald-300"
                                                        : "bg-slate-800 text-slate-300"
                                                }`}
                                            >
                                                {sh.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-[11px]">
                                            Modal: Rp{" "}
                                            {Number(
                                                sh.opening_cash,
                                            ).toLocaleString("id-ID")}{" "}
                                            • Tunai: Rp{" "}
                                            {Number(
                                                sh.total_cash_sales,
                                            ).toLocaleString("id-ID")}{" "}
                                            • QRIS: Rp{" "}
                                            {Number(
                                                sh.total_qris_sales,
                                            ).toLocaleString("id-ID")}
                                        </p>
                                        {sh.notes && (
                                            <p className="text-[11px] text-slate-500 italic">
                                                "{sh.notes}"
                                            </p>
                                        )}
                                    </div>

                                    {sh.status === "closed" && (
                                        <div className="text-right">
                                            <p className="font-bold">
                                                Fisik: Rp{" "}
                                                {Number(
                                                    sh.actual_cash,
                                                ).toLocaleString("id-ID")}
                                            </p>
                                            <span
                                                className={`text-[11px] font-mono font-bold ${
                                                    Number(sh.difference) === 0
                                                        ? "text-emerald-400"
                                                        : Number(
                                                                sh.difference,
                                                            ) < 0
                                                          ? "text-red-400"
                                                          : "text-amber-400"
                                                }`}
                                            >
                                                Selisih: Rp{" "}
                                                {Number(
                                                    sh.difference,
                                                ).toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
