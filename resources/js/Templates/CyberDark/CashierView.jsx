import React from "react";
import { useCartStore } from "@/Engine/useCartStore";
import {
    Coffee,
    Plus,
    Minus,
    Sparkles,
    CreditCard,
    Banknote,
    Volume2,
    Printer,
} from "lucide-react";

export default function CyberDarkCashier({
    menus,
    tables,
    recentOrders,
    onCheckout,
    onCallQueue,
    onPrintReceipt,
}) {
    const {
        cart,
        addToCart,
        updateQty,
        getTotal,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        tableId,
        setTableId,
        orderType,
        setOrderType,
        paymentMethod,
        setPaymentMethod,
    } = useCartStore();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 grid grid-cols-12 gap-6">
            {/* Katalog Menu & Antrean Aktif */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-emerald-500/20 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                            <Sparkles className="w-6 h-6" /> CyberDark POS
                            Engine
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Mode Glassmorphism • Auto Stock & AI Token Generator
                        </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Template #1: CyberDark
                    </span>
                </div>

                {/* Grid Menu */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {menus.map((menu) => (
                        <div
                            key={menu.id}
                            onClick={() => addToCart(menu)}
                            className="cursor-pointer group p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-md border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="h-28 rounded-xl bg-gradient-to-br from-emerald-950 to-slate-900 flex items-center justify-center mb-3">
                                    <Coffee className="w-10 h-10 text-emerald-400 group-hover:scale-110 transition-transform" />
                                </div>
                                <h3 className="font-semibold text-base">
                                    {menu.name}
                                </h3>
                                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                                    {menu.description}
                                </p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-800/80 flex justify-between items-center">
                                <span className="text-emerald-400 font-bold">
                                    Rp{" "}
                                    {Number(menu.price).toLocaleString("id-ID")}
                                </span>
                                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                                    <Plus className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Panel Call Queue, Cetak Struk, & Riwayat Order + AI Token */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
                        Antrean Pesanan, Struk Thermal & AI Token Terbit
                    </h2>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {recentOrders.map((ord) => (
                            <div
                                key={ord.id}
                                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80"
                            >
                                <div>
                                    <span className="font-bold text-emerald-400 mr-2">
                                        Antrean #{ord.queue_number}
                                    </span>
                                    <span className="font-medium">
                                        {ord.customer_name}
                                    </span>
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                                        {ord.order_type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {ord.ai_token && (
                                        <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono">
                                            {ord.ai_token.token_code}
                                        </span>
                                    )}
                                    {onPrintReceipt && (
                                        <button
                                            onClick={() => onPrintReceipt(ord)}
                                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1 transition"
                                        >
                                            <Printer className="w-3.5 h-3.5" />{" "}
                                            Struk & QR
                                        </button>
                                    )}
                                    <button
                                        onClick={() =>
                                            onCallQueue(
                                                ord.queue_number,
                                                ord.customer_name,
                                            )
                                        }
                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold flex items-center gap-1 transition"
                                    >
                                        <Volume2 className="w-3.5 h-3.5" />{" "}
                                        Panggil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Panel Keranjang & Checkout */}
            <div className="col-span-12 lg:col-span-4 p-6 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 flex flex-col justify-between h-fit space-y-4">
                <div className="space-y-3">
                    <h2 className="text-lg font-bold border-b border-slate-800 pb-3">
                        Detail Transaksi
                    </h2>

                    <input
                        type="text"
                        placeholder="Nama Pelanggan *"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full rounded-xl bg-slate-950 border-slate-800 text-slate-100 text-sm"
                    />

                    <input
                        type="text"
                        placeholder="No. WhatsApp (Opsional Member)"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full rounded-xl bg-slate-950 border-slate-800 text-slate-100 text-sm"
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <select
                            value={orderType}
                            onChange={(e) => setOrderType(e.target.value)}
                            className="rounded-xl bg-slate-950 border-slate-800 text-slate-100 text-sm"
                        >
                            <option value="dine_in">Dine-In</option>
                            <option value="takeaway">Takeaway</option>
                            <option value="delivery">Delivery</option>
                        </select>

                        <select
                            value={tableId}
                            onChange={(e) => setTableId(e.target.value)}
                            className="rounded-xl bg-slate-950 border-slate-800 text-slate-100 text-sm"
                        >
                            <option value="">Pilih Meja</option>
                            {tables.map((t) => (
                                <option key={t.id} value={t.id}>
                                    Meja {t.table_number}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* List Item di Keranjang */}
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1 pt-1">
                        {cart.map((item) => (
                            <div
                                key={item.menu_id}
                                className="p-3 rounded-xl bg-slate-950 flex justify-between items-center"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-emerald-400">
                                        Rp{" "}
                                        {(item.price * item.qty).toLocaleString(
                                            "id-ID",
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            updateQty(item.menu_id, -1)
                                        }
                                        className="p-1 rounded bg-slate-800"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-sm font-bold w-5 text-center">
                                        {item.qty}
                                    </span>
                                    <button
                                        onClick={() =>
                                            updateQty(item.menu_id, 1)
                                        }
                                        className="p-1 rounded bg-emerald-600"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("qris")}
                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                                paymentMethod === "qris"
                                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                                    : "border-slate-800 text-slate-400"
                            }`}
                        >
                            <CreditCard className="w-4 h-4" /> Online QRIS
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("cash")}
                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                                paymentMethod === "cash"
                                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                                    : "border-slate-800 text-slate-400"
                            }`}
                        >
                            <Banknote className="w-4 h-4" /> Tunai (Cash)
                        </button>
                    </div>

                    <div className="flex justify-between text-lg font-bold">
                        <span>Total Bayar</span>
                        <span className="text-emerald-400">
                            Rp {getTotal().toLocaleString("id-ID")}
                        </span>
                    </div>

                    <button
                        onClick={onCheckout}
                        disabled={cart.length === 0 || !customerName}
                        className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold transition"
                    >
                        Proses Pembayaran & Cetak Token AI
                    </button>
                </div>
            </div>
        </div>
    );
}
