import React from "react";
import { useCartStore } from "@/Engine/useCartStore";
import { Volume2, Printer, Plus, Minus, Zap } from "lucide-react";

export default function NeoBrutalCashier({
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
        <div className="min-h-screen bg-yellow-300 text-black p-6 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
                {/* Katalog Kiri */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="bg-white border-4 border-black p-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                                <Zap className="w-6 h-6 fill-yellow-400" />{" "}
                                Neo-Brutal Pop POS
                            </h1>
                            <p className="text-xs font-bold text-neutral-600">
                                High-Contrast Street Coffee Template • Fast
                                Touch Mode
                            </p>
                        </div>
                        <span className="px-3 py-1 bg-pink-400 border-2 border-black rounded-lg text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            Template #3: Neo-Brutal
                        </span>
                    </div>

                    {/* Grid Menu Bento */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {menus.map((menu) => (
                            <div
                                key={menu.id}
                                onClick={() => addToCart(menu)}
                                className="cursor-pointer bg-white border-4 border-black p-4 rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <span className="px-2 py-0.5 bg-cyan-300 border-2 border-black rounded text-[10px] font-black uppercase">
                                        {menu.category}
                                    </span>
                                    <h3 className="font-black text-base mt-2">
                                        {menu.name}
                                    </h3>
                                    <p className="text-xs text-neutral-600 line-clamp-2 mt-1">
                                        {menu.description}
                                    </p>
                                </div>
                                <div className="mt-4 pt-2 border-t-2 border-black flex justify-between items-center">
                                    <span className="font-black text-sm">
                                        Rp{" "}
                                        {Number(menu.price).toLocaleString(
                                            "id-ID",
                                        )}
                                    </span>
                                    <span className="px-2.5 py-1 bg-lime-400 border-2 border-black rounded-lg text-xs font-black">
                                        + PILIH
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Antrean & Tombol Cetak Struk */}
                    <div className="bg-white border-4 border-black p-5 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
                        <h2 className="font-black uppercase text-sm">
                            Antrean Aktif & Struk QR Token AI
                        </h2>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {recentOrders.map((ord) => (
                                <div
                                    key={ord.id}
                                    className="p-3 bg-amber-100 border-2 border-black rounded-xl flex flex-wrap justify-between items-center gap-2"
                                >
                                    <div>
                                        <span className="font-black text-sm mr-2">
                                            #{ord.queue_number}
                                        </span>
                                        <span className="font-bold text-sm">
                                            {ord.customer_name}
                                        </span>
                                        {ord.ai_token && (
                                            <span className="ml-2 px-2 py-0.5 bg-purple-300 border border-black rounded text-[11px] font-mono font-bold">
                                                {ord.ai_token.token_code}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onPrintReceipt(ord)}
                                            className="px-3 py-1.5 bg-white hover:bg-neutral-100 border-2 border-black rounded-lg text-xs font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        >
                                            <Printer className="w-3.5 h-3.5" />{" "}
                                            Struk & QR AI
                                        </button>
                                        <button
                                            onClick={() =>
                                                onCallQueue(
                                                    ord.queue_number,
                                                    ord.customer_name,
                                                )
                                            }
                                            className="px-3 py-1.5 bg-lime-400 hover:bg-lime-300 border-2 border-black rounded-lg text-xs font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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

                {/* Panel Checkout Kanan */}
                <div className="col-span-12 lg:col-span-4 bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-fit space-y-4">
                    <div className="space-y-3">
                        <h2 className="text-lg font-black uppercase border-b-4 border-black pb-2">
                            Struk Order Baru
                        </h2>

                        <input
                            type="text"
                            placeholder="Nama Pelanggan *"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full rounded-xl border-2 border-black text-sm font-bold"
                        />

                        <input
                            type="text"
                            placeholder="No. WhatsApp (Opsional Member)"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="w-full rounded-xl border-2 border-black text-sm font-bold"
                        />

                        <div className="grid grid-cols-2 gap-2">
                            <select
                                value={orderType}
                                onChange={(e) => setOrderType(e.target.value)}
                                className="rounded-xl border-2 border-black text-xs font-bold"
                            >
                                <option value="dine_in">DINE-IN</option>
                                <option value="takeaway">TAKEAWAY</option>
                                <option value="delivery">DELIVERY</option>
                            </select>

                            <select
                                value={tableId}
                                onChange={(e) => setTableId(e.target.value)}
                                className="rounded-xl border-2 border-black text-xs font-bold"
                            >
                                <option value="">Pilih Meja</option>
                                {tables.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        Meja {t.table_number}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto py-1">
                            {cart.map((item) => (
                                <div
                                    key={item.menu_id}
                                    className="p-2.5 bg-yellow-100 border-2 border-black rounded-xl flex justify-between items-center"
                                >
                                    <div>
                                        <p className="text-xs font-black">
                                            {item.name}
                                        </p>
                                        <p className="text-xs font-bold text-neutral-700">
                                            Rp{" "}
                                            {(
                                                item.price * item.qty
                                            ).toLocaleString("id-ID")}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() =>
                                                updateQty(item.menu_id, -1)
                                            }
                                            className="p-1 bg-white border border-black rounded"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="font-black text-xs w-5 text-center">
                                            {item.qty}
                                        </span>
                                        <button
                                            onClick={() =>
                                                updateQty(item.menu_id, 1)
                                            }
                                            className="p-1 bg-lime-400 border border-black rounded"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t-4 border-black">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("qris")}
                                className={`py-2 rounded-xl border-2 border-black text-xs font-black uppercase ${
                                    paymentMethod === "qris"
                                        ? "bg-cyan-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        : "bg-neutral-100"
                                }`}
                            >
                                QRIS Online
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("cash")}
                                className={`py-2 rounded-xl border-2 border-black text-xs font-black uppercase ${
                                    paymentMethod === "cash"
                                        ? "bg-lime-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        : "bg-neutral-100"
                                }`}
                            >
                                Cash Tunai
                            </button>
                        </div>

                        <div className="flex justify-between text-lg font-black">
                            <span>TOTAL</span>
                            <span>Rp {getTotal().toLocaleString("id-ID")}</span>
                        </div>

                        <button
                            onClick={onCheckout}
                            disabled={cart.length === 0 || !customerName}
                            className="w-full py-3.5 bg-pink-400 hover:bg-pink-300 disabled:opacity-40 border-4 border-black rounded-xl font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                            Bayar & Cetak QR Token AI
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
