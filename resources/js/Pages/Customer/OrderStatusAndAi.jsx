import React, { useState, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import CustomerLayout from "@/Layouts/CustomerLayout";
import ReceiptModal from "@/Components/ReceiptModal";
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
    Receipt,
    Crown,
    Wifi,
    Copy,
    Users,
    Calculator,
    Share2,
} from "lucide-react";

export default function OrderStatusAndAi({
    order,
    chatLogs = [],
    activeTemplate = "cyber-dark",
}) {
    const [prompt, setPrompt] = useState("");
    const [sendingAi, setSendingAi] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [showReceipt, setShowReceipt] = useState(false);

    // State Kalkulator Split Bill (Patungan Nongkrong)
    const [splitCount, setSplitCount] = useState(2);
    const [splitMode, setSplitMode] = useState("equal"); // 'equal' | 'items'
    const [selectedMyItems, setSelectedMyItems] = useState({});

    const prevStatusRef = useRef(order.order_status);
    const chatBoxRef = useRef(null);

    const isWood = activeTemplate === "minimalist-wood";
    const isBrutal = activeTemplate === "neo-brutal";
    const isUnlocked =
        order.payment?.payment_status === "paid" && order.ai_token;
    const wifiPass = order.cafe?.settings?.wifi_password || "kopitechnog123";

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [chatLogs]);

    // Auto-Sync Setiap 5 Detik & Bunyikan Panggilan Suara Saat Status Berubah Jadi "READY"
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ["order", "chatLogs"],
                preserveScroll: true,
                onSuccess: (page) => {
                    const newStatus = page.props.order?.order_status;
                    if (
                        prevStatusRef.current !== "ready" &&
                        newStatus === "ready"
                    ) {
                        prevStatusRef.current = "ready";
                        if ("speechSynthesis" in window) {
                            const u = new SpeechSynthesisUtterance(
                                `Halo Kak ${order.customer_name}, pesanan antrean nomor ${order.queue_number} Anda sudah siap disajikan!`,
                            );
                            u.lang = "id-ID";
                            window.speechSynthesis.speak(u);
                        }
                    } else {
                        prevStatusRef.current = newStatus;
                    }
                },
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSendPrompt = (customPrompt = null) => {
        const text = customPrompt ?? prompt;
        if (!text.trim() || !isUnlocked) return;

        setSendingAi(true);
        router.post(
            route("customer.ask-ai"),
            { token_code: order.ai_token.token_code, prompt: text },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSendingAi(false);
                    setPrompt("");
                },
            },
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

    // Hitung Nominal Split Bill
    const grandTotal = Number(order.grand_total || 0);
    const equalPerPerson = Math.ceil(grandTotal / Math.max(1, splitCount));

    const toggleMyItem = (itemId) => {
        setSelectedMyItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    const mySelectedTotal = (order.items || []).reduce((sum, item) => {
        return selectedMyItems[item.id] ? sum + Number(item.subtotal) : sum;
    }, 0);

    const generateSplitWaLink = () => {
        const itemLines = (order.items || [])
            .map(
                (i) =>
                    `• ${i.qty}x ${i.menu?.name}: Rp ${Number(i.subtotal).toLocaleString("id-ID")}`,
            )
            .join("\n");

        const splitSummary =
            splitMode === "equal"
                ? `*Patungan Bagi Rata (${splitCount} Orang):* Rp ${equalPerPerson.toLocaleString("id-ID")} / orang`
                : `*Bagian Pilihan Saya:* Rp ${mySelectedTotal.toLocaleString("id-ID")}`;

        const text =
            `☕ *Tagihan Patungan Nongkrong - ${order.cafe?.name}*\n` +
            `No. Struk: ${order.order_code} (Antrean #${order.queue_number})\n\n` +
            `*Rincian Pesanan:*\n${itemLines}\n\n` +
            `*Grand Total:* Rp ${grandTotal.toLocaleString("id-ID")}\n` +
            `${splitSummary}`;

        return `https://wa.me/?text=${encodeURIComponent(text)}`;
    };

    const steps = [
        { key: "pending", label: "Validasi Kasir", icon: Clock },
        { key: "paid", label: "Antrean Dapur", icon: CheckCircle2 },
        { key: "processing", label: "Sedang Diracik", icon: ChefHat },
        { key: "ready", label: "Siap Saji!", icon: Coffee },
    ];

    const currentStepIdx = steps.findIndex((s) => s.key === order.order_status);
    const remainingQuota = order.ai_token
        ? Math.max(0, order.ai_token.quota_limit - order.ai_token.quota_used)
        : 0;

    const cardClass = isBrutal
        ? "bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        : isWood
          ? "bg-white border border-amber-200 text-stone-800 shadow-sm"
          : "bg-slate-900/90 border border-slate-800 text-slate-100 shadow-xl";

    const inputClass = isBrutal
        ? "rounded-2xl bg-yellow-100 border-2 border-black text-black font-bold text-xs"
        : isWood
          ? "rounded-2xl bg-amber-50/70 border-stone-300 text-stone-800 text-xs"
          : "rounded-2xl bg-slate-950 border-slate-800 text-white text-xs";

    return (
        <CustomerLayout
            cafe={order.cafe}
            table={order.table}
            activeTemplate={activeTemplate}
            activePage="status"
            currentOrderCode={order.order_code}
            isWifiUnlocked={Boolean(isUnlocked)}
        >
            <Head
                title={`Antrean #${order.queue_number} - ${order.cafe?.name}`}
            />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* 1. KARTU STATUS ANTREAN LIVE, AKSES WIFI & E-STRUK */}
                <div className={`p-6 rounded-3xl space-y-5 ${cardClass}`}>
                    <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs opacity-60 font-mono">
                                    {order.order_code}
                                </span>
                                {order.customer && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black flex items-center gap-1">
                                        <Crown className="w-3 h-3" /> Member:{" "}
                                        {order.customer.member_code}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl font-black text-emerald-500 mt-1">
                                Nomor Antrean #{order.queue_number}
                            </h1>
                            <p className="text-xs opacity-80 mt-1">
                                Pemesan: <strong>{order.customer_name}</strong>{" "}
                                •{" "}
                                <span className="uppercase">
                                    {order.order_type}
                                </span>
                                {order.table &&
                                    ` (Meja #${order.table.table_number})`}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {isUnlocked ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black">
                                    <CheckCircle2 className="w-4 h-4" /> LUNAS (
                                    {order.payment.payment_method.toUpperCase()}
                                    )
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black animate-pulse">
                                    <Clock className="w-4 h-4" /> MENUNGGU
                                    VALIDASI KASIR
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={() => setShowReceipt(true)}
                                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow transition"
                            >
                                <Receipt className="w-3.5 h-3.5" /> Lihat
                                E-Struk
                            </button>
                        </div>
                    </div>

                    {/* Kotak Status Kunci Free WiFi Kafe */}
                    <div
                        className={`p-3.5 rounded-2xl border flex flex-wrap justify-between items-center gap-2 text-xs ${
                            isUnlocked
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                        }`}
                    >
                        {isUnlocked ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <Wifi className="w-4 h-4 text-emerald-400" />
                                    <span>
                                        Akses Free WiFi Terbuka! Password:{" "}
                                        <strong className="font-mono text-sm underline">
                                            {wifiPass}
                                        </strong>
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigator.clipboard.writeText(wifiPass)
                                    }
                                    className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center gap-1"
                                >
                                    <Copy className="w-3 h-3" /> Salin Sandi
                                    WiFi
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                <span>
                                    <strong>
                                        Password Free WiFi & AI Co-Worker
                                        Terkunci:
                                    </strong>{" "}
                                    Akan terbuka otomatis di layar ini begitu
                                    pembayaran Anda divalidasi oleh Kasir.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Stepper Progress Dapur */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                        {steps.map((st, idx) => {
                            const Icon = st.icon;
                            const passed =
                                currentStepIdx >= idx ||
                                order.order_status === "completed";
                            const isCurrent =
                                steps[currentStepIdx]?.key === st.key;
                            return (
                                <div
                                    key={st.key}
                                    className={`p-3.5 rounded-2xl border text-center transition ${
                                        passed
                                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow"
                                            : "bg-black/10 border-current/10 opacity-45"
                                    } ${isCurrent ? "ring-2 ring-emerald-400" : ""}`}
                                >
                                    <Icon className="w-5 h-5 mx-auto mb-1" />
                                    <p className="text-xs font-black">
                                        {st.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Smart Waiter Call */}
                    <div className="pt-3 border-t border-current/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-bold flex items-center gap-1.5 text-amber-500">
                            <BellRing className="w-4 h-4" /> Panggil Pelayan ke
                            Meja:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {[
                                "🛎️ Panggil Pelayan",
                                "🧻 Minta Tisu / Sendok",
                                "🧹 Bersihkan Meja",
                            ].map((act) => (
                                <button
                                    key={act}
                                    type="button"
                                    onClick={() => handleWaiterCall(act)}
                                    className="px-3 py-1.5 rounded-xl bg-black/15 hover:bg-amber-500 hover:text-slate-950 border border-current/15 font-bold transition"
                                >
                                    {act}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. WORKSPACE AI CHATBOT CO-WORKER */}
                <div className={`p-6 rounded-3xl space-y-4 ${cardClass}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/10 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="font-black text-base">
                                    AI Chatbot Co-Worker & Teman Nongkrong
                                </h2>
                                <p className="text-xs opacity-70">
                                    Tanyakan rekomendasi menu, ide kerja, tugas
                                    kuliah, coding, hingga topik berita bebas!
                                </p>
                            </div>
                        </div>

                        {isUnlocked && (
                            <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400 font-mono text-xs font-black">
                                Token: {order.ai_token.token_code} (Sisa Kuota:{" "}
                                {remainingQuota}x)
                            </span>
                        )}
                    </div>

                    {!isUnlocked ? (
                        <div className="py-10 text-center space-y-3 bg-rose-500/10 rounded-2xl border border-rose-500/30 p-6">
                            <Lock className="w-10 h-10 text-rose-400 mx-auto" />
                            <h3 className="font-black text-rose-400 text-base">
                                Akses AI Co-Worker & Free WiFi Menunggu Validasi
                                Kasir
                            </h3>
                            <p className="text-xs opacity-80 max-w-md mx-auto leading-relaxed">
                                Silakan selesaikan pembayaran tunai untuk{" "}
                                <strong>Antrean #{order.queue_number}</strong>{" "}
                                di kasir. Begitu kasir menekan tombol Validasi,
                                layar ini akan{" "}
                                <strong>
                                    otomatis membuka kunci WiFi & AI Co-Worker
                                </strong>
                                !
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    "Rekomendasi kopi paling enak di sini?",
                                    "Bantu saya buat ide konten kreatif hari ini!",
                                    "Apa saja promo voucher yang sedang aktif?",
                                    "Bagaimana status pesanan saya saat ini?",
                                ].map((q, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        disabled={
                                            sendingAi || remainingQuota <= 0
                                        }
                                        onClick={() => handleSendPrompt(q)}
                                        className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500 hover:text-white border border-purple-500/30 text-[11px] font-bold transition"
                                    >
                                        ✨ {q}
                                    </button>
                                ))}
                            </div>

                            <div
                                ref={chatBoxRef}
                                className="h-72 overflow-y-auto space-y-3 p-4 rounded-2xl bg-slate-950 text-slate-100 border border-slate-800"
                            >
                                {chatLogs.length === 0 && (
                                    <div className="text-center py-12 space-y-2 text-xs text-slate-400">
                                        <Sparkles className="w-7 h-7 text-purple-400 mx-auto" />
                                        <p>
                                            Token AI Anda sudah aktif! Silakan
                                            ketik pertanyaan apa saja di bawah.
                                        </p>
                                    </div>
                                )}
                                {chatLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="space-y-2 text-xs"
                                    >
                                        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 p-3 rounded-2xl ml-auto max-w-md">
                                            <strong>Anda:</strong> {log.prompt}
                                        </div>
                                        <div className="bg-purple-500/15 border border-purple-500/30 text-slate-200 p-3.5 rounded-2xl mr-auto max-w-lg whitespace-pre-line leading-relaxed">
                                            <strong className="text-purple-300 block mb-1">
                                                🤖 AI Co-Worker:
                                            </strong>
                                            {log.response}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendPrompt();
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    disabled={sendingAi || remainingQuota <= 0}
                                    placeholder={
                                        remainingQuota > 0
                                            ? "Tanyakan apa saja ke AI Co-Worker..."
                                            : "Kuota Token AI untuk struk ini telah habis."
                                    }
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className={`flex-1 ${inputClass}`}
                                />
                                <button
                                    type="submit"
                                    disabled={sendingAi || remainingQuota <= 0}
                                    className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-black text-xs flex items-center gap-1.5 shadow-lg"
                                >
                                    <Send className="w-4 h-4" />{" "}
                                    {sendingAi ? "..." : "Kirim"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* 3. FITUR BARU: SMART SPLIT BILL (KALKULATOR PATUNGAN NONGKRONG & SHARE WA) */}
                <div className={`p-6 rounded-3xl space-y-4 ${cardClass}`}>
                    <div className="flex flex-wrap justify-between items-center gap-3 border-b border-current/10 pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                                <Calculator className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm">
                                    Kalkulator Split Bill (Hitung Patungan
                                    Nongkrong)
                                </h3>
                                <p className="text-[11px] opacity-70">
                                    Total Tagihan Struk:{" "}
                                    <strong>
                                        Rp {grandTotal.toLocaleString("id-ID")}
                                    </strong>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-1.5 text-xs font-black">
                            <button
                                type="button"
                                onClick={() => setSplitMode("equal")}
                                className={`px-3 py-1.5 rounded-xl transition ${
                                    splitMode === "equal"
                                        ? "bg-emerald-500 text-slate-950"
                                        : "bg-black/15 opacity-70"
                                }`}
                            >
                                👥 Bagi Rata
                            </button>
                            <button
                                type="button"
                                onClick={() => setSplitMode("items")}
                                className={`px-3 py-1.5 rounded-xl transition ${
                                    splitMode === "items"
                                        ? "bg-emerald-500 text-slate-950"
                                        : "bg-black/15 opacity-70"
                                }`}
                            >
                                ☕ Pilih Itemku
                            </button>
                        </div>
                    </div>

                    {splitMode === "equal" ? (
                        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/15 border border-current/10 text-xs">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-emerald-400" />
                                <span className="font-bold">
                                    Jumlah Teman Patungan:
                                </span>
                                <div className="flex gap-1">
                                    {[2, 3, 4, 5, 6].map((n) => (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => setSplitCount(n)}
                                            className={`w-8 h-8 rounded-xl font-black ${
                                                splitCount === n
                                                    ? "bg-emerald-500 text-slate-950 shadow"
                                                    : "bg-black/20 hover:bg-black/30"
                                            }`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="text-[10px] uppercase opacity-65 block">
                                    Patungan per Orang:
                                </span>
                                <span className="text-lg font-black text-emerald-400">
                                    Rp {equalPerPerson.toLocaleString("id-ID")}{" "}
                                    / orang
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 text-xs">
                            <p className="text-[11px] opacity-75">
                                Centang menu yang kamu pesan sendiri untuk
                                menghitung porsi tagihanmu:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {order.items?.map((item) => {
                                    const checked = !!selectedMyItems[item.id];
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() =>
                                                toggleMyItem(item.id)
                                            }
                                            className={`cursor-pointer p-3 rounded-2xl border flex justify-between items-center transition ${
                                                checked
                                                    ? "bg-emerald-500/20 border-emerald-500 font-bold"
                                                    : "bg-black/15 border-current/10 opacity-75"
                                            }`}
                                        >
                                            <span>
                                                {checked ? "✅ " : "⬜ "}{" "}
                                                {item.qty}x {item.menu?.name}
                                            </span>
                                            <span className="font-mono font-bold text-emerald-400">
                                                Rp{" "}
                                                {Number(
                                                    item.subtotal,
                                                ).toLocaleString("id-ID")}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex justify-between items-center font-black">
                                <span>Total Porsi Pesananmu:</span>
                                <span className="text-base text-emerald-400">
                                    Rp {mySelectedTotal.toLocaleString("id-ID")}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <a
                            href={generateSplitWaLink()}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs inline-flex items-center gap-2 shadow"
                        >
                            <Share2 className="w-4 h-4" /> Bagikan Hitungan
                            Patungan ke WhatsApp ↗
                        </a>
                    </div>
                </div>

                {/* 4. FORM RATING BINTANG PELANGGAN */}
                <form
                    onSubmit={handleSubmitReview}
                    className={`p-6 rounded-3xl space-y-4 ${cardClass}`}
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-black text-sm flex items-center gap-2 text-amber-500">
                            <Star className="w-4 h-4 fill-amber-400" /> Beri
                            Rating Kopi & Pelayanan Barista Kami
                        </h3>
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setRating(num)}
                                    className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                                        rating >= num
                                            ? "bg-amber-400 text-slate-950 shadow"
                                            : "bg-black/15 opacity-60"
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
                            className={`flex-1 ${inputClass}`}
                        />
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
                        >
                            Kirim Ulasan
                        </button>
                    </div>
                </form>
            </div>

            {showReceipt && (
                <ReceiptModal
                    order={order}
                    cafeName={order.cafe?.name}
                    cafeSettings={order.cafe?.settings}
                    onClose={() => setShowReceipt(false)}
                />
            )}
        </CustomerLayout>
    );
}
