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
    Tv,
    WalletCards,
    Bell,
    Globe,
} from "lucide-react";

export default function CaffeOSLayout({
    children,
    templates = [],
    tables = [],
}) {
    const { auth, flash } = usePage().props;
    const userRole = auth.user?.role || "cashier";
    const activeSlug = auth.activeTemplate || "cyber-dark";

    const navItems = [
        {
            name: "Super Admin SaaS (HQ)",
            href: route("superadmin.dashboard"),
            active: route().current("superadmin.*"),
            icon: Globe,
            roles: ["owner"],
        },
        {
            name: "Owner Monitoring & AI",
            href: route("owner.dashboard"),
            active: route().current("owner.*"),
            icon: LayoutDashboard,
            roles: ["owner"],
        },
        {
            name: "Kasir POS & Call Queue",
            href: route("pos.index"),
            active: route().current("pos.index"),
            icon: Monitor,
            roles: ["owner", "cashier", "barista"],
        },
        {
            name: "Dapur, Menu & Promo",
            href: route("management.index"),
            active: route().current("management.*"),
            icon: ChefHat,
            roles: ["owner", "barista", "cashier"],
        },
        {
            name: "Keuangan & Riwayat Struk",
            href: route("finance.index"),
            active: route().current("finance.*"),
            icon: WalletCards,
            roles: ["owner", "cashier"],
        },
        {
            name: "Layar TV Antrean",
            href: route("pos.queue-board"),
            active: route().current("pos.queue-board"),
            icon: Tv,
            roles: ["owner", "cashier", "barista"],
        },
    ].filter((item) => item.roles.includes(userRole));

    const handleSwitchTemplate = (templateId) => {
        router.post(route("pos.switch-template"), { template_id: templateId });
    };

    const handleLogout = () => {
        router.post(route("logout"));
    };

    const themeStyles = {
        "cyber-dark": {
            wrapper: "bg-slate-950 text-slate-100",
            sidebar:
                "bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 text-slate-100",
            header: "bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 text-slate-100",
            brandBox:
                "bg-slate-950 border border-emerald-500/30 text-emerald-400",
            roleBadge:
                "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
            navActive:
                "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-extrabold",
            navInactive: "text-slate-300 hover:bg-slate-800/80",
            qrChip: "bg-slate-950 border border-slate-800 text-emerald-300 hover:border-emerald-500/50",
            tplActive: "bg-emerald-500 text-slate-950 font-extrabold",
            tplInactive:
                "bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800",
            logoutBtn:
                "bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300",
        },
        "minimalist-wood": {
            wrapper: "bg-amber-50/70 text-stone-800",
            sidebar:
                "bg-amber-950 text-amber-50 border-r border-amber-900 shadow-xl",
            header: "bg-white border-b border-amber-200 text-stone-800 shadow-sm",
            brandBox:
                "bg-amber-900/80 border border-amber-700 text-amber-300 font-serif",
            roleBadge: "bg-amber-400 text-amber-950",
            navActive: "bg-amber-400 text-amber-950 shadow-md font-extrabold",
            navInactive: "text-amber-100/80 hover:bg-amber-900",
            qrChip: "bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-200",
            tplActive: "bg-amber-900 text-amber-100 font-bold",
            tplInactive:
                "bg-amber-50 text-stone-600 hover:bg-amber-100 border border-amber-200",
            logoutBtn:
                "bg-red-900/70 hover:bg-red-800 text-amber-100 border border-red-700",
        },
        "neo-brutal": {
            wrapper: "bg-yellow-300 text-black",
            sidebar: "bg-white text-black border-r-4 border-black",
            header: "bg-cyan-300 text-black border-b-4 border-black",
            brandBox:
                "bg-pink-400 border-2 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
            roleBadge: "bg-yellow-300 border-2 border-black text-black",
            navActive:
                "bg-lime-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black",
            navInactive:
                "text-black hover:bg-yellow-200 font-bold border-2 border-transparent",
            qrChip: "bg-white border-2 border-black text-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-lime-300",
            tplActive:
                "bg-pink-400 text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
            tplInactive:
                "bg-white text-black border-2 border-black font-bold hover:bg-yellow-100",
            logoutBtn:
                "bg-red-400 hover:bg-red-300 text-black border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
        },
    };

    const currentStyle = themeStyles[activeSlug] || themeStyles["cyber-dark"];

    return (
        <div className={`min-h-screen flex ${currentStyle.wrapper}`}>
            <aside
                className={`w-64 flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30 ${currentStyle.sidebar}`}
            >
                <div className="p-5 space-y-6 overflow-y-auto">
                    <div className={`p-4 rounded-2xl ${currentStyle.brandBox}`}>
                        <div className="flex items-center gap-2 font-extrabold text-base">
                            <Sparkles className="w-5 h-5 shrink-0" />
                            <span className="truncate">
                                {auth.cafe?.name || "TechnoG CaffeOS"}
                            </span>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between text-xs">
                            <span className="truncate opacity-85 font-medium">
                                {auth.user?.name}
                            </span>
                            <span
                                className={`px-2 py-0.5 rounded-md uppercase font-extrabold text-[10px] ${currentStyle.roleBadge}`}
                            >
                                {userRole}
                            </span>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider opacity-60">
                            Menu Navigasi ({userRole})
                        </p>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-3 transition ${
                                        item.active
                                            ? currentStyle.navActive
                                            : currentStyle.navInactive
                                    }`}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {tables.length > 0 && (
                        <div className="space-y-2 pt-3 border-t border-current/10">
                            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider opacity-60 flex items-center gap-1">
                                <QrCode className="w-3.5 h-3.5" /> Simulasi QR
                                Pelanggan
                            </p>
                            <div className="grid grid-cols-2 gap-1.5 px-1">
                                {tables.map((t) => (
                                    <a
                                        key={t.id}
                                        href={route("customer.scan", t.qr_code)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`px-2 py-1.5 rounded-lg text-[11px] font-mono text-center transition ${currentStyle.qrChip}`}
                                    >
                                        Meja {t.table_number} ↗
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-current/10">
                    <button
                        onClick={handleLogout}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${currentStyle.logoutBtn}`}
                    >
                        <LogOut className="w-4 h-4" /> Keluar ({userRole})
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header
                    className={`sticky top-0 z-20 px-6 py-3 flex flex-wrap justify-between items-center gap-4 ${currentStyle.header}`}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg bg-black/10">
                            🎨 Tema Aktif: {activeSlug.toUpperCase()}
                        </span>
                        <span className="hidden md:inline-block text-xs opacity-75 font-medium">
                            Sidebar + Header Terpadu • Satu Mesin Fitur Seragam
                        </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        {templates.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold flex items-center gap-1 mr-1 opacity-80">
                                    <Palette className="w-4 h-4" /> Ganti
                                    Template UI:
                                </span>
                                {templates.map((tpl) => (
                                    <button
                                        key={tpl.id}
                                        onClick={() =>
                                            handleSwitchTemplate(tpl.id)
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1 ${
                                            activeSlug === tpl.slug
                                                ? currentStyle.tplActive
                                                : currentStyle.tplInactive
                                        }`}
                                    >
                                        <span>{tpl.name}</span>
                                        {activeSlug === tpl.slug && (
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </header>

                {flash?.success && (
                    <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex flex-wrap justify-between items-center gap-2 shadow">
                        <span className="flex items-center gap-2">
                            <Bell className="w-4 h-4" /> {flash.success}
                        </span>
                        {flash.ai_token && (
                            <span className="px-3 py-0.5 rounded-full bg-slate-950 text-purple-300 font-mono">
                                Token AI Terbit: {flash.ai_token}
                            </span>
                        )}
                    </div>
                )}

                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
