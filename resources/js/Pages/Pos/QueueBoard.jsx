import React, { useEffect, useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { ChefHat, CheckCircle2, Volume2, Sparkles, Clock } from "lucide-react";

export default function QueueBoard({
    cafe,
    processingOrders = [],
    readyOrders = [],
}) {
    const [currentTime, setCurrentTime] = useState(
        new Date().toLocaleTimeString("id-ID"),
    );
    const announcedIdsRef = useRef(new Set(readyOrders.map((o) => o.id)));

    // Jam Digital Real-Time di Layar TV
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString("id-ID"));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Auto-Sync Data Antrean Setiap 4 Detik & Bunyikan Suara Otomatis Jika Ada Order Baru yang "Ready"
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

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col justify-between">
            <Head title={`TV Monitor Antrean - ${cafe?.name}`} />

            {/* Header Layar TV Kafe */}
            <header className="bg-slate-900 border border-slate-800 rounded-3xl px-8 py-5 flex justify-between items-center shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white">
                            {cafe?.name || "TechnoG CaffeOS"}
                        </h1>
                        <p className="text-sm text-emerald-400 font-semibold">
                            LIVE ORDER QUEUE MONITOR • AUTO VOICE CALL SYSTEM
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right bg-slate-950 px-5 py-2.5 rounded-2xl border border-slate-800">
                        <span className="text-xs text-slate-400 flex items-center justify-end gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />{" "}
                            WAKTU SAAT INI
                        </span>
                        <span className="text-2xl font-mono font-extrabold text-emerald-400">
                            {currentTime}
                        </span>
                    </div>
                </div>
            </header>

            {/* Grid 2 Kolom Besar: Sedang Disiapkan Dapur vs Siap Disajikan */}
            <div className="grid grid-cols-12 gap-8 my-8 flex-1">
                {/* KOLOM KIRI: DAPUR PROSES (SEDANG DIRACIK BARISTA) */}
                <div className="col-span-6 bg-slate-900/70 border-2 border-amber-500/30 rounded-3xl p-6 flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400">
                                <ChefHat className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-amber-400 uppercase">
                                    Sedang Diracik Dapur
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Pesanan sedang diproses oleh Barista kami
                                </p>
                            </div>
                        </div>
                        <span className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 font-black text-lg">
                            {processingOrders.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 content-start overflow-y-auto">
                        {processingOrders.length === 0 ? (
                            <p className="col-span-2 text-center text-slate-500 py-20 text-sm">
                                Belum ada antrean yang sedang diproses di dapur.
                            </p>
                        ) : (
                            processingOrders.map((ord) => (
                                <div
                                    key={ord.id}
                                    className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 flex justify-between items-center"
                                >
                                    <div>
                                        <span className="text-xs text-amber-400 font-bold uppercase">
                                            {ord.order_type}
                                        </span>
                                        <p className="text-4xl font-black text-white mt-0.5">
                                            #{ord.queue_number}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-300 truncate max-w-[160px] mt-1">
                                            {ord.customer_name}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-bold animate-pulse">
                                        Meracik...
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* KOLOM KANAN: SIAP SAJI (SILAKAN AMBIL DI MEJA BARISTA) */}
                <div className="col-span-6 bg-emerald-950/20 border-2 border-emerald-500 rounded-3xl p-6 flex flex-col shadow-2xl shadow-emerald-500/10">
                    <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-emerald-500 text-slate-950">
                                <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-emerald-400 uppercase">
                                    Siap Disajikan!
                                </h2>
                                <p className="text-xs text-emerald-200/70">
                                    Silakan ambil pesanan Anda di counter
                                    Barista
                                </p>
                            </div>
                        </div>
                        <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-black text-lg">
                            {readyOrders.length}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 content-start overflow-y-auto">
                        {readyOrders.length === 0 ? (
                            <p className="col-span-2 text-center text-slate-500 py-20 text-sm">
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
                                    className="cursor-pointer p-5 rounded-2xl bg-emerald-500 text-slate-950 flex justify-between items-center shadow-lg hover:bg-emerald-400 transition"
                                >
                                    <div>
                                        <span className="text-xs font-extrabold uppercase bg-slate-950 text-emerald-400 px-2 py-0.5 rounded">
                                            SIAP SAJI
                                        </span>
                                        <p className="text-5xl font-black mt-1">
                                            #{ord.queue_number}
                                        </p>
                                        <p className="text-base font-extrabold truncate max-w-[160px] mt-1">
                                            {ord.customer_name}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-slate-950/15">
                                        <Volume2 className="w-7 h-7 text-slate-950" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Running Text Info Bawah */}
            <footer className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 flex justify-between items-center text-xs text-slate-400">
                <span>
                    💡 <strong>Tips Pelanggan:</strong> Scan QR Code pada struk
                    pembayaran Anda untuk membuka akses{" "}
                    <strong>AI Chatbot Co-Worker</strong> selama nongkrong di
                    kafe!
                </span>
                <span className="text-emerald-400 font-mono font-bold">
                    Powered by TechnoG Solutions
                </span>
            </footer>
        </div>
    );
}
