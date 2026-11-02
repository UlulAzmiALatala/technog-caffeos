import React from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Monitor,
    ChefHat,
    QrCode,
    LogOut,
    Sparkles,
    Palette,
    ShieldCheck,
} from "lucide-react";

export default function CaffeOSLayout({
    children,
    templates = [],
    tables = [],
}) {
    const { auth, flash } = usePage().props;
    const userRole = auth.user?.role || "cashier";
    const isWoodTemplate = auth.activeTemplate === "minimalist-wood";

    // Daftar Menu Navigasi Berdasarkan Role (Owner = Super Admin, Cashier, Barista)
    const navItems = [
        {
            name: "Owner Monitoring & AI",
            href: route("owner.dashboard"),
            active: route().current("owner.*"),
            icon: LayoutDashboard,
            roles: ["owner"], // Khusus Owner
        },
        {
            name: "Kasir POS & Call Queue",
            href: route("pos.index"),
            active: route().current("pos.*"),
            icon: Monitor,
            roles: ["owner", "cashier", "barista"],
        },
        {
            name: "Dapur, Menu & Stok",
            href: route("management.index"),
            active: route().current("management.*"),
            icon: ChefHat,
            roles: ["owner", "barista", "cashier"],
        },
    ].filter((item) => item.roles.includes(userRole));

    const handleSwitchTemplate = (templateId) => {
        router.post(route("pos.switch-template"), { template_id: templateId });
    };

    const handleLogout = () => {
        router.post(route("logout"));
    };

    // =========================================================================
    // LAYOUT A: TOP HEADER (Aktif jika memilih Template "Minimalist Warm Wood")
    // =========================================================================
    if (isWoodTemplate) {
        return (
            <div className="min-h-screen bg-amber-50/70 text-stone-800 flex flex-col">
                <header className="bg-amber-950 text-amber-50 shadow-md sticky top-0 z-30">
                    <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-wrap justify-between items-center gap-4">
                        {/* Brand & Role Info */}
                        <div className="flex items-center gap-6">
                            <div>
                                <span className="text-lg font-serif font-bold text-amber-300 tracking-wide">
                                    ☕ {auth.cafe?.name}
                                </span>
                                <span className="ml-2.5 px-2 py-0.5 text-[11px] rounded bg-amber-800 text-amber-200 uppercase font-bold">
                                    {userRole}
                                </span>
                            </div>

                            {/* Menu Navigasi Horizontal (Header) */}
                            <nav className="flex items-center gap-2">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
                                                item.active
                                                    ? "bg-amber-400 text-amber-950 shadow-sm"
                                                    : "text-amber-100 hover:bg-amber-900"
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />{" "}
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Switcher Template & Logout */}
                        <div className="flex items-center gap-3 text-xs">
                            {templates.length > 0 && (
                                <div className="flex items-center gap-1 bg-amber-900/80 p-1 rounded-lg border border-amber-800">
                                    <Palette className="w-3.5 h-3.5 text-amber-300 ml-1.5 mr-1" />
                                    {templates.map((tpl) => (
                                        <button
                                            key={tpl.id}
                                            onClick={() =>
                                                handleSwitchTemplate(tpl.id)
                                            }
                                            className={`px-2.5 py-1 rounded font-semibold transition ${
                                                auth.activeTemplate === tpl.slug
                                                    ? "bg-amber-300 text-amber-950"
                                                    : "text-amber-200 hover:bg-amber-800"
                                            }`}
                                        >
                                            {tpl.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 rounded-lg bg-red-800/80 hover:bg-red-700 text-white font-semibold flex items-center gap-1"
                            >
                                <LogOut className="w-3.5 h-3.5" /> Keluar
                            </button>
                        </div>
                    </div>

                    {/* Sub-Header Simulasi QR & Flash Message */}
                    <div className="bg-amber-900/90 px-6 py-1.5 text-xs flex justify-between items-center border-t border-amber-800/60">
                        <div className="flex items-center gap-2">
                            <span className="text-amber-200">
                                📱 Buka Link QR Pelanggan:
                            </span>
                            {tables.map((t) => (
                                <a
                                    key={t.id}
                                    href={route("customer.scan", t.qr_code)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 hover:bg-amber-400 hover:text-amber-950 font-mono transition"
                                >
                                    Meja {t.table_number} ↗
                                </a>
                            ))}
                        </div>
                        {flash?.success && (
                            <span className="text-emerald-300 font-semibold">
                                ✨ {flash.success}{" "}
                                {flash.ai_token &&
                                    `| Token AI: ${flash.ai_token}`}
                            </span>
                        )}
                    </div>
                </header>

                <main className="flex-1">{children}</main>
            </div>
        );
    }

    // =========================================================================
    // LAYOUT B: LEFT SIDEBAR (Aktif jika memilih Template "CyberDark")
    // =========================================================================
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex">
            {/* Sidebar Kiri */}
            <aside className="w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between shrink-0 sticky top-0 h-screen">
                <div className="p-5 space-y-6">
                    {/* Identitas Kafe & Role */}
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/20">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                            <Sparkles className="w-5 h-5" /> {auth.cafe?.name}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                            <span>{auth.user?.name}</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase font-bold text-[10px]">
                                {userRole}
                            </span>
                        </div>
                    </div>

                    {/* Menu Navigasi Vertikal (Sidebar) */}
                    <div className="space-y-1.5">
                        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Menu Operasional ({userRole})
                        </p>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition ${
                                        item.active
                                            ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                                            : "text-slate-300 hover:bg-slate-800/80"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" /> {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Pintasan Simulasi Scan QR Meja */}
                    {tables.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <QrCode className="w-3 h-3" /> Simulasi QR
                                Pelanggan
                            </p>
                            <div className="grid grid-cols-2 gap-1.5 px-2">
                                {tables.map((t) => (
                                    <a
                                        key={t.id}
                                        href={route("customer.scan", t.qr_code)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/40 text-emerald-300 text-[11px] font-mono text-center transition"
                                    >
                                        Meja {t.table_number} ↗
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bagian Bawah Sidebar: Switcher Template & Logout */}
                <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/50">
                    {templates.length > 0 && (
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                                <Palette className="w-3.5 h-3.5 text-emerald-400" />{" "}
                                Tema Layout Aktif
                            </span>
                            <div className="grid grid-cols-1 gap-1.5">
                                {templates.map((tpl) => (
                                    <button
                                        key={tpl.id}
                                        onClick={() =>
                                            handleSwitchTemplate(tpl.id)
                                        }
                                        className={`w-full px-3 py-1.5 rounded-lg text-xs font-bold text-left transition flex justify-between items-center ${
                                            auth.activeTemplate === tpl.slug
                                                ? "bg-emerald-500/20 border border-emerald-500 text-emerald-300"
                                                : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                                        }`}
                                    >
                                        <span>{tpl.name}</span>
                                        {auth.activeTemplate === tpl.slug && (
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center justify-center gap-2 transition"
                    >
                        <LogOut className="w-4 h-4" /> Logout ({auth.user?.role}
                        )
                    </button>
                </div>
            </aside>

            {/* Konten Utama */}
            <div className="flex-1 flex flex-col min-w-0">
                {flash?.success && (
                    <div className="bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-300 px-6 py-2.5 text-xs font-semibold flex justify-between items-center">
                        <span>✨ {flash.success}</span>
                        {flash.ai_token && (
                            <span className="px-2.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-200 font-mono">
                                Token AI Baru: {flash.ai_token}
                            </span>
                        )}
                    </div>
                )}
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
