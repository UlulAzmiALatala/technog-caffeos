import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Sparkles,
    QrCode,
    Bot,
    Layers,
    Volume2,
    ShieldCheck,
    ArrowRight,
    Store,
    CheckCircle2,
    UserCheck,
} from "lucide-react";

export default function Welcome({ templates = [], cafes = [] }) {
    const { auth } = usePage().props;
    const [form, setForm] = useState({
        cafe_name: "",
        address: "",
        template_id: templates[0]?.id || 1,
        owner_name: "",
        email: "",
        phone: "",
        password: "",
    });

    const handleRegisterCafe = (e) => {
        e.preventDefault();
        router.post(route("saas.register-cafe"), form);
    };

    const handleQuickDemo = (role) => {
        router.post(route("saas.quick-demo"), { role });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <Head title="TechnoG CaffeOS - Multi-Template Smart Cafe SaaS Platform" />

            {/* Navbar */}
            <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-extrabold text-lg tracking-tight text-white">
                                TechnoG{" "}
                                <span className="text-emerald-400">
                                    CaffeOS
                                </span>
                            </span>
                            <span className="hidden sm:inline-block ml-2 text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                                Multi-Template SaaS POS
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={route("dashboard")}
                                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                            >
                                Masuk ke Workspace (
                                {auth.user.role.toUpperCase()}){" "}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <Link
                                href={route("login")}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                            >
                                Login Akun Kafe
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
                {/* Hero Section & 1-Click Demo Role Switcher */}
                <div className="text-center max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                        <Bot className="w-4 h-4" /> Satu Mesin POS Lengkap •
                        Bebas Ganti Template UI Seketika
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                        Platform Kasir Kafe Pintar dengan{" "}
                        <span className="text-emerald-400">AI Co-Worker</span> &
                        Multi-Template
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base">
                        Dilengkapi QR Table Self-Order, Gating Token AI
                        Pelanggan, Pemotongan Resep Bahan Baku Otomatis,
                        Panggilan Suara Antrean (Call Queue), dan AI Business
                        Analyst khusus Owner.
                    </p>

                    {/* Bar 1-Click Demo Login untuk Menguji 3 Role Berbeda */}
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 max-w-xl mx-auto space-y-2.5">
                        <p className="text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-emerald-400" />
                            Mode Pengujian Instan (1-Click Masuk Sesuai Role):
                        </p>
                        <div className="grid grid-cols-3 gap-2.5">
                            <button
                                onClick={() => handleQuickDemo("owner")}
                                className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                            >
                                👑 Masuk sbg OWNER
                            </button>
                            <button
                                onClick={() => handleQuickDemo("cashier")}
                                className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                            >
                                💻 Masuk sbg CASHIER
                            </button>
                            <button
                                onClick={() => handleQuickDemo("barista")}
                                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                            >
                                ☕ Masuk sbg BARISTA
                            </button>
                        </div>
                    </div>
                </div>

                {/* Showcase 3 Template UI yang Menggunakan 1 Mesin Fitur Seragam */}
                <div className="space-y-6">
                    <div className="text-center space-y-1">
                        <h2 className="text-2xl font-bold">
                            Katalog Template Kasir & Menu Pelanggan
                        </h2>
                        <p className="text-xs text-slate-400">
                            Seluruh template di bawah ini memiliki fitur 100%
                            identik, namun dengan struktur navigasi
                            (Sidebar/Header) dan estetika berbeda.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Card Template 1 */}
                        <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-4">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
                                Left Sidebar • Dark Glassmorphism
                            </span>
                            <h3 className="text-xl font-bold text-white">
                                1. CyberDark GlassPOS
                            </h3>
                            <p className="text-xs text-slate-400">
                                Desain futuristik dengan efek kaca gelap,
                                indikator neon emerald, dan tata letak sidebar
                                vertikal untuk kafe modern & co-working space.
                            </p>
                        </div>

                        {/* Card Template 2 */}
                        <div className="p-6 rounded-2xl bg-amber-950/60 border border-amber-500/40 space-y-4">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">
                                Top Header • Warm Coffee Shop
                            </span>
                            <h3 className="text-xl font-serif font-bold text-amber-200">
                                2. Minimalist Warm Wood
                            </h3>
                            <p className="text-xs text-amber-100/70">
                                Nuansa hangat artisan roastery dengan tipografi
                                serif klasik, navigasi header atas horizontal,
                                dan katalog berbentuk daftar bersih.
                            </p>
                        </div>

                        {/* Card Template 3 */}
                        <div className="p-6 rounded-2xl bg-yellow-300 text-slate-950 border-4 border-black shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] space-y-4">
                            <span className="px-3 py-1 rounded-md text-xs font-black bg-pink-400 border-2 border-black uppercase">
                                High Contrast • Bento Grid
                            </span>
                            <h3 className="text-xl font-black uppercase">
                                3. Neo-Brutalist Pop
                            </h3>
                            <p className="text-xs font-bold text-slate-800">
                                Gaya pop-art kontras tinggi dengan garis tegas
                                hitam, bayangan retro, dan tombol aksi ekstra
                                cepat untuk kedai kopi anak muda.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Pendaftaran Tenant Kafe Baru (Multi-Tenant Onboarding) */}
                <div className="grid md:grid-cols-12 gap-8 items-center bg-slate-900/90 border border-slate-800 rounded-3xl p-8">
                    <div className="md:col-span-5 space-y-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <Store className="w-4 h-4" /> SaaS Multi-Tenant
                            Onboarding
                        </span>
                        <h2 className="text-2xl font-bold">
                            Daftarkan Kafe Baru & Pilih Template Anda Sekarang
                        </h2>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Setiap kafe yang mendaftar akan langsung mendapatkan
                            workspace terisolasi, akun Owner (Super Admin), meja
                            QR otomatis, stok awal, dan Token AI Co-Worker.
                        </p>

                        <div className="space-y-2 pt-2 text-xs text-slate-300">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />{" "}
                                Otomatis Generate Meja QR & Menu Awal
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />{" "}
                                Bebas Ganti Template Kapan Saja Tanpa Kehilangan
                                Data
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />{" "}
                                Terintegrasi AI Chatbot Pelanggan & AI Analyst
                                Owner
                            </div>
                        </div>
                    </div>

                    <form
                        onSubmit={handleRegisterCafe}
                        className="md:col-span-7 grid sm:grid-cols-2 gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800"
                    >
                        <div className="sm:col-span-2">
                            <label className="text-xs text-slate-400">
                                Pilih Template Awal Kafe
                            </label>
                            <select
                                value={form.template_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        template_id: e.target.value,
                                    })
                                }
                                className="w-full mt-1 rounded-xl bg-slate-900 border-slate-800 text-sm text-emerald-300 font-bold"
                            >
                                {templates.map((tpl) => (
                                    <option key={tpl.id} value={tpl.id}>
                                        🎨 Template: {tpl.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400">
                                Nama Kafe / Coffee Shop *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Misal: Kopi Senja Palu"
                                value={form.cafe_name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        cafe_name: e.target.value,
                                    })
                                }
                                className="w-full mt-1 rounded-xl bg-slate-900 border-slate-800 text-sm text-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-400">
                                Alamat Kafe *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Kota / Jalan..."
                                value={form.address}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        address: e.target.value,
                                    })
                                }
                                className="w-full mt-1 rounded-xl bg-slate-900 border-slate-800 text-sm text-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-400">
                                Nama Pemilik (Owner) *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Nama Anda..."
                                value={form.owner_name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        owner_name: e.target.value,
                                    })
                                }
                                className="w-full mt-1 rounded-xl bg-slate-900 border-slate-800 text-sm text-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-400">
                                Nomor WhatsApp *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="0851..."
                                value={form.phone}
                                onChange={(e) =>
                                    setForm({ ...form, phone: e.target.value })
                                }
                                className="w-full mt-1 rounded-xl bg-slate-900 border-slate-800 text-sm text-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-400">
                                Email Login Owner *
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="owner@kopisenja.id"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                className="w-full mt-1 rounded-xl bg-slate-900 border-slate-800 text-sm text-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-400">
                                Password *
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="Minimal 6 karakter"
                                value={form.password}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        password: e.target.value,
                                    })
                                }
                                className="w-full mt-1 rounded-xl bg-slate-900 border-slate-800 text-sm text-white"
                            />
                        </div>

                        <div className="sm:col-span-2 pt-2">
                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition shadow-lg shadow-emerald-500/20"
                            >
                                🚀 Buat Kafe & Masuk ke Dashboard Owner
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
