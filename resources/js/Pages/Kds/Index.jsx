import React, { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    Flame,
    Clock,
    CheckCircle2,
    ChefHat,
    Volume2,
    BookOpen,
    AlertTriangle,
    Sparkles,
    CheckSquare,
} from "lucide-react";

export default function KdsIndex({
    activeOrders = [],
    completedTodayCount = 0,
    templates = [],
    tables = [],
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";

    // Detik berjalan untuk menghitung SLA Timer per pesanan secara live
    const [nowTick, setNowTick] = useState(Date.now());
    const [checkedItems, setCheckedItems] = useState({});
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        const timer = setInterval(() => setNowTick(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-reload KDS setiap 5 detik
    useEffect(() => {
        const sync = setInterval(() => {
            router.reload({
                only: ["activeOrders", "completedTodayCount"],
                preserveScroll: true,
            });
        }, 5000);
        return () => clearInterval(sync);
    }, []);

    const toggleItemCheck = (itemId) => {
        setCheckedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    const getElapsedInfo = (createdAt) => {
        const diffSec = Math.max(
            0,
            Math.floor((nowTick - new Date(createdAt).getTime()) / 1000),
        );
        const mins = Math.floor(diffSec / 60);
        const secs = diffSec % 60;
        const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

        if (mins >= 10) {
            return {
                formatted,
                level: "overdue",
                label: "OVERDUE (>10m)",
                color: "bg-rose-500 text-white animate-pulse",
            };
        }
        if (mins >= 5) {
            return {
                formatted,
                level: "warning",
                label: "WARNING (5-10m)",
                color: "bg-amber-400 text-slate-950",
            };
        }
        return {
            formatted,
            level: "ontime",
            label: "ON-TIME (<5m)",
            color: "bg-emerald-500 text-slate-950",
        };
    };

    const handleBumpOrder = (order, nextStatus) => {
        if (nextStatus === "ready" && "speechSynthesis" in window) {
            const msg = new SpeechSynthesisUtterance(
                `Pesanan antrean nomor ${order.queue_number}, atas nama ${order.customer_name}, sudah siap disajikan di meja barista.`,
            );
            msg.lang = "id-ID";
            window.speechSynthesis.speak(msg);
        }
        router.post(route("kds.bump", order.id), { next_status: nextStatus });
    };

    const cardClass = isBrutal
        ? "bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        : isWood
          ? "bg-white border border-amber-200 text-stone-800 shadow-sm"
          : "bg-slate-900 border border-slate-800 text-slate-100";

    const filteredOrders = activeOrders.filter(
        (o) => statusFilter === "ALL" || o.order_status === statusFilter,
    );

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Smart KDS & Barista SLA Timer - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Header Smart KDS & Indikator SLA */}
                <div
                    className={`p-6 rounded-3xl flex flex-wrap justify-between items-center gap-4 ${cardClass}`}
                >
                    <div>
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                            <Flame className="w-4 h-4" /> Barista Kitchen
                            Display System (KDS)
                        </span>
                        <h1 className="text-2xl font-black mt-0.5">
                            Monitor Durasi Racik (SLA Stopwatch) & Panduan
                            Takaran Resep
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-black">
                        {["ALL", "paid", "processing", "ready"].map((st) => (
                            <button
                                key={st}
                                type="button"
                                onClick={() => setStatusFilter(st)}
                                className={`px-3.5 py-2 rounded-xl uppercase transition ${
                                    statusFilter === st
                                        ? "bg-emerald-500 text-slate-950 shadow"
                                        : "bg-black/20 hover:bg-black/30"
                                }`}
                            >
                                {st === "ALL"
                                    ? `Semua Aktif (${activeOrders.length})`
                                    : st}
                            </button>
                        ))}
                        <span className="px-3.5 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
                            ✅ Selesai Hari Ini: {completedTodayCount} Order
                        </span>
                    </div>
                </div>

                {/* Grid Tiket KDS Barista */}
                {filteredOrders.length === 0 ? (
                    <div
                        className={`p-16 rounded-3xl text-center space-y-2 ${cardClass}`}
                    >
                        <ChefHat className="w-12 h-12 text-emerald-400 mx-auto opacity-75" />
                        <h3 className="text-lg font-black">
                            Semua Antrean Dapur Telah Diselesaikan!
                        </h3>
                        <p className="text-xs opacity-65">
                            Pesanan baru dari Kasir POS maupun QR Meja akan
                            langsung muncul otomatis di layar ini.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredOrders.map((ord) => {
                            const sla = getElapsedInfo(ord.created_at);

                            return (
                                <div
                                    key={ord.id}
                                    className={`p-5 rounded-3xl flex flex-col justify-between space-y-4 border-t-8 ${
                                        sla.level === "overdue"
                                            ? "border-t-rose-500"
                                            : sla.level === "warning"
                                              ? "border-t-amber-400"
                                              : "border-t-emerald-500"
                                    } ${cardClass}`}
                                >
                                    <div className="space-y-3">
                                        {/* Header Tiket & Stopwatch SLA */}
                                        <div className="flex justify-between items-start border-b border-current/10 pb-3">
                                            <div>
                                                <span className="text-2xl font-black text-emerald-500">
                                                    #{ord.queue_number}
                                                </span>
                                                <span className="ml-2 text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-black/20">
                                                    {ord.order_type}{" "}
                                                    {ord.table
                                                        ? `• Meja ${ord.table.table_number}`
                                                        : ""}
                                                </span>
                                                <p className="font-bold text-sm mt-1">
                                                    {ord.customer_name}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <span
                                                    className={`px-2.5 py-1 rounded-xl font-mono font-black text-xs inline-flex items-center gap-1 ${sla.color}`}
                                                >
                                                    <Clock className="w-3.5 h-3.5" />{" "}
                                                    {sla.formatted}
                                                </span>
                                                <span className="block text-[9px] font-black uppercase opacity-60 mt-1">
                                                    {sla.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Checklist Item & Contekan Takaran Resep */}
                                        <div className="space-y-2.5">
                                            {ord.items?.map((item) => {
                                                const isDone =
                                                    !!checkedItems[item.id];
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() =>
                                                            toggleItemCheck(
                                                                item.id,
                                                            )
                                                        }
                                                        className={`cursor-pointer p-3 rounded-2xl border transition ${
                                                            isDone
                                                                ? "bg-emerald-500/15 border-emerald-500/40 opacity-60 line-through"
                                                                : "bg-black/20 border-current/10 hover:border-emerald-500/40"
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-center text-xs font-black">
                                                            <span className="flex items-center gap-2">
                                                                <CheckSquare
                                                                    className={`w-4 h-4 ${isDone ? "text-emerald-400" : "opacity-40"}`}
                                                                />
                                                                {item.qty}x{" "}
                                                                {
                                                                    item.menu
                                                                        ?.name
                                                                }
                                                            </span>
                                                            {item.notes && (
                                                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                                                                    {item.notes}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* SOP Takaran & Bahan Resep */}
                                                        {item.menu
                                                            ?.treatment && (
                                                            <p className="text-[11px] text-cyan-400 font-semibold mt-1">
                                                                🧪 SOP:{" "}
                                                                {
                                                                    item.menu
                                                                        .treatment
                                                                }
                                                            </p>
                                                        )}
                                                        {item.menu?.stocks
                                                            ?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                                {item.menu.stocks.map(
                                                                    (st) => (
                                                                        <span
                                                                            key={
                                                                                st.id
                                                                            }
                                                                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 opacity-80"
                                                                        >
                                                                            {
                                                                                st.name
                                                                            }
                                                                            :{" "}
                                                                            {st
                                                                                .pivot
                                                                                .qty_needed *
                                                                                item.qty}
                                                                            {
                                                                                st.unit
                                                                            }
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 1-Click KDS Bump Bar */}
                                    <div className="pt-3 border-t border-current/10">
                                        {ord.order_status === "paid" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleBumpOrder(
                                                        ord,
                                                        "processing",
                                                    )
                                                }
                                                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                                            >
                                                <ChefHat className="w-4 h-4" />{" "}
                                                MULAI RACIK PESANAN (BUMP
                                                PROSES)
                                            </button>
                                        )}

                                        {ord.order_status === "processing" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleBumpOrder(
                                                        ord,
                                                        "ready",
                                                    )
                                                }
                                                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                                            >
                                                <Volume2 className="w-4 h-4" />{" "}
                                                SIAP SAJI & PANGGIL SUARA
                                                PELANGGAN
                                            </button>
                                        )}

                                        {ord.order_status === "ready" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleBumpOrder(
                                                        ord,
                                                        "completed",
                                                    )
                                                }
                                                className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />{" "}
                                                SERAHKAN & TUTUP TIKET KDS
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </CaffeOSLayout>
    );
}
