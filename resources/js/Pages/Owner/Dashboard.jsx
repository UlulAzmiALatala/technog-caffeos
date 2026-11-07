import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    TrendingUp,
    ShoppingBag,
    AlertOctagon,
    Download,
    Bot,
    Send,
    Sparkles,
    BarChart3,
    Award,
    Wallet,
} from "lucide-react";

export default function OwnerDashboard({
    metrics,
    revenueChart = [],
    topMenus = [],
    shiftAudits = [],
    recentOrders,
    templates,
    tables,
    ownerChatLogs,
}) {
    const { auth } = usePage().props;
    const [prompt, setPrompt] = useState("");
    const isWood = auth.activeTemplate === "minimalist-wood";

    const handleAskOwnerAi = (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        router.post(
            route("owner.ask-ai"),
            { prompt },
            { onSuccess: () => setPrompt("") },
        );
    };

    const cardClass = isWood
        ? "bg-white border border-amber-200 text-stone-800 shadow-sm"
        : "bg-slate-900/80 border border-slate-800 text-slate-100";

    const maxRevenue = Math.max(...revenueChart.map((d) => d.revenue), 1);
    const maxMenuQty = Math.max(...topMenus.map((m) => Number(m.total_qty)), 1);

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Owner Super Admin & AI - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header Monitoring & Tombol EXPORT */}
                <div
                    className={`p-6 rounded-2xl flex flex-wrap justify-between items-center gap-4 ${cardClass}`}
                >
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                            Super Admin Executive Lounge
                        </span>
                        <h1 className="text-2xl font-bold mt-0.5">
                            Monitoring Bisnis, Grafik Analitik & AI Co-Worker
                        </h1>
                    </div>

                    <a
                        href={route("owner.export")}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition"
                    >
                        <Download className="w-4 h-4" /> Export Laporan
                        Transaksi (CSV / Excel)
                    </a>
                </div>

                {/* 4 Kartu Indikator Utama */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-70">
                            <span>Total Omzet Keseluruhan</span>
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-emerald-500 mt-2">
                            Rp{" "}
                            {Number(metrics.total_revenue).toLocaleString(
                                "id-ID",
                            )}
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-70">
                            <span>Omzet Hari Ini</span>
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-2xl font-extrabold mt-2">
                            Rp{" "}
                            {Number(metrics.today_revenue).toLocaleString(
                                "id-ID",
                            )}
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-70">
                            <span>Total Transaksi Masuk</span>
                            <ShoppingBag className="w-4 h-4 text-purple-400" />
                        </div>
                        <p className="text-2xl font-extrabold mt-2">
                            {metrics.total_orders} Order
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-70">
                            <span>Peringatan Stok Menipis</span>
                            <AlertOctagon className="w-4 h-4 text-red-400" />
                        </div>
                        <p className="text-2xl font-extrabold text-red-400 mt-2">
                            {metrics.low_stock_count} Bahan Baku
                        </p>
                    </div>
                </div>

                {/* Baris Visualisasi Grafik: Grafik Batang Omzet 7 Hari & Leaderboard Menu Terlaris */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Grafik Tren Omzet 7 Hari Terakhir */}
                    <div
                        className={`col-span-12 lg:col-span-7 p-6 rounded-2xl ${cardClass}`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="font-bold text-base flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-emerald-500" />{" "}
                                    Grafik Tren Omzet 7 Hari Terakhir
                                </h2>
                                <p className="text-xs opacity-70">
                                    Visualisasi pendapatan harian kafe secara
                                    real-time
                                </p>
                            </div>
                        </div>

                        <div className="h-52 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-700/30 pb-2">
                            {revenueChart.map((day, idx) => {
                                const heightPercent = Math.max(
                                    8,
                                    Math.round(
                                        (day.revenue / maxRevenue) * 100,
                                    ),
                                );
                                return (
                                    <div
                                        key={idx}
                                        className="flex-1 flex flex-col items-center gap-2 group"
                                    >
                                        <span className="text-[10px] font-mono font-bold text-emerald-400 opacity-80 group-hover:opacity-100">
                                            {day.revenue > 0
                                                ? `Rp ${(day.revenue / 1000).toFixed(0)}k`
                                                : "Rp 0"}
                                        </span>
                                        <div className="w-full h-36 flex items-end justify-center bg-slate-800/30 rounded-xl p-1">
                                            <div
                                                style={{
                                                    height: `${heightPercent}%`,
                                                }}
                                                className="w-full rounded-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-500"
                                            />
                                        </div>
                                        <span className="text-[11px] font-bold opacity-75">
                                            {day.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Leaderboard Top 5 Menu Terlaris */}
                    <div
                        className={`col-span-12 lg:col-span-5 p-6 rounded-2xl ${cardClass}`}
                    >
                        <h2 className="font-bold text-base flex items-center gap-2 mb-4">
                            <Award className="w-5 h-5 text-amber-400" /> Top 5
                            Menu Paling Laris
                        </h2>
                        <div className="space-y-3.5">
                            {topMenus.length === 0 ? (
                                <p className="text-xs opacity-60 py-10 text-center">
                                    Belum ada data penjualan menu.
                                </p>
                            ) : (
                                topMenus.map((item, idx) => {
                                    const widthPercent = Math.max(
                                        15,
                                        Math.round(
                                            (Number(item.total_qty) /
                                                maxMenuQty) *
                                                100,
                                        ),
                                    );
                                    return (
                                        <div
                                            key={item.menu_id}
                                            className="space-y-1"
                                        >
                                            <div className="flex justify-between text-xs font-bold">
                                                <span>
                                                    #{idx + 1}{" "}
                                                    {item.menu?.name || "Menu"}
                                                </span>
                                                <span className="text-emerald-400">
                                                    {item.total_qty} Terjual (Rp{" "}
                                                    {Number(
                                                        item.total_sales,
                                                    ).toLocaleString("id-ID")}
                                                    )
                                                </span>
                                            </div>
                                            <div className="w-full h-2.5 rounded-full bg-slate-800/50 overflow-hidden">
                                                <div
                                                    style={{
                                                        width: `${widthPercent}%`,
                                                    }}
                                                    className="h-full rounded-full bg-amber-400"
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Grid Bawah: AI Co-Worker for Owner (Kiri) & Audit Shift + Transaksi (Kanan) */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Panel AI CO-WORKER FOR OWNER */}
                    <div
                        className={`col-span-12 lg:col-span-5 p-6 rounded-2xl flex flex-col justify-between ${cardClass}`}
                    >
                        <div>
                            <div className="flex items-center gap-3 border-b border-slate-700/30 pb-4 mb-4">
                                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-base">
                                        AI Co-Worker for Owner
                                    </h2>
                                    <p className="text-xs opacity-70">
                                        Asisten Analitik Omzet, Efisiensi Stok &
                                        Strategi Promo
                                    </p>
                                </div>
                            </div>

                            <div className="h-72 overflow-y-auto space-y-3 p-3 rounded-xl bg-slate-950/80 text-slate-100 border border-slate-800 mb-4">
                                {ownerChatLogs.length === 0 && (
                                    <div className="text-center py-10 px-4 space-y-2 text-xs text-slate-400">
                                        <Sparkles className="w-6 h-6 text-purple-400 mx-auto" />
                                        <p>
                                            Halo Owner! Saya terhubung langsung
                                            dengan data omzet dan stok gudang
                                            Anda.
                                        </p>
                                    </div>
                                )}
                                {ownerChatLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="space-y-2 text-xs"
                                    >
                                        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-3 rounded-xl ml-auto max-w-xs">
                                            <strong>Owner:</strong> {log.prompt}
                                        </div>
                                        <div className="bg-purple-500/15 border border-purple-500/30 text-slate-200 p-3 rounded-xl mr-auto">
                                            <strong>AI Analyst:</strong>{" "}
                                            {log.response}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form
                            onSubmit={handleAskOwnerAi}
                            className="flex gap-2"
                        >
                            <input
                                type="text"
                                placeholder="Minta analisis omzet atau strategi menu ke AI..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="flex-1 rounded-xl bg-slate-950 border-slate-800 text-xs text-white"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5"
                            >
                                <Send className="w-3.5 h-3.5" /> Analisa
                            </button>
                        </form>
                    </div>

                    {/* Tabel Audit Laci Shift Kasir & Riwayat Transaksi */}
                    <div className="col-span-12 lg:col-span-7 space-y-6">
                        <div className={`p-6 rounded-2xl ${cardClass}`}>
                            <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-emerald-500" />{" "}
                                Audit Rekonsiliasi Laci Shift Kasir
                            </h2>
                            <div className="overflow-x-auto max-h-48">
                                <table className="w-full text-xs text-left">
                                    <thead className="uppercase opacity-60 border-b border-slate-700/30">
                                        <tr>
                                            <th className="py-2">Kasir</th>
                                            <th className="py-2">Modal Awal</th>
                                            <th className="py-2">Seharusnya</th>
                                            <th className="py-2">
                                                Fisik Aktual
                                            </th>
                                            <th className="py-2 text-right">
                                                Selisih / Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/20">
                                        {shiftAudits.map((sh) => (
                                            <tr key={sh.id}>
                                                <td className="py-2 font-bold">
                                                    {sh.user?.name}
                                                </td>
                                                <td className="py-2">
                                                    Rp{" "}
                                                    {Number(
                                                        sh.opening_cash,
                                                    ).toLocaleString("id-ID")}
                                                </td>
                                                <td className="py-2">
                                                    Rp{" "}
                                                    {Number(
                                                        sh.expected_cash,
                                                    ).toLocaleString("id-ID")}
                                                </td>
                                                <td className="py-2">
                                                    {sh.actual_cash !== null
                                                        ? `Rp ${Number(sh.actual_cash).toLocaleString("id-ID")}`
                                                        : "-"}
                                                </td>
                                                <td className="py-2 text-right font-bold">
                                                    {sh.status === "open" ? (
                                                        <span className="text-emerald-400">
                                                            SHIFT AKTIF
                                                        </span>
                                                    ) : Number(
                                                          sh.difference,
                                                      ) === 0 ? (
                                                        <span className="text-emerald-400">
                                                            BALANCE
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-400">
                                                            Rp{" "}
                                                            {Number(
                                                                sh.difference,
                                                            ).toLocaleString(
                                                                "id-ID",
                                                            )}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className={`p-6 rounded-2xl ${cardClass}`}>
                            <h2 className="font-bold text-base mb-3">
                                Riwayat Transaksi Real-Time
                            </h2>
                            <div className="overflow-x-auto max-h-56">
                                <table className="w-full text-xs text-left">
                                    <thead className="uppercase opacity-60 border-b border-slate-700/30">
                                        <tr>
                                            <th className="py-2">Antrean</th>
                                            <th className="py-2">Pelanggan</th>
                                            <th className="py-2">Metode</th>
                                            <th className="py-2">Diskon</th>
                                            <th className="py-2 text-right">
                                                Grand Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/20">
                                        {recentOrders.map((ord) => (
                                            <tr key={ord.id}>
                                                <td className="py-2 font-bold text-emerald-500">
                                                    #{ord.queue_number}
                                                </td>
                                                <td className="py-2">
                                                    {ord.customer_name}
                                                </td>
                                                <td className="py-2 uppercase">
                                                    {
                                                        ord.payment
                                                            ?.payment_method
                                                    }
                                                </td>
                                                <td className="py-2 text-purple-400">
                                                    {Number(
                                                        ord.discount_total,
                                                    ) > 0
                                                        ? `-Rp ${Number(ord.discount_total).toLocaleString("id-ID")}`
                                                        : "-"}
                                                </td>
                                                <td className="py-2 text-right font-bold">
                                                    Rp{" "}
                                                    {Number(
                                                        ord.grand_total,
                                                    ).toLocaleString("id-ID")}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CaffeOSLayout>
    );
}
