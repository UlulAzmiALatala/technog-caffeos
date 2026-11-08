import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    PieChart,
    Calculator,
    TrendingUp,
    Sparkles,
    Award,
    DollarSign,
    Save,
    Coffee,
    Layers,
} from "lucide-react";

export default function MenuEngineeringIndex({
    stocks = [],
    engineeredMenus = [],
    benchmarks,
    templates = [],
    tables = [],
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";

    // State Harga Modal Bahan Baku per Satuan (gram/ml/pcs)
    const [costInputs, setCostInputs] = useState(() => {
        const initial = {};
        stocks.forEach((st) => {
            initial[st.id] = st.unit_cost;
        });
        return initial;
    });

    // State Edit Cepat Harga Jual Menu
    const [priceInputs, setPriceInputs] = useState(() => {
        const initial = {};
        engineeredMenus.forEach((m) => {
            initial[m.id] = m.price;
        });
        return initial;
    });

    const [quadrantFilter, setQuadrantFilter] = useState("ALL");

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

    const handleSaveUnitCosts = (e) => {
        e.preventDefault();
        router.post(route("menu-engineering.stocks.costs"), {
            costs: costInputs,
        });
    };

    const handleUpdateMenuPrice = (menuId) => {
        router.post(route("menu-engineering.menus.price", menuId), {
            price: priceInputs[menuId],
        });
    };

    const filteredMenus = engineeredMenus.filter(
        (m) => quadrantFilter === "ALL" || m.quadrant === quadrantFilter,
    );

    const starCount = engineeredMenus.filter(
        (m) => m.quadrant === "STAR",
    ).length;
    const plowhorseCount = engineeredMenus.filter(
        (m) => m.quadrant === "PLOWHORSE",
    ).length;
    const puzzleCount = engineeredMenus.filter(
        (m) => m.quadrant === "PUZZLE",
    ).length;
    const dogCount = engineeredMenus.filter((m) => m.quadrant === "DOG").length;

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Kalkulator HPP Resep & Menu Engineering - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* 4 Kartu Ringkasan Kuadran Statistik Menu Engineering */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div
                        onClick={() => setQuadrantFilter("STAR")}
                        className={`cursor-pointer p-5 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/10 transition hover:scale-[1.01]`}
                    >
                        <div className="flex justify-between items-center text-xs font-black text-emerald-400">
                            <span>🌟 KUADRAN 1: STAR (PRIMADONA)</span>
                            <Award className="w-4 h-4" />
                        </div>
                        <p className="text-3xl font-black text-emerald-400 mt-2">
                            {starCount} Menu
                        </p>
                        <p className="text-[11px] opacity-75 mt-1">
                            Penjualan Tinggi & Margin Laba Tinggi
                        </p>
                    </div>

                    <div
                        onClick={() => setQuadrantFilter("PLOWHORSE")}
                        className={`cursor-pointer p-5 rounded-2xl border-2 border-cyan-500/50 bg-cyan-500/10 transition hover:scale-[1.01]`}
                    >
                        <div className="flex justify-between items-center text-xs font-black text-cyan-400">
                            <span>🐎 KUADRAN 2: PLOWHORSE</span>
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <p className="text-3xl font-black text-cyan-400 mt-2">
                            {plowhorseCount} Menu
                        </p>
                        <p className="text-[11px] opacity-75 mt-1">
                            Laris Manis tapi Margin Keuntungan Tipis
                        </p>
                    </div>

                    <div
                        onClick={() => setQuadrantFilter("PUZZLE")}
                        className={`cursor-pointer p-5 rounded-2xl border-2 border-purple-500/50 bg-purple-500/10 transition hover:scale-[1.01]`}
                    >
                        <div className="flex justify-between items-center text-xs font-black text-purple-400">
                            <span>🧩 KUADRAN 3: PUZZLE (POTENSIAL)</span>
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <p className="text-3xl font-black text-purple-400 mt-2">
                            {puzzleCount} Menu
                        </p>
                        <p className="text-[11px] opacity-75 mt-1">
                            Margin Tinggi tapi Jarang Dipesan (Butuh Promo)
                        </p>
                    </div>

                    <div
                        onClick={() => setQuadrantFilter("DOG")}
                        className={`cursor-pointer p-5 rounded-2xl border-2 border-rose-500/50 bg-rose-500/10 transition hover:scale-[1.01]`}
                    >
                        <div className="flex justify-between items-center text-xs font-black text-rose-400">
                            <span>⚠️ KUADRAN 4: DOG (EVALUASI)</span>
                            <PieChart className="w-4 h-4" />
                        </div>
                        <p className="text-3xl font-black text-rose-400 mt-2">
                            {dogCount} Menu
                        </p>
                        <p className="text-[11px] opacity-75 mt-1">
                            Penjualan Rendah & Margin Keuntungan Rendah
                        </p>
                    </div>
                </div>

                {/* Grid Utama: Pengaturan Harga Modal Bahan Baku (Kiri) + Tabel HPP & Matriks Menu (Kanan) */}
                <div className="grid grid-cols-12 gap-6">
                    {/* KOLOM KIRI (4): HARGA MODAL BAHAN BAKU PER GRAM/ML/PCS */}
                    <form
                        onSubmit={handleSaveUnitCosts}
                        className={`col-span-12 lg:col-span-4 p-6 rounded-2xl space-y-4 h-fit ${cardClass}`}
                    >
                        <div className="border-b border-current/10 pb-3">
                            <h2 className="font-extrabold text-base flex items-center gap-2 text-emerald-500">
                                <Calculator className="w-5 h-5" /> Standar Biaya
                                Bahan Baku
                            </h2>
                            <p className="text-xs opacity-70 mt-0.5">
                                Atur harga beli per satuan (gram/ml/pcs) untuk
                                menghitung HPP resep secara otomatis.
                            </p>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                            {stocks.map((st) => (
                                <div
                                    key={st.id}
                                    className="p-3 rounded-xl bg-black/15 border border-current/10 flex justify-between items-center gap-2 text-xs"
                                >
                                    <div>
                                        <p className="font-bold">{st.name}</p>
                                        <span className="text-[10px] opacity-65">
                                            Satuan Takaran: per 1 {st.unit}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] opacity-70">
                                            Rp
                                        </span>
                                        <input
                                            type="number"
                                            step="any"
                                            value={costInputs[st.id] ?? 0}
                                            onChange={(e) =>
                                                setCostInputs({
                                                    ...costInputs,
                                                    [st.id]: e.target.value,
                                                })
                                            }
                                            className={`w-24 font-mono ${inputClass}`}
                                        />
                                        <span className="text-[10px] opacity-60">
                                            /{st.unit}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Save className="w-4 h-4" /> Simpan & Hitung Ulang
                            HPP Menu
                        </button>
                    </form>

                    {/* KOLOM KANAN (8): MATRIKS ANALISIS HPP, MARGIN & REKOMENDASI HARGA */}
                    <div
                        className={`col-span-12 lg:col-span-8 p-6 rounded-2xl space-y-4 h-fit ${cardClass}`}
                    >
                        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-current/10 pb-3">
                            <div>
                                <h2 className="font-extrabold text-base flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-emerald-500" />{" "}
                                    Analisis HPP Resep, Gross Margin &
                                    Rekomendasi Strategis
                                </h2>
                                <p className="text-xs opacity-70">
                                    Rata-rata Margin Kafe:{" "}
                                    <strong>{benchmarks.avg_margin}%</strong> •
                                    Rata-rata Laba Kotor/Cup:{" "}
                                    <strong>
                                        Rp{" "}
                                        {Number(
                                            benchmarks.avg_gross_profit,
                                        ).toLocaleString("id-ID")}
                                    </strong>
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setQuadrantFilter("ALL")}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-black"
                            >
                                Tampilkan Semua ({engineeredMenus.length})
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                            {filteredMenus.map((m) => {
                                const badgeStyle = {
                                    STAR: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
                                    PLOWHORSE:
                                        "bg-cyan-500/20 border-cyan-500/40 text-cyan-400",
                                    PUZZLE: "bg-purple-500/20 border-purple-500/40 text-purple-300",
                                    DOG: "bg-rose-500/20 border-rose-500/40 text-rose-400",
                                }[m.quadrant];

                                return (
                                    <div
                                        key={m.id}
                                        className="p-4 rounded-2xl bg-black/15 border border-current/10 space-y-3 text-xs"
                                    >
                                        <div className="flex flex-wrap justify-between items-start gap-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-sm">
                                                        {m.name}
                                                    </span>
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full border font-black text-[10px] ${badgeStyle}`}
                                                    >
                                                        {m.quadrant}
                                                    </span>
                                                    <span className="text-[11px] opacity-65">
                                                        ({m.qty_sold} Cup
                                                        Terjual)
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-amber-400 font-semibold mt-1">
                                                    💡 Rekomendasi Statistik:{" "}
                                                    {m.advice}
                                                </p>
                                            </div>

                                            {/* Edit Harga Jual Langsung */}
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[11px] opacity-70">
                                                    Harga Jual:
                                                </span>
                                                <input
                                                    type="number"
                                                    value={
                                                        priceInputs[m.id] ??
                                                        m.price
                                                    }
                                                    onChange={(e) =>
                                                        setPriceInputs({
                                                            ...priceInputs,
                                                            [m.id]: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className={`w-28 font-mono ${inputClass}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleUpdateMenuPrice(
                                                            m.id,
                                                        )
                                                    }
                                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-[11px]"
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </div>

                                        {/* Rincian Komposisi HPP Resep & Laba Kotor */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-current/10">
                                            <div className="p-2.5 rounded-xl bg-black/20">
                                                <span className="text-[10px] opacity-60 block">
                                                    Modal Resep (HPP / Cup)
                                                </span>
                                                <span className="font-mono font-extrabold text-rose-400 text-sm">
                                                    Rp{" "}
                                                    {Number(
                                                        m.hpp,
                                                    ).toLocaleString("id-ID")}
                                                </span>
                                                <div className="mt-1 space-y-0.5 text-[10px] opacity-75">
                                                    {m.recipe_breakdown.map(
                                                        (rcp, idx) => (
                                                            <div key={idx}>
                                                                •{" "}
                                                                {rcp.stock_name}{" "}
                                                                (
                                                                {rcp.qty_needed}
                                                                {rcp.unit}): Rp{" "}
                                                                {rcp.cost.toLocaleString(
                                                                    "id-ID",
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-black/20">
                                                <span className="text-[10px] opacity-60 block">
                                                    Laba Kotor / Cup (Margin)
                                                </span>
                                                <span className="font-mono font-extrabold text-emerald-400 text-sm">
                                                    +Rp{" "}
                                                    {Number(
                                                        m.gross_profit,
                                                    ).toLocaleString(
                                                        "id-ID",
                                                    )}{" "}
                                                    ({m.margin_percent}%)
                                                </span>
                                            </div>

                                            <div className="p-2.5 rounded-xl bg-black/20">
                                                <span className="text-[10px] opacity-60 block">
                                                    Total Kontribusi Laba
                                                </span>
                                                <span className="font-mono font-extrabold text-cyan-400 text-sm">
                                                    Rp{" "}
                                                    {Number(
                                                        m.total_profit_contribution,
                                                    ).toLocaleString("id-ID")}
                                                </span>
                                            </div>
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
