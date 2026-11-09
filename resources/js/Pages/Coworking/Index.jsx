import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    Briefcase,
    Bot,
    Coffee,
    Printer,
    Plus,
    CheckCircle2,
    Sparkles,
    Building2,
    Users,
    CreditCard,
    X,
} from "lucide-react";

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

    const [selectedPkg, setSelectedPkg] = useState(packages[0] || null);
    const [checkoutForm, setCheckoutForm] = useState({
        customer_name: "",
        customer_phone: "",
        table_id: tables[0]?.id || "",
        complimentary_menu_id: menus[0]?.id || "",
        complimentary_qty: 1,
        payment_method: "qris",
    });

    const [newPkgForm, setNewPkgForm] = useState({
        name: "",
        type: "coworking",
        price: 50000,
        ai_quota: 30,
        perks: "Meja Co-Working + Free Kopi + 30x Token AI Co-Worker",
    });

    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

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

    const handleCheckoutPackage = (e) => {
        e.preventDefault();
        if (!selectedPkg) return;

        router.post(
            route("coworking.checkout"),
            {
                package_name: selectedPkg.name,
                price: selectedPkg.price,
                ai_quota: selectedPkg.ai_quota,
                ...checkoutForm,
            },
            {
                onSuccess: () =>
                    setCheckoutForm({
                        ...checkoutForm,
                        customer_name: "",
                        customer_phone: "",
                    }),
            },
        );
    };

    const handleStorePackage = (e) => {
        e.preventDefault();
        router.post(route("coworking.packages.store"), newPkgForm, {
            onSuccess: () =>
                setNewPkgForm({
                    name: "",
                    type: "coworking",
                    price: 50000,
                    ai_quota: 30,
                    perks: "",
                }),
        });
    };

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Co-Working Space Pass & B2B Catering - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* 1. KATALOG PAKET CO-WORKING PASS & B2B COFFEE CATERING */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {packages.map((pkg) => {
                        const isSelected = selectedPkg?.id === pkg.id;
                        return (
                            <div
                                key={pkg.id}
                                onClick={() => {
                                    setSelectedPkg(pkg);
                                    setCheckoutForm((prev) => ({
                                        ...prev,
                                        complimentary_qty:
                                            pkg.type === "catering" ? 20 : 1,
                                    }));
                                }}
                                className={`cursor-pointer p-5 rounded-3xl flex flex-col justify-between transition ${
                                    isSelected
                                        ? "ring-4 ring-emerald-500 bg-emerald-500/15 border border-emerald-500 text-white"
                                        : cardClass
                                }`}
                            >
                                <div className="space-y-2">
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
                                            🤖 {pkg.ai_quota}x AI Prompt
                                        </span>
                                    </div>
                                    <h3 className="font-black text-base">
                                        {pkg.name}
                                    </h3>
                                    <p className="text-xs opacity-75 leading-relaxed">
                                        {pkg.perks}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-current/10 flex justify-between items-center">
                                    <span className="text-lg font-black text-emerald-400">
                                        Rp{" "}
                                        {Number(pkg.price).toLocaleString(
                                            "id-ID",
                                        )}
                                    </span>
                                    <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-[11px]">
                                        {isSelected
                                            ? "✓ Terpilih"
                                            : "Pilih Paket"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 2. GRID UTAMA: FORM CHECKOUT PAKET (KIRI) + TABEL RIWAYAT & INVOICE B2B (KANAN) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 space-y-6">
                        {/* Form Aktivasi Paket & Terbitkan High-Quota AI Token */}
                        <form
                            onSubmit={handleCheckoutPackage}
                            className={`p-6 rounded-3xl space-y-4 ${cardClass}`}
                        >
                            <div className="border-b border-current/10 pb-3">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                                    Checkout Co-Working / B2B Order
                                </span>
                                <h2 className="font-black text-base mt-0.5">
                                    {selectedPkg?.name || "Pilih Paket di Atas"}
                                </h2>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Nama Member Co-Working / Nama Instansi B2B *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: PT Digital Nusantara / Kak Budi"
                                    value={checkoutForm.customer_name}
                                    onChange={(e) =>
                                        setCheckoutForm({
                                            ...checkoutForm,
                                            customer_name: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        No. WhatsApp PIC
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="0812..."
                                        value={checkoutForm.customer_phone}
                                        onChange={(e) =>
                                            setCheckoutForm({
                                                ...checkoutForm,
                                                customer_phone: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Alokasi Meja Kerja / VIP
                                    </label>
                                    <select
                                        value={checkoutForm.table_id}
                                        onChange={(e) =>
                                            setCheckoutForm({
                                                ...checkoutForm,
                                                table_id: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    >
                                        <option value="">
                                            -- Tanpa Meja (Catering) --
                                        </option>
                                        {tables.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                Meja #{t.table_number} (
                                                {t.location})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2.5">
                                <div className="col-span-2">
                                    <label className="text-[11px] font-bold opacity-75">
                                        Sajian Minuman Termasuk (Potong Stok)
                                    </label>
                                    <select
                                        value={
                                            checkoutForm.complimentary_menu_id
                                        }
                                        onChange={(e) =>
                                            setCheckoutForm({
                                                ...checkoutForm,
                                                complimentary_menu_id:
                                                    e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    >
                                        {menus.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Jumlah Cup
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={checkoutForm.complimentary_qty}
                                        onChange={(e) =>
                                            setCheckoutForm({
                                                ...checkoutForm,
                                                complimentary_qty:
                                                    e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 font-mono ${inputClass}`}
                                    />
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex justify-between items-center text-xs">
                                <span>
                                    Kuota Token AI Co-Worker Diterbitkan:
                                </span>
                                <span className="font-mono font-black text-purple-300 text-sm">
                                    🤖 {selectedPkg?.ai_quota || 25}x Prompt AI
                                </span>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Sparkles className="w-4 h-4" /> Aktifkan Paket
                                & Terbitkan Invoice B2B
                            </button>
                        </form>

                        {/* Form Tambah Paket Baru */}
                        <form
                            onSubmit={handleStorePackage}
                            className={`p-6 rounded-3xl space-y-3 ${cardClass}`}
                        >
                            <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-emerald-500">
                                <Plus className="w-4 h-4" /> Buat Paket
                                Co-Working / Catering Baru
                            </h3>
                            <input
                                type="text"
                                required
                                placeholder="Nama Paket Baru..."
                                value={newPkgForm.name}
                                onChange={(e) =>
                                    setNewPkgForm({
                                        ...newPkgForm,
                                        name: e.target.value,
                                    })
                                }
                                className={`w-full ${inputClass}`}
                            />
                            <div className="grid grid-cols-3 gap-2">
                                <select
                                    value={newPkgForm.type}
                                    onChange={(e) =>
                                        setNewPkgForm({
                                            ...newPkgForm,
                                            type: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                >
                                    <option value="coworking">
                                        Co-Working
                                    </option>
                                    <option value="catering">
                                        B2B Catering
                                    </option>
                                </select>
                                <input
                                    type="number"
                                    required
                                    placeholder="Harga (Rp)"
                                    value={newPkgForm.price}
                                    onChange={(e) =>
                                        setNewPkgForm({
                                            ...newPkgForm,
                                            price: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                />
                                <input
                                    type="number"
                                    required
                                    placeholder="Kuota AI"
                                    value={newPkgForm.ai_quota}
                                    onChange={(e) =>
                                        setNewPkgForm({
                                            ...newPkgForm,
                                            ai_quota: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                />
                            </div>
                            <input
                                type="text"
                                required
                                placeholder="Deskripsi Fasilitas / Perks..."
                                value={newPkgForm.perks}
                                onChange={(e) =>
                                    setNewPkgForm({
                                        ...newPkgForm,
                                        perks: e.target.value,
                                    })
                                }
                                className={`w-full ${inputClass}`}
                            />
                            <button
                                type="submit"
                                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs"
                            >
                                + Simpan ke Katalog Paket
                            </button>
                        </form>
                    </div>

                    {/* Daftar Transaksi Co-Working & Cetak Invoice B2B Resmi */}
                    <div
                        className={`lg:col-span-7 p-6 rounded-3xl space-y-4 h-fit ${cardClass}`}
                    >
                        <div className="border-b border-current/10 pb-3">
                            <h2 className="font-extrabold text-base flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-emerald-500" />{" "}
                                Daftar Member Co-Working Aktif & Faktur Invoice
                                B2B
                            </h2>
                            <p className="text-xs opacity-70">
                                Klik tombol "Cetak Invoice B2B" untuk mencetak
                                dokumen penagihan resmi instansi/perusahaan
                            </p>
                        </div>

                        <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                            {b2bOrders.length === 0 ? (
                                <p className="text-center py-12 text-xs opacity-60">
                                    Belum ada transaksi paket Co-Working atau
                                    B2B Catering hari ini.
                                </p>
                            ) : (
                                b2bOrders.map((ord) => (
                                    <div
                                        key={ord.id}
                                        className="p-4 rounded-2xl bg-black/15 border border-current/10 flex flex-wrap justify-between items-center gap-4 text-xs"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-black text-emerald-400">
                                                    {ord.order_code}
                                                </span>
                                                <span className="font-black text-sm">
                                                    {ord.customer_name}
                                                </span>
                                                {ord.table && (
                                                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                                                        Meja #
                                                        {ord.table.table_number}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] opacity-80">
                                                Paket:{" "}
                                                <strong>
                                                    {ord.items?.[0]?.notes ||
                                                        "Co-Working / B2B Package"}
                                                </strong>{" "}
                                                ({ord.items?.[0]?.qty || 1}x{" "}
                                                {ord.items?.[0]?.menu?.name ||
                                                    "Complimentary"}
                                                )
                                            </p>
                                            {ord.ai_token && (
                                                <span className="inline-block px-2.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono font-bold text-[11px]">
                                                    Token VIP:{" "}
                                                    {ord.ai_token.token_code}{" "}
                                                    (Kuota:{" "}
                                                    {ord.ai_token.quota_limit}x
                                                    Prompt)
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-sm font-black text-emerald-500">
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
                                                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center gap-1.5 shadow transition"
                                            >
                                                <Printer className="w-3.5 h-3.5" />{" "}
                                                Cetak Invoice B2B
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CETAK INVOICE B2B RESMI (OFFICIAL CORPORATE INVOICE) */}
            {selectedInvoiceOrder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white text-slate-950 rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-5 font-sans">
                        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                                    OFFICIAL B2B & CO-WORKING INVOICE
                                </span>
                                <h2 className="text-2xl font-black uppercase mt-0.5">
                                    {auth.cafe?.name || "TechnoG CaffeOS"}
                                </h2>
                                <p className="text-xs text-slate-500">
                                    {auth.cafe?.address}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                                    PAID / LUNAS
                                </span>
                                <p className="font-mono font-bold text-xs mt-2">
                                    No: {selectedInvoiceOrder.order_code}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                    Tanggal:{" "}
                                    {new Date(
                                        selectedInvoiceOrder.created_at,
                                    ).toLocaleDateString("id-ID")}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-100 text-xs space-y-1">
                            <p className="text-slate-500 font-bold uppercase text-[10px]">
                                Ditagihkan Kepada (Client / Instansi):
                            </p>
                            <p className="font-black text-base text-slate-900">
                                {selectedInvoiceOrder.customer_name}
                            </p>
                            {selectedInvoiceOrder.ai_token && (
                                <p className="font-mono text-purple-700 font-bold pt-1">
                                    Lisensi Token AI Co-Worker:{" "}
                                    {selectedInvoiceOrder.ai_token.token_code} (
                                    {selectedInvoiceOrder.ai_token.quota_limit}{" "}
                                    Kuota Prompt)
                                </p>
                            )}
                        </div>

                        <table className="w-full text-xs text-left border-b pb-4">
                            <thead className="uppercase text-slate-500 border-b">
                                <tr>
                                    <th className="py-2">
                                        Deskripsi Layanan / Paket
                                    </th>
                                    <th className="py-2 text-center">Qty</th>
                                    <th className="py-2 text-right">
                                        Total Harga
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="py-3 font-bold">
                                        {selectedInvoiceOrder.items?.[0]
                                            ?.notes ||
                                            "Paket Co-Working / B2B Catering"}
                                        <span className="block text-[11px] text-slate-500 font-normal">
                                            Termasuk sajian:{" "}
                                            {selectedInvoiceOrder.items?.[0]
                                                ?.menu?.name ||
                                                "Signature Beverage"}
                                        </span>
                                    </td>
                                    <td className="py-3 text-center font-mono">
                                        {selectedInvoiceOrder.items?.[0]?.qty ||
                                            1}
                                    </td>
                                    <td className="py-3 text-right font-mono font-bold">
                                        Rp{" "}
                                        {Number(
                                            selectedInvoiceOrder.grand_total,
                                        ).toLocaleString("id-ID")}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="flex justify-between items-center text-lg font-black bg-slate-900 text-white p-4 rounded-2xl">
                            <span>GRAND TOTAL INVOICE</span>
                            <span className="text-emerald-400">
                                Rp{" "}
                                {Number(
                                    selectedInvoiceOrder.grand_total,
                                ).toLocaleString("id-ID")}
                            </span>
                        </div>

                        <div className="flex gap-2 pt-2 print:hidden">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2"
                            >
                                <Printer className="w-4 h-4" /> Cetak Faktur
                                Invoice Resmi (PDF)
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedInvoiceOrder(null)}
                                className="px-4 py-3 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CaffeOSLayout>
    );
}
