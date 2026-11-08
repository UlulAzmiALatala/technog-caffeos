import React from "react";
import { Link, router } from "@inertiajs/react";
import {
    Sparkles,
    ShieldCheck,
    Zap,
    ArrowLeft,
    Bot,
    ScanFace,
    Layers,
    ChefHat,
} from "lucide-react";

export default function GuestLayout({
    children,
    title = "Otoritas Akun",
    subtitle = "Masuk ke ekosistem manajemen kafe pintar",
}) {
    const handleInstantRoleLogin = (role) => {
        router.post(route("saas.quick-demo"), { role });
    };

    return (
        <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col lg:flex-row relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
            {/* Ambient Glow Latar */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

            {/* KOLOM KIRI: BRANDING & ARSITEKTUR TECHNOG CAFFEOS (TAMPIL DI DESKTOP) */}
            <div className="hidden lg:flex lg:w-7/12 p-12 flex-col justify-between border-r border-slate-800/80 bg-[#060B19]/80 backdrop-blur-2xl relative z-10">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-105 transition">
                            T
                        </div>
                        <div>
                            <span className="text-lg font-black tracking-wider">
                                TECHNOG{" "}
                                <span className="text-emerald-400">
                                    CAFFEOS
                                </span>
                            </span>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Multi-Tenant Smart Cafe SaaS
                            </span>
                        </div>
                    </Link>

                    <Link
                        href="/"
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />{" "}
                        Kembali ke Portal Depan
                    </Link>
                </div>

                <div className="space-y-6 max-w-xl my-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black">
                        <Sparkles className="w-3.5 h-3.5" /> Enterprise
                        Authentication Gateway
                    </div>

                    <h1 className="text-4xl font-black tracking-tight leading-tight">
                        Kendalikan Kasir POS, Dapur KDS &{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            AI Database Co-Worker
                        </span>{" "}
                        dalam Satu Pintu.
                    </h1>

                    <p className="text-xs text-slate-400 leading-relaxed">
                        Sistem manajemen kafe terpadu dengan 3 template desain
                        adaptif, kalkulasi HPP resep otomatis, presensi
                        biometrik wajah & GPS, serta integrasi panggilan meja
                        pelanggan secara real-time.
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                            <Bot className="w-5 h-5 text-purple-400" />
                            <p className="font-black text-white">
                                Live SQL + Gemini AI
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Asisten cerdas pembaca 12 tabel database kafe
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                            <ScanFace className="w-5 h-5 text-emerald-400" />
                            <p className="font-black text-white">
                                64-Point Biometric & GPS
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Verifikasi wajah staf & radius lokasi kafe
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                            <ChefHat className="w-5 h-5 text-amber-400" />
                            <p className="font-black text-white">
                                Smart KDS & Waiter Call
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Stopwatch SLA barista & panggilan meja live
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                            <Layers className="w-5 h-5 text-cyan-400" />
                            <p className="font-black text-white">
                                3 Tema UI Multi-Tenant
                            </p>
                            <p className="text-[11px] text-slate-400">
                                CyberDark, Minimalist Wood & Neo-Brutalist
                            </p>
                        </div>
                    </div>

                    {/* Panel 1-Click Quick Demo Login di Layout Auth */}
                    <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" /> Pintasan Masuk Cepat
                            (1-Klik Demo Tanpa Ketik Password):
                        </span>
                        <div className="grid grid-cols-3 gap-2 text-xs font-black">
                            <button
                                type="button"
                                onClick={() => handleInstantRoleLogin("owner")}
                                className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow"
                            >
                                👑 Login Owner
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleInstantRoleLogin("cashier")
                                }
                                className="py-2.5 rounded-xl bg-slate-900 hover:bg-cyan-400 hover:text-slate-950 border border-slate-800 text-cyan-400 transition"
                            >
                                💻 Login Cashier
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleInstantRoleLogin("barista")
                                }
                                className="py-2.5 rounded-xl bg-slate-900 hover:bg-amber-400 hover:text-slate-950 border border-slate-800 text-amber-400 transition"
                            >
                                ☕ Login Barista
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                        © {new Date().getFullYear()} TechnoG Solutions •
                        Enterprise SaaS Architecture
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <ShieldCheck className="w-4 h-4" /> Role-Based Security
                        Active
                    </span>
                </div>
            </div>

            {/* KOLOM KANAN: CONTAINER FORM AUTH (LOGIN, REGISTER, FORGOT PASSWORD, DLL) */}
            <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
                <div className="w-full max-w-md space-y-6">
                    {/* Header Mobile */}
                    <div className="lg:hidden flex items-center justify-between mb-4">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-950">
                                T
                            </div>
                            <span className="font-black text-base">
                                TECHNOG{" "}
                                <span className="text-emerald-400">
                                    CAFFEOS
                                </span>
                            </span>
                        </Link>
                        <Link
                            href="/"
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Beranda
                        </Link>
                    </div>

                    {/* Kartu Utama Form Auth */}
                    <div className="p-7 sm:p-8 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-6">
                        <div className="border-b border-slate-800 pb-4">
                            <h2 className="text-xl font-black text-white">
                                {title}
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                {subtitle}
                            </p>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
