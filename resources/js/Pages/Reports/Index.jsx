import React from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    FileText,
    Printer,
    TrendingUp,
    DollarSign,
    ShieldCheck,
    CreditCard,
    AlertTriangle,
    CheckCircle2,
    Calendar,
} from "lucide-react";

export default function ReportsIndex({
    cafe,
    currentPeriod = "all",
    summary,
    paymentBreakdown,
    orderTypeBreakdown,
    expensesByCategory = {},
    topItems = [],
    latestShifts = [],
    templates = [],
    tables = [],
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";

    const handlePeriodChange = (period) => {
        router.get(
            route("reports.index"),
            { period },
            { preserveScroll: true },
        );
    };

    const cardClass = isBrutal
        ? "bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        : isWood
          ? "bg-white border border-amber-200 text-stone-800 shadow-sm"
          : "bg-slate-900 border border-slate-800 text-slate-100";

    const periodLabels = {
        today: "HARI INI (" + new Date().toLocaleDateString("id-ID") + ")",
        month:
            "BULAN INI (" +
            new Date().toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
            }) +
            ")",
        all: "AKUMULASI KESELURUHAN",
    };

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Laporan Tutup Buku (Z-Report) & Pajak PB1 - TechnoG CaffeOS" />

            <div className="p-6 max-w-6xl mx-auto space-y-6 print:p-0 print:max-w-none">
                {/* Bar Filter Periode & Tombol Cetak Dokumen Resmi (Disembunyikan Saat Dicetak) */}
                <div
                    className={`no-print print:hidden p-5 rounded-3xl flex flex-wrap justify-between items-center gap-4 ${cardClass}`}
                >
                    <div>
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                            <FileText className="w-4 h-4" /> End-of-Day Z-Report
                            & Tax PB1 Statement
                        </span>
                        <h1 className="text-xl font-black mt-0.5">
                            Laporan Tutup Buku Kasir, Pajak Restoran (PB1) &
                            Laba Rugi
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-black">
                        {[
                            { id: "today", label: "Hari Ini" },
                            { id: "month", label: "Bulan Ini" },
                            { id: "all", label: "Semua Periode" },
                        ].map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => handlePeriodChange(p.id)}
                                className={`px-3.5 py-2 rounded-xl transition ${
                                    currentPeriod === p.id
                                        ? "bg-emerald-500 text-slate-950 shadow"
                                        : "bg-black/20 hover:bg-black/30"
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black flex items-center gap-2 shadow-lg"
                        >
                            <Printer className="w-4 h-4" /> Cetak Dokumen
                            Z-Report Resmi (A4 / PDF)
                        </button>
                    </div>
                </div>

                {/* LEMBAR DOKUMEN Z-REPORT & LABA RUGI RESMI (TAMPIL BERSIH DI LAYAR & KERTAS A4) */}
                <div className="p-8 rounded-3xl bg-white text-slate-900 border-2 border-slate-200 shadow-2xl print:shadow-none print:border-none space-y-6 font-sans">
                    {/* Kop Dokumen Resmi */}
                    <div className="flex flex-wrap justify-between items-start border-b-4 border-slate-900 pb-5 gap-4">
                        <div>
                            <span className="px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                                OFFICIAL Z-REPORT & PROFIT-LOSS STATEMENT
                            </span>
                            <h2 className="text-2xl font-black uppercase mt-2">
                                {cafe?.name}
                            </h2>
                            <p className="text-xs text-slate-600">
                                {cafe?.address}
                            </p>
                        </div>

                        <div className="text-right text-xs space-y-1">
                            <p className="font-black text-sm text-emerald-700">
                                PERIODE: {periodLabels[currentPeriod]}
                            </p>
                            <p className="text-slate-500 font-mono">
                                Dicetak Oleh: {auth.user?.name} (
                                {auth.user?.role.toUpperCase()})
                            </p>
                            <p className="text-slate-500 font-mono">
                                Waktu Cetak:{" "}
                                {new Date().toLocaleString("id-ID")}
                            </p>
                        </div>
                    </div>

                    {/* Bagian 1: Ringkasan Eksekutif Omzet, Pajak PB1 & Laba Bersih */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] font-black uppercase text-slate-500 block">
                                1. Omzet Kotor (Gross Sales)
                            </span>
                            <p className="text-lg font-black text-slate-900 mt-1">
                                Rp{" "}
                                {Number(
                                    summary.net_sales_revenue,
                                ).toLocaleString("id-ID")}
                            </p>
                            <span className="text-[11px] text-slate-500">
                                {summary.valid_orders_count} Transaksi Sukses
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                            <span className="text-[10px] font-black uppercase text-amber-800 block">
                                2. Pajak Restoran PB1 ({summary.tax_percent}%)
                            </span>
                            <p className="text-lg font-black text-amber-700 mt-1">
                                Rp{" "}
                                {Number(
                                    summary.estimated_tax_pb1,
                                ).toLocaleString("id-ID")}
                            </p>
                            <span className="text-[11px] text-amber-700">
                                DPP Bersih: Rp{" "}
                                {Number(
                                    summary.revenue_before_tax,
                                ).toLocaleString("id-ID")}
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                            <span className="text-[10px] font-black uppercase text-rose-800 block">
                                3. Total Pengeluaran & Gaji
                            </span>
                            <p className="text-lg font-black text-rose-700 mt-1">
                                -Rp{" "}
                                {Number(summary.total_expenses).toLocaleString(
                                    "id-ID",
                                )}
                            </p>
                            <span className="text-[11px] text-rose-600">
                                Void Struk: {summary.voided_orders_count}x (Rp{" "}
                                {Number(summary.voided_amount).toLocaleString(
                                    "id-ID",
                                )}
                                )
                            </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500">
                            <span className="text-[10px] font-black uppercase text-emerald-800 block">
                                4. Laba Bersih (Net Profit)
                            </span>
                            <p className="text-xl font-black text-emerald-700 mt-1">
                                Rp{" "}
                                {Number(summary.net_profit).toLocaleString(
                                    "id-ID",
                                )}
                            </p>
                            <span className="text-[11px] font-bold text-emerald-700">
                                Setelah Pajak & Biaya Operasional
                            </span>
                        </div>
                    </div>

                    {/* Bagian 2: Rincian Metode Pembayaran & Pengeluaran per Kategori */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                            <h3 className="font-black text-sm uppercase border-b pb-2">
                                A. Rekonsiliasi Penerimaan per Metode Bayar
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between py-1 border-b border-dashed">
                                    <span>📱 QRIS Dinamis</span>
                                    <strong className="font-mono">
                                        Rp{" "}
                                        {Number(
                                            paymentBreakdown.qris || 0,
                                        ).toLocaleString("id-ID")}
                                    </strong>
                                </div>
                                <div className="flex justify-between py-1 border-b border-dashed">
                                    <span>💵 Uang Tunai (Cash Laci Kasir)</span>
                                    <strong className="font-mono">
                                        Rp{" "}
                                        {Number(
                                            paymentBreakdown.cash || 0,
                                        ).toLocaleString("id-ID")}
                                    </strong>
                                </div>
                                <div className="flex justify-between py-1 border-b border-dashed">
                                    <span>
                                        💳 E-Wallet (GoPay / OVO / Dana)
                                    </span>
                                    <strong className="font-mono">
                                        Rp{" "}
                                        {Number(
                                            paymentBreakdown.ewallet || 0,
                                        ).toLocaleString("id-ID")}
                                    </strong>
                                </div>
                                <div className="flex justify-between py-1 border-b border-dashed">
                                    <span>
                                        🏦 Virtual Account / Transfer Bank
                                    </span>
                                    <strong className="font-mono">
                                        Rp{" "}
                                        {Number(
                                            paymentBreakdown.va || 0,
                                        ).toLocaleString("id-ID")}
                                    </strong>
                                </div>
                                <div className="flex justify-between pt-1 font-black text-emerald-700">
                                    <span>Total Diskon Voucher Diberikan</span>
                                    <span className="font-mono">
                                        -Rp{" "}
                                        {Number(
                                            summary.total_discount,
                                        ).toLocaleString("id-ID")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                            <h3 className="font-black text-sm uppercase border-b pb-2">
                                B. Rincian Kas Keluar & Top 5 Menu Terjual
                            </h3>
                            <div className="space-y-1.5">
                                {Object.entries(expensesByCategory).map(
                                    ([cat, amt]) => (
                                        <div
                                            key={cat}
                                            className="flex justify-between text-rose-700"
                                        >
                                            <span>• Biaya {cat}</span>
                                            <strong className="font-mono">
                                                -Rp{" "}
                                                {Number(amt).toLocaleString(
                                                    "id-ID",
                                                )}
                                            </strong>
                                        </div>
                                    ),
                                )}
                            </div>

                            <div className="pt-2 border-t space-y-1.5">
                                <span className="font-black text-[11px] uppercase text-slate-500 block">
                                    Top Kontributor Menu:
                                </span>
                                {topItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between"
                                    >
                                        <span>
                                            {idx + 1}. {item.menu?.name} (
                                            {item.total_qty} cup)
                                        </span>
                                        <strong className="font-mono">
                                            Rp{" "}
                                            {Number(
                                                item.total_sales,
                                            ).toLocaleString("id-ID")}
                                        </strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bagian 3: Kolom Tanda Tangan Pengesahan Tutup Buku */}
                    <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
                        <div className="space-y-14">
                            <p className="font-bold text-slate-600 uppercase">
                                Disiapkan & Dihitung Oleh (Kasir Shift)
                            </p>
                            <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-black">
                                Staf Kasir Bertugas
                            </div>
                        </div>
                        <div className="space-y-14">
                            <p className="font-bold text-slate-600 uppercase">
                                Diperiksa & Disahkan Oleh (Owner Kafe)
                            </p>
                            <div className="border-t border-slate-400 w-48 mx-auto pt-1 font-black">
                                {auth.user?.name}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CaffeOSLayout>
    );
}
