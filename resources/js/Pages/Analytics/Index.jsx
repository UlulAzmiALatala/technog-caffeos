import React, { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    LineChart,
    Flame,
    AlertTriangle,
    TrendingUp,
    Calculator,
    Clock,
    Package,
    Sparkles,
    ArrowRight,
    CheckCircle2,
} from "lucide-react";

export default function AnalyticsIndex({
    hourlyHeatmap = [],
    stockForecasts = [],
    baselineMetrics,
    templates = [],
    tables = [],
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";

    // State Slider Interaktif What-If Profit Simulator
    const [simExtraOrdersPerDay, setSimExtraOrdersPerDay] = useState(15);
    const [simPriceIncreasePercent, setSimPriceIncreasePercent] = useState(5);
    const [simCogsPercent, setSimCogsPercent] = useState(32);

    const cardClass = isBrutal
        ? "bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        : isWood
          ? "bg-white border border-amber-200 text-stone-800 shadow-sm"
          : "bg-slate-900 border border-slate-800 text-slate-100";

    // Kalkulasi Real-Time What-If Simulator (30 Hari)
    const baseDailyOrders = Number(baselineMetrics?.daily_avg_orders || 10);
    const baseAov = Number(baselineMetrics?.avg_order_value || 35000);
    const fixedExpenses = Number(
        baselineMetrics?.monthly_fixed_expenses || 4500000,
    );

    const projectedDailyOrders = baseDailyOrders + Number(simExtraOrdersPerDay);
    const projectedAov = Math.round(
        baseAov * (1 + Number(simPriceIncreasePercent) / 100),
    );
    const projectedMonthlyRevenue = projectedDailyOrders * projectedAov * 30;
    const projectedMonthlyCogs = Math.round(
        projectedMonthlyRevenue * (Number(simCogsPercent) / 100),
    );
    const projectedMonthlyNetProfit =
        projectedMonthlyRevenue - projectedMonthlyCogs - fixedExpenses;

    const maxHourlyOrders = Math.max(...hourlyHeatmap.map((h) => h.orders), 1);
    const criticalStocksCount = stockForecasts.filter(
        (s) => s.urgency === "CRITICAL",
    ).length;

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Prediksi Statistik & Simulator Profit - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* 1. SIMULATOR TARGET PROFIT INTERAKTIF (WHAT-IF BUSINESS SIMULATOR) */}
                <div className={`p-6 rounded-3xl space-y-5 ${cardClass}`}>
                    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-current/10 pb-4">
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                                <Calculator className="w-4 h-4" /> Interactive
                                Statistical What-If Simulator
                            </span>
                            <h1 className="text-2xl font-black mt-0.5">
                                Simulator Proyeksi Omzet & Laba Bersih Bulanan
                                (30 Hari)
                            </h1>
                        </div>
                        <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-black">
                            AOV Saat Ini: Rp {baseAov.toLocaleString("id-ID")} /
                            Transaksi
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        {/* 3 Slider Variabel Simulasi */}
                        <div className="lg:col-span-7 space-y-4 text-xs">
                            <div className="p-4 rounded-2xl bg-black/15 border border-current/10 space-y-2">
                                <div className="flex justify-between font-bold">
                                    <span>
                                        1. Tambahan Target Transaksi Harian
                                        (+Order/Hari)
                                    </span>
                                    <span className="text-emerald-400 font-black">
                                        +{simExtraOrdersPerDay} Order/Hari
                                        (Total: {projectedDailyOrders}{" "}
                                        Order/Hari)
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={simExtraOrdersPerDay}
                                    onChange={(e) =>
                                        setSimExtraOrdersPerDay(e.target.value)
                                    }
                                    className="w-full accent-emerald-500 cursor-pointer"
                                />
                            </div>

                            <div className="p-4 rounded-2xl bg-black/15 border border-current/10 space-y-2">
                                <div className="flex justify-between font-bold">
                                    <span>
                                        2. Penyesuaian Harga Jual / Upselling
                                        Rata-Rata (%)
                                    </span>
                                    <span className="text-cyan-400 font-black">
                                        +{simPriceIncreasePercent}% (AOV Baru:
                                        Rp{" "}
                                        {projectedAov.toLocaleString("id-ID")})
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="-10"
                                    max="35"
                                    value={simPriceIncreasePercent}
                                    onChange={(e) =>
                                        setSimPriceIncreasePercent(
                                            e.target.value,
                                        )
                                    }
                                    className="w-full accent-cyan-400 cursor-pointer"
                                />
                            </div>

                            <div className="p-4 rounded-2xl bg-black/15 border border-current/10 space-y-2">
                                <div className="flex justify-between font-bold">
                                    <span>
                                        3. Rasio HPP Bahan Baku (COGS %)
                                    </span>
                                    <span className="text-amber-400 font-black">
                                        {simCogsPercent}% dari Omzet
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="20"
                                    max="55"
                                    value={simCogsPercent}
                                    onChange={(e) =>
                                        setSimCogsPercent(e.target.value)
                                    }
                                    className="w-full accent-amber-400 cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Hasil Proyeksi Bulanan */}
                        <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/60 border border-emerald-500/40 text-white space-y-4 shadow-2xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                                Hasil Proyeksi Finansial (30 Hari)
                            </span>

                            <div className="space-y-2 text-xs border-b border-slate-800 pb-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">
                                        Proyeksi Omzet Kotor:
                                    </span>
                                    <span className="font-mono font-bold text-white">
                                        Rp{" "}
                                        {projectedMonthlyRevenue.toLocaleString(
                                            "id-ID",
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">
                                        Estimasi HPP Bahan ({simCogsPercent}%):
                                    </span>
                                    <span className="font-mono text-rose-400">
                                        -Rp{" "}
                                        {projectedMonthlyCogs.toLocaleString(
                                            "id-ID",
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">
                                        Biaya Operasional & Gaji:
                                    </span>
                                    <span className="font-mono text-amber-400">
                                        -Rp{" "}
                                        {fixedExpenses.toLocaleString("id-ID")}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs text-slate-300 block">
                                    Estimasi Laba Bersih (Net Profit):
                                </span>
                                <p className="text-3xl font-black text-emerald-400 mt-1">
                                    Rp{" "}
                                    {projectedMonthlyNetProfit.toLocaleString(
                                        "id-ID",
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. GRID BAWAH: PREDIKSI HABISNYA STOK (KIRI) & HEATMAP JAM SIBUK (KANAN) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* PREDIKSI UMUR STOK GUDANG (STOCK RUN-OUT FORECASTING) */}
                    <div
                        className={`lg:col-span-7 p-6 rounded-3xl space-y-4 ${cardClass}`}
                    >
                        <div className="flex justify-between items-center border-b border-current/10 pb-3">
                            <div>
                                <h2 className="font-extrabold text-base flex items-center gap-2">
                                    <Package className="w-5 h-5 text-emerald-500" />{" "}
                                    Prediksi Kapan Stok Bahan Baku Habis
                                    (Burn-Rate)
                                </h2>
                                <p className="text-xs opacity-70">
                                    Dihitung otomatis dari rata-rata pemakaian
                                    resep harian dibagi sisa stok gudang
                                </p>
                            </div>
                            {criticalStocksCount > 0 && (
                                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-black animate-pulse">
                                    ⚠️ {criticalStocksCount} Kritis
                                </span>
                            )}
                        </div>

                        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                            {stockForecasts.map((st) => {
                                const badgeColor =
                                    st.urgency === "CRITICAL"
                                        ? "bg-rose-500 text-white"
                                        : st.urgency === "WARNING"
                                          ? "bg-amber-400 text-slate-950"
                                          : "bg-emerald-500/20 text-emerald-400";

                                return (
                                    <div
                                        key={st.id}
                                        className="p-4 rounded-2xl bg-black/15 border border-current/10 flex flex-wrap justify-between items-center gap-3 text-xs"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-sm">
                                                    {st.name}
                                                </span>
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${badgeColor}`}
                                                >
                                                    Estimasi Habis:{" "}
                                                    {st.days_remaining} Hari
                                                    Lagi
                                                </span>
                                            </div>
                                            <p className="opacity-75">
                                                Sisa Gudang:{" "}
                                                <strong>
                                                    {st.current_qty.toLocaleString(
                                                        "id-ID",
                                                    )}{" "}
                                                    {st.unit}
                                                </strong>{" "}
                                                • Laju Pakai:{" "}
                                                <strong>
                                                    ~{st.daily_burn_rate}{" "}
                                                    {st.unit}/hari
                                                </strong>
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-[10px] opacity-60 block">
                                                Saran Re-Order (Stok 14 Hari):
                                            </span>
                                            <Link
                                                href={route("inventory.index")}
                                                className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-black transition"
                                            >
                                                + PO{" "}
                                                {st.recommended_po_qty.toLocaleString(
                                                    "id-ID",
                                                )}{" "}
                                                {st.unit}{" "}
                                                <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* HEATMAP DISTRIBUSI JAM SIBUK (PEAK HOURS) */}
                    <div
                        className={`lg:col-span-5 p-6 rounded-3xl space-y-4 h-fit ${cardClass}`}
                    >
                        <div className="border-b border-current/10 pb-3">
                            <h2 className="font-extrabold text-base flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-400" />{" "}
                                Heatmap Distribusi Jam Sibuk Kafe
                            </h2>
                            <p className="text-xs opacity-70">
                                Analisis kepadatan transaksi berdasarkan jam
                                operasional
                            </p>
                        </div>

                        <div className="space-y-4">
                            {hourlyHeatmap.map((slot, idx) => {
                                const widthPct = Math.max(
                                    12,
                                    Math.round(
                                        (slot.orders / maxHourlyOrders) * 100,
                                    ),
                                );
                                const isPeak =
                                    slot.orders === maxHourlyOrders &&
                                    slot.orders > 0;

                                return (
                                    <div
                                        key={idx}
                                        className="space-y-1.5 text-xs"
                                    >
                                        <div className="flex justify-between items-center font-bold">
                                            <span className="flex items-center gap-1.5">
                                                {slot.label}
                                                {isPeak && (
                                                    <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[9px] font-black">
                                                        🔥 PEAK HOUR
                                                    </span>
                                                )}
                                            </span>
                                            <span className="font-mono text-emerald-400">
                                                {slot.orders} Order (Rp{" "}
                                                {slot.revenue.toLocaleString(
                                                    "id-ID",
                                                )}
                                                )
                                            </span>
                                        </div>
                                        <div className="w-full h-3 rounded-full bg-black/25 overflow-hidden p-0.5">
                                            <div
                                                style={{
                                                    width: `${widthPct}%`,
                                                }}
                                                className={`h-full rounded-full ${
                                                    isPeak
                                                        ? "bg-gradient-to-r from-amber-400 to-rose-500"
                                                        : "bg-gradient-to-r from-emerald-500 to-cyan-400"
                                                }`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </CaffeOSLayout>
    );
}
