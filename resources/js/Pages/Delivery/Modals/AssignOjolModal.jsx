import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Truck, CheckCircle2, X } from "lucide-react";

export default function AssignOjolModal({ isOpen, orderItem, onClose }) {
    const [form, setForm] = useState({
        courier_brand: "GoSend Instant (Ojol)",
        driver_name: "",
        driver_phone: "",
        license_plate: "DN 4521 XY",
        delivery_status: "driver_assigned",
    });

    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (orderItem) {
            setForm({
                courier_brand:
                    orderItem.courier_brand || "GoSend Instant (Ojol)",
                driver_name: orderItem.driver_name || "Bli Kadek (Mitra Ojol)",
                driver_phone: orderItem.driver_phone || "08124567890",
                license_plate: orderItem.license_plate || "DN 4521 XY",
                delivery_status:
                    orderItem.delivery_status === "waiting_driver"
                        ? "driver_assigned"
                        : orderItem.delivery_status,
            });
        }
    }, [orderItem]);

    if (!isOpen || !orderItem) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route("deliveries.assign", orderItem.id), form, {
            preserveScroll: true,
            onSuccess: () => onClose(),
            onFinish: () => setProcessing(false),
        });
    };

    const inputClass =
        "w-full mt-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 focus:border-amber-400 text-xs text-white py-2.5 px-3.5";

    return (
        <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900/95 border border-amber-500/40 text-slate-100 rounded-[2.5rem] max-w-md w-full p-7 shadow-[0_25px_70px_rgba(0,0,0,0.8)] space-y-5 relative overflow-hidden">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                                Ojol Delivery Dispatch
                            </span>
                            <h3 className="text-base font-black text-white">
                                Antrean #{orderItem.queue_number} —{" "}
                                {orderItem.customer_name}
                            </h3>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase block">
                        Alamat Pengiriman Pelanggan:
                    </span>
                    <p className="font-bold text-amber-300">
                        {orderItem.delivery_address}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="font-bold text-slate-300">
                            Armada Kurir / Ojol
                        </label>
                        <select
                            value={form.courier_brand}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    courier_brand: e.target.value,
                                })
                            }
                            className={inputClass}
                        >
                            <option value="GoSend Instant (Ojol)">
                                GoSend Instant (Ojol)
                            </option>
                            <option value="GrabExpress Instant (Ojol)">
                                GrabExpress Instant (Ojol)
                            </option>
                            <option value="Maxim Bike Delivery">
                                Maxim Bike Delivery
                            </option>
                            <option value="Kurir Internal Kafe">
                                Kurir Internal Kafe
                            </option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-slate-300">
                                Nama Driver Ojol *
                            </label>
                            <input
                                type="text"
                                required
                                value={form.driver_name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        driver_name: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="font-bold text-slate-300">
                                Plat Nomor Motor *
                            </label>
                            <input
                                type="text"
                                required
                                value={form.license_plate}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        license_plate: e.target.value,
                                    })
                                }
                                className={`${inputClass} font-mono uppercase`}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-slate-300">
                                No. WhatsApp Driver *
                            </label>
                            <input
                                type="text"
                                required
                                value={form.driver_phone}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        driver_phone: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="font-bold text-slate-300">
                                Status Pengantaran
                            </label>
                            <select
                                value={form.delivery_status}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        delivery_status: e.target.value,
                                    })
                                }
                                className={inputClass}
                            >
                                <option value="driver_assigned">
                                    🛵 Driver Menuju Kafe
                                </option>
                                <option value="on_the_way">
                                    🚀 Sedang Diantar Driver
                                </option>
                                <option value="delivered">
                                    ✅ Tiba di Tujuan
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2.5 pt-3 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Simpan & Kirim
                            Info ke HP Pelanggan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
