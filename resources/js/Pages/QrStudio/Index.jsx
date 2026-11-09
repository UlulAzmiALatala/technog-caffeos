import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    QrCode,
    Printer,
    RefreshCw,
    ExternalLink,
    Wifi,
    Bot,
    Plus,
    CheckCircle2,
} from "lucide-react";

export default function QrStudioIndex({
    cafe,
    tables = [],
    templates = [],
    baseUrl = "http://127.0.0.1:8000",
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";

    const [cardStyle, setCardStyle] = useState("emerald-dark"); // emerald-dark | warm-gold | white-minimal
    const [tagline, setTagline] = useState(
        "Scan untuk Pesan Kopi, Buka Sandi WiFi & Akses AI Co-Worker",
    );
    const [newTableForm, setNewTableForm] = useState({
        table_number: "",
        location: "Indoor Co-Working",
    });
    const [printTargetId, setPrintTargetId] = useState("ALL"); // 'ALL' atau ID meja tertentu

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

    const handleAddTable = (e) => {
        e.preventDefault();
        router.post(route("management.tables.store"), newTableForm, {
            onSuccess: () =>
                setNewTableForm({
                    table_number: "",
                    location: "Indoor Co-Working",
                }),
        });
    };

    const handleRegenerateQr = (tableId) => {
        router.post(route("qr-studio.regenerate", tableId));
    };

    // Fungsi Cetak Semua Meja atau 1 Meja Spesifik secara Presisi
    const handlePrintCards = (target = "ALL") => {
        setPrintTargetId(target);
        setTimeout(() => {
            window.print();
            setPrintTargetId("ALL");
        }, 150);
    };

    const tentThemes = {
        "emerald-dark": "bg-slate-950 text-white border-2 border-emerald-500",
        "warm-gold": "bg-[#1C120C] text-amber-50 border-2 border-amber-400",
        "white-minimal": "bg-white text-slate-950 border-2 border-slate-900",
    };

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Studio Desain & Cetak Standee QR Meja - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6 print:p-0 print:max-w-none">
                {/* Panel Kontrol Desain (Otomatis Disembunyikan Saat Print Kertas A4) */}
                <div
                    className={`no-print print:hidden p-6 rounded-3xl space-y-5 ${cardClass}`}
                >
                    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-current/10 pb-4">
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                                <QrCode className="w-4 h-4" /> Acrylic Table
                                Tent & QR Standee Studio
                            </span>
                            <h1 className="text-2xl font-black mt-0.5">
                                Generator Kartu QR Code Meja Siap Cetak (
                                {tables.length} Meja)
                            </h1>
                            <p className="text-xs opacity-70 mt-0.5">
                                Mode cetak telah dioptimalkan: Sidebar & Header
                                otomatis disembunyikan saat mencetak ke A4/PDF.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => handlePrintCards("ALL")}
                            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition"
                        >
                            <Printer className="w-4 h-4" /> Cetak Semua Kartu QR
                            (Full A4 Tanpa Sidebar)
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                        <div className="lg:col-span-5 space-y-2 text-xs">
                            <label className="font-bold opacity-75 block">
                                Slogan Instruksi pada Kartu Meja:
                            </label>
                            <input
                                type="text"
                                value={tagline}
                                onChange={(e) => setTagline(e.target.value)}
                                className={`w-full ${inputClass}`}
                            />
                        </div>

                        <div className="lg:col-span-4 space-y-2 text-xs">
                            <label className="font-bold opacity-75 block">
                                Tema Warna Kartu Akrilik:
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    {
                                        id: "emerald-dark",
                                        label: "Cyber Emerald",
                                    },
                                    { id: "warm-gold", label: "Roastery Gold" },
                                    {
                                        id: "white-minimal",
                                        label: "Clean White",
                                    },
                                ].map((st) => (
                                    <button
                                        key={st.id}
                                        type="button"
                                        onClick={() => setCardStyle(st.id)}
                                        className={`py-2 px-2 rounded-xl font-black text-[11px] border ${
                                            cardStyle === st.id
                                                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                                                : "bg-black/20 border-current/15"
                                        }`}
                                    >
                                        {st.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form
                            onSubmit={handleAddTable}
                            className="lg:col-span-3 flex gap-2"
                        >
                            <input
                                type="text"
                                required
                                placeholder="No. Meja Baru (mis: 08)"
                                value={newTableForm.table_number}
                                onChange={(e) =>
                                    setNewTableForm({
                                        ...newTableForm,
                                        table_number: e.target.value,
                                    })
                                }
                                className={`flex-1 ${inputClass}`}
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-1 shrink-0"
                            >
                                <Plus className="w-4 h-4" /> Meja
                            </button>
                        </form>
                    </div>
                </div>

                {/* GRID KARTU STANDEE QR CODE MEJA (PRESISI 2 KOLOM DI KERTAS A4 & ANTI-TERPOTONG) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-5">
                    {tables
                        .filter(
                            (t) =>
                                printTargetId === "ALL" ||
                                printTargetId === t.id,
                        )
                        .map((t) => {
                            const scanUrl = `${baseUrl}/order/qr/${t.qr_code}`;
                            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(scanUrl)}`;

                            return (
                                <div
                                    key={t.id}
                                    style={{
                                        pageBreakInside: "avoid",
                                        breakInside: "avoid",
                                        WebkitPrintColorAdjust: "exact",
                                        printColorAdjust: "exact",
                                    }}
                                    className={`p-6 rounded-3xl flex flex-col items-center text-center justify-between space-y-4 shadow-2xl print:shadow-none ${tentThemes[cardStyle]}`}
                                >
                                    {/* Header Kartu Akrilik */}
                                    <div className="space-y-1 w-full border-b border-current/15 pb-3">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 block">
                                            SMART TABLE SELF-ORDER
                                        </span>
                                        <h2 className="text-xl font-black tracking-tight">
                                            {cafe?.name}
                                        </h2>
                                        <div className="inline-block px-4 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-sm mt-1">
                                            MEJA #{t.table_number} ({t.location}
                                            )
                                        </div>
                                    </div>

                                    {/* Gambar QR Code Asli */}
                                    <div className="p-3 rounded-2xl bg-white shadow-inner border border-slate-200">
                                        <img
                                            src={qrImageUrl}
                                            alt={`QR Meja ${t.table_number}`}
                                            className="w-44 h-44 object-contain mx-auto"
                                        />
                                    </div>

                                    {/* Panduan 3 Langkah Pelanggan */}
                                    <div className="space-y-2 w-full">
                                        <p className="text-xs font-bold leading-relaxed px-2">
                                            {tagline}
                                        </p>
                                        <div className="flex justify-center gap-2 text-[10px] font-black uppercase">
                                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                                                <Wifi className="w-3 h-3" />{" "}
                                                Free WiFi
                                            </span>
                                            <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                                                <Bot className="w-3 h-3" /> AI
                                                Co-Worker
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-mono opacity-60">
                                            {t.qr_code}
                                        </p>
                                    </div>

                                    {/* Tombol Aksi per Kartu (Disembunyikan Saat Dicetak Kertas) */}
                                    <div className="no-print print:hidden w-full pt-3 border-t border-current/15 flex gap-1.5">
                                        <a
                                            href={route(
                                                "customer.scan",
                                                t.qr_code,
                                            )}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1"
                                        >
                                            Tes Scan{" "}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handlePrintCards(t.id)
                                            }
                                            className="px-2.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] flex items-center gap-1"
                                            title="Cetak Hanya Meja Ini"
                                        >
                                            <Printer className="w-3.5 h-3.5" />{" "}
                                            Print 1
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRegenerateQr(t.id)
                                            }
                                            className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px]"
                                            title="Acak Ulang Kode QR Meja"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </CaffeOSLayout>
    );
}
