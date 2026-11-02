import React from "react";
import { useCartStore } from "@/Engine/useCartStore";
import { Volume2, Printer, CreditCard, Banknote } from "lucide-react";

export default function MinimalistWoodCashier({
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
        <div className="min-h-screen bg-amber-50/70 text-stone-800 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Klasik */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-amber-900">
                            Minimalist Wood Roastery POS
                        </h1>
                        <p className="text-stone-500 text-sm">
                            Tampilan Bersih & Hangat • Mesin Kasir Terpadu
                        </p>
                    </div>
                    <span className="px-4 py-1.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-900">
                        Template #2: Minimalist Wood
                    </span>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Katalog Menu & Antrean Kiri */}
                    <div className="col-span-12 lg:col-span-7 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 space-y-4">
                            <h2 className="font-serif font-bold text-lg text-amber-950">
                                Katalog Sajian Kafe
                            </h2>
                            <div className="divide-y divide-stone-100">
                                {menus.map((menu) => (
                                    <div
                                        key={menu.id}
                                        className="py-3.5 flex justify-between items-center"
                                    >
                                        <div>
                                            <h3 className="font-bold text-stone-800">
                                                {menu.name}
                                            </h3>
                                            <p className="text-xs text-stone-500">
                                                {menu.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <span className="font-semibold text-amber-800">
                                                Rp{" "}
                                                {Number(
                                                    menu.price,
                                                ).toLocaleString("id-ID")}
                                            </span>
                                            <button
                                                onClick={() => addToCart(menu)}
                                                className="px-3.5 py-1.5 rounded-lg bg-amber-800 text-white text-xs font-semibold hover:bg-amber-700"
                                            >
                                                + Tambah
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Daftar Antrean, Call Queue, & Struk QR */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 space-y-3">
                            <h2 className="font-serif font-bold text-base text-amber-950">
                                Antrean Pesanan & Cetak Struk QR Token AI
                            </h2>
                            <div className="space-y-2 max-h-56 overflow-y-auto">
                                {recentOrders.map((ord) => (
                                    <div
                                        key={ord.id}
                                        className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 flex flex-wrap justify-between items-center gap-2 text-xs"
                                    >
                                        <div>
                                            <span className="font-bold text-amber-900 mr-2">
                                                Antrean #{ord.queue_number}
                                            </span>
                                            <span className="font-semibold">
                                                {ord.customer_name}
                                            </span>
                                            {ord.ai_token && (
                                                <span className="ml-2 px-2 py-0.5 rounded bg-amber-200/70 text-amber-950 font-mono">
                                                    {ord.ai_token.token_code}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {onPrintReceipt && (
                                                <button
                                                    onClick={() =>
                                                        onPrintReceipt(ord)
                                                    }
                                                    className="px-2.5 py-1.5 rounded bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold flex items-center gap-1"
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
                                                className="px-2.5 py-1.5 rounded bg-amber-800 hover:bg-amber-700 text-white font-semibold flex items-center gap-1"
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

                    {/* Struk Kasir Kanan */}
                    <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-stone-200 space-y-4 h-fit">
                        <h2 className="font-serif font-bold text-lg border-b pb-2 text-amber-950">
                            Nota Pemesanan
                        </h2>

                        <input
                            type="text"
                            placeholder="Nama Pemesan *"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full rounded-lg border-stone-300 text-sm"
                        />

                        <input
                            type="text"
                            placeholder="Nomor WhatsApp (Opsional Member)"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full rounded-lg border-stone-300 text-sm"
                        />

                        <div className="grid grid-cols-2 gap-2">
                            <select
                                value={orderType}
                                onChange={(e) => setOrderType(e.target.value)}
                                className="rounded-lg border-stone-300 text-sm"
                            >
                                <option value="dine_in">Dine-In</option>
                                <option value="takeaway">Takeaway</option>
                                <option value="delivery">Delivery</option>
                            </select>

                            <select
                                value={tableId}
                                onChange={(e) => setTableId(e.target.value)}
                                className="rounded-lg border-stone-300 text-sm"
                            >
                                <option value="">Pilih Meja</option>
                                {tables.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        Meja {t.table_number}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2 max-h-56 overflow-y-auto">
                            {cart.map((item) => (
                                <div
                                    key={item.menu_id}
                                    className="flex justify-between items-center text-sm bg-amber-50/60 p-2.5 rounded-lg"
                                >
                                    <span>
                                        {item.name} (x{item.qty})
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">
                                            Rp{" "}
                                            {(
                                                item.price * item.qty
                                            ).toLocaleString("id-ID")}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateQty(item.menu_id, -1)
                                            }
                                            className="px-2 bg-stone-200 rounded"
                                        >
                                            -
                                        </button>
                                        <button
                                            onClick={() =>
                                                updateQty(item.menu_id, 1)
                                            }
                                            className="px-2 bg-amber-800 text-white rounded"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("qris")}
                                className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 ${
                                    paymentMethod === "qris"
                                        ? "border-amber-800 bg-amber-100 text-amber-950"
                                        : "border-stone-200 text-stone-500"
                                }`}
                            >
                                <CreditCard className="w-4 h-4" /> Online QRIS
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("cash")}
                                className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 ${
                                    paymentMethod === "cash"
                                        ? "border-amber-800 bg-amber-100 text-amber-950"
                                        : "border-stone-200 text-stone-500"
                                }`}
                            >
                                <Banknote className="w-4 h-4" /> Tunai (Cash)
                            </button>
                        </div>

                        <div className="pt-3 border-t flex justify-between font-bold text-lg text-amber-950">
                            <span>Total</span>
                            <span>Rp {getTotal().toLocaleString("id-ID")}</span>
                        </div>

                        <button
                            onClick={onCheckout}
                            disabled={cart.length === 0 || !customerName}
                            className="w-full py-3 rounded-lg bg-amber-900 hover:bg-amber-800 disabled:opacity-40 text-white font-semibold"
                        >
                            Bayar & Terbitkan AI Token
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
