import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { useCartStore } from "@/Engine/useCartStore";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import CyberDarkCashier from "@/Templates/CyberDark/CashierView";
import MinimalistWoodCashier from "@/Templates/MinimalistWood/CashierView";
import NeoBrutalCashier from "@/Templates/NeoBrutal/CashierView";
import ReceiptModal from "@/Components/ReceiptModal";
import QrisPaymentModal from "@/Components/QrisPaymentModal";
import ShiftModal from "@/Components/ShiftModal";
import {
    Wallet,
    Lock,
    Unlock,
    Ticket,
    X,
    Search,
    Banknote,
    MessageSquarePlus,
} from "lucide-react";

export default function Workspace({
    menus,
    tables,
    templates,
    vouchers = [],
    recentOrders,
    activeShift,
    shiftStats,
    shiftHistory,
}) {
    const { auth } = usePage().props;
    const {
        cart,
        customerName,
        customerPhone,
        tableId,
        orderType,
        paymentMethod,
        appliedVoucher,
        setAppliedVoucher,
        cashReceived,
        setCashReceived,
        getChangeAmount,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        updateItemNotes,
        getDiscountAmount,
        getTotal,
        clearCart,
    } = useCartStore();

    const [selectedOrderReceipt, setSelectedOrderReceipt] = useState(null);
    const [showQrisModal, setShowQrisModal] = useState(false);
    const [showShiftModal, setShowShiftModal] = useState(!activeShift);

    // Filter menu berdasarkan kategori & pencarian secara dinamis untuk seluruh template
    const categories = ["ALL", ...new Set(menus.map((m) => m.category))];
    const filteredMenus = menus.filter((m) => {
        const matchCat =
            selectedCategory === "ALL" || m.category === selectedCategory;
        const matchSearch = m.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    const submitTransaction = () => {
        router.post(
            route("pos.checkout"),
            {
                customer_name: customerName,
                customer_phone: customerPhone,
                table_id: tableId || null,
                order_type: orderType,
                payment_method: paymentMethod,
                voucher_id: appliedVoucher?.id || null,
                cash_received: cashReceived || getTotal(),
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

    const handleCheckout = () => {
        if (!activeShift) {
            setShowShiftModal(true);
            return;
        }

        if (paymentMethod === "qris") {
            setShowQrisModal(true);
        } else {
            submitTransaction();
        }
    };

    const handleCallQueue = (queueNumber, name) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(
                `Panggilan antrean nomor ${queueNumber}, atas nama ${name}, pesanan Anda sudah siap di meja barista.`,
            );
            utterance.lang = "id-ID";
            utterance.rate = 0.95;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleApproveCash = (orderId) => {
        if (!activeShift) {
            setShowShiftModal(true);
            return;
        }
        router.post(route("pos.approve-cash", orderId));
    };

    const templateMap = {
        "cyber-dark": CyberDarkCashier,
        "minimalist-wood": MinimalistWoodCashier,
        "neo-brutal": NeoBrutalCashier,
    };
    const ActiveTemplateComponent =
        templateMap[auth.activeTemplate] || CyberDarkCashier;

    const pendingCashOrders = recentOrders.filter(
        (o) => o.order_status === "pending",
    );

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="POS Workspace - TechnoG CaffeOS" />

            {/* Bar 1: Status Shift Kasir & Petty Cash Real-Time */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200">
                {activeShift ? (
                    <>
                        <div className="flex flex-wrap items-center gap-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                                <Unlock className="w-3.5 h-3.5" /> SHIFT AKTIF (
                                {activeShift.user?.name})
                            </span>
                            <span>
                                Modal Awal:{" "}
                                <strong>
                                    Rp{" "}
                                    {Number(
                                        activeShift.opening_cash,
                                    ).toLocaleString("id-ID")}
                                </strong>
                            </span>
                            <span>•</span>
                            <span>
                                Tunai Masuk:{" "}
                                <strong className="text-emerald-400">
                                    +Rp{" "}
                                    {Number(
                                        shiftStats?.cash_sales || 0,
                                    ).toLocaleString("id-ID")}
                                </strong>
                            </span>
                            <span>•</span>
                            <span>
                                QRIS Masuk:{" "}
                                <strong className="text-cyan-400">
                                    Rp{" "}
                                    {Number(
                                        shiftStats?.qris_sales || 0,
                                    ).toLocaleString("id-ID")}
                                </strong>
                            </span>
                            <span>•</span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 font-bold text-amber-300">
                                💵 Total Uang di Laci: Rp{" "}
                                {Number(
                                    shiftStats?.expected_cash || 0,
                                ).toLocaleString("id-ID")}
                            </span>
                        </div>

                        <button
                            onClick={() => setShowShiftModal(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold flex items-center gap-1.5 transition"
                        >
                            <Lock className="w-3.5 h-3.5" /> Tutup Shift &
                            Hitung Laci
                        </button>
                    </>
                ) : (
                    <div className="w-full flex justify-between items-center text-amber-300">
                        <span className="font-bold flex items-center gap-2">
                            <Wallet className="w-4 h-4" /> Shift Kasir Belum
                            Dibuka! Buka shift dan input modal awal laci untuk
                            mulai bertransaksi.
                        </span>
                        <button
                            onClick={() => setShowShiftModal(true)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold"
                        >
                            🔓 Buka Shift Kasir Sekarang
                        </button>
                    </div>
                )}
            </div>

            {/* Bar 2: Pencarian Cepat, Filter Kategori Menu, & Pilihan Voucher Promo */}
            <div className="bg-slate-950 border-b border-slate-800/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Cari nama kopi / menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 pr-3 py-1 rounded-lg bg-slate-900 border-slate-800 text-xs text-white"
                        />
                    </div>

                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1 rounded-lg font-bold transition ${
                                selectedCategory === cat
                                    ? "bg-emerald-500 text-slate-950"
                                    : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-purple-300 font-bold flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5" /> Voucher:
                    </span>
                    {vouchers.map((v) => {
                        const isSelected = appliedVoucher?.id === v.id;
                        return (
                            <button
                                key={v.id}
                                type="button"
                                onClick={() =>
                                    setAppliedVoucher(isSelected ? null : v)
                                }
                                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition flex items-center gap-1 ${
                                    isSelected
                                        ? "bg-purple-600 text-white shadow"
                                        : "bg-slate-900 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                                }`}
                            >
                                🏷️ {v.code}
                                {isSelected && <X className="w-3 h-3 ml-1" />}
                            </button>
                        );
                    })}
                    {appliedVoucher && (
                        <span className="text-emerald-400 font-bold">
                            (-Rp {getDiscountAmount().toLocaleString("id-ID")})
                        </span>
                    )}
                </div>
            </div>

            {/* Bar 3: Helper Kalkulator Kembalian Tunai & Catatan Cepat Item (Aktif Jika Ada Item di Keranjang) */}
            {cart.length > 0 && (
                <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200">
                    {/* Tombol Catatan Cepat untuk Item Terakhir di Keranjang */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400 flex items-center gap-1">
                            <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-400" />
                            Catatan{" "}
                            <strong>{cart[cart.length - 1]?.name}</strong>:
                        </span>
                        {[
                            "Less Sugar",
                            "Normal Sugar",
                            "Less Ice",
                            "Extra Ice",
                            "Hot",
                        ].map((note) => (
                            <button
                                key={note}
                                type="button"
                                onClick={() =>
                                    updateItemNotes(
                                        cart[cart.length - 1].menu_id,
                                        note,
                                    )
                                }
                                className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${
                                    cart[cart.length - 1]?.notes === note
                                        ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                                        : "bg-slate-950 border-slate-700 text-slate-300 hover:border-emerald-500/50"
                                }`}
                            >
                                {note}
                            </button>
                        ))}
                    </div>

                    {/* Kalkulator Uang Diterima & Kembalian (Jika Pilih Pembayaran Cash) */}
                    {paymentMethod === "cash" && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-amber-300 font-bold flex items-center gap-1">
                                <Banknote className="w-3.5 h-3.5" /> Uang Tunai
                                Diterima:
                            </span>
                            {[getTotal(), 50000, 100000].map((nom) => (
                                <button
                                    key={nom}
                                    type="button"
                                    onClick={() => setCashReceived(nom)}
                                    className={`px-2.5 py-1 rounded font-mono font-bold ${
                                        Number(cashReceived) === nom
                                            ? "bg-amber-400 text-slate-950"
                                            : "bg-slate-950 border border-slate-700 text-amber-300"
                                    }`}
                                >
                                    {nom === getTotal()
                                        ? "Uang Pas"
                                        : `Rp ${nom.toLocaleString("id-ID")}`}
                                </button>
                            ))}
                            <input
                                type="number"
                                placeholder="Nominal Lain..."
                                value={cashReceived}
                                onChange={(e) =>
                                    setCashReceived(e.target.value)
                                }
                                className="w-28 py-0.5 px-2 rounded bg-slate-950 border-slate-700 text-xs text-white font-mono"
                            />
                            <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold font-mono">
                                Kembalian: Rp{" "}
                                {getChangeAmount().toLocaleString("id-ID")}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Bar Notifikasi Validasi Pembayaran Tunai (Cash) dari Pelanggan Scan QR */}
            {pendingCashOrders.length > 0 && (
                <div className="bg-amber-500/20 border-b border-amber-500/40 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-amber-300">
                        🔔 Menunggu Validasi Kasir (Pembayaran Tunai dari QR
                        Meja):
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {pendingCashOrders.map((o) => (
                            <button
                                key={o.id}
                                onClick={() => handleApproveCash(o.id)}
                                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold animate-pulse"
                            >
                                💰 Validasi Cash Antrean #{o.queue_number} (
                                {o.customer_name} - Rp{" "}
                                {Number(o.grand_total).toLocaleString("id-ID")})
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <ActiveTemplateComponent
                menus={filteredMenus}
                tables={tables}
                recentOrders={recentOrders}
                onCheckout={handleCheckout}
                onCallQueue={handleCallQueue}
                onPrintReceipt={(order) => setSelectedOrderReceipt(order)}
            />

            <ShiftModal
                isOpen={showShiftModal}
                onClose={() => setShowShiftModal(false)}
                activeShift={activeShift}
                shiftStats={shiftStats}
                shiftHistory={shiftHistory}
            />

            <QrisPaymentModal
                isOpen={showQrisModal}
                totalAmount={getTotal()}
                customerName={customerName}
                onConfirmPaid={submitTransaction}
                onClose={() => setShowQrisModal(false)}
            />

            <ReceiptModal
                order={selectedOrderReceipt}
                cafeName={auth.cafe?.name}
                cafeSettings={auth.cafe?.settings}
                onClose={() => setSelectedOrderReceipt(null)}
            />
        </CaffeOSLayout>
    );
}
