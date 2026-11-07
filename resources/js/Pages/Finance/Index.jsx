import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import ReceiptModal from "@/Components/ReceiptModal";
import {
    WalletCards,
    TrendingUp,
    ArrowDownCircle,
    PiggyBank,
    Printer,
    Ban,
    Plus,
    Trash2,
    Filter,
    RotateCcw,
} from "lucide-react";

export default function FinanceIndex({
    summary,
    filters,
    orders = [],
    expenses = [],
    templates = [],
    tables = [],
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";

    const [selectedOrderReceipt, setSelectedOrderReceipt] = useState(null);
    const [dateFilter, setDateFilter] = useState(filters?.date || "");
    const [statusFilter, setStatusFilter] = useState(filters?.status || "ALL");

    // State Form Input Pengeluaran Operasional (Kas Keluar)
    const [expenseForm, setExpenseForm] = useState({
        title: "",
        category: "Bahan Baku Darurat",
        amount: "",
        payment_source: "cash_drawer",
        expense_date: new Date().toISOString().split("T")[0],
        notes: "",
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

    // Terapkan Filter Tanggal & Status Order
    const handleApplyFilter = (e) => {
        e.preventDefault();
        router.get(
            route("finance.index"),
            { date: dateFilter, status: statusFilter },
            { preserveState: true },
        );
    };

    const handleResetFilter = () => {
        setDateFilter("");
        setStatusFilter("ALL");
        router.get(route("finance.index"));
    };

    // Simpan Pengeluaran Baru
    const handleStoreExpense = (e) => {
        e.preventDefault();
        router.post(route("finance.expenses.store"), expenseForm, {
            onSuccess: () =>
                setExpenseForm({
                    ...expenseForm,
                    title: "",
                    amount: "",
                    notes: "",
                }),
        });
    };

    // Void / Batalkan Order & Kembalikan Stok
    const handleVoidOrder = (order) => {
        if (
            confirm(
                `Batalkan (VOID) Antrean #${order.queue_number} atas nama ${order.customer_name}? Stok bahan baku akan dikembalikan otomatis ke gudang.`,
            )
        ) {
            router.post(route("finance.orders.void", order.id));
        }
    };

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Manajemen Keuangan & Riwayat Transaksi - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* 4 Kartu Ringkasan Laba Rugi Kafe */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Omzet Penjualan Bersih</span>
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-emerald-500 mt-2">
                            Rp{" "}
                            {Number(summary.net_sales).toLocaleString("id-ID")}
                        </p>
                        <p className="text-[11px] opacity-60 mt-1">
                            Total Diskon Promo: Rp{" "}
                            {Number(summary.total_discount).toLocaleString(
                                "id-ID",
                            )}
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Total Kas Keluar (Expenses)</span>
                            <ArrowDownCircle className="w-4 h-4 text-red-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-red-500 mt-2">
                            -Rp{" "}
                            {Number(summary.total_expenses).toLocaleString(
                                "id-ID",
                            )}
                        </p>
                        <p className="text-[11px] opacity-60 mt-1">
                            Belanja bahan darurat, es batu, operasional
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Estimasi Laba Bersih (Net Profit)</span>
                            <PiggyBank className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-2xl font-extrabold text-purple-500 mt-2">
                            Rp{" "}
                            {Number(summary.net_profit).toLocaleString("id-ID")}
                        </p>
                        <p className="text-[11px] opacity-60 mt-1">
                            Omzet Penjualan dikurangi Kas Keluar
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Total Struk Ditampilkan</span>
                            <WalletCards className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-extrabold mt-2">
                            {orders.length} Transaksi
                        </p>
                        <p className="text-[11px] opacity-60 mt-1">
                            Mendukung Cetak Ulang Struk & Void Order
                        </p>
                    </div>
                </div>

                {/* Grid Utama: Form & Daftar Kas Keluar (Kiri) + Tabel Riwayat Struk & Void (Kanan) */}
                <div className="grid grid-cols-12 gap-6">
                    {/* KOLOM KIRI (5): INPUT & DAFTAR PENGELUARAN OPERASIONAL */}
                    <div className="col-span-12 lg:col-span-5 space-y-6">
                        <form
                            onSubmit={handleStoreExpense}
                            className={`p-6 rounded-2xl space-y-3.5 ${cardClass}`}
                        >
                            <h2 className="font-extrabold text-base border-b border-current/10 pb-2 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-emerald-500" />{" "}
                                Catat Kas Keluar / Biaya Operasional
                            </h2>

                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Keperluan Pengeluaran *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Beli Es Batu Kristal 4 Karung"
                                    value={expenseForm.title}
                                    onChange={(e) =>
                                        setExpenseForm({
                                            ...expenseForm,
                                            title: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Kategori Biaya
                                    </label>
                                    <select
                                        value={expenseForm.category}
                                        onChange={(e) =>
                                            setExpenseForm({
                                                ...expenseForm,
                                                category: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    >
                                        <option value="Bahan Baku Darurat">
                                            Bahan Baku Darurat
                                        </option>
                                        <option value="Operasional Dapur">
                                            Operasional Dapur
                                        </option>
                                        <option value="Listrik, Air & Internet">
                                            Listrik, Air & Internet
                                        </option>
                                        <option value="Kemasan & Kebersihan">
                                            Kemasan & Kebersihan
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Nominal (Rp) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1000"
                                        placeholder="40000"
                                        value={expenseForm.amount}
                                        onChange={(e) =>
                                            setExpenseForm({
                                                ...expenseForm,
                                                amount: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Sumber Dana
                                    </label>
                                    <select
                                        value={expenseForm.payment_source}
                                        onChange={(e) =>
                                            setExpenseForm({
                                                ...expenseForm,
                                                payment_source: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    >
                                        <option value="cash_drawer">
                                            Uang Laci Kasir
                                        </option>
                                        <option value="bank_transfer">
                                            Transfer Rekening Kafe
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Tanggal
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={expenseForm.expense_date}
                                        onChange={(e) =>
                                            setExpenseForm({
                                                ...expenseForm,
                                                expense_date: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition"
                            >
                                Simpan Catatan Kas Keluar
                            </button>
                        </form>

                        {/* Riwayat Pengeluaran Operasional */}
                        <div
                            className={`p-6 rounded-2xl space-y-3 ${cardClass}`}
                        >
                            <h3 className="font-extrabold text-sm">
                                Riwayat Pengeluaran Terakhir
                            </h3>
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {expenses.length === 0 ? (
                                    <p className="text-xs opacity-60 text-center py-6">
                                        Belum ada catatan pengeluaran
                                        operasional.
                                    </p>
                                ) : (
                                    expenses.map((exp) => (
                                        <div
                                            key={exp.id}
                                            className="p-3 rounded-xl bg-black/10 border border-current/10 flex justify-between items-center text-xs"
                                        >
                                            <div>
                                                <p className="font-bold">
                                                    {exp.title}
                                                </p>
                                                <p className="text-[11px] opacity-70">
                                                    {exp.category} •{" "}
                                                    {exp.payment_source ===
                                                    "cash_drawer"
                                                        ? "Laci Kasir"
                                                        : "Transfer Bank"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-extrabold text-red-500">
                                                    -Rp{" "}
                                                    {Number(
                                                        exp.amount,
                                                    ).toLocaleString("id-ID")}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        router.delete(
                                                            route(
                                                                "finance.expenses.destroy",
                                                                exp.id,
                                                            ),
                                                        )
                                                    }
                                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* KOLOM KANAN (7): RIWAYAT TRANSAKSI LENGKAP, FILTER TANGGAL & VOID ORDER */}
                    <div
                        className={`col-span-12 lg:col-span-7 p-6 rounded-2xl space-y-4 h-fit ${cardClass}`}
                    >
                        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-current/10 pb-3">
                            <div>
                                <h2 className="font-extrabold text-base">
                                    Audit Riwayat Struk, Cetak Ulang & Void
                                    Pesanan
                                </h2>
                                <p className="text-xs opacity-70">
                                    Jika pesanan dibatalkan (Void), stok bahan
                                    baku resep otomatis kembali ke gudang.
                                </p>
                            </div>
                        </div>

                        {/* Bar Filter Tanggal & Status */}
                        <form
                            onSubmit={handleApplyFilter}
                            className="flex flex-wrap items-center gap-2"
                        >
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className={inputClass}
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className={inputClass}
                            >
                                <option value="ALL">Semua Status Order</option>
                                <option value="paid">Paid (Lunas)</option>
                                <option value="processing">
                                    Processing (Dapur)
                                </option>
                                <option value="ready">Ready (Siap Saji)</option>
                                <option value="completed">
                                    Completed (Selesai)
                                </option>
                                <option value="cancelled">
                                    Cancelled (Void/Batal)
                                </option>
                            </select>
                            <button
                                type="submit"
                                className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1"
                            >
                                <Filter className="w-3.5 h-3.5" /> Filter
                            </button>
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="px-3 py-2 rounded-xl bg-slate-500/20 text-xs font-bold flex items-center gap-1"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Reset
                            </button>
                        </form>

                        {/* Tabel Riwayat Order */}
                        <div className="overflow-x-auto max-h-[500px]">
                            <table className="w-full text-xs text-left">
                                <thead className="uppercase opacity-60 border-b border-current/10">
                                    <tr>
                                        <th className="py-2.5">
                                            No. Struk / Antrean
                                        </th>
                                        <th className="py-2.5">Pelanggan</th>
                                        <th className="py-2.5">Status</th>
                                        <th className="py-2.5">Total</th>
                                        <th className="py-2.5 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-current/10">
                                    {orders.map((ord) => (
                                        <tr key={ord.id}>
                                            <td className="py-3">
                                                <span className="font-extrabold text-emerald-500 mr-1.5">
                                                    #{ord.queue_number}
                                                </span>
                                                <span className="font-mono text-[11px] opacity-75">
                                                    {ord.order_code}
                                                </span>
                                            </td>
                                            <td className="py-3 font-semibold">
                                                {ord.customer_name}
                                                <span className="block text-[10px] opacity-60 uppercase">
                                                    {ord.order_type} •{" "}
                                                    {ord.payment
                                                        ?.payment_method ||
                                                        "CASH"}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <span
                                                    className={`px-2 py-0.5 rounded uppercase text-[10px] font-bold ${
                                                        ord.order_status ===
                                                        "cancelled"
                                                            ? "bg-red-500/20 text-red-400"
                                                            : "bg-emerald-500/20 text-emerald-400"
                                                    }`}
                                                >
                                                    {ord.order_status}
                                                </span>
                                            </td>
                                            <td className="py-3 font-extrabold">
                                                Rp{" "}
                                                {Number(
                                                    ord.grand_total,
                                                ).toLocaleString("id-ID")}
                                            </td>
                                            <td className="py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedOrderReceipt(
                                                                ord,
                                                            )
                                                        }
                                                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold flex items-center gap-1 transition"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />{" "}
                                                        Struk
                                                    </button>
                                                    {ord.order_status !==
                                                        "cancelled" && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleVoidOrder(
                                                                    ord,
                                                                )
                                                            }
                                                            className="px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white font-bold flex items-center gap-1 transition"
                                                        >
                                                            <Ban className="w-3.5 h-3.5" />{" "}
                                                            Void
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <ReceiptModal
                order={selectedOrderReceipt}
                cafeName={auth.cafe?.name}
                cafeSettings={auth.cafe?.settings}
                onClose={() => setSelectedOrderReceipt(null)}
            />
        </CaffeOSLayout>
    );
}
