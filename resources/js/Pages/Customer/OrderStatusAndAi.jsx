import React, { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import {
    Bot,
    Lock,
    CheckCircle2,
    Clock,
    Send,
    Sparkles,
    ChefHat,
    Coffee,
    BellRing,
    Star,
} from "lucide-react";

export default function OrderStatusAndAi({ order, chatLogs }) {
    const { flash } = usePage().props;
    const [prompt, setPrompt] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const isUnlocked =
        order.payment?.payment_status === "paid" && order.ai_token;

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ["order", "chatLogs"],
                preserveScroll: true,
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSendPrompt = (e) => {
        e.preventDefault();
        if (!prompt.trim() || !isUnlocked) return;

        router.post(
            route("customer.ask-ai"),
            { token_code: order.ai_token.token_code, prompt },
            { onSuccess: () => setPrompt("") },
        );
    };

    const handleWaiterCall = (callType) => {
        router.post(
            route("customer.action", order.order_code),
            { waiter_call_type: callType },
            { preserveScroll: true },
        );
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        router.post(
            route("customer.action", order.order_code),
            { rating, comment },
            {
                preserveScroll: true,
                onSuccess: () => setComment(""),
            },
        );
    };

    const steps = [
        { key: "pending", label: "Validasi Kasir", icon: Clock },
        { key: "paid", label: "Antrean Dapur", icon: CheckCircle2 },
        { key: "processing", label: "Dapur Proses", icon: ChefHat },
        { key: "ready", label: "Siap Saji!", icon: Coffee },
    ];

    const currentStepIdx = steps.findIndex((s) => s.key === order.order_status);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
            <Head title={`Order #${order.queue_number} - AI Co-Worker`} />

            <div className="max-w-3xl mx-auto space-y-6">
                {flash?.success && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                        ✨ {flash.success}
                    </div>
                )}

                {/* Kartu Nomor Antrean & Live Progress Tracker */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <span className="text-xs text-slate-400 font-mono">
                                {order.order_code}
                            </span>
                            <h1 className="text-2xl font-bold text-emerald-400">
                                Nomor Antrean: #{order.queue_number}
                            </h1>
                            <p className="text-sm text-slate-300 mt-1">
                                Pemesan: <strong>{order.customer_name}</strong>{" "}
                                ({order.order_type.toUpperCase()})
                            </p>
                        </div>

                        {isUnlocked ? (
                            <div className="text-right">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                                    <CheckCircle2 className="w-4 h-4" /> LUNAS (
                                    {order.payment.payment_method.toUpperCase()}
                                    )
                                </span>
                                <p className="text-xs font-mono text-purple-300 mt-2">
                                    Token AI: {order.ai_token.token_code} (Sisa
                                    Kuota:{" "}
                                    {order.ai_token.quota_limit -
                                        order.ai_token.quota_used}
                                    )
                                </p>
                            </div>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold animate-pulse">
                                <Clock className="w-4 h-4" /> MENUNGGU VALIDASI
                                KASIR (TUNAI)
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                        {steps.map((st, idx) => {
                            const Icon = st.icon;
                            const passed =
                                currentStepIdx >= idx ||
                                order.order_status === "completed";
                            return (
                                <div
                                    key={st.key}
                                    className={`p-3 rounded-xl border text-center transition ${
                                        passed
                                            ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300"
                                            : "bg-slate-950 border-slate-800 text-slate-500"
                                    }`}
                                >
                                    <Icon className="w-5 h-5 mx-auto mb-1" />
                                    <p className="text-[11px] font-bold">
                                        {st.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tombol Pintasan Panggil Pelayan (Smart Waiter Call) */}
                    <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-amber-300 font-bold flex items-center gap-1.5">
                            <BellRing className="w-4 h-4" /> Butuh Bantuan di
                            Meja?
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {[
                                "🛎️ Panggil Pelayan",
                                "🧻 Minta Tisu / Sendok",
                                "🧹 Bersihkan Meja",
                            ].map((act) => (
                                <button
                                    key={act}
                                    type="button"
                                    onClick={() => handleWaiterCall(act)}
                                    className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 text-slate-200 font-bold transition"
                                >
                                    {act}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Panel AI Chatbot Co-Worker */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                        <div className="flex items-center gap-2.5">
                            <Bot className="w-7 h-7 text-purple-400" />
                            <div>
                                <h2 className="font-bold text-lg">
                                    AI Chatbot Co-Worker
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Asisten Pintar Pelanggan & Teman Kerja Kafe
                                </p>
                            </div>
                        </div>
                        <span className="text-[11px] text-slate-500">
                            Live Sync Aktif (5s)
                        </span>
                    </div>

                    {!isUnlocked ? (
                        <div className="py-12 text-center space-y-3 bg-slate-950/60 rounded-xl border border-red-500/30 p-6">
                            <Lock className="w-12 h-12 text-red-400 mx-auto" />
                            <h3 className="font-bold text-red-300 text-base">
                                Akses AI Chatbot Co-Worker Masih Terkunci!
                            </h3>
                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                                Begitu kasir mengklik tombol Validasi Pembayaran
                                Tunai untuk Antrean #{order.queue_number},
                                halaman ini akan{" "}
                                <strong>
                                    otomatis membuka kunci AI Co-Worker
                                </strong>{" "}
                                tanpa perlu Anda refresh.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="h-64 overflow-y-auto space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                                {chatLogs.length === 0 && (
                                    <p className="text-xs text-slate-500 text-center py-10">
                                        Token AI Anda aktif! Tanyakan
                                        rekomendasi kopi, bantuan ide
                                        kerja/coding, atau tanya status pesanan
                                        Anda.
                                    </p>
                                )}
                                {chatLogs.map((log) => (
                                    <div key={log.id} className="space-y-2">
                                        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 p-3 rounded-xl text-xs ml-auto max-w-md">
                                            <strong>Anda:</strong> {log.prompt}
                                        </div>
                                        <div className="bg-purple-500/10 border border-purple-500/30 text-slate-200 p-3 rounded-xl text-xs mr-auto max-w-lg flex gap-2">
                                            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                            <div>
                                                <strong>AI Co-Worker:</strong>{" "}
                                                {log.response}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form
                                onSubmit={handleSendPrompt}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    placeholder="Tanya AI Co-Worker..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="flex-1 rounded-xl bg-slate-950 border-slate-800 text-sm text-white"
                                />
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs flex items-center gap-1.5"
                                >
                                    <Send className="w-4 h-4" /> Kirim
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Form Rating & Ulasan Pelanggan untuk Barista */}
                <form
                    onSubmit={handleSubmitReview}
                    className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm flex items-center gap-2 text-yellow-400">
                            <Star className="w-4 h-4 fill-yellow-400" /> Beri
                            Rating Rasa Kopi & Pelayanan Barista Kami
                        </h3>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setRating(num)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                        rating >= num
                                            ? "bg-yellow-400 text-slate-950"
                                            : "bg-slate-800 text-slate-400"
                                    }`}
                                >
                                    {num} ⭐
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Tulis kesan atau masukan singkat Anda..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="flex-1 rounded-xl bg-slate-950 border-slate-800 text-xs text-white"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                        >
                            Kirim Ulasan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
