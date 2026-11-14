import React, { useState, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import { useCartStore } from "@/Engine/useCartStore";
import CustomerLayout from "@/Layouts/CustomerLayout";
import QrisPaymentModal from "@/Components/QrisPaymentModal";
import {
    Sparkles,
    Plus,
    Minus,
    CreditCard,
    Banknote,
    Coffee,
    Search,
    Flame,
    Ticket,
    X,
    ShoppingBag,
    Crown,
    Truck,
    MapPin,
} from "lucide-react";

export default function SelfOrder({
    cafe,
    table,
    menus = [],
    vouchers = [],
    bestSellerIds = [],
    activeTemplate = "cyber-dark",
}) {
    const {
        cart,
        addToCart,
        updateQty,
        updateItemNotes,
        getSubtotal,
        getDiscountAmount,
        getTotal,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        orderType,
        setOrderType,
        paymentMethod,
        setPaymentMethod,
        appliedVoucher,
        setAppliedVoucher,
        clearCart,
    } = useCartStore();

    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [showQrisModal, setShowQrisModal] = useState(false);

    // State Khusus Percabangan Flowchart: IS DELIVERY ORDER == YES (Order Online Ojol)
    const courierOptions = [
        { id: "GoSend Instant (Ojol)", cost: 12000, eta: "15-25 Menit" },
        { id: "GrabExpress Instant (Ojol)", cost: 13000, eta: "15-25 Menit" },
        { id: "Maxim Bike Delivery", cost: 9000, eta: "20-30 Menit" },
        { id: "Kurir Internal Kafe", cost: 8000, eta: "25-40 Menit" },
    ];
    const [selectedCourier, setSelectedCourier] = useState(courierOptions[0]);
    const [deliveryAddress, setDeliveryAddress] = useState("");

    const cartSectionRef = useRef(null);

    const isWood = activeTemplate === "minimalist-wood";
    const isBrutal = activeTemplate === "neo-brutal";

    const categories = ["ALL", ...new Set(menus.map((m) => m.category))];
    const filteredMenus = menus.filter((m) => {
        const matchCat =
            selectedCategory === "ALL" || m.category === selectedCategory;
        const matchSearch = m.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    const isDelivery = orderType === "delivery";
    const shippingCost = isDelivery ? selectedCourier.cost : 0;
    const finalTotalWithShipping = getTotal() + shippingCost;

    const submitCustomerOrder = () => {
        router.post(
            route("customer.submit-order", table.qr_code),
            {
                customer_name: customerName,
                customer_phone: customerPhone,
                order_type: orderType,
                payment_method: paymentMethod,
                voucher_id: appliedVoucher?.id || null,
                courier_brand: isDelivery ? selectedCourier.id : null,
                delivery_address: isDelivery ? deliveryAddress : null,
                shipping_cost: shippingCost,
                items: cart,
            },
            {
                onSuccess: () => {
                    setShowQrisModal(false);
                    clearCart();
                },
            },
        );
    };

    const handleCheckoutClick = () => {
        if (cart.length === 0 || !customerName.trim()) return;
        if (isDelivery && !deliveryAddress.trim()) return;

        if (paymentMethod === "qris") {
            setShowQrisModal(true);
        } else {
            submitCustomerOrder();
        }
    };

    const scrollToCart = () => {
        cartSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const cardClass = isBrutal
        ? "bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        : isWood
          ? "bg-white border border-amber-200 text-stone-800 shadow-sm"
          : "bg-slate-900/90 border border-slate-800 text-slate-100";

    const inputClass = isBrutal
        ? "rounded-xl bg-yellow-100 border-2 border-black text-black font-bold text-xs"
        : isWood
          ? "rounded-xl bg-amber-50/70 border-stone-300 text-stone-800 text-xs"
          : "rounded-xl bg-slate-950 border-slate-800 text-white text-xs";

    const earnedPointsPreview = Math.floor(finalTotalWithShipping / 10000);
    const totalItemsInCart = cart.reduce((s, i) => s + i.qty, 0);

    return (
        <CustomerLayout
            cafe={cafe}
            table={table}
            activeTemplate={activeTemplate}
            activePage="menu"
            cartCount={totalItemsInCart}
            onOpenCartDrawer={scrollToCart}
        >
            <Head title={`Pesan Online & Self-Order - ${cafe.name}`} />

            <div className="space-y-6">
                {/* Banner Hero Sambutan Pelanggan */}
                <div
                    className={`p-6 rounded-3xl relative overflow-hidden flex flex-wrap justify-between items-center gap-4 ${
                        isBrutal
                            ? "bg-pink-400 border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                            : isWood
                              ? "bg-gradient-to-r from-amber-900 to-stone-900 text-amber-50 shadow-lg"
                              : "bg-gradient-to-r from-emerald-950/90 via-slate-900 to-indigo-950/90 border border-emerald-500/30 text-white shadow-xl"
                    }`}
                >
                    <div className="space-y-1 max-w-xl">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-400">
                            <Sparkles className="w-3.5 h-3.5" /> Dine-In Meja #
                            {table.table_number} • Takeaway • Order Delivery
                            Ojol
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black">
                            Pesan dari Meja atau Order Delivery Ojol ke Rumahmu!
                        </h2>
                        <p className="text-xs opacity-80 leading-relaxed">
                            Setiap transaksi (baik makan di tempat maupun pesan
                            antar via{" "}
                            <strong>GoSend / GrabExpress / Maxim</strong>)
                            otomatis mendapatkan{" "}
                            <strong>Token AI Co-Worker</strong> gratis!
                        </p>
                    </div>
                </div>

                {/* Bar Pencarian & Filter Kategori Menu */}
                <div
                    className={`p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 ${cardClass}`}
                >
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="w-4 h-4 opacity-50 absolute left-3.5 top-2.5" />
                        <input
                            type="text"
                            placeholder="Cari nama kopi, minuman, atau makanan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-9 pr-4 py-2 ${inputClass}`}
                        />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-black transition shrink-0 ${
                                    selectedCategory === cat
                                        ? "bg-emerald-500 text-slate-950 shadow"
                                        : "bg-black/10 hover:bg-black/20"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid Katalog Menu (Kiri) + Keranjang Checkout & Ojol Delivery (Kanan) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
                        {filteredMenus.map((menu) => {
                            const isBestSeller = bestSellerIds.includes(
                                menu.id,
                            );
                            const inCartItem = cart.find(
                                (i) => i.menu_id === menu.id,
                            );

                            return (
                                <div
                                    key={menu.id}
                                    className={`p-4 rounded-3xl flex flex-col justify-between relative overflow-hidden transition hover:scale-[1.01] ${cardClass}`}
                                >
                                    {isBestSeller && (
                                        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow">
                                            <Flame className="w-3 h-3 fill-slate-950" />{" "}
                                            BEST SELLER
                                        </span>
                                    )}

                                    <div>
                                        {menu.image ? (
                                            <img
                                                src={menu.image}
                                                alt={menu.name}
                                                className="h-36 w-full object-cover rounded-2xl mb-3 border border-current/10"
                                            />
                                        ) : (
                                            <div className="h-36 rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-900 flex items-center justify-center mb-3">
                                                <Coffee className="w-10 h-10 text-emerald-400" />
                                            </div>
                                        )}

                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                                            {menu.category}
                                        </span>
                                        <h3 className="font-black text-base mt-1">
                                            {menu.name}
                                        </h3>
                                        <p className="text-xs opacity-70 line-clamp-2 mt-0.5">
                                            {menu.description ||
                                                "Racikan spesial barista kami."}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-current/10 flex justify-between items-center">
                                        <span className="font-black text-base text-emerald-500">
                                            Rp{" "}
                                            {Number(menu.price).toLocaleString(
                                                "id-ID",
                                            )}
                                        </span>

                                        {inCartItem ? (
                                            <div className="flex items-center gap-2 bg-emerald-500/20 px-2 py-1 rounded-xl border border-emerald-500/40">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQty(menu.id, -1)
                                                    }
                                                    className="p-1 rounded-lg bg-slate-900 text-white"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="font-black text-xs w-4 text-center">
                                                    {inCartItem.qty}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQty(menu.id, 1)
                                                    }
                                                    className="p-1 rounded-lg bg-emerald-500 text-slate-950"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => addToCart(menu)}
                                                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow"
                                            >
                                                <Plus className="w-3.5 h-3.5" />{" "}
                                                Pesan
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Panel Keranjang & Pilihan Ojol Delivery */}
                    <div
                        ref={cartSectionRef}
                        className={`lg:col-span-5 p-6 rounded-3xl space-y-4 h-fit sticky top-24 ${cardClass}`}
                    >
                        <div className="flex justify-between items-center border-b border-current/10 pb-3">
                            <h2 className="font-black text-base flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-emerald-500" />{" "}
                                Detail Pesanan Anda
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black">
                                {totalItemsInCart} Item
                            </span>
                        </div>

                        {/* Pilihan Mode Pesanan Sesuai Flowchart: Dine-In / Takeaway / Delivery Ojol */}
                        <div className="grid grid-cols-3 gap-1.5 text-[11px] font-black">
                            <button
                                type="button"
                                onClick={() => setOrderType("dine_in")}
                                className={`py-2.5 px-2 rounded-xl border transition ${
                                    orderType === "dine_in"
                                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow"
                                        : "bg-black/15 border-current/10 opacity-70"
                                }`}
                            >
                                🍽️ Dine-In
                            </button>
                            <button
                                type="button"
                                onClick={() => setOrderType("takeaway")}
                                className={`py-2.5 px-2 rounded-xl border transition ${
                                    orderType === "takeaway"
                                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow"
                                        : "bg-black/15 border-current/10 opacity-70"
                                }`}
                            >
                                🛍️ Takeaway
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setOrderType("delivery");
                                    setPaymentMethod("qris");
                                }}
                                className={`py-2.5 px-2 rounded-xl border transition ${
                                    orderType === "delivery"
                                        ? "bg-amber-400 text-slate-950 border-amber-300 shadow"
                                        : "bg-black/15 border-current/10 opacity-70"
                                }`}
                            >
                                🛵 Delivery Ojol
                            </button>
                        </div>

                        <div className="space-y-2.5">
                            <input
                                type="text"
                                required
                                placeholder="Nama Penerima / Pemesan *"
                                value={customerName}
                                onChange={(e) =>
                                    setCustomerName(e.target.value)
                                }
                                className={`w-full ${inputClass}`}
                            />
                            <div className="relative">
                                <input
                                    type="text"
                                    required={isDelivery}
                                    placeholder={
                                        isDelivery
                                            ? "No. WhatsApp Aktif (Wajib untuk Hubungi Ojol) *"
                                            : "No. WhatsApp (Dapat Poin Member Otomatis)"
                                    }
                                    value={customerPhone}
                                    onChange={(e) =>
                                        setCustomerPhone(e.target.value)
                                    }
                                    className={`w-full ${inputClass}`}
                                />
                                {earnedPointsPreview > 0 && (
                                    <span className="absolute right-2.5 top-2 text-[10px] font-black text-amber-400 flex items-center gap-1">
                                        <Crown className="w-3 h-3" /> +
                                        {earnedPointsPreview} Poin
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* PANEL KHUSUS SAAT "IS DELIVERY ORDER == YES" (PILIH KURIR OJOL & ALAMAT) */}
                        {isDelivery && (
                            <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 space-y-3 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="font-black text-amber-400 flex items-center gap-1.5">
                                        <Truck className="w-4 h-4" /> Pilih
                                        Layanan Kurir Ojol:
                                    </span>
                                    <span className="text-[10px] font-mono opacity-80">
                                        ETA: {selectedCourier.eta}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5">
                                    {courierOptions.map((c) => {
                                        const active =
                                            selectedCourier.id === c.id;
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedCourier(c)
                                                }
                                                className={`p-2 rounded-xl border text-left transition ${
                                                    active
                                                        ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow"
                                                        : "bg-slate-950/80 text-slate-200 border-slate-800"
                                                }`}
                                            >
                                                <span className="block text-[10px] truncate">
                                                    {c.id}
                                                </span>
                                                <span className="font-mono text-[10px]">
                                                    +Rp{" "}
                                                    {c.cost.toLocaleString(
                                                        "id-ID",
                                                    )}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div>
                                    <label className="font-bold text-amber-300 flex items-center gap-1 mb-1">
                                        <MapPin className="w-3.5 h-3.5" />{" "}
                                        Alamat Lengkap & Patokan Pengantaran *
                                    </label>
                                    <textarea
                                        rows="2"
                                        required
                                        placeholder="Contoh: Jl. Garuda No. 14 Palu (Pagar Hitam depan Indomaret)..."
                                        value={deliveryAddress}
                                        onChange={(e) =>
                                            setDeliveryAddress(e.target.value)
                                        }
                                        className={`w-full ${inputClass}`}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                            {cart.length === 0 ? (
                                <p className="text-center py-8 text-xs opacity-60">
                                    Belum ada menu dipilih. Klik tombol "+
                                    Pesan" pada menu di samping.
                                </p>
                            ) : (
                                cart.map((item) => (
                                    <div
                                        key={item.menu_id}
                                        className="p-3 rounded-2xl bg-black/15 border border-current/10 space-y-2 text-xs"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-black">
                                                    {item.name}
                                                </p>
                                                <p className="text-[11px] text-emerald-400 font-bold">
                                                    Rp{" "}
                                                    {(
                                                        item.price * item.qty
                                                    ).toLocaleString("id-ID")}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQty(
                                                            item.menu_id,
                                                            -1,
                                                        )
                                                    }
                                                    className="p-1 rounded-lg bg-slate-800 text-white"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="font-black w-4 text-center">
                                                    {item.qty}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQty(
                                                            item.menu_id,
                                                            1,
                                                        )
                                                    }
                                                    className="p-1 rounded-lg bg-emerald-500 text-slate-950"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1 pt-1 border-t border-current/10">
                                            {[
                                                "Less Sugar",
                                                "Normal",
                                                "Extra Ice",
                                                "Less Ice",
                                                "Hot",
                                            ].map((note) => (
                                                <button
                                                    key={note}
                                                    type="button"
                                                    onClick={() =>
                                                        updateItemNotes(
                                                            item.menu_id,
                                                            item.notes === note
                                                                ? ""
                                                                : note,
                                                        )
                                                    }
                                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                                                        item.notes === note
                                                            ? "bg-emerald-500 text-slate-950 font-black"
                                                            : "bg-black/20 opacity-70 hover:opacity-100"
                                                    }`}
                                                >
                                                    {note}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {vouchers.length > 0 && (
                            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2 text-xs">
                                <span className="font-black text-purple-300 flex items-center gap-1">
                                    <Ticket className="w-3.5 h-3.5" /> Klaim
                                    Voucher Promo:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {vouchers.map((v) => {
                                        const active =
                                            appliedVoucher?.id === v.id;
                                        return (
                                            <button
                                                key={v.id}
                                                type="button"
                                                onClick={() =>
                                                    setAppliedVoucher(
                                                        active ? null : v,
                                                    )
                                                }
                                                className={`px-2.5 py-1 rounded-xl font-mono font-black text-[11px] flex items-center gap-1 transition ${
                                                    active
                                                        ? "bg-purple-600 text-white shadow"
                                                        : "bg-slate-950 text-purple-300 border border-purple-500/30"
                                                }`}
                                            >
                                                🏷️ {v.code} (
                                                {v.discount_type === "percent"
                                                    ? `-${Number(v.discount_value)}%`
                                                    : `-Rp ${Number(v.discount_value).toLocaleString("id-ID")}`}
                                                )
                                                {active && (
                                                    <X className="w-3 h-3" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("qris")}
                                className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 transition ${
                                    paymentMethod === "qris"
                                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow"
                                        : "border-current/15 opacity-60"
                                }`}
                            >
                                <CreditCard className="w-4 h-4" /> QRIS Online
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("cash")}
                                className={`p-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-1.5 transition ${
                                    paymentMethod === "cash"
                                        ? "border-amber-500 bg-amber-500/20 text-amber-400 shadow"
                                        : "border-current/15 opacity-60"
                                }`}
                            >
                                <Banknote className="w-4 h-4" />{" "}
                                {isDelivery ? "COD / Tunai" : "Tunai Kasir"}
                            </button>
                        </div>

                        <div className="space-y-1 pt-3 border-t border-current/10 text-xs">
                            <div className="flex justify-between opacity-75">
                                <span>Subtotal Menu</span>
                                <span>
                                    Rp {getSubtotal().toLocaleString("id-ID")}
                                </span>
                            </div>
                            {getDiscountAmount() > 0 && (
                                <div className="flex justify-between text-emerald-400 font-bold">
                                    <span>
                                        Diskon Promo ({appliedVoucher?.code})
                                    </span>
                                    <span>
                                        -Rp{" "}
                                        {getDiscountAmount().toLocaleString(
                                            "id-ID",
                                        )}
                                    </span>
                                </div>
                            )}
                            {isDelivery && (
                                <div className="flex justify-between text-amber-400 font-bold">
                                    <span>Ongkir {selectedCourier.id}</span>
                                    <span>
                                        +Rp{" "}
                                        {shippingCost.toLocaleString("id-ID")}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-black pt-1">
                                <span>Total Bayar</span>
                                <span className="text-emerald-500">
                                    Rp{" "}
                                    {finalTotalWithShipping.toLocaleString(
                                        "id-ID",
                                    )}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleCheckoutClick}
                            disabled={
                                cart.length === 0 ||
                                !customerName.trim() ||
                                (isDelivery && !deliveryAddress.trim())
                            }
                            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
                        >
                            <Sparkles className="w-4 h-4" />{" "}
                            {isDelivery
                                ? "Pesan Delivery Ojol & Dapatkan Token AI"
                                : "Kirim Pesanan & Buka AI Co-Worker"}
                        </button>
                    </div>
                </div>
            </div>

            <QrisPaymentModal
                isOpen={showQrisModal}
                totalAmount={finalTotalWithShipping}
                customerName={customerName}
                onConfirmPaid={submitCustomerOrder}
                onClose={() => setShowQrisModal(false)}
            />
        </CustomerLayout>
    );
}
