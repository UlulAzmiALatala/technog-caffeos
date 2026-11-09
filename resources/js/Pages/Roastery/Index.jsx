import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    Flame,
    Coffee,
    Gauge,
    Award,
    Plus,
    Scale,
    Thermometer,
    Clock,
    Sparkles,
} from "lucide-react";

export default function RoasteryIndex({
    roastBatches = [],
    dialInLogs = [],
    stocks = [],
    templates = [],
    tables = [],
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";

    const [activeTab, setActiveTab] = useState("dialin"); // dialin | roastery

    // Form State Kalibrasi Dial-In Espresso Harian
    const [dialForm, setDialForm] = useState({
        bean_name: "House Blend Arabika Gayo x Toraja",
        grind_setting: "2.2 (Fine)",
        dose_in_gram: 18,
        yield_out_gram: 36,
        time_seconds: 27,
        sca_score: 87.5,
        tasting_notes:
            "Sweet caramel, dark cocoa, balanced citrus acidity, creamy body",
    });

    // Form State Batch Roasting Biji Kopi
    const [roastForm, setRoastForm] = useState({
        bean_origin: "Arabika Flores Bajawa Natural",
        roast_level: "Medium",
        green_weight_gram: 5000,
        roasted_weight_gram: 4250,
        roast_temp_celsius: 209,
        duration_minutes: 13.0,
        target_stock_id: stocks[0]?.id || "",
    });

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

    // Kalkulasi Live Preview Rasio Espresso & Susut Roasting
    const liveRatio =
        dialForm.dose_in_gram > 0
            ? (
                  Number(dialForm.yield_out_gram) /
                  Number(dialForm.dose_in_gram)
              ).toFixed(1)
            : "2.0";

    const liveShrinkage =
        roastForm.green_weight_gram > 0
            ? (
                  ((Number(roastForm.green_weight_gram) -
                      Number(roastForm.roasted_weight_gram)) /
                      Number(roastForm.green_weight_gram)) *
                  100
              ).toFixed(1)
            : "0.0";

    const handleDialInSubmit = (e) => {
        e.preventDefault();
        router.post(route("roastery.dial-in.store"), dialForm);
    };

    const handleRoastSubmit = (e) => {
        e.preventDefault();
        router.post(route("roastery.batch.store"), roastForm);
    };

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Roastery Batch & Kalibrasi Espresso QC - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* 3 Kartu Indikator Quality Control Kopi */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Rasio Ekstraksi Kalibrasi Terakhir</span>
                            <Gauge className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-black text-emerald-500 mt-2">
                            {dialInLogs[0]?.brew_ratio || "1 : 2.0"} (
                            {dialInLogs[0]?.time_seconds || 28} Detik)
                        </p>
                        <p className="text-[11px] opacity-70 mt-1">
                            Dose: {dialInLogs[0]?.dose_in_gram || 18}g → Yield:{" "}
                            {dialInLogs[0]?.yield_out_gram || 36}g
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Rata-Rata Skor Cupping SCA</span>
                            <Award className="w-4 h-4 text-amber-400" />
                        </div>
                        <p className="text-2xl font-black text-amber-400 mt-2">
                            ⭐ {dialInLogs[0]?.sca_score || 86.5} / 100
                            (Specialty Grade)
                        </p>
                        <p className="text-[11px] opacity-70 mt-1 truncate">
                            Notes: {dialInLogs[0]?.tasting_notes}
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Total Produksi Batch Roastery</span>
                            <Flame className="w-4 h-4 text-rose-500" />
                        </div>
                        <p className="text-2xl font-black text-rose-500 mt-2">
                            {roastBatches.length} Batch Sangrai
                        </p>
                        <p className="text-[11px] opacity-70 mt-1">
                            Rata-rata susut bobot (Shrinkage): ~16.5%
                        </p>
                    </div>
                </div>

                {/* Navigasi Tab */}
                <div className="flex flex-wrap gap-3 border-b border-current/10 pb-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab("dialin")}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition ${
                            activeTab === "dialin"
                                ? "bg-emerald-500 text-slate-950 shadow-lg"
                                : "bg-black/20 hover:bg-black/30"
                        }`}
                    >
                        <Gauge className="w-4 h-4" /> KALIBRASI DIAL-IN ESPRESSO
                        & CUPPING LAB ({dialInLogs.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("roastery")}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition ${
                            activeTab === "roastery"
                                ? "bg-emerald-500 text-slate-950 shadow-lg"
                                : "bg-black/20 hover:bg-black/30"
                        }`}
                    >
                        <Flame className="w-4 h-4" /> ROASTERY BATCH TRACKER &
                        SHRINKAGE ({roastBatches.length})
                    </button>
                </div>

                {/* ================= TAB 1: KALIBRASI DIAL-IN ESPRESSO HARIAN ================= */}
                {activeTab === "dialin" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <form
                            onSubmit={handleDialInSubmit}
                            className={`lg:col-span-5 p-6 rounded-3xl space-y-4 h-fit ${cardClass}`}
                        >
                            <h2 className="font-extrabold text-base text-emerald-500 border-b border-current/10 pb-2 flex items-center gap-2">
                                <Coffee className="w-5 h-5" /> Input Kalibrasi
                                Espresso Shift Pagi/Sore
                            </h2>

                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Beans / Blend yang Dikalibrasi *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={dialForm.bean_name}
                                    onChange={(e) =>
                                        setDialForm({
                                            ...dialForm,
                                            bean_name: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Grind Size Grinder *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={dialForm.grind_setting}
                                        onChange={(e) =>
                                            setDialForm({
                                                ...dialForm,
                                                grind_setting: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Skor Cupping SCA (0-100)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={dialForm.sca_score}
                                        onChange={(e) =>
                                            setDialForm({
                                                ...dialForm,
                                                sca_score: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 font-mono ${inputClass}`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2.5">
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Dose In (g)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={dialForm.dose_in_gram}
                                        onChange={(e) =>
                                            setDialForm({
                                                ...dialForm,
                                                dose_in_gram: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 font-mono ${inputClass}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Yield Out (g/ml)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={dialForm.yield_out_gram}
                                        onChange={(e) =>
                                            setDialForm({
                                                ...dialForm,
                                                yield_out_gram: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 font-mono ${inputClass}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Waktu (Detik)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={dialForm.time_seconds}
                                        onChange={(e) =>
                                            setDialForm({
                                                ...dialForm,
                                                time_seconds: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 font-mono ${inputClass}`}
                                    />
                                </div>
                            </div>

                            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex justify-between items-center text-xs">
                                <span>Kalkulasi Brew Ratio Otomatis:</span>
                                <span className="font-mono font-black text-emerald-400 text-sm">
                                    1 : {liveRatio} ({dialForm.time_seconds}s)
                                </span>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Flavor & Tasting Notes *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={dialForm.tasting_notes}
                                    onChange={(e) =>
                                        setDialForm({
                                            ...dialForm,
                                            tasting_notes: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg"
                            >
                                + Simpan Standar Resep Kalibrasi Hari Ini
                            </button>
                        </form>

                        <div
                            className={`lg:col-span-7 p-6 rounded-3xl space-y-4 h-fit ${cardClass}`}
                        >
                            <h2 className="font-extrabold text-base border-b border-current/10 pb-2">
                                Riwayat Log Kalibrasi Espresso & Evaluasi Rasa
                                (Cupping QC)
                            </h2>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                {dialInLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="p-4 rounded-2xl bg-black/15 border border-current/10 space-y-2 text-xs"
                                    >
                                        <div className="flex flex-wrap justify-between items-center gap-2">
                                            <div>
                                                <span className="font-black text-sm text-emerald-400">
                                                    {log.bean_name}
                                                </span>
                                                <span className="ml-2 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                                                    SCA Score: {log.sca_score}
                                                </span>
                                            </div>
                                            <span className="text-[11px] opacity-60 font-mono">
                                                {log.logged_at} •{" "}
                                                {log.barista_name}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                                            <div className="p-2 rounded-xl bg-black/20">
                                                <span className="opacity-60 block text-[9px]">
                                                    GRIND SIZE
                                                </span>
                                                <strong>
                                                    {log.grind_setting}
                                                </strong>
                                            </div>
                                            <div className="p-2 rounded-xl bg-black/20">
                                                <span className="opacity-60 block text-[9px]">
                                                    DOSE → YIELD
                                                </span>
                                                <strong>
                                                    {log.dose_in_gram}g →{" "}
                                                    {log.yield_out_gram}g
                                                </strong>
                                            </div>
                                            <div className="p-2 rounded-xl bg-black/20">
                                                <span className="opacity-60 block text-[9px]">
                                                    BREW RATIO
                                                </span>
                                                <strong className="text-emerald-400">
                                                    {log.brew_ratio}
                                                </strong>
                                            </div>
                                            <div className="p-2 rounded-xl bg-black/20">
                                                <span className="opacity-60 block text-[9px]">
                                                    EXTRACTION
                                                </span>
                                                <strong className="text-cyan-400">
                                                    {log.time_seconds} Detik
                                                </strong>
                                            </div>
                                        </div>

                                        <p className="italic opacity-85 pt-1">
                                            ☕ <strong>Tasting Notes:</strong> "
                                            {log.tasting_notes}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= TAB 2: ROASTERY BATCH TRACKER & AUTO STOCK SYNC ================= */}
                {activeTab === "roastery" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <form
                            onSubmit={handleRoastSubmit}
                            className={`lg:col-span-5 p-6 rounded-3xl space-y-4 h-fit ${cardClass}`}
                        >
                            <h2 className="font-extrabold text-base text-rose-400 border-b border-current/10 pb-2 flex items-center gap-2">
                                <Flame className="w-5 h-5" /> Catat Batch
                                Sangrai Baru & Tambah Stok Gudang
                            </h2>

                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Origin Biji Kopi (Green Bean) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={roastForm.bean_origin}
                                    onChange={(e) =>
                                        setRoastForm({
                                            ...roastForm,
                                            bean_origin: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Profil Roast Level
                                    </label>
                                    <select
                                        value={roastForm.roast_level}
                                        onChange={(e) =>
                                            setRoastForm({
                                                ...roastForm,
                                                roast_level: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    >
                                        <option value="Light (Filter / V60)">
                                            Light (Filter / V60)
                                        </option>
                                        <option value="Medium (Omni Roast)">
                                            Medium (Omni Roast)
                                        </option>
                                        <option value="Medium-Dark (Espresso)">
                                            Medium-Dark (Espresso)
                                        </option>
                                        <option value="Dark Roast">
                                            Dark Roast
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Masukkan Hasil ke Stok Gudang
                                    </label>
                                    <select
                                        value={roastForm.target_stock_id}
                                        onChange={(e) =>
                                            setRoastForm({
                                                ...roastForm,
                                                target_stock_id: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    >
                                        <option value="">
                                            -- Hanya Catat Log --
                                        </option>
                                        {stocks.map((st) => (
                                            <option key={st.id} value={st.id}>
                                                + {st.name} ({st.current_qty}
                                                {st.unit})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Berat Mentah / Green (Gram) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={roastForm.green_weight_gram}
                                        onChange={(e) =>
                                            setRoastForm({
                                                ...roastForm,
                                                green_weight_gram:
                                                    e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 font-mono ${inputClass}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Berat Matang / Roasted (Gram) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={roastForm.roasted_weight_gram}
                                        onChange={(e) =>
                                            setRoastForm({
                                                ...roastForm,
                                                roasted_weight_gram:
                                                    e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 font-mono ${inputClass}`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Suhu Drop (°Celsius)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={roastForm.roast_temp_celsius}
                                        onChange={(e) =>
                                            setRoastForm({
                                                ...roastForm,
                                                roast_temp_celsius:
                                                    e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 font-mono ${inputClass}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Durasi Sangrai (Menit)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={roastForm.duration_minutes}
                                        onChange={(e) =>
                                            setRoastForm({
                                                ...roastForm,
                                                duration_minutes:
                                                    e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 font-mono ${inputClass}`}
                                    />
                                </div>
                            </div>

                            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex justify-between items-center text-xs">
                                <span>
                                    Estimasi Susut Bobot Air (Shrinkage):
                                </span>
                                <span className="font-mono font-black text-amber-400 text-sm">
                                    -{liveShrinkage}% Susut
                                </span>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg"
                            >
                                + Simpan Batch Roasting & Tambah ke Stok Gudang
                            </button>
                        </form>

                        <div
                            className={`lg:col-span-7 p-6 rounded-3xl space-y-4 h-fit ${cardClass}`}
                        >
                            <h2 className="font-extrabold text-base border-b border-current/10 pb-2">
                                Log Produksi Batch Roastery & Penyusutan Bobot
                                (Shrinkage)
                            </h2>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                {roastBatches.map((b) => (
                                    <div
                                        key={b.id}
                                        className="p-4 rounded-2xl bg-black/15 border border-current/10 flex flex-wrap justify-between items-center gap-4 text-xs"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-black text-amber-400">
                                                    {b.batch_code}
                                                </span>
                                                <span className="font-black text-sm">
                                                    {b.bean_origin}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                                                    {b.roast_level}
                                                </span>
                                            </div>
                                            <p className="opacity-80">
                                                Green:{" "}
                                                <strong>
                                                    {b.green_weight_gram}g
                                                </strong>{" "}
                                                → Roasted:{" "}
                                                <strong className="text-emerald-400">
                                                    {b.roasted_weight_gram}g
                                                </strong>{" "}
                                                • Suhu Drop:{" "}
                                                <strong>
                                                    {b.roast_temp_celsius}°C
                                                </strong>{" "}
                                                ({b.duration_minutes} mnt)
                                            </p>
                                            <p className="text-[10px] opacity-60">
                                                Roaster: {b.roaster_name} •{" "}
                                                {b.roasted_at}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <span className="px-3 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono font-black">
                                                Susut: -{b.shrinkage_percent}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CaffeOSLayout>
    );
}
