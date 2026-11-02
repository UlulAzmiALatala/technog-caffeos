import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { useCartStore } from "@/Engine/useCartStore";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import CyberDarkCashier from "@/Templates/CyberDark/CashierView";
import MinimalistWoodCashier from "@/Templates/MinimalistWood/CashierView";
import NeoBrutalCashier from "@/Templates/NeoBrutal/CashierView";
import ReceiptModal from "@/Components/ReceiptModal";
import QrisPaymentModal from "@/Components/QrisPaymentModal";

export default function Workspace({ menus, tables, templates, recentOrders }) {
    const { auth } = usePage().props;
    const {
        cart,
        customerName,
        customerPhone,
        tableId,
        orderType,
        paymentMethod,
        getTotal,
        clearCart,
    } = useCartStore();

    const [selectedOrderReceipt, setSelectedOrderReceipt] = useState(null);
    const [showQrisModal, setShowQrisModal] = useState(false);

    // Eksekusi pengiriman data transaksi ke Backend
    const submitTransaction = () => {
        router.post(
            route("pos.checkout"),
            {
                customer_name: customerName,
                customer_phone: customerPhone,
                table_id: tableId || null,
                order_type: orderType,
                payment_method: paymentMethod,
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

    // Jika metode bayar adalah QRIS, tampilkan pop-up scan QRIS terlebih dahulu
    const handleCheckout = () => {
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
        router.post(route("pos.approve-cash", orderId));
    };

    // Resolver 3 Pilihan Template Kasir
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
                menus={menus}
                tables={tables}
                recentOrders={recentOrders}
                onCheckout={handleCheckout}
                onCallQueue={handleCallQueue}
                onPrintReceipt={(order) => setSelectedOrderReceipt(order)}
            />

            {/* Modal Pop-up Pembayaran Online QRIS */}
            <QrisPaymentModal
                isOpen={showQrisModal}
                totalAmount={getTotal()}
                customerName={customerName}
                onConfirmPaid={submitTransaction}
                onClose={() => setShowQrisModal(false)}
            />

            {/* Modal Cetak Struk Thermal & QR Code Token AI */}
            <ReceiptModal
                order={selectedOrderReceipt}
                cafeName={auth.cafe?.name}
                onClose={() => setSelectedOrderReceipt(null)}
            />
        </CaffeOSLayout>
    );
}
