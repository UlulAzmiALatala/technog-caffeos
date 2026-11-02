import React from "react";
import { Head, router } from "@inertiajs/react";
import { useCartStore } from "@/Engine/useCartStore";
import {
    QrCode,
    Sparkles,
    Lock,
    Plus,
    Minus,
    CreditCard,
    Banknote,
} from "lucide-react";

export default function SelfOrder({ cafe, table, menus, activeTemplate }) {
    const {
        cart,
        addToCart,
        updateQty,
        getTotal,
        customerName,
        setCustomerName,
        orderType,
        setOrderType,
        paymentMethod,
        setPaymentMethod,
        clearCart,
    } = useCartStore();

    const isWood = activeTemplate === "minimalist-wood";

    const handleSubmitOrder = () => {
        router.post(
            route("customer.submit-order", table.qr_code),
            {
                customer_name: customerName,
                order_type: orderType,
                payment_method: paymentMethod,
                items: cart,
            },
            { onSuccess: () => clearCart() },
        );
    };

    return (
        <div
            className={`min-h-screen pb-24 ${isWood ? "bg-amber-50 text-stone-800" : "bg-slate-950 text-slate-100"}`}
        >
            <Head title={`Order Meja ${table.table_number} - ${cafe.name}`} />

            {/* Header Pelanggan Adaptif Sesuai Template */}
            <div
                className={`p-5 sticky top-0 z-10 flex justify-between items-center border-b ${
                    isWood
                        ? "bg-amber-950 text-amber-50 border-amber-900"
                        : "bg-slate-900 border-slate-800"
                }`}
            >
                <div>
                    <span
                        className={`text-xs font-semibold flex items-center gap-1 ${isWood ? "text-amber-300" : "text-emerald-400"}`}
                    >
                        <QrCode className="w-3.5 h-3.5" /> QR MEJA #
                        {table.table_number} ({table.location})
                    </span>
                    <h1
                        className={`text-xl font-bold ${isWood ? "font-serif" : ""}`}
                    >
                        {cafe.name}
                    </h1>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> AI Co-Worker Terkunci
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-5 grid md:grid-cols-12 gap-6">
                {/* Katalog Menu */}
                <div className="md:col-span-7 space-y-3">
                    <h2
                        className={`font-bold ${isWood ? "font-serif text-lg text-amber-950" : "text-slate-300"}`}
                    >
                        Daftar Menu Kafe (
                        {isWood ? "Warm Wood Theme" : "CyberDark Theme"})
                    </h2>
                    {menus.map((menu) => (
                        <div
                            key={menu.id}
                            className={`p-4 rounded-2xl border flex justify-between items-center ${
                                isWood
                                    ? "bg-white border-amber-200 shadow-sm"
                                    : "bg-slate-900 border-slate-800"
                            }`}
                        >
                            <div className="pr-4">
                                <h3 className="font-bold text-base">
                                    {menu.name}
                                </h3>
                                <p className="text-xs opacity-70 mt-1">
                                    {menu.description}
                                </p>
                                <p
                                    className={`font-bold text-sm mt-2 ${isWood ? "text-amber-800" : "text-emerald-400"}`}
                                >
                                    Rp{" "}
                                    {Number(menu.price).toLocaleString("id-ID")}
                                </p>
                            </div>
                            <button
                                onClick={() => addToCart(menu)}
                                className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 ${
                                    isWood
                                        ? "bg-amber-900 text-white hover:bg-amber-800"
                                        : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                }`}
                            >
                                + Pesan
                            </button>
                        </div>
                    ))}
                </div>

                {/* Keranjang Checkout Pelanggan */}
                <div
                    className={`md:col-span-5 p-5 rounded-2xl border space-y-4 h-fit ${
                        isWood
                            ? "bg-white border-amber-200 shadow-sm"
                            : "bg-slate-900 border-slate-800"
                    }`}
                >
                    <h2 className="font-bold border-b pb-2">
                        Keranjang Meja #{table.table_number}
                    </h2>

                    <input
                        type="text"
                        placeholder="Masukkan Nama Anda..."
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={`w-full rounded-xl text-sm ${
                            isWood
                                ? "bg-amber-50/50 border-stone-300 text-stone-800"
                                : "bg-slate-950 border-slate-800 text-white"
                        }`}
                    />

                    <select
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value)}
                        className={`w-full rounded-xl text-sm ${
                            isWood
                                ? "bg-amber-50/50 border-stone-300 text-stone-800"
                                : "bg-slate-950 border-slate-800 text-white"
                        }`}
                    >
                        <option value="dine_in">
                            Dine-In (Makan di Meja {table.table_number})
                        </option>
                        <option value="takeaway">Bungkus (Takeaway)</option>
                        <option value="delivery">Delivery</option>
                    </select>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {cart.map((item) => (
                            <div
                                key={item.menu_id}
                                className={`flex justify-between items-center text-sm p-2.5 rounded-xl ${
                                    isWood ? "bg-amber-50" : "bg-slate-950"
                                }`}
                            >
                                <span>{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            updateQty(item.menu_id, -1)
                                        }
                                        className="p-1 bg-stone-300 text-stone-900 rounded"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="font-bold">
                                        {item.qty}
                                    </span>
                                    <button
                                        onClick={() =>
                                            updateQty(item.menu_id, 1)
                                        }
                                        className="p-1 bg-emerald-600 text-white rounded"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("qris")}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 ${
                                paymentMethod === "qris"
                                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-500"
                                    : "border-stone-400/40 opacity-60"
                            }`}
                        >
                            <CreditCard className="w-4 h-4" /> Online QRIS
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod("cash")}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 ${
                                paymentMethod === "cash"
                                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-500"
                                    : "border-stone-400/40 opacity-60"
                            }`}
                        >
                            <Banknote className="w-4 h-4" /> Tunai Kasir
                        </button>
                    </div>

                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span
                            className={
                                isWood ? "text-amber-900" : "text-emerald-400"
                            }
                        >
                            Rp {getTotal().toLocaleString("id-ID")}
                        </span>
                    </div>

                    <button
                        onClick={handleSubmitOrder}
                        disabled={cart.length === 0 || !customerName}
                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 ${
                            isWood
                                ? "bg-amber-900 text-white hover:bg-amber-800"
                                : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                        }`}
                    >
                        <Sparkles className="w-4 h-4" /> Checkout & Dapatkan
                        Token AI
                    </button>
                </div>
            </div>
        </div>
    );
}
