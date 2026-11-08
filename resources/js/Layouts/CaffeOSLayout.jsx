import React, { useState, useEffect, useRef } from "react";
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
    ShieldAlert,
    Tv,
    WalletCards,
    Bell,
    Globe,
    Truck,
    CalendarClock,
    UserCheck,
    Menu,
    ChevronRight,
    Cpu,
    Activity,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    X,
    UserCog,
    PieChart,
    Megaphone,
    Flame,
    Wrench,
} from "lucide-react";

export default function CaffeOSLayout({
    children,
    templates = [],
    tables = [],
}) {
    const { auth, flash, errors } = usePage().props;
    const userRole = auth.user?.role || "cashier";
    const activeSlug = auth.activeTemplate || "cyber-dark";

    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem("caffeos_sidebar_open");
        return saved !== null ? JSON.parse(saved) : true;
    });
    const sidebarWidth = sidebarOpen ? 280 : 80;

    useEffect(() => {
        localStorage.setItem(
            "caffeos_sidebar_open",
            JSON.stringify(sidebarOpen),
        );
    }, [sidebarOpen]);

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const notifRef = useRef(null);
    const profileRef = useRef(null);

    // =========================================================================
    // UNIVERSAL FLOATING TOAST ENGINE (MENANGANI BERHASIL & GAGAL DI SEMUA HALAMAN)
    // =========================================================================
    const [toasts, setToasts] = useState([]);

    const pushToast = (message, token = null, type = "success") => {
        if (!message) return;
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, token, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4500);
    };

    // 1. Pantau setiap kali request Inertia selesai (Agar klik berulang dengan pesan sama tetap muncul Toast!)
    useEffect(() => {
        const removeFinishListener = router.on("finish", () => {
            // Cek dilakukan via perubahan props di bawah
        });
        return () => removeFinishListener();
    }, []);

    // 2. Tangkap Flash Success & Flash Error dari Controller mana pun
    useEffect(() => {
        if (flash?.success) {
            pushToast(flash.success, flash.ai_token || null, "success");
        }
        if (flash?.error) {
            pushToast(flash.error, null, "error");
        }
    }, [flash]);

    // 3. Tangkap Error Validasi Form (Jika ada input kurang/salah saat klik Tambah/Simpan)
    useEffect(() => {
        const errorKeys = Object.keys(errors || {});
        if (errorKeys.length > 0) {
            const firstErrorMsg = errors[errorKeys[0]];
            pushToast(`Gagal Memproses: ${firstErrorMsg}`, null, "error");
        }
    }, [errors]);

    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target))
                setIsNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target))
                setProfileOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const timeString = currentTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    const dateString = currentTime.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    // Struktur Navigasi Lengkap Berkelompok sesuai Role
    const navGroups = [
        {
            id: "executive",
            groupTitle: "Pusat Komando",
            items: [
                {
                    name: "Super Admin SaaS",
                    subtext: "Kontrol Multi-Tenant HQ",
                    href: route("superadmin.dashboard"),
                    active: route().current("superadmin.*"),
                    icon: Globe,
                    badge: "HQ",
                    badgeColor:
                        "bg-purple-500/15 text-purple-300 border-purple-500/30",
                    roles: ["owner"],
                },
                {
                    name: "Executive Lounge",
                    subtext: "Monitoring Omzet & AI",
                    href: route("owner.dashboard"),
                    active: route().current("owner.*"),
                    icon: LayoutDashboard,
                    badge: "Live",
                    badgeColor:
                        "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                    roles: ["owner"],
                },
                {
                    name: "HPP & Menu Matrix",
                    subtext: "COGS Resep & 4 Kuadran",
                    href: route("menu-engineering.index"),
                    active: route().current("menu-engineering.*"),
                    icon: PieChart,
                    badge: "Stats",
                    badgeColor:
                        "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
                    roles: ["owner", "barista"],
                },
            ],
        },
        {
            id: "frontoffice",
            groupTitle: "Kasir & Layanan Meja",
            items: [
                {
                    name: "Kasir POS Engine",
                    subtext: "Transaksi & Shift Laci",
                    href: route("pos.index"),
                    active: route().current("pos.index"),
                    icon: Monitor,
                    badge: "POS",
                    badgeColor:
                        "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
                    roles: ["owner", "cashier"],
                },
                {
                    name: "Loyalty & WA Blast",
                    subtext: "Tukar Poin & Promo CRM",
                    href: route("marketing.index"),
                    active: route().current("marketing.*"),
                    icon: Megaphone,
                    badge: "CRM",
                    badgeColor:
                        "bg-amber-500/15 text-amber-300 border-amber-500/30",
                    roles: ["owner", "cashier"],
                },
                {
                    name: "Denah & Reservasi",
                    subtext: "Live Floor Plan Meja",
                    href: route("reservations.index"),
                    active: route().current("reservations.*"),
                    icon: CalendarClock,
                    roles: ["owner", "cashier", "barista"],
                },
                {
                    name: "Layar TV Antrean",
                    subtext: "Auto Voice Call Queue",
                    href: route("pos.queue-board"),
                    active: route().current("pos.queue-board"),
                    icon: Tv,
                    badge: "TV",
                    badgeColor:
                        "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
                    roles: ["owner", "cashier", "barista"],
                },
            ],
        },
        {
            id: "kitchen",
            groupTitle: "Dapur & Rantai Pasok",
            items: [
                {
                    name: "Smart KDS Barista",
                    subtext: "SLA Stopwatch & Resep",
                    href: route("kds.index"),
                    active: route().current("kds.*"),
                    icon: Flame,
                    badge: "SLA",
                    badgeColor:
                        "bg-rose-500/15 text-rose-300 border-rose-500/30",
                    roles: ["owner", "barista", "cashier"],
                },
                {
                    name: "Dapur & Resep Menu",
                    subtext: "Order, Promo & Member",
                    href: route("management.index"),
                    active: route().current("management.*"),
                    icon: ChefHat,
                    roles: ["owner", "barista", "cashier"],
                },
                {
                    name: "Gudang & PO Supplier",
                    subtext: "Supply Chain & Opname",
                    href: route("inventory.index"),
                    active: route().current("inventory.*"),
                    icon: Truck,
                    roles: ["owner", "barista"],
                },
                {
                    name: "Mesin & Shift Roster",
                    subtext: "Kalibrasi Alat & Jadwal",
                    href: route("operations.index"),
                    active: route().current("operations.*"),
                    icon: Wrench,
                    roles: ["owner", "barista", "cashier"],
                },
            ],
        },
        {
            id: "governance",
            groupTitle: "Keuangan & SDM Biometrik",
            items: [
                {
                    name: "Ledger Keuangan",
                    subtext: "Laba Bersih & Void Struk",
                    href: route("finance.index"),
                    active: route().current("finance.*"),
                    icon: WalletCards,
                    roles: ["owner", "cashier"],
                },
                {
                    name: "Presensi Wajah & GPS",
                    subtext: "Biometrik Staf & Rating",
                    href: route("hr.index"),
                    active: route().current("hr.*"),
                    icon: UserCheck,
                    badge: "FaceID",
                    badgeColor:
                        "bg-amber-500/15 text-amber-300 border-amber-500/30",
                    roles: ["owner", "cashier", "barista"],
                },
                {
                    name: "Payroll & Audit CCTV",
                    subtext: "Slip Gaji & Log Aktivitas",
                    href: route("governance.index"),
                    active: route().current("governance.*"),
                    icon: ShieldAlert,
                    badge: "CCTV",
                    badgeColor:
                        "bg-rose-500/15 text-rose-300 border-rose-500/30",
                    roles: ["owner"],
                },
            ],
        },
    ];

    const themeConfig = {
        "cyber-dark": {
            wrapper: "bg-slate-950 text-slate-100",
            sidebar:
                "bg-[#060B19]/95 border-r border-slate-800/80 text-slate-300",
            sidebarHeader: "bg-[#040814]/50 border-b border-slate-800/80",
            header: "bg-slate-900/80 backdrop-blur-2xl border-b border-slate-800/80 text-slate-100",
            activeItem:
                "bg-gradient-to-r from-emerald-600/25 via-emerald-500/15 to-transparent text-white border border-emerald-500/40 shadow-[0_8px_25px_-5px_rgba(16,185,129,0.25)]",
            activeIcon:
                "bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]",
            laserBar: "from-amber-400 via-emerald-400 to-teal-600",
            dropdown: "bg-slate-900/95 border border-slate-700 text-slate-100",
        },
        "minimalist-wood": {
            wrapper: "bg-amber-50/70 text-stone-800",
            sidebar:
                "bg-[#1C120C]/95 border-r border-amber-900/60 text-amber-100",
            sidebarHeader: "bg-[#120B07]/60 border-b border-amber-900/60",
            header: "bg-white/85 backdrop-blur-2xl border-b border-amber-200/80 text-stone-800",
            activeItem:
                "bg-gradient-to-r from-amber-500/30 via-amber-500/15 to-transparent text-amber-200 border border-amber-400/50 shadow-md",
            activeIcon:
                "bg-gradient-to-br from-amber-300 to-amber-600 text-amber-950 shadow-md",
            laserBar: "from-amber-300 via-amber-500 to-orange-600",
            dropdown: "bg-white/95 border border-amber-200 text-stone-800",
        },
        "neo-brutal": {
            wrapper: "bg-yellow-300 text-black",
            sidebar: "bg-white border-r-4 border-black text-black",
            sidebarHeader: "bg-pink-400 border-b-4 border-black",
            header: "bg-cyan-300 border-b-4 border-black text-black",
            activeItem:
                "bg-lime-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
            activeIcon: "bg-yellow-300 text-black border-2 border-black",
            laserBar: "from-black via-black to-black",
            dropdown:
                "bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
        },
    };

    const currentTheme = themeConfig[activeSlug] || themeConfig["cyber-dark"];
    const initial = auth.user?.name
        ? auth.user.name.charAt(0).toUpperCase()
        : "U";

    const handleSwitchTemplate = (templateId) => {
        router.post(route("pos.switch-template"), { template_id: templateId });
    };

    const handleQuickRoleSwitch = (role) => {
        router.post(route("saas.quick-demo"), { role });
    };

    const handleLogout = () => {
        router.post(route("logout"));
    };

    return (
        <div className={`min-h-screen flex ${currentTheme.wrapper}`}>
            <style>{`
                @keyframes ring-dewa {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(15deg) scale(1.1); }
                    50% { transform: rotate(-10deg) scale(1.1); }
                    75% { transform: rotate(5deg) scale(1.1); }
                }
                .animate-ring-dewa { animation: ring-dewa 1.5s ease-in-out infinite; }

                @keyframes lintas-elegan {
                    0% { transform: translateX(110vw); }
                    100% { transform: translateX(-30vw); }
                }
                @keyframes toast-progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(16, 185, 129, 0.3); border-radius: 10px; }
            `}</style>

            {/* FLOATING TOAST NOTIFICATION KANAN ATAS (HIJAU UNTUK BERHASIL, MERAH UNTUK GAGAL/ERROR) */}
            <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                {toasts.map((t) => {
                    const isError = t.type === "error";
                    return (
                        <div
                            key={t.id}
                            className={`pointer-events-auto relative overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-2xl border p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 text-white ${
                                isError
                                    ? "border-rose-500/60"
                                    : "border-emerald-500/50"
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div
                                    className={`p-2 rounded-xl shrink-0 ${
                                        isError
                                            ? "bg-rose-500/20 text-rose-400"
                                            : "bg-emerald-500/20 text-emerald-400"
                                    }`}
                                >
                                    {isError ? (
                                        <XCircle className="w-5 h-5" />
                                    ) : (
                                        <CheckCircle2 className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-[11px] font-black uppercase tracking-widest ${
                                            isError
                                                ? "text-rose-400"
                                                : "text-emerald-400"
                                        }`}
                                    >
                                        {isError
                                            ? "Peringatan / Gagal"
                                            : "Berhasil Diproses"}
                                    </p>
                                    <p className="text-xs font-bold text-slate-100 mt-0.5 leading-relaxed">
                                        {t.message}
                                    </p>
                                    {t.token && (
                                        <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-[11px] font-bold">
                                            Token AI: {t.token}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() =>
                                        setToasts((prev) =>
                                            prev.filter(
                                                (item) => item.id !== t.id,
                                            ),
                                        )
                                    }
                                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div
                                className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r animate-[toast-progress_4.5s_linear_forwards] ${
                                    isError
                                        ? "from-rose-500 to-amber-500"
                                        : "from-emerald-400 to-teal-500"
                                }`}
                            />
                        </div>
                    );
                })}
            </div>

            {/* 1. COLLAPSIBLE SIDEBAR */}
            <aside
                style={{ width: `${sidebarWidth}px` }}
                className={`fixed inset-y-0 left-0 flex flex-col z-40 shadow-[15px_0_40px_rgba(0,0,0,0.45)] select-none transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${currentTheme.sidebar}`}
            >
                {activeSlug !== "neo-brutal" && (
                    <>
                        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[90px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-10 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none translate-x-1/3" />
                    </>
                )}

                <div
                    className={`h-24 px-3 flex items-center justify-center relative shrink-0 z-20 ${currentTheme.sidebarHeader}`}
                >
                    <Link
                        href={route("dashboard")}
                        className={`flex items-center w-full group focus:outline-none transition-all duration-300 ${
                            sidebarOpen
                                ? "px-2 gap-3.5 justify-start"
                                : "justify-center"
                        }`}
                    >
                        <div className="relative flex items-center justify-center shrink-0">
                            <div className="absolute inset-0 bg-emerald-400/30 rounded-2xl blur-md group-hover:bg-emerald-400/50 transition-all duration-500" />
                            <div className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 via-emerald-500 to-teal-700 shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-emerald-200/40 group-hover:scale-105 transition-all duration-300">
                                <span className="font-black text-slate-950 text-xl tracking-tighter">
                                    T
                                </span>
                            </div>
                        </div>

                        {sidebarOpen && (
                            <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-black tracking-wider truncate">
                                        CAFFE
                                        <span className="text-emerald-400">
                                            OS
                                        </span>
                                    </span>
                                    <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                                        SaaS
                                    </span>
                                </div>
                                <span className="text-[9px] font-extrabold opacity-60 uppercase tracking-[0.18em] mt-1 truncate">
                                    {auth.cafe?.name || "TechnoG Solutions"}
                                </span>
                            </div>
                        )}
                    </Link>
                </div>

                <nav
                    className={`flex-1 py-4 overflow-y-auto custom-scrollbar space-y-5 relative z-10 ${
                        sidebarOpen ? "px-3" : "px-2"
                    }`}
                >
                    {navGroups.map((group) => {
                        const visibleItems = group.items.filter((item) =>
                            item.roles.includes(userRole),
                        );
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={group.id} className="space-y-1.5">
                                {sidebarOpen ? (
                                    <div className="px-3 mb-1.5 flex items-center gap-2">
                                        <span className="text-[9px] font-black opacity-50 uppercase tracking-[0.2em]">
                                            {group.groupTitle}
                                        </span>
                                        <div className="flex-1 h-[1px] bg-current opacity-10" />
                                    </div>
                                ) : (
                                    <div className="w-6 h-[1px] bg-current opacity-15 mx-auto my-2" />
                                )}

                                {visibleItems.map((item) => {
                                    const IconComponent = item.icon;
                                    const isActive = item.active;

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            title={
                                                !sidebarOpen
                                                    ? `${item.name} — ${item.subtext}`
                                                    : undefined
                                            }
                                            className={`relative flex items-center rounded-2xl transition-all duration-300 group ${
                                                sidebarOpen
                                                    ? "px-3 py-2.5 gap-3 justify-between w-full overflow-hidden"
                                                    : "w-12 h-12 mx-auto justify-center"
                                            } ${
                                                isActive
                                                    ? currentTheme.activeItem
                                                    : "opacity-75 hover:opacity-100 hover:bg-white/5 border border-transparent"
                                            }`}
                                        >
                                            {isActive && (
                                                <div
                                                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-gradient-to-b ${currentTheme.laserBar} rounded-r-full shadow-[0_0_12px_rgba(16,185,129,0.9)] ${
                                                        sidebarOpen
                                                            ? "h-7"
                                                            : "h-5"
                                                    }`}
                                                />
                                            )}

                                            {sidebarOpen ? (
                                                <>
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div
                                                            className={`w-9 h-9 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center ${
                                                                isActive
                                                                    ? currentTheme.activeIcon
                                                                    : "bg-slate-800/70 text-slate-300 border border-slate-700/60 group-hover:text-emerald-300"
                                                            }`}
                                                        >
                                                            <IconComponent
                                                                size={18}
                                                                strokeWidth={
                                                                    isActive
                                                                        ? 2.5
                                                                        : 2
                                                                }
                                                            />
                                                        </div>

                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-xs font-black truncate leading-snug">
                                                                {item.name}
                                                            </span>
                                                            <span className="text-[10px] opacity-65 truncate leading-tight mt-0.5">
                                                                {item.subtext}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        {item.badge && (
                                                            <span
                                                                className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${item.badgeColor}`}
                                                            >
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                        <ChevronRight
                                                            size={14}
                                                            className={`transition-all duration-300 ${
                                                                isActive
                                                                    ? "translate-x-0 opacity-100"
                                                                    : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                                                            }`}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="relative flex items-center justify-center w-full h-full">
                                                    <IconComponent
                                                        size={20}
                                                        strokeWidth={
                                                            isActive ? 2.5 : 2
                                                        }
                                                        className="transition-transform duration-300 group-hover:scale-110"
                                                    />
                                                    {item.badge && (
                                                        <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
                                                    )}
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer Sidebar */}
                <div className="p-3 border-t border-slate-800/60 bg-black/30 relative z-20 shrink-0 space-y-2">
                    {sidebarOpen ? (
                        <>
                            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-black/40 border border-white/10 text-[9px] font-black">
                                {["owner", "cashier", "barista"].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => handleQuickRoleSwitch(r)}
                                        className={`py-1 rounded-lg uppercase transition ${
                                            userRole === r
                                                ? "bg-emerald-500 text-slate-950 shadow"
                                                : "text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>

                            <div className="relative rounded-2xl p-3 bg-gradient-to-br from-slate-900/95 via-[#0A1128]/95 to-emerald-950/40 border border-slate-800/90 text-slate-200 shadow-inner overflow-hidden">
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-indigo-500 to-amber-500 opacity-70" />
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-400">
                                            CaffeOS Core Active
                                        </span>
                                    </div>
                                    <div className="flex items-end gap-0.5 h-3">
                                        <span className="w-0.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                                        <span className="w-0.5 h-2.5 bg-indigo-400 rounded-full animate-pulse [animation-delay:150ms]" />
                                        <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-pulse [animation-delay:300ms]" />
                                        <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse [animation-delay:450ms]" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between bg-[#040814]/80 px-2.5 py-1.5 rounded-xl border border-slate-800/80 mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Clock
                                            size={12}
                                            className="text-amber-400 shrink-0"
                                        />
                                        <span className="text-xs font-mono font-black text-white tracking-wider">
                                            {timeString}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                                        {dateString}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                                    <span className="flex items-center gap-1 text-indigo-300 truncate">
                                        <Cpu
                                            size={11}
                                            className="text-indigo-400 shrink-0"
                                        />
                                        AI Engine Sync
                                    </span>
                                    <span className="flex items-center gap-1 text-amber-300/90 uppercase">
                                        <ShieldCheck
                                            size={11}
                                            className="text-amber-400"
                                        />
                                        {userRole} Auth
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div
                            className="w-12 h-12 mx-auto rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center gap-1 relative cursor-help"
                            title={`CaffeOS Core Active • ${timeString}`}
                        >
                            <div className="relative flex items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-50" />
                                <Activity
                                    size={16}
                                    className="text-emerald-400 relative z-10"
                                />
                            </div>
                            <span className="text-[8px] font-mono font-black text-slate-400">
                                LIVE
                            </span>
                        </div>
                    )}
                </div>
            </aside>

            {/* 2. AREA KANAN: STICKY HEADER + KONTEN UTAMA */}
            <div
                style={{ paddingLeft: `${sidebarWidth}px` }}
                className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
            >
                <header
                    className={`sticky top-0 z-30 flex justify-between items-center py-3 px-4 sm:px-8 h-24 transition-all duration-300 relative overflow-visible ${currentTheme.header}`}
                >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                        <div className="absolute top-1/2 -translate-y-1/2 w-full animate-[lintas-elegan_28s_linear_infinite]">
                            <div className="flex items-center opacity-50">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_2px_#10b981]" />
                                <div className="h-[1.5px] w-40 bg-gradient-to-r from-emerald-500 via-teal-500/20 to-transparent" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-3 rounded-2xl bg-black/15 hover:bg-emerald-500/20 border border-current/15 transition-all duration-200 shadow-sm group active:scale-95"
                            title="Buka / Kecilkan Menu Sidebar"
                        >
                            <Menu
                                size={20}
                                className="transition-transform duration-300 group-hover:rotate-90"
                            />
                        </button>

                        <div className="hidden sm:flex items-center gap-3">
                            <div className="relative flex items-center justify-center">
                                <div className="absolute w-4 h-4 bg-emerald-400 rounded-full blur-md opacity-60 animate-pulse" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative z-10 border border-white" />
                            </div>
                            <div>
                                <p className="text-xs font-black tracking-[0.15em] uppercase leading-tight">
                                    {auth.cafe?.name || "TechnoG CaffeOS"}
                                </p>
                                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-0.5">
                                    Tema: {activeSlug.toUpperCase()} • Role:{" "}
                                    {userRole.toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                        {templates.length > 0 && (
                            <div className="hidden lg:flex items-center gap-1 bg-black/15 p-1.5 rounded-2xl border border-current/10">
                                <Palette className="w-4 h-4 text-emerald-400 ml-1.5 mr-1" />
                                {templates.map((tpl) => (
                                    <button
                                        key={tpl.id}
                                        type="button"
                                        onClick={() =>
                                            handleSwitchTemplate(tpl.id)
                                        }
                                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black transition ${
                                            activeSlug === tpl.slug
                                                ? "bg-emerald-500 text-slate-950 shadow"
                                                : "opacity-70 hover:opacity-100"
                                        }`}
                                    >
                                        {tpl.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="relative" ref={notifRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsNotifOpen(!isNotifOpen);
                                    setProfileOpen(false);
                                }}
                                className="relative p-3 rounded-2xl bg-black/15 hover:bg-emerald-500/20 border border-current/15 transition-all shadow-sm"
                                title="Notifikasi & Simulasi QR Meja"
                            >
                                <Bell
                                    size={20}
                                    className="animate-ring-dewa text-emerald-400"
                                />
                                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-black text-white bg-rose-500 rounded-full border-2 border-slate-900">
                                    {tables.length || 1}
                                </span>
                            </button>

                            {isNotifOpen && (
                                <div
                                    className={`absolute right-0 top-14 mt-2 w-80 sm:w-96 rounded-3xl shadow-2xl p-5 z-50 space-y-4 backdrop-blur-3xl ${currentTheme.dropdown}`}
                                >
                                    <div className="flex justify-between items-center border-b border-current/10 pb-3">
                                        <div>
                                            <h3 className="text-sm font-black">
                                                Pusat Notifikasi & Link QR Meja
                                            </h3>
                                            <p className="text-[10px] opacity-60 uppercase tracking-widest">
                                                Uji Toast Sukses & Gagal
                                            </p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    pushToast(
                                                        "Data berhasil ditambahkan ke sistem!",
                                                        "AI-OK99",
                                                        "success",
                                                    )
                                                }
                                                className="px-2 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black"
                                            >
                                                + Sukses
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    pushToast(
                                                        "Gagal menyimpan: Stok tidak mencukupi!",
                                                        null,
                                                        "error",
                                                    )
                                                }
                                                className="px-2 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-black"
                                            >
                                                ! Gagal
                                            </button>
                                        </div>
                                    </div>

                                    {tables.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[11px] font-bold opacity-75 flex items-center gap-1">
                                                <QrCode className="w-3.5 h-3.5 text-emerald-400" />{" "}
                                                Buka Halaman Scan QR Pelanggan:
                                            </p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {tables.map((t) => (
                                                    <a
                                                        key={t.id}
                                                        href={route(
                                                            "customer.scan",
                                                            t.qr_code,
                                                        )}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-2.5 rounded-xl bg-black/20 hover:bg-emerald-500 hover:text-slate-950 border border-current/10 text-xs font-mono font-bold text-center transition"
                                                    >
                                                        📱 Meja #
                                                        {t.table_number} ↗
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setProfileOpen(!profileOpen);
                                    setIsNotifOpen(false);
                                }}
                                className="relative flex items-center transition-transform duration-200 hover:scale-105 focus:outline-none group"
                            >
                                <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[2px] shadow-md">
                                    <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400 font-black text-base">
                                        {initial}
                                    </div>
                                </div>
                            </button>

                            {profileOpen && (
                                <div
                                    className={`absolute right-0 top-14 mt-2 w-72 rounded-3xl shadow-2xl overflow-hidden z-50 backdrop-blur-3xl ${currentTheme.dropdown}`}
                                >
                                    <div className="p-5 border-b border-current/10 bg-black/10">
                                        <p className="text-sm font-black truncate">
                                            {auth.user?.name}
                                        </p>
                                        <p className="text-[11px] opacity-65 truncate mt-0.5">
                                            {auth.user?.email}
                                        </p>
                                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            <ShieldCheck size={13} /> Role:{" "}
                                            {userRole}
                                        </div>
                                    </div>

                                    <div className="p-3 space-y-1">
                                        <Link
                                            href={route("hr.index")}
                                            onClick={() =>
                                                setProfileOpen(false)
                                            }
                                            className="w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl hover:bg-black/15 text-xs font-black uppercase tracking-wider transition"
                                        >
                                            <UserCog
                                                size={16}
                                                className="text-emerald-400"
                                            />
                                            <span>Presensi Wajah & Profil</span>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl hover:bg-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-wider transition"
                                        >
                                            <LogOut size={16} />
                                            <span>Log Out Sistem</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
