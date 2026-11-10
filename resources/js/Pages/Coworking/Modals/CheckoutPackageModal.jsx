import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Sparkles, Bot, X } from "lucide-react";

export default function CheckoutPackageModal({
    isOpen,
    selectedPkg,
    menus = [],
    tables = [],
    onClose,
}) {
    const [form, setForm] = useState({
        customer_name: "",
        customer_phone: "",
        table_id: tables[0]?.id || "",
        complimentary_menu_id: menus[0]?.id || "",
        complimentary_qty: 1,
        payment_method: "qris",
    });

    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (selectedPkg) {
            setForm((prev) => ({
                ...prev,
                complimentary_qty: selectedPkg.type === "catering" ? 20 : 1,
            }));
        }
    }, [selectedPkg]);

    if (!isOpen || !selectedPkg) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            route("coworking.checkout"),
            {
                package_name: selectedPkg.name,
                price: selectedPkg.price,
                ai_quota: selectedPkg.ai_quota,
                ...form,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setForm({ ...form, customer_name: "", customer_phone: "" });
                    onClose();
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const inputClass =
        "w-full mt-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 focus:border-emerald-500 text-xs text-white py-2.5 px-3.5";

    return (
        <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900/95 border border-emerald-500/40 text-slate-100 rounded-[2.5rem] max-w-lg w-full p-7 shadow-[0_25px_70px_rgba(0,0,0,0.8)] space-y-5 relative overflow-hidden">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                            Aktivasi Co-Working Pass / B2B Order
                        </span>
                        <h3 className="text-lg font-black text-white mt-0.5">
                            {selectedPkg.name}
                        </h3>
                        <p className="text-xs text-emerald-400 font-mono font-bold mt-0.5">
                            Rp{" "}
                            {Number(selectedPkg.price).toLocaleString("id-ID")}{" "}
                            • 🤖 {selectedPkg.ai_quota}x Kuota AI
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="font-bold text-slate-300">
                            Nama Member Co-Working / Nama Instansi B2B *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: PT Digital Nusantara / Kak Budi"
                            value={form.customer_name}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    customer_name: e.target.value,
                                })
                            }
                            className={inputClass}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-slate-300">
                                No. WhatsApp PIC
                            </label>
                            <input
                                type="text"
                                placeholder="0812..."
                                value={form.customer_phone}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        customer_phone: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="font-bold text-slate-300">
                                Alokasi Meja Kerja / VIP
                            </label>
                            <select
                                value={form.table_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        table_id: e.target.value,
                                    })
                                }
                                className={inputClass}
                            >
                                <option value="">
                                    -- Tanpa Meja (Catering) --
                                </option>
                                {tables.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        Meja #{t.table_number} ({t.location})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                            <label className="font-bold text-slate-300">
                                Sajian Minuman Termasuk (Potong Stok)
                            </label>
                            <select
                                value={form.complimentary_menu_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        complimentary_menu_id: e.target.value,
                                    })
                                }
                                className={inputClass}
                            >
                                {menus.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="font-bold text-slate-300">
                                Jumlah Cup
                            </label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={form.complimentary_qty}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        complimentary_qty: e.target.value,
                                    })
                                }
                                className={`${inputClass} font-mono`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="font-bold text-slate-300">
                            Metode Pembayaran
                        </label>
                        <select
                            value={form.payment_method}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    payment_method: e.target.value,
                                })
                            }
                            className={inputClass}
                        >
                            <option value="qris">QRIS</option>
                            <option value="va">
                                Transfer Bank / Virtual Account B2B
                            </option>
                            <option value="cash">Tunai (Cash Kasir)</option>
                        </select>
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
                            className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Sparkles className="w-4 h-4" />{" "}
                            {processing
                                ? "Memproses..."
                                : "Aktifkan Paket & Terbitkan Invoice B2B"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
