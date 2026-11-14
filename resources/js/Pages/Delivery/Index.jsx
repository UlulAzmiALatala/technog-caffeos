import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import AssignOjolModal from "./Modals/AssignOjolModal";
import {
    Truck,
    MapPin,
    PhoneCall,
    CheckCircle2,
    Clock,
    Sparkles,
    ExternalLink,
} from "lucide-react";

export default function DeliveryIndex({
    deliveryOrders = [],
    templates = [],
    tables = [],
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";

    const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);

    const cardClass = isBrutal
        ? "bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        : isWood
          ? "bg-white border border-amber-200 text-stone-800 shadow-sm"
          : "bg-slate-900 border border-slate-800 text-slate-100";

    const statusBadge = {
        waiting_driver:
            "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse",
        driver_assigned: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        on_the_way: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
        delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    };

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Order Delivery Online & Dispatch Ojol - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div
                    className={`p-6 rounded-[2.5rem] flex flex-wrap justify-between items-center gap-4 ${cardClass}`}
                >
                    <div>
                        <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                            <Truck className="w-4 h-4" /> Online Delivery & Ojol
                            Dispatch Center
                        </span>
                        <h1 className="text-2xl font-black mt-0.5">
                            Manajemen Pesanan Antar (GoSend / GrabExpress /
                            Maxim) ({deliveryOrders.length})
                        </h1>
                        <p className="text-xs opacity-70 mt-0.5">
                            Menangani percabangan alur{" "}
                            <strong>IS DELIVERY ORDER = YES</strong> lengkap
                            dengan penugasan Driver Ojol ke layar HP pelanggan.
                        </p>
                    </div>

                    {tables[0] && (
                        <a
                            href={route("customer.scan", tables[0].qr_code)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg"
                        >
                            🛵 Simulasi Order Delivery Pelanggan{" "}
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    )}
                </div>

                {deliveryOrders.length === 0 ? (
                    <div
                        className={`p-14 rounded-[2.5rem] text-center space-y-2 ${cardClass}`}
                    >
                        <Truck className="w-12 h-12 text-amber-400 mx-auto opacity-75" />
                        <h3 className="text-lg font-black">
                            Belum Ada Pesanan Delivery Ojol
                        </h3>
                        <p className="text-xs opacity-65">
                            Buka halaman Self-Order Pelanggan lalu pilih mode{" "}
                            <strong>"🛵 Delivery Ojol"</strong> untuk menguji
                            alur pengiriman.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {deliveryOrders.map((ord) => (
                            <div
                                key={ord.id}
                                className={`p-6 rounded-[2.5rem] flex flex-col justify-between space-y-4 ${cardClass}`}
                            >
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start border-b border-current/10 pb-3">
                                        <div>
                                            <span className="font-mono text-xs text-amber-400 font-black">
                                                {ord.order_code} • Antrean #
                                                {ord.queue_number}
                                            </span>
                                            <h3 className="text-lg font-black mt-0.5">
                                                {ord.customer_name}
                                            </h3>
                                            <p className="text-xs opacity-75">
                                                WA Pelanggan:{" "}
                                                {ord.customer_phone}
                                            </p>
                                        </div>

                                        <span
                                            className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase ${
                                                statusBadge[
                                                    ord.delivery_status
                                                ] || statusBadge.waiting_driver
                                            }`}
                                        >
                                            {ord.delivery_status.replace(
                                                /_/g,
                                                " ",
                                            )}
                                        </span>
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-black/15 border border-current/10 space-y-1.5 text-xs">
                                        <span className="text-[10px] font-black uppercase text-amber-400 block">
                                            📍 Alamat Pengantaran (
                                            {ord.courier_brand}):
                                        </span>
                                        <p className="font-bold">
                                            {ord.delivery_address}
                                        </p>
                                    </div>

                                    {ord.driver_name && (
                                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center text-xs">
                                            <div>
                                                <span className="text-[10px] opacity-70 block">
                                                    Driver Ojol Bertugas:
                                                </span>
                                                <strong className="text-emerald-400">
                                                    🛵 {ord.driver_name} (
                                                    {ord.license_plate})
                                                </strong>
                                            </div>
                                            <span className="font-mono text-[11px]">
                                                {ord.driver_phone}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-current/10 flex justify-between items-center">
                                    <div>
                                        <span className="text-[10px] opacity-65 block">
                                            Total Termasuk Ongkir:
                                        </span>
                                        <span className="text-lg font-black text-emerald-400">
                                            Rp{" "}
                                            {ord.grand_total.toLocaleString(
                                                "id-ID",
                                            )}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedOrderForModal(ord)
                                        }
                                        className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow transition"
                                    >
                                        <Truck className="w-4 h-4" /> Tugaskan /
                                        Update Ojol
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AssignOjolModal
                isOpen={Boolean(selectedOrderForModal)}
                orderItem={selectedOrderForModal}
                onClose={() => setSelectedOrderForModal(null)}
            />
        </CaffeOSLayout>
    );
}
