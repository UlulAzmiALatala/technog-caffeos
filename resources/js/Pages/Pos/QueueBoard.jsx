import React, { useEffect, useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    ChefHat,
    CheckCircle2,
    Volume2,
    Sparkles,
    Clock,
    Maximize2,
    Minimize2,
} from "lucide-react";

export default function QueueBoard({
    cafe,
    templates = [],
    tables = [],
    processingOrders = [],
    readyOrders = [],
}) {
    const [currentTime, setCurrentTime] = useState(
        new Date().toLocaleTimeString("id-ID"),
    );
    const [isFullscreenTv, setIsFullscreenTv] = useState(false);
    const announcedIdsRef = useRef(new Set(readyOrders.map((o) => o.id)));

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString("id-ID"));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const syncInterval = setInterval(() => {
            router.reload({
                only: ["processingOrders", "readyOrders"],
                preserveScroll: true,
                onSuccess: (page) => {
                    const latestReady = page.props.readyOrders || [];
                    latestReady.forEach((ord) => {
                        if (!announcedIdsRef.current.has(ord.id)) {
                            announcedIdsRef.current.add(ord.id);
                            speakQueue(ord.queue_number, ord.customer_name);
                        }
                    });
                },
            });
        }, 4000);

        return () => clearInterval(syncInterval);
    }, []);

    const speakQueue = (queueNumber, customerName) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(
                `Panggilan antrean nomor ${queueNumber}, atas nama ${customerName}, pesanan Anda telah siap disajikan. Silakan ambil di meja barista.`,
            );
            utterance.lang = "id-ID";
            utterance.rate = 0.95;
            window.speechSynthesis.speak(utterance);
        }
    };

    const boardContent = (
        <div
            className={`${isFullscreenTv ? "min-h-screen bg-slate-950 text-white p-8" : "p-6"} space-y-6`}
        >
            {/* Header Layar Monitor Antrean */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">
                            Layar Monitor Antrean (
                            {cafe?.name || "TechnoG CaffeOS"})
                        </h1>
                        <p className="text-xs text-emerald-400 font-semibold">
                            AUTO-SYNC 4 DETIK • KLIK KARTU HIJAU UNTUK PANGGIL
                            SUARA ULANG
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3 text-emerald-400" /> WAKTU
                            LIVE
                        </span>
                        <span className="text-lg font-mono font-extrabold text-emerald-400">
                            {currentTime}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsFullscreenTv(!isFullscreenTv)}
                        className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition"
                    >
                        {isFullscreenTv ? (
                            <>
                                <Minimize2 className="w-4 h-4" /> Tampilkan
                                Sidebar & Header
                            </>
                        ) : (
                            <>
                                <Maximize2 className="w-4 h-4" /> Mode Layar
                                Penuh TV
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Grid 2 Kolom Besar: Sedang Diracik Dapur vs Siap Disajikan */}
            <div className="grid grid-cols-12 gap-6">
                {/* KOLOM KIRI: DAPUR PROSES */}
                <div className="col-span-12 lg:col-span-6 bg-slate-900 border-2 border-amber-500/30 text-white rounded-3xl p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
                                <ChefHat className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-amber-400 uppercase">
                                    Sedang Diracik Dapur
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Pesanan sedang disiapkan oleh Barista
                                </p>
                            </div>
                        </div>
                        <span className="px-4 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-base">
                            {processingOrders.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                        {processingOrders.length === 0 ? (
                            <p className="col-span-2 text-center text-slate-500 py-16 text-xs">
                                Belum ada antrean yang sedang diproses di dapur.
                            </p>
                        ) : (
                            processingOrders.map((ord) => (
                                <div
                                    key={ord.id}
                                    className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 flex justify-between items-center"
                                >
                                    <div>
                                        <span className="text-[10px] text-amber-400 font-bold uppercase">
                                            {ord.order_type}
                                        </span>
                                        <p className="text-3xl font-black text-white mt-0.5">
                                            #{ord.queue_number}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-300 truncate max-w-[140px] mt-1">
                                            {ord.customer_name}
                                        </p>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 text-[11px] font-bold animate-pulse">
                                        Meracik...
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* KOLOM KANAN: SIAP DISAJIKAN */}
                <div className="col-span-12 lg:col-span-6 bg-slate-900 border-2 border-emerald-500 text-white rounded-3xl p-6 space-y-5 shadow-xl shadow-emerald-500/10">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-emerald-500 text-slate-950">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-emerald-400 uppercase">
                                    Siap Disajikan!
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Silakan ambil pesanan di meja Barista
                                </p>
                            </div>
                        </div>
                        <span className="px-4 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-base">
                            {readyOrders.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                        {readyOrders.length === 0 ? (
                            <p className="col-span-2 text-center text-slate-500 py-16 text-xs">
                                Belum ada pesanan di meja pengambilan.
                            </p>
                        ) : (
                            readyOrders.map((ord) => (
                                <div
                                    key={ord.id}
                                    onClick={() =>
                                        speakQueue(
                                            ord.queue_number,
                                            ord.customer_name,
                                        )
                                    }
                                    className="cursor-pointer p-4 rounded-2xl bg-emerald-500 text-slate-950 flex justify-between items-center shadow-lg hover:bg-emerald-400 transition"
                                >
                                    <div>
                                        <span className="text-[10px] font-extrabold uppercase bg-slate-950 text-emerald-400 px-2 py-0.5 rounded">
                                            SIAP SAJI
                                        </span>
                                        <p className="text-4xl font-black mt-1">
                                            #{ord.queue_number}
                                        </p>
                                        <p className="text-sm font-extrabold truncate max-w-[140px] mt-0.5">
                                            {ord.customer_name}
                                        </p>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-slate-950/15">
                                        <Volume2 className="w-6 h-6 text-slate-950" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (isFullscreenTv) {
        return (
            <>
                <Head title={`TV Monitor Antrean - ${cafe?.name}`} />
                {boardContent}
            </>
        );
    }

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title={`TV Monitor Antrean - ${cafe?.name}`} />
            {boardContent}
        </CaffeOSLayout>
    );
}
