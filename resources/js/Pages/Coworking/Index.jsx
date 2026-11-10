import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import CreatePackageModal from "./Modals/CreatePackageModal";
import CheckoutPackageModal from "./Modals/CheckoutPackageModal";
import PrintInvoiceModal from "./Modals/PrintInvoiceModal";
import { Briefcase, Printer, Plus, Sparkles, Building2 } from "lucide-react";

export default function CoworkingIndex({
    packages = [],
    b2bOrders = [],
    menus = [],
    tables = [],
    templates = [],
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";

    // State Kontrol 3 Modal
    const [showCreatePkgModal, setShowCreatePkgModal] = useState(false);
    const [activePkgForCheckout, setActivePkgForCheckout] = useState(null);
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

    const cardClass = isBrutal
        ? "bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        : isWood
          ? "bg-white border border-amber-200 text-stone-800 shadow-sm"
          : "bg-slate-900 border border-slate-800 text-slate-100";

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Co-Working Space Pass & B2B Catering - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* 1. HEADER ACTION BAR */}
                <div
                    className={`p-6 rounded-[2.5rem] flex flex-wrap justify-between items-center gap-4 ${cardClass}`}
                >
                    <div>
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4" /> Digital Nomad
                            Space & Corporate B2B Catering
                        </span>
                        <h1 className="text-2xl font-black mt-0.5">
                            Katalog Paket Co-Working Pass & Faktur Invoice
                            Instansi
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setActivePkgForCheckout(packages[0] || null)
                            }
                            className="px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition active:scale-95"
                        >
                            <Sparkles className="w-4 h-4" /> + Checkout Paket
                            Cepat
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowCreatePkgModal(true)}
                            className="px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> + Buat Paket Baru
                        </button>
                    </div>
                </div>

                {/* 2. GRID KATALOG PAKET CO-WORKING & B2B CATERING */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`p-5 rounded-[2.5rem] flex flex-col justify-between transition hover:scale-[1.01] ${cardClass}`}
                        >
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center">
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                            pkg.type === "catering"
                                                ? "bg-amber-500/20 text-amber-300"
                                                : "bg-purple-500/20 text-purple-300"
                                        }`}
                                    >
                                        {pkg.type === "catering"
                                            ? "🏢 B2B Catering"
                                            : "💻 Co-Working Pass"}
                                    </span>
                                    <span className="font-mono text-xs font-black text-emerald-400">
                                        🤖 {pkg.ai_quota}x AI
                                    </span>
                                </div>
                                <h3 className="font-black text-base leading-snug">
                                    {pkg.name}
                                </h3>
                                <p className="text-xs opacity-75 leading-relaxed">
                                    {pkg.perks}
                                </p>
                            </div>

                            <div className="mt-5 pt-3.5 border-t border-current/10 flex justify-between items-center">
                                <span className="text-lg font-black text-emerald-400">
                                    Rp{" "}
                                    {Number(pkg.price).toLocaleString("id-ID")}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setActivePkgForCheckout(pkg)}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow transition"
                                >
                                    Aktifkan Paket
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. TABEL FULL-WIDTH TRANSAKSI CO-WORKING & INVOICE B2B */}
                <div className={`p-6 rounded-[2.5rem] space-y-4 ${cardClass}`}>
                    <div className="border-b border-current/10 pb-3">
                        <h2 className="font-extrabold text-base flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-emerald-500" />{" "}
                            Daftar Member Co-Working Aktif & Faktur Invoice B2B
                            ({b2bOrders.length})
                        </h2>
                    </div>

                    {b2bOrders.length === 0 ? (
                        <p className="text-center py-12 text-xs opacity-60">
                            Belum ada transaksi paket Co-Working atau B2B
                            Catering. Klik tombol{" "}
                            <strong>"Aktifkan Paket"</strong> pada kartu di
                            atas.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {b2bOrders.map((ord) => (
                                <div
                                    key={ord.id}
                                    className="p-4 rounded-2xl bg-black/15 border border-current/10 flex justify-between items-center gap-4 text-xs"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-black text-emerald-400">
                                                {ord.order_code}
                                            </span>
                                            <span className="font-black text-sm">
                                                {ord.customer_name}
                                            </span>
                                        </div>
                                        <p className="text-[11px] opacity-80">
                                            {ord.items?.[0]?.notes ||
                                                "Co-Working / B2B Package"}{" "}
                                            ({ord.items?.[0]?.qty || 1}x{" "}
                                            {ord.items?.[0]?.menu?.name ||
                                                "Complimentary"}
                                            )
                                        </p>
                                        {ord.ai_token && (
                                            <span className="inline-block px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-[10px]">
                                                Token VIP:{" "}
                                                {ord.ai_token.token_code} (
                                                {ord.ai_token.quota_limit}x
                                                Prompt)
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <span className="text-sm font-black text-emerald-400">
                                            Rp{" "}
                                            {Number(
                                                ord.grand_total,
                                            ).toLocaleString("id-ID")}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedInvoiceOrder(ord)
                                            }
                                            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center gap-1.5 shadow transition"
                                        >
                                            <Printer className="w-3.5 h-3.5" />{" "}
                                            Invoice B2B
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* KOMPONEN MODAL BLUR */}
            <CreatePackageModal
                isOpen={showCreatePkgModal}
                onClose={() => setShowCreatePkgModal(false)}
            />

            <CheckoutPackageModal
                isOpen={Boolean(activePkgForCheckout)}
                selectedPkg={activePkgForCheckout}
                menus={menus}
                tables={tables}
                onClose={() => setActivePkgForCheckout(null)}
            />

            <PrintInvoiceModal
                order={selectedInvoiceOrder}
                cafe={auth.cafe}
                onClose={() => setSelectedInvoiceOrder(null)}
            />
        </CaffeOSLayout>
    );
}
