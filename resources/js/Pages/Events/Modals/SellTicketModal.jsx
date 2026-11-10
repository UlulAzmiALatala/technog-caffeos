import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Ticket, Bot, X, CheckCircle2 } from "lucide-react";

export default function SellTicketModal({ isOpen, eventItem, onClose }) {
    const [form, setForm] = useState({
        participant_name: "",
        participant_phone: "",
        payment_method: "qris",
    });

    const [processing, setProcessing] = useState(false);

    if (!isOpen || !eventItem) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            route("events.tickets.sell"),
            {
                event_id: eventItem.id,
                ...form,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setForm({
                        participant_name: "",
                        participant_phone: "",
                        payment_method: "qris",
                    });
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
            <div className="bg-slate-900/95 border border-emerald-500/40 text-slate-100 rounded-[2.5rem] max-w-md w-full p-7 shadow-[0_25px_70px_rgba(0,0,0,0.8)] space-y-5 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                            <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                Registrasi Peserta & E-Ticket
                            </span>
                            <h3 className="text-base font-black text-white leading-snug">
                                {eventItem.title}
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

                {/* Info Ringkas Event */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Jadwal Acara:</span>
                        <span className="font-mono font-bold text-amber-400">
                            {eventItem.event_date} • {eventItem.event_time}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Harga Tiket:</span>
                        <span className="font-mono font-black text-emerald-400 text-sm">
                            Rp{" "}
                            {Number(eventItem.ticket_price).toLocaleString(
                                "id-ID",
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                        <span className="text-slate-400">
                            Bonus Token AI Peserta:
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-[11px] flex items-center gap-1">
                            <Bot className="w-3 h-3" />{" "}
                            {eventItem.ai_quota_bonus || 25}x Prompt AI
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="font-bold text-slate-300">
                            Nama Lengkap Peserta *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ketik nama peserta workshop..."
                            value={form.participant_name}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    participant_name: e.target.value,
                                })
                            }
                            className={inputClass}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-slate-300">
                                No. WhatsApp *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="0812..."
                                value={form.participant_phone}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        participant_phone: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="font-bold text-slate-300">
                                Metode Bayar
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
                                <option value="qris">QRIS Dinamis</option>
                                <option value="cash">Tunai (Cash)</option>
                                <option value="va">Transfer Bank / VA</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2.5 pt-3 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                        >
                            <CheckCircle2 className="w-4 h-4" />{" "}
                            {processing
                                ? "Memproses..."
                                : "Terbitkan E-Ticket & Catat Omzet"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
