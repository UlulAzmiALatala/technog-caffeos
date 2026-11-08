import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    Sparkles,
    Monitor,
    ChefHat,
    Bot,
    QrCode,
    ShieldCheck,
    ScanFace,
    PieChart,
    Layers,
    ArrowRight,
    CheckCircle2,
    Building2,
    Zap,
    LogIn,
    Globe,
} from "lucide-react";

export default function Welcome({
    auth,
    templates = [],
    totalCafes = 1,
    totalOrders = 0,
    sampleTableQr = "CAFEOS-TBL-01",
}) {
    const [form, setForm] = useState({
        cafe_name: "",
        address: "",
        template_id: templates[0]?.id || 1,
        owner_name: "",
        email: "",
        phone: "",
        password: "",
    });

    const handleRegisterTenant = (e) => {
        e.preventDefault();
        router.post(route("saas.register-cafe"), form);
    };

    const handleQuickDemo = (role) => {
        router.post(route("saas.quick-demo"), { role });
    };

    return (
        <div className="min-h-screen bg-[#040814] text-slate-100 selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden">
            <Head title="TechnoG CaffeOS — Multi-Tenant Smart Cafe ERP & AI Co-Worker SaaS" />

            {/* Dekorasi Ambient Cahaya Latar */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

            {/* 1. NAVBAR EKSEKUTIF */}
            <header className="sticky top-0 z-40 bg-[#040814]/80 backdrop-blur-2xl border-b border-slate-800/80 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-slate-950 text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                            T
                        </div>
                        <div>
                            <span className="text-lg font-black tracking-wider">
                                TECHNOG{" "}
                                <span className="text-emerald-400">
                                    CAFFEOS
                                </span>
                            </span>
                            <span className="ml-2 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase">
                                Enterprise SaaS
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold">
                        <a
                            href={route("customer.scan", sampleTableQr)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 flex items-center gap-1.5 transition"
                        >
                            <QrCode className="w-4 h-4" /> Simulasi Scan QR
                            Pelanggan ↗
                        </a>

                        {auth?.user ? (
                            <Link
                                href={route("dashboard")}
                                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center gap-1.5 shadow-lg"
                            >
                                Buka Dashboard ({auth.user.role.toUpperCase()}){" "}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <Link
                                href={route("login")}
                                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-black flex items-center gap-1.5"
                            >
                                <LogIn className="w-4 h-4 text-emerald-400" />{" "}
                                Login Staf / Owner
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 space-y-16 relative z-10">
                {/* 2. HERO SECTION & 1-CLICK LIVE ROLE LAUNCHER */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-black">
                            <Sparkles className="w-4 h-4" /> Multi-Template POS
                            • Biometric FaceID • Hybrid AI Co-Worker
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.15]">
                            Sistem Operasi Kafe Pintar &{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                                AI Co-Worker Space
                            </span>{" "}
                            Pertama di Indonesia.
                        </h1>

                        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
                            Satu mesin ERP kafe seragam dengan{" "}
                            <strong>3 Template UI Adaptif</strong>, pemotongan
                            stok resep otomatis per gram/ml,{" "}
                            <strong>Kalkulator HPP Menu Engineering</strong>,{" "}
                            <strong>Presensi Wajah & Geofencing GPS</strong>,
                            hingga <strong>Token AI Co-Worker</strong> di setiap
                            struk pelanggan.
                        </p>

                        {/* Panel 1-Click Live Demo Role Switcher */}
                        <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/30 space-y-3 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                    <Zap className="w-4 h-4" /> Instant Live
                                    Demo Launcher (1-Klik Tanpa Ketik Password)
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">
                                    {totalCafes} Tenant Aktif • {totalOrders}{" "}
                                    Transaksi
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                <button
                                    type="button"
                                    onClick={() => handleQuickDemo("owner")}
                                    className="p-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex flex-col items-start gap-1 shadow-lg transition"
                                >
                                    <span className="flex items-center gap-1.5 text-sm">
                                        👑 Masuk sbg OWNER
                                    </span>
                                    <span className="text-[10px] opacity-80 font-bold">
                                        Akses Penuh 12 Modul + Audit CCTV
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleQuickDemo("cashier")}
                                    className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white font-black text-xs flex flex-col items-start gap-1 transition"
                                >
                                    <span className="flex items-center gap-1.5 text-sm text-cyan-400">
                                        💻 Masuk sbg CASHIER
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-semibold">
                                        POS Kasir, Shift Laci & Loyalty WA
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleQuickDemo("barista")}
                                    className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-white font-black text-xs flex flex-col items-start gap-1 transition"
                                >
                                    <span className="flex items-center gap-1.5 text-sm text-amber-400">
                                        ☕ Masuk sbg BARISTA
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-semibold">
                                        Smart KDS Stopwatch, Resep & PO
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* 6 Fitur Unggulan Grid Kecil */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                            {[
                                {
                                    icon: Layers,
                                    title: "3 Tema UI Instan",
                                    desc: "CyberDark, Wood & Brutal",
                                },
                                {
                                    icon: Bot,
                                    title: "Hybrid AI Engine",
                                    desc: "Baca 12 Tabel SQL + Gemini",
                                },
                                {
                                    icon: ScanFace,
                                    title: "Biometrik Wajah & GPS",
                                    desc: "64-Point Face Match & Radius",
                                },
                                {
                                    icon: PieChart,
                                    title: "Menu Engineering",
                                    desc: "Kalkulator HPP & 4 Kuadran",
                                },
                                {
                                    icon: ChefHat,
                                    title: "Smart KDS SLA",
                                    desc: "Stopwatch Racik & Voice Call",
                                },
                                {
                                    icon: QrCode,
                                    title: "QR Meja & Split Bill",
                                    desc: "WiFi & AI Terbuka Saat Lunas",
                                },
                            ].map((feat, i) => {
                                const Icon = feat.icon;
                                return (
                                    <div
                                        key={i}
                                        className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1"
                                    >
                                        <Icon className="w-4 h-4 text-emerald-400" />
                                        <p className="font-black text-white">
                                            {feat.title}
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            {feat.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. FORM REGISTRASI TENANT KAFE BARU (ONBOARDING SAAS) */}
                    <div className="lg:col-span-5">
                        <form
                            onSubmit={handleRegisterTenant}
                            className="p-7 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800 shadow-2xl space-y-4"
                        >
                            <div className="border-b border-slate-800 pb-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5" />{" "}
                                    Multi-Tenant SaaS Onboarding
                                </span>
                                <h2 className="text-xl font-black mt-1">
                                    Daftarkan Brand Kafe Baru Anda
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Otomatis membuat workspace kafe, meja QR,
                                    stok awal, dan akun Owner dalam 3 detik.
                                </p>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="font-bold text-slate-300">
                                        Nama Brand Kafe *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Kosta Coffee Roastery"
                                        value={form.cafe_name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                cafe_name: e.target.value,
                                            })
                                        }
                                        className="w-full mt-1 rounded-xl bg-slate-950 border-slate-800 text-xs text-white"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-slate-300">
                                        Alamat Cabang Kafe *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Jl. Ir. H. Juanda, Palu / Yogyakarta"
                                        value={form.address}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                address: e.target.value,
                                            })
                                        }
                                        className="w-full mt-1 rounded-xl bg-slate-950 border-slate-800 text-xs text-white"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-slate-300">
                                        Pilih Template Desain Kasir & QR
                                    </label>
                                    <select
                                        value={form.template_id}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                template_id: e.target.value,
                                            })
                                        }
                                        className="w-full mt-1 rounded-xl bg-slate-950 border-slate-800 text-xs text-emerald-400 font-bold"
                                    >
                                        {templates.map((tpl) => (
                                            <option key={tpl.id} value={tpl.id}>
                                                🎨 {tpl.name} ({tpl.slug})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="font-bold text-slate-300">
                                            Nama Owner *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nama Lengkap"
                                            value={form.owner_name}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    owner_name: e.target.value,
                                                })
                                            }
                                            className="w-full mt-1 rounded-xl bg-slate-950 border-slate-800 text-xs text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-300">
                                            No. WhatsApp *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="0812..."
                                            value={form.phone}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    phone: e.target.value,
                                                })
                                            }
                                            className="w-full mt-1 rounded-xl bg-slate-950 border-slate-800 text-xs text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="font-bold text-slate-300">
                                            Email Login Owner *
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="owner@kafe.com"
                                            value={form.email}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="w-full mt-1 rounded-xl bg-slate-950 border-slate-800 text-xs text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-bold text-slate-300">
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            required
                                            placeholder="Min. 6 Karakter"
                                            value={form.password}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    password: e.target.value,
                                                })
                                            }
                                            className="w-full mt-1 rounded-xl bg-slate-950 border-slate-800 text-xs text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                            >
                                🚀 Buat Workspace Kafe Saya Sekarang
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
