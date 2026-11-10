import React from "react";
import { Printer, X } from "lucide-react";

export default function PrintInvoiceModal({ order, cafe, onClose }) {
    if (!order) return null;

    return (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white text-slate-950 rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl space-y-5 font-sans">
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                            OFFICIAL B2B & CO-WORKING INVOICE
                        </span>
                        <h2 className="text-2xl font-black uppercase mt-0.5">
                            {cafe?.name || "TechnoG CaffeOS"}
                        </h2>
                        <p className="text-xs text-slate-500">
                            {cafe?.address}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                            PAID / LUNAS
                        </span>
                        <p className="font-mono font-bold text-xs mt-2">
                            No: {order.order_code}
                        </p>
                        <p className="text-[11px] text-slate-500">
                            Tanggal:{" "}
                            {new Date(order.created_at).toLocaleDateString(
                                "id-ID",
                            )}
                        </p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 text-xs space-y-1">
                    <p className="text-slate-500 font-bold uppercase text-[10px]">
                        Ditagihkan Kepada (Client / Instansi):
                    </p>
                    <p className="font-black text-base text-slate-900">
                        {order.customer_name}
                    </p>
                    {order.ai_token && (
                        <p className="font-mono text-purple-700 font-bold pt-1">
                            Lisensi Token AI Co-Worker:{" "}
                            {order.ai_token.token_code} (
                            {order.ai_token.quota_limit} Kuota Prompt)
                        </p>
                    )}
                </div>

                <table className="w-full text-xs text-left border-b pb-4">
                    <thead className="uppercase text-slate-500 border-b">
                        <tr>
                            <th className="py-2">Deskripsi Layanan / Paket</th>
                            <th className="py-2 text-center">Qty</th>
                            <th className="py-2 text-right">Total Harga</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-3 font-bold">
                                {order.items?.[0]?.notes ||
                                    "Paket Co-Working / B2B Catering"}
                                <span className="block text-[11px] text-slate-500 font-normal">
                                    Termasuk sajian:{" "}
                                    {order.items?.[0]?.menu?.name ||
                                        "Signature Beverage"}
                                </span>
                            </td>
                            <td className="py-3 text-center font-mono">
                                {order.items?.[0]?.qty || 1}
                            </td>
                            <td className="py-3 text-right font-mono font-bold">
                                Rp{" "}
                                {Number(order.grand_total).toLocaleString(
                                    "id-ID",
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="flex justify-between items-center text-lg font-black bg-slate-900 text-white p-4 rounded-2xl">
                    <span>GRAND TOTAL INVOICE</span>
                    <span className="text-emerald-400">
                        Rp {Number(order.grand_total).toLocaleString("id-ID")}
                    </span>
                </div>

                <div className="flex gap-2.5 pt-2 no-print print:hidden">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Printer className="w-4 h-4" /> Cetak Faktur Invoice
                        Resmi (PDF)
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1"
                    >
                        <X className="w-4 h-4" /> Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
