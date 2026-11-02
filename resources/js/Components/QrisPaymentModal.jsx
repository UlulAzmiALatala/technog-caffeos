import React from "react";
import { CheckCircle2, QrCode, ShieldCheck, X } from "lucide-react";

export default function QrisPaymentModal({
    isOpen,
    totalAmount,
    customerName,
    onConfirmPaid,
    onClose,
}) {
    if (!isOpen) return null;

    const dummyQrisPayload = `00020101021226590014ID.TECHNOG.QRIS0118936009143123456789520458125303360540${totalAmount}5802ID5914TECHNOG CAFFEOS6010YOGYAKARTA6304ABCD`;
    const qrisImage = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(dummyQrisPayload)}`;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white text-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
                <div className="flex justify-between items-center border-b pb-3">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-sm">
                        <QrCode className="w-5 h-5" /> QRIS Payment Gateway
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-slate-100"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div>
                    <p className="text-xs text-slate-500">
                        Pembayaran Pesanan Atas Nama
                    </p>
                    <p className="font-bold text-base">{customerName}</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                        Rp {Number(totalAmount).toLocaleString("id-ID")}
                    </p>
                </div>

                <div className="p-4 bg-slate-50 border-2 border-dashed border-emerald-500 rounded-2xl inline-block mx-auto">
                    <img
                        src={qrisImage}
                        alt="QRIS Code"
                        className="w-48 h-48 mx-auto"
                    />
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                        Mendukung GoPay, OVO, Dana, ShopeePay & Mobile Banking
                    </span>
                </div>

                <button
                    type="button"
                    onClick={onConfirmPaid}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                    <CheckCircle2 className="w-4 h-4" /> Simulasikan Pembayaran
                    QRIS Sukses
                </button>
            </div>
        </div>
    );
}
