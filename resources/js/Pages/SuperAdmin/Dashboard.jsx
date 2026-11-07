import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    Building2,
    Globe,
    Layers,
    TrendingUp,
    Power,
    LogIn,
    Palette,
    Plus,
    CheckCircle2,
    Ban,
} from "lucide-react";

export default function SuperAdminDashboard({
    platformStats,
    cafes = [],
    templates = [],
    tables = [],
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";

    const [tplForm, setTplForm] = useState({ name: "", slug: "" });

    const cardClass = isBrutal
        ? "bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        : isWood
          ? "bg-white border border-amber-200 text-stone-800 shadow-sm"
          : "bg-slate-900 border border-slate-800 text-slate-100";

    const inputClass = isBrutal
        ? "rounded-xl bg-yellow-100 border-2 border-black text-black font-bold text-xs"
        : isWood
          ? "rounded-xl bg-amber-50/50 border-stone-300 text-stone-800 text-xs"
          : "rounded-xl bg-slate-950 border-slate-800 text-white text-xs";

    const handleCreateTemplate = (e) => {
        e.preventDefault();
        router.post(route("superadmin.templates.store"), tplForm, {
            onSuccess: () => setTplForm({ name: "", slug: "" }),
        });
    };

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="TechnoG HQ Super Admin SaaS - CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Banner Header TechnoG Solutions HQ */}
                <div
                    className={`p-6 rounded-2xl flex flex-wrap justify-between items-center gap-4 ${cardClass}`}
                >
                    <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                            <Globe className="w-4 h-4" /> TechnoG Solutions •
                            Multi-Tenant SaaS Control Center
                        </span>
                        <h1 className="text-2xl font-black mt-1">
                            Super Admin Platform Management (Seluruh Mitra Kafe)
                        </h1>
                        <p className="text-xs opacity-70 mt-0.5">
                            Pantau omzet seluruh tenant kafe, kelola lisensi
                            aktif, ganti tema mitra dari pusat, atau masuk ke
                            dashboard kafe klien.
                        </p>
                    </div>
                </div>

                {/* 4 Metrik Global Platform SaaS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Total Mitra Kafe Terdaftar</span>
                            <Building2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-black text-emerald-500 mt-2">
                            {platformStats.total_cafes} Kafe
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Tenant Berstatus Aktif</span>
                            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        </div>
                        <p className="text-3xl font-black text-cyan-400 mt-2">
                            {platformStats.active_cafes} Aktif
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Total Transaksi Lintas Kafe</span>
                            <Layers className="w-4 h-4 text-purple-400" />
                        </div>
                        <p className="text-3xl font-black text-purple-400 mt-2">
                            {platformStats.total_platform_orders} Order
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Total GMV Seluruh Platform</span>
                            <TrendingUp className="w-4 h-4 text-amber-400" />
                        </div>
                        <p className="text-2xl font-black text-amber-400 mt-2">
                            Rp{" "}
                            {Number(
                                platformStats.total_platform_gmv,
                            ).toLocaleString("id-ID")}
                        </p>
                    </div>
                </div>

                {/* Daftar Semua Tenant Kafe & Kontrol Lisensi */}
                <div className={`p-6 rounded-2xl space-y-4 ${cardClass}`}>
                    <h2 className="font-extrabold text-base border-b border-current/10 pb-3">
                        Daftar Mitra Kafe (Tenants) di Platform TechnoG CaffeOS
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="uppercase opacity-60 border-b border-current/10">
                                <tr>
                                    <th className="py-3">Nama Kafe & Alamat</th>
                                    <th className="py-3">Template Aktif</th>
                                    <th className="py-3">Statistik Tenant</th>
                                    <th className="py-3">Total Omzet Kafe</th>
                                    <th className="py-3">Status</th>
                                    <th className="py-3 text-right">
                                        Kontrol Super Admin
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-current/10">
                                {cafes.map((cafe) => (
                                    <tr key={cafe.id}>
                                        <td className="py-3.5">
                                            <p className="font-extrabold text-sm">
                                                {cafe.name}
                                            </p>
                                            <p className="text-[11px] opacity-65">
                                                {cafe.address || "-"}
                                            </p>
                                        </td>
                                        <td className="py-3.5">
                                            <select
                                                value={cafe.template_id}
                                                onChange={(e) =>
                                                    router.post(
                                                        route(
                                                            "superadmin.cafes.template",
                                                            cafe.id,
                                                        ),
                                                        {
                                                            template_id:
                                                                e.target.value,
                                                        },
                                                    )
                                                }
                                                className={inputClass}
                                            >
                                                {templates.map((tpl) => (
                                                    <option
                                                        key={tpl.id}
                                                        value={tpl.id}
                                                    >
                                                        {tpl.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-3.5">
                                            <span className="font-semibold">
                                                {cafe.menus_count} Menu •{" "}
                                                {cafe.users_count} Staf •{" "}
                                                {cafe.orders_count} Order
                                            </span>
                                        </td>
                                        <td className="py-3.5 font-extrabold text-emerald-500">
                                            Rp{" "}
                                            {Number(
                                                cafe.orders_sum_grand_total ||
                                                    0,
                                            ).toLocaleString("id-ID")}
                                        </td>
                                        <td className="py-3.5">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                                    cafe.is_active
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : "bg-red-500/20 text-red-400"
                                                }`}
                                            >
                                                {cafe.is_active
                                                    ? "ACTIVE"
                                                    : "SUSPENDED"}
                                            </span>
                                        </td>
                                        <td className="py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.post(
                                                            route(
                                                                "superadmin.cafes.impersonate",
                                                                cafe.id,
                                                            ),
                                                        )
                                                    }
                                                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1 transition"
                                                >
                                                    <LogIn className="w-3.5 h-3.5" />{" "}
                                                    Masuk Kafe Ini
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.post(
                                                            route(
                                                                "superadmin.cafes.toggle",
                                                                cafe.id,
                                                            ),
                                                        )
                                                    }
                                                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition ${
                                                        cafe.is_active
                                                            ? "bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white"
                                                            : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950"
                                                    }`}
                                                >
                                                    {cafe.is_active ? (
                                                        <>
                                                            <Ban className="w-3.5 h-3.5" />{" "}
                                                            Suspend
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Power className="w-3.5 h-3.5" />{" "}
                                                            Aktifkan
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Manajemen Katalog Master Template UI */}
                <div className="grid grid-cols-12 gap-6">
                    <form
                        onSubmit={handleCreateTemplate}
                        className={`col-span-12 lg:col-span-4 p-6 rounded-2xl space-y-4 h-fit ${cardClass}`}
                    >
                        <h3 className="font-extrabold text-sm flex items-center gap-2 border-b border-current/10 pb-2">
                            <Plus className="w-4 h-4 text-emerald-500" />{" "}
                            Registrasi Master Template Baru
                        </h3>
                        <div>
                            <label className="text-[11px] font-bold opacity-75">
                                Nama Template UI
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Pastel Korean Cafe"
                                value={tplForm.name}
                                onChange={(e) =>
                                    setTplForm({
                                        ...tplForm,
                                        name: e.target.value,
                                    })
                                }
                                className={`w-full mt-1 ${inputClass}`}
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold opacity-75">
                                Slug Identifier
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: pastel-korean"
                                value={tplForm.slug}
                                onChange={(e) =>
                                    setTplForm({
                                        ...tplForm,
                                        slug: e.target.value,
                                    })
                                }
                                className={`w-full mt-1 font-mono ${inputClass}`}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs"
                        >
                            Simpan Master Template
                        </button>
                    </form>

                    <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {templates.map((tpl) => (
                            <div
                                key={tpl.id}
                                className={`p-5 rounded-2xl flex flex-col justify-between ${cardClass}`}
                            >
                                <div>
                                    <Palette className="w-6 h-6 text-emerald-500 mb-2" />
                                    <h4 className="font-extrabold text-base">
                                        {tpl.name}
                                    </h4>
                                    <p className="text-xs font-mono opacity-65 mt-0.5">
                                        slug: {tpl.slug}
                                    </p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-current/10 flex justify-between items-center text-xs">
                                    <span className="font-bold text-emerald-500">
                                        Dipakai {tpl.cafes_count || 0} Kafe
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                        READY
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </CaffeOSLayout>
    );
}
