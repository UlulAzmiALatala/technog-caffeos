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
    Users,
} from "lucide-react";

export default function OwnerDashboard({
    metrics,
    lowStocks,
    recentOrders,
    staffs,
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
                            Monitoring Bisnis & AI Co-Worker for Owner
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

                {/* 4 Kartu Indikator Utama (MONITORING) */}
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

                {/* Grid Utama: AI Co-Worker for Owner (Kiri) & Tabel Monitoring Transaksi/Staf (Kanan) */}
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

                            <div className="h-80 overflow-y-auto space-y-3 p-3 rounded-xl bg-slate-950/80 text-slate-100 border border-slate-800 mb-4">
                                {ownerChatLogs.length === 0 && (
                                    <div className="text-center py-12 px-4 space-y-2 text-xs text-slate-400">
                                        <Sparkles className="w-6 h-6 text-purple-400 mx-auto" />
                                        <p>
                                            Halo Owner! Saya terhubung langsung
                                            dengan data omzet dan stok gudang
                                            Anda.
                                        </p>
                                        <p className="text-slate-500">
                                            Coba tanya: "Bagaimana performa
                                            omzet hari ini dan stok apa yang
                                            harus dibeli?"
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

                    {/* Tabel Monitoring Transaksi & Akun Staf */}
                    <div className="col-span-12 lg:col-span-7 space-y-6">
                        <div className={`p-6 rounded-2xl ${cardClass}`}>
                            <h2 className="font-bold text-base mb-4">
                                Riwayat Transaksi Real-Time
                            </h2>
                            <div className="overflow-x-auto max-h-64">
                                <table className="w-full text-xs text-left">
                                    <thead className="uppercase opacity-60 border-b border-slate-700/30">
                                        <tr>
                                            <th className="py-2">Antrean</th>
                                            <th className="py-2">Pelanggan</th>
                                            <th className="py-2">Metode</th>
                                            <th className="py-2">Status</th>
                                            <th className="py-2 text-right">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/20">
                                        {recentOrders.map((ord) => (
                                            <tr key={ord.id}>
                                                <td className="py-2.5 font-bold text-emerald-500">
                                                    #{ord.queue_number}
                                                </td>
                                                <td className="py-2.5">
                                                    {ord.customer_name}
                                                </td>
                                                <td className="py-2.5 uppercase">
                                                    {
                                                        ord.payment
                                                            ?.payment_method
                                                    }
                                                </td>
                                                <td className="py-2.5 uppercase font-semibold">
                                                    {ord.order_status}
                                                </td>
                                                <td className="py-2.5 text-right font-bold">
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

                        {/* Daftar Staf Aktif (Owner, Cashier, Barista) */}
                        <div className={`p-6 rounded-2xl ${cardClass}`}>
                            <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-emerald-500" />{" "}
                                Daftar Akun Role Internal Kafe
                            </h2>
                            <div className="grid grid-cols-3 gap-3">
                                {staffs.map((st) => (
                                    <div
                                        key={st.id}
                                        className="p-3 rounded-xl bg-slate-950/40 border border-slate-700/30 text-xs"
                                    >
                                        <p className="font-bold">{st.name}</p>
                                        <p className="opacity-70">{st.email}</p>
                                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase font-bold text-[10px]">
                                            Role: {st.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CaffeOSLayout>
    );
}
