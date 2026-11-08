import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    QrCode,
    Wifi,
    Copy,
    Lock,
    Coffee,
    Bot,
    CheckCircle2,
    XCircle,
    X,
    ShoppingBag,
} from "lucide-react";

export default function CustomerLayout({
    children,
    cafe,
    table,
    activeTemplate = "cyber-dark",
    activePage = "menu", // 'menu' | 'status'
    currentOrderCode = null,
    isWifiUnlocked = false,
    cartCount = 0,
    onOpenCartDrawer = null,
}) {
    const { flash, errors } = usePage().props;
    const [toasts, setToasts] = useState([]);
    const [savedOrderCode, setSavedOrderCode] = useState(null);
    const [savedTableQr, setSavedTableQr] = useState(null);

    const wifiPass = cafe?.settings?.wifi_password || "kopitechnog123";

    useEffect(() => {
        if (table?.qr_code) {
            localStorage.setItem("caffeos_last_table_qr", table.qr_code);
            setSavedTableQr(table.qr_code);
        } else {
            setSavedTableQr(localStorage.getItem("caffeos_last_table_qr"));
        }

        if (currentOrderCode) {
            localStorage.setItem("caffeos_last_order_code", currentOrderCode);
            setSavedOrderCode(currentOrderCode);
        } else {
            setSavedOrderCode(localStorage.getItem("caffeos_last_order_code"));
        }
    }, [table?.qr_code, currentOrderCode]);

    const pushToast = (message, type = "success") => {
        if (!message) return;
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4200);
    };

    useEffect(() => {
        if (flash?.success) pushToast(flash.success, "success");
        if (flash?.error) pushToast(flash.error, "error");
    }, [flash]);

    useEffect(() => {
        const keys = Object.keys(errors || {});
        if (keys.length > 0) {
            pushToast(errors[keys[0]], "error");
        }
    }, [errors]);

    const handleWifiClick = () => {
        if (!isWifiUnlocked) {
            pushToast(
                "🔒 Akses Free WiFi masih terkunci! Selesaikan pemesanan & pembayaran Anda terlebih dahulu untuk membuka Password WiFi & AI Co-Worker.",
                "error",
            );
            return;
        }
        navigator.clipboard.writeText(wifiPass);
        pushToast(
            `📶 Password Free WiFi "${wifiPass}" berhasil disalin!`,
            "success",
        );
    };

    const themeMap = {
        "cyber-dark": {
            wrapper: "bg-[#050811] text-slate-100",
            header: "bg-[#090E1A]/85 backdrop-blur-2xl border-b border-emerald-500/20 text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)]",
            brandBadge:
                "bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]",
            tablePill:
                "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300",
            wifiUnlockedPill:
                "bg-slate-900/90 border border-emerald-500/50 text-emerald-300 hover:border-emerald-400",
            wifiLockedPill:
                "bg-slate-900/80 border border-amber-500/40 text-amber-300 hover:bg-amber-500/10",
            bottomDock:
                "bg-[#090E1A]/95 backdrop-blur-2xl border border-slate-800 text-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.7)]",
            dockActive:
                "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black shadow-lg shadow-emerald-500/25",
        },
        "minimalist-wood": {
            wrapper: "bg-[#FAF5EE] text-stone-800",
            header: "bg-[#231710]/95 backdrop-blur-2xl border-b border-amber-800 text-amber-50 shadow-md",
            brandBadge:
                "bg-gradient-to-br from-amber-300 to-amber-600 text-amber-950 shadow-md",
            tablePill: "bg-amber-400 text-amber-950",
            wifiUnlockedPill:
                "bg-amber-900/80 border border-emerald-400 text-emerald-300",
            wifiLockedPill:
                "bg-amber-900/60 border border-amber-700 text-amber-200",
            bottomDock:
                "bg-[#231710]/95 backdrop-blur-2xl border border-amber-800 text-amber-100 shadow-2xl",
            dockActive: "bg-amber-400 text-amber-950 font-black shadow-md",
        },
        "neo-brutal": {
            wrapper: "bg-yellow-300 text-black",
            header: "bg-cyan-300 border-b-4 border-black text-black",
            brandBadge:
                "bg-pink-400 border-2 border-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
            tablePill:
                "bg-lime-400 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
            wifiUnlockedPill:
                "bg-lime-300 border-2 border-black text-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
            wifiLockedPill:
                "bg-amber-200 border-2 border-black text-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
            bottomDock:
                "bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
            dockActive:
                "bg-pink-400 border-2 border-black text-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
        },
    };

    const currentTheme = themeMap[activeTemplate] || themeMap["cyber-dark"];

    return (
        <div
            className={`min-h-screen flex flex-col justify-between pb-28 relative overflow-x-hidden ${currentTheme.wrapper}`}
        >
            <style>{`
                @keyframes customer-comet {
                    0% { transform: translateX(110vw); }
                    100% { transform: translateX(-30vw); }
                }
                @keyframes toast-line {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>

            {/* FLOATING TOAST KANAN ATAS */}
            <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
                {toasts.map((t) => {
                    const isError = t.type === "error";
                    return (
                        <div
                            key={t.id}
                            className={`pointer-events-auto relative overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-2xl border p-4 shadow-2xl text-white ${
                                isError
                                    ? "border-rose-500"
                                    : "border-emerald-500"
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`p-1.5 rounded-xl ${isError ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}
                                >
                                    {isError ? (
                                        <XCircle className="w-5 h-5" />
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="flex-1 text-xs font-bold leading-relaxed">
                                    {t.message}
                                </div>
                                <button
                                    onClick={() =>
                                        setToasts((prev) =>
                                            prev.filter((i) => i.id !== t.id),
                                        )
                                    }
                                    className="text-slate-400 hover:text-white"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div
                                className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r animate-[toast-line_4.2s_linear_forwards] ${
                                    isError
                                        ? "from-rose-500 to-amber-500"
                                        : "from-emerald-400 to-teal-500"
                                }`}
                            />
                        </div>
                    );
                })}
            </div>

            {/* 1. HEADER UTAMA CUSTOMER SUPER-APP */}
            <header
                className={`sticky top-0 z-40 px-4 sm:px-8 py-3.5 transition-all relative overflow-hidden ${currentTheme.header}`}
            >
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-1/2 -translate-y-1/2 w-full animate-[customer-comet_24s_linear_infinite]">
                        <div className="flex items-center opacity-50">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_2px_#10b981]" />
                            <div className="h-[1.5px] w-36 bg-gradient-to-r from-emerald-500 via-teal-400/20 to-transparent" />
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-3 relative z-10">
                    <div className="flex items-center gap-3.5">
                        <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${currentTheme.brandBadge}`}
                        >
                            ☕
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base sm:text-lg font-black tracking-tight leading-none">
                                    {cafe?.name || "TechnoG CaffeOS"}
                                </h1>
                                {table && (
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${currentTheme.tablePill}`}
                                    >
                                        <QrCode className="w-3 h-3" /> Meja #
                                        {table.table_number}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] opacity-70 font-medium mt-1">
                                Smart Self-Order & AI Co-Worker Space • Tema:{" "}
                                {activeTemplate.toUpperCase()}
                            </p>
                        </div>
                    </div>

                    {/* Tombol Status WiFi (Terkunci sebelum order, Terbuka setelah order lunas) */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleWifiClick}
                            className={`px-3 py-2 rounded-2xl text-xs font-mono flex items-center gap-1.5 transition active:scale-95 ${
                                isWifiUnlocked
                                    ? currentTheme.wifiUnlockedPill
                                    : currentTheme.wifiLockedPill
                            }`}
                        >
                            {isWifiUnlocked ? (
                                <>
                                    <Wifi className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">
                                        Free WiFi:
                                    </span>
                                    <strong>{wifiPass}</strong>
                                    <Copy className="w-3 h-3 opacity-70" />
                                </>
                            ) : (
                                <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>WiFi: Terkunci (Pesan Dulu)</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* 2. KONTEN UTAMA PELANGGAN */}
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6">
                {children}
            </main>

            {/* 3. FLOATING BOTTOM NAVIGATION DOCK */}
            <div className="fixed bottom-4 inset-x-0 z-40 px-4 pointer-events-none">
                <div
                    className={`max-w-lg mx-auto p-2 rounded-3xl flex items-center justify-between gap-2 pointer-events-auto ${currentTheme.bottomDock}`}
                >
                    {savedTableQr ? (
                        <Link
                            href={route("customer.scan", savedTableQr)}
                            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                                activePage === "menu"
                                    ? currentTheme.dockActive
                                    : "opacity-75 hover:opacity-100"
                            }`}
                        >
                            <Coffee className="w-4 h-4" />
                            <span>Katalog Menu</span>
                        </Link>
                    ) : (
                        <div
                            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 ${activePage === "menu" ? currentTheme.dockActive : "opacity-50"}`}
                        >
                            <Coffee className="w-4 h-4" />
                            <span>Katalog Menu</span>
                        </div>
                    )}

                    {savedOrderCode ? (
                        <Link
                            href={route(
                                "customer.order-status",
                                savedOrderCode,
                            )}
                            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                                activePage === "status"
                                    ? currentTheme.dockActive
                                    : "opacity-75 hover:opacity-100"
                            }`}
                        >
                            <Bot className="w-4 h-4" />
                            <span>Status, WiFi & AI</span>
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() =>
                                pushToast(
                                    "🔒 Silakan pesan minimal 1 menu terlebih dahulu untuk membuka akses Free WiFi & AI Co-Worker!",
                                    "error",
                                )
                            }
                            className="flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 opacity-60 hover:opacity-90"
                        >
                            <Lock className="w-3.5 h-3.5" />
                            <span>WiFi & AI Terkunci</span>
                        </button>
                    )}

                    {activePage === "menu" && onOpenCartDrawer && (
                        <button
                            type="button"
                            onClick={onOpenCartDrawer}
                            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span>{cartCount}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
