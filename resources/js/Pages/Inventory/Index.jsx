import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    Truck,
    PackageCheck,
    ClipboardCheck,
    AlertOctagon,
    Plus,
    Trash2,
    Building2,
    History,
} from "lucide-react";

export default function InventoryIndex({
    stocks = [],
    suppliers = [],
    stockLogs = [],
    templates = [],
    tables = [],
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";
    const [activeTab, setActiveTab] = useState("po"); // po | suppliers

    // State Form Mutasi Stok (Purchase Order Masuk / Stock Opname / Waste)
    const [logForm, setLogForm] = useState({
        stock_id: stocks[0]?.id || "",
        supplier_id: suppliers[0]?.id || "",
        type: "purchase_in",
        qty: "",
        total_cost: "",
        record_expense: true,
        notes: "",
    });

    // State Form Supplier Baru
    const [supplierForm, setSupplierForm] = useState({
        name: "",
        contact_person: "",
        phone: "",
        category: "Biji Kopi & Susu",
        address: "",
    });

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

    const handleStoreStockLog = (e) => {
        e.preventDefault();
        router.post(route("inventory.logs.store"), logForm, {
            onSuccess: () =>
                setLogForm({
                    ...logForm,
                    qty: "",
                    total_cost: "",
                    notes: "",
                }),
        });
    };

    const handleStoreSupplier = (e) => {
        e.preventDefault();
        router.post(route("inventory.suppliers.store"), supplierForm, {
            onSuccess: () =>
                setSupplierForm({
                    name: "",
                    contact_person: "",
                    phone: "",
                    category: "Biji Kopi & Susu",
                    address: "",
                }),
        });
    };

    const totalPurchaseValue = stockLogs
        .filter((l) => l.type === "purchase_in")
        .reduce((sum, l) => sum + Number(l.total_cost || 0), 0);

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Supply Chain, PO & Stock Opname - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* Ringkasan Gudang & Supply Chain */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Total Mitra Supplier Bahan Baku</span>
                            <Truck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-extrabold text-emerald-500 mt-2">
                            {suppliers.length} Supplier
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Total Belanja Purchase Order (PO)</span>
                            <PackageCheck className="w-4 h-4 text-cyan-400" />
                        </div>
                        <p className="text-2xl font-extrabold text-cyan-400 mt-2">
                            Rp {totalPurchaseValue.toLocaleString("id-ID")}
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Total Aktivitas Audit & Opname</span>
                            <ClipboardCheck className="w-4 h-4 text-purple-400" />
                        </div>
                        <p className="text-3xl font-extrabold text-purple-400 mt-2">
                            {stockLogs.length} Log Mutasi
                        </p>
                    </div>
                </div>

                {/* Tab Pilihan: Purchase Order & Stock Opname vs Database Supplier */}
                <div className="flex gap-3 border-b border-current/10 pb-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab("po")}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
                            activeTab === "po"
                                ? "bg-emerald-500 text-slate-950 shadow"
                                : "bg-slate-800/40 text-current"
                        }`}
                    >
                        <PackageCheck className="w-4 h-4" /> 1. BELANJA PO MASUK
                        & STOCK OPNAME
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("suppliers")}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition ${
                            activeTab === "suppliers"
                                ? "bg-emerald-500 text-slate-950 shadow"
                                : "bg-slate-800/40 text-current"
                        }`}
                    >
                        <Building2 className="w-4 h-4" /> 2. DATABASE SUPPLIER (
                        {suppliers.length})
                    </button>
                </div>

                {/* ================= TAB 1: PURCHASE ORDER & STOCK OPNAME ================= */}
                {activeTab === "po" && (
                    <div className="grid grid-cols-12 gap-6">
                        <form
                            onSubmit={handleStoreStockLog}
                            className={`col-span-12 lg:col-span-5 p-6 rounded-2xl space-y-4 h-fit ${cardClass}`}
                        >
                            <h2 className="font-extrabold text-base border-b border-current/10 pb-2 text-emerald-500">
                                + Input Belanja PO / Stock Opname / Waste
                            </h2>

                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Jenis Transaksi Gudang *
                                </label>
                                <select
                                    value={logForm.type}
                                    onChange={(e) =>
                                        setLogForm({
                                            ...logForm,
                                            type: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                >
                                    <option value="purchase_in">
                                        📦 Belanja Stok Masuk (Purchase Order
                                        Supplier)
                                    </option>
                                    <option value="opname_adjustment">
                                        📋 Stock Opname (Tambah Penyesuaian
                                        Fisik)
                                    </option>
                                    <option value="waste_out">
                                        🗑️ Barang Rusak / Tumpah / Kedaluwarsa
                                        (Potong Stok)
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Pilih Item Bahan Baku *
                                </label>
                                <select
                                    value={logForm.stock_id}
                                    onChange={(e) =>
                                        setLogForm({
                                            ...logForm,
                                            stock_id: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                >
                                    {stocks.map((st) => (
                                        <option key={st.id} value={st.id}>
                                            {st.name} (Sisa Saat Ini:{" "}
                                            {Number(
                                                st.current_qty,
                                            ).toLocaleString("id-ID")}{" "}
                                            {st.unit})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {logForm.type === "purchase_in" && (
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Pilih Mitra Supplier
                                    </label>
                                    <select
                                        value={logForm.supplier_id}
                                        onChange={(e) =>
                                            setLogForm({
                                                ...logForm,
                                                supplier_id: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    >
                                        <option value="">
                                            -- Tanpa Supplier Spesifik --
                                        </option>
                                        {suppliers.map((sup) => (
                                            <option key={sup.id} value={sup.id}>
                                                {sup.name} ({sup.category})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        {logForm.type === "waste_out"
                                            ? "Jumlah Dibuang/Rusak *"
                                            : "Jumlah Masuk (gram/ml/pcs) *"}
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        step="any"
                                        placeholder="Contoh: 5000"
                                        value={logForm.qty}
                                        onChange={(e) =>
                                            setLogForm({
                                                ...logForm,
                                                qty: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    />
                                </div>

                                {logForm.type === "purchase_in" && (
                                    <div>
                                        <label className="text-[11px] font-bold opacity-75">
                                            Total Biaya Belanja PO (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Contoh: 350000"
                                            value={logForm.total_cost}
                                            onChange={(e) =>
                                                setLogForm({
                                                    ...logForm,
                                                    total_cost: e.target.value,
                                                })
                                            }
                                            className={`w-full mt-1 ${inputClass}`}
                                        />
                                    </div>
                                )}
                            </div>

                            {logForm.type === "purchase_in" && (
                                <label className="flex items-center gap-2 text-xs cursor-pointer pt-1">
                                    <input
                                        type="checkbox"
                                        checked={logForm.record_expense}
                                        onChange={(e) =>
                                            setLogForm({
                                                ...logForm,
                                                record_expense:
                                                    e.target.checked,
                                            })
                                        }
                                        className="rounded text-emerald-500"
                                    />
                                    <span>
                                        Catat otomatis biaya PO ini ke Laporan
                                        Kas Keluar (/finance)
                                    </span>
                                </label>
                            )}

                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Catatan / Nomor Faktur Nota
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Nota INV-ROAST-099 atau Susu tumpah 200ml"
                                    value={logForm.notes}
                                    onChange={(e) =>
                                        setLogForm({
                                            ...logForm,
                                            notes: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition"
                            >
                                Simpan Mutasi & Update Stok Gudang
                            </button>
                        </form>

                        {/* Tabel Riwayat Log Mutasi Stok Gudang */}
                        <div
                            className={`col-span-12 lg:col-span-7 p-6 rounded-2xl space-y-4 h-fit ${cardClass}`}
                        >
                            <h2 className="font-extrabold text-base flex items-center gap-2 border-b border-current/10 pb-3">
                                <History className="w-5 h-5 text-emerald-500" />{" "}
                                Kartu Stok & Audit Mutasi Gudang
                            </h2>

                            <div className="overflow-x-auto max-h-[520px]">
                                <table className="w-full text-xs text-left">
                                    <thead className="uppercase opacity-60 border-b border-current/10">
                                        <tr>
                                            <th className="py-2.5">
                                                Tanggal / PIC
                                            </th>
                                            <th className="py-2.5">
                                                Bahan Baku
                                            </th>
                                            <th className="py-2.5">
                                                Tipe Mutasi
                                            </th>
                                            <th className="py-2.5">
                                                Perubahan Qty
                                            </th>
                                            <th className="py-2.5 text-right">
                                                Biaya PO
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-current/10">
                                        {stockLogs.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="py-10 text-center opacity-60"
                                                >
                                                    Belum ada riwayat Purchase
                                                    Order atau Stock Opname.
                                                </td>
                                            </tr>
                                        ) : (
                                            stockLogs.map((log) => (
                                                <tr key={log.id}>
                                                    <td className="py-3">
                                                        <span className="font-bold block">
                                                            {new Date(
                                                                log.created_at,
                                                            ).toLocaleDateString(
                                                                "id-ID",
                                                            )}
                                                        </span>
                                                        <span className="text-[10px] opacity-65">
                                                            Oleh:{" "}
                                                            {log.user?.name}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="font-extrabold">
                                                            {log.stock?.name}
                                                        </span>
                                                        {log.supplier && (
                                                            <span className="block text-[10px] text-cyan-400">
                                                                Supplier:{" "}
                                                                {
                                                                    log.supplier
                                                                        .name
                                                                }
                                                            </span>
                                                        )}
                                                        {log.notes && (
                                                            <span className="block text-[10px] italic opacity-70">
                                                                "{log.notes}"
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3">
                                                        <span
                                                            className={`px-2 py-0.5 rounded uppercase text-[10px] font-bold ${
                                                                log.type ===
                                                                "purchase_in"
                                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                                    : log.type ===
                                                                        "waste_out"
                                                                      ? "bg-red-500/20 text-red-400"
                                                                      : "bg-purple-500/20 text-purple-300"
                                                            }`}
                                                        >
                                                            {log.type.replace(
                                                                "_",
                                                                " ",
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 font-mono font-extrabold">
                                                        <span
                                                            className={
                                                                Number(
                                                                    log.qty_change,
                                                                ) >= 0
                                                                    ? "text-emerald-400"
                                                                    : "text-red-400"
                                                            }
                                                        >
                                                            {Number(
                                                                log.qty_change,
                                                            ) > 0
                                                                ? "+"
                                                                : ""}
                                                            {Number(
                                                                log.qty_change,
                                                            ).toLocaleString(
                                                                "id-ID",
                                                            )}{" "}
                                                            {log.stock?.unit}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-right font-bold">
                                                        {Number(
                                                            log.total_cost,
                                                        ) > 0
                                                            ? `Rp ${Number(log.total_cost).toLocaleString("id-ID")}`
                                                            : "-"}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= TAB 2: DATABASE SUPPLIER ================= */}
                {activeTab === "suppliers" && (
                    <div className="grid grid-cols-12 gap-6">
                        <form
                            onSubmit={handleStoreSupplier}
                            className={`col-span-12 lg:col-span-4 p-6 rounded-2xl space-y-4 h-fit ${cardClass}`}
                        >
                            <h2 className="font-extrabold text-base text-emerald-500 border-b border-current/10 pb-2">
                                + Tambah Mitra Supplier Baru
                            </h2>
                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Nama Perusahaan / Supplier *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: CV Kopi Gayo Mandiri"
                                    value={supplierForm.name}
                                    onChange={(e) =>
                                        setSupplierForm({
                                            ...supplierForm,
                                            name: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Nama Sales / PIC
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Bpk. Anton"
                                        value={supplierForm.contact_person}
                                        onChange={(e) =>
                                            setSupplierForm({
                                                ...supplierForm,
                                                contact_person: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        No. WhatsApp *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="0812..."
                                        value={supplierForm.phone}
                                        onChange={(e) =>
                                            setSupplierForm({
                                                ...supplierForm,
                                                phone: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Kategori Pasokan
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Biji Kopi, Susu UHT, Cup Kemasan..."
                                    value={supplierForm.category}
                                    onChange={(e) =>
                                        setSupplierForm({
                                            ...supplierForm,
                                            category: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Alamat Gudang Supplier
                                </label>
                                <input
                                    type="text"
                                    value={supplierForm.address}
                                    onChange={(e) =>
                                        setSupplierForm({
                                            ...supplierForm,
                                            address: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs"
                            >
                                Simpan Data Supplier
                            </button>
                        </form>

                        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
                            {suppliers.map((sup) => (
                                <div
                                    key={sup.id}
                                    className={`p-5 rounded-2xl flex justify-between items-start ${cardClass}`}
                                >
                                    <div className="space-y-1">
                                        <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase">
                                            {sup.category}
                                        </span>
                                        <h3 className="font-extrabold text-base pt-1">
                                            {sup.name}
                                        </h3>
                                        <p className="text-xs opacity-75">
                                            PIC: {sup.contact_person || "-"} •
                                            WA: <strong>{sup.phone}</strong>
                                        </p>
                                        <p className="text-[11px] opacity-60">
                                            {sup.address || "-"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            router.delete(
                                                route(
                                                    "inventory.suppliers.destroy",
                                                    sup.id,
                                                ),
                                            )
                                        }
                                        className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </CaffeOSLayout>
    );
}
