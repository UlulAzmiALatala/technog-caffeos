import React from "react";
import { Printer, X, Sparkles } from "lucide-react";

export default function ReceiptModal({ order, cafeName, onClose }) {
    if (!order) return null;

    // URL langsung menuju halaman Status Order & AI Chatbot Co-Worker milik pelanggan
    const aiOrderUrl = route("customer.order-status", order.order_code);
    const qrTokenImg = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(aiOrderUrl)}`;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white text-slate-950 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 font-mono text-xs">
                {/* Header Tombol Aksi (Disembunyikan saat Print) */}
                <div className="flex justify-between items-center border-b pb-3 print:hidden font-sans">
                    <span className="font-bold text-sm text-slate-700">
                        Preview Struk Thermal (58mm/80mm)
                    </span>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-slate-100"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Area Struk Cetak */}
                <div className="text-center space-y-1 border-b border-dashed border-slate-400 pb-3">
                    <h2 className="text-base font-extrabold uppercase">
                        {cafeName || "TechnoG CaffeOS"}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                        Smart Cafe & AI Co-Worker Space
                    </p>
                    <p className="text-[11px] pt-1">
                        No: <strong>{order.order_code}</strong>
                    </p>
                    <div className="inline-block px-3 py-1 rounded bg-slate-900 text-white font-bold text-sm mt-1">
                        ANTREAN #{order.queue_number}
                    </div>
                </div>

                {/* Info Pelanggan */}
                <div className="space-y-1 border-b border-dashed border-slate-400 pb-3 text-[11px]">
                    <div className="flex justify-between">
                        <span>Pelanggan:</span>
                        <span className="font-bold">{order.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tipe Order:</span>
                        <span className="uppercase">
                            {order.order_type}{" "}
                            {order.table
                                ? `(Meja ${order.table.table_number})`
                                : ""}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Metode Bayar:</span>
                        <span className="uppercase font-bold">
                            {order.payment?.payment_method || "CASH"} (
                            {order.payment?.payment_status})
                        </span>
                    </div>
                </div>

                {/* Rincian Item Menu */}
                <div className="space-y-2 border-b border-dashed border-slate-400 pb-3">
                    {order.items?.map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between items-start"
                        >
                            <div>
                                <p className="font-bold">
                                    {item.menu?.name || "Menu Item"}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                    {item.qty} x Rp{" "}
                                    {Number(item.unit_price).toLocaleString(
                                        "id-ID",
                                    )}
                                </p>
                            </div>
                            <span className="font-semibold">
                                Rp{" "}
                                {Number(item.subtotal).toLocaleString("id-ID")}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Grand Total */}
                <div className="flex justify-between text-sm font-extrabold border-b border-dashed border-slate-400 pb-3">
                    <span>TOTAL BAYAR</span>
                    <span>
                        Rp {Number(order.grand_total).toLocaleString("id-ID")}
                    </span>
                </div>

                {/* Bagian QR Code Token AI Sesuai Flowchart Gambar 1 */}
                {order.ai_token ? (
                    <div className="text-center space-y-2 pt-1">
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3" /> AKSES AI CHATBOT
                            CO-WORKER
                        </div>
                        <img
                            src={qrTokenImg}
                            alt="QR Code Token AI"
                            className="w-32 h-32 mx-auto border border-slate-300 p-1.5 rounded-xl"
                        />
                        <p className="text-xs font-extrabold tracking-widest bg-slate-100 py-1 rounded">
                            TOKEN: {order.ai_token.token_code}
                        </p>
                        <p className="text-[10px] text-slate-500 leading-tight">
                            Scan QR di atas untuk memantau status dapur &
                            konsultasi gratis dengan AI Co-Worker (Kuota:{" "}
                            {order.ai_token.quota_limit}x chat).
                        </p>
                    </div>
                ) : (
                    <p className="text-center text-[11px] text-amber-700 font-bold py-2">
                        *Selesaikan validasi pembayaran di kasir untuk
                        mengaktifkan QR Token AI.
                    </p>
                )}

                {/* Tombol Print & Tutup */}
                <div className="flex gap-2 pt-3 print:hidden font-sans">
                    <button
                        onClick={() => window.print()}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                        <Printer className="w-4 h-4" /> Cetak Struk
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
