import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Calendar, Plus, Sparkles, X } from "lucide-react";

export default function CreateEventModal({ isOpen, onClose }) {
    const [form, setForm] = useState({
        title: "",
        category: "Coffee Masterclass",
        event_date: new Date().toISOString().split("T")[0],
        event_time: "16:00 - 19:00 WITA",
        speaker: "Head Barista TechnoG",
        ticket_price: 100000,
        quota: 25,
        perks: "Free Signature Coffee + Sertifikat + 25x Kuota AI Co-Worker",
    });

    const [processing, setProcessing] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route("events.store"), form, {
            preserveScroll: true,
            onSuccess: () => {
                setForm({ ...form, title: "" });
                onClose();
            },
            onFinish: () => setProcessing(false),
        });
    };

    const inputClass =
        "w-full mt-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 focus:border-purple-500 text-xs text-white py-2.5 px-3.5";

    return (
        <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900/95 border border-purple-500/40 text-slate-100 rounded-[2.5rem] max-w-lg w-full p-7 shadow-[0_25px_70px_rgba(0,0,0,0.8)] space-y-5 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

                {/* Header Modal */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                                Community & Masterclass Hub
                            </span>
                            <h3 className="text-lg font-black text-white">
                                Publikasikan Event / Workshop Baru
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

                {/* Form Input Event */}
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="font-bold text-slate-300">
                            Judul Event / Workshop *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Manual Brew V60 & Sensory Class"
                            value={form.title}
                            onChange={(e) =>
                                setForm({ ...form, title: e.target.value })
                            }
                            className={inputClass}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-slate-300">
                                Kategori Acara
                            </label>
                            <select
                                value={form.category}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        category: e.target.value,
                                    })
                                }
                                className={inputClass}
                            >
                                <option value="Coffee Masterclass">
                                    Coffee Masterclass
                                </option>
                                <option value="Community Gathering">
                                    Community Gathering
                                </option>
                                <option value="Live Music & Acoustic">
                                    Live Music & Acoustic
                                </option>
                                <option value="Tech & Startup Talk">
                                    Tech & Startup Talk
                                </option>
                            </select>
                        </div>
                        <div>
                            <label className="font-bold text-slate-300">
                                Pemateri / Host *
                            </label>
                            <input
                                type="text"
                                required
                                value={form.speaker}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        speaker: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-slate-300">
                                Tanggal Pelaksanaan *
                            </label>
                            <input
                                type="date"
                                required
                                value={form.event_date}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        event_date: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="font-bold text-slate-300">
                                Jam Operasional *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="16:00 - 19:00 WITA"
                                value={form.event_time}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        event_time: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="font-bold text-slate-300">
                                Harga Tiket (Rp) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={form.ticket_price}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        ticket_price: e.target.value,
                                    })
                                }
                                className={`${inputClass} font-mono text-emerald-400 font-bold`}
                            />
                        </div>
                        <div>
                            <label className="font-bold text-slate-300">
                                Kuota Kursi Peserta *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={form.quota}
                                onChange={(e) =>
                                    setForm({ ...form, quota: e.target.value })
                                }
                                className={`${inputClass} font-mono`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="font-bold text-slate-300">
                            Benefit & Fasilitas Peserta (Perks) *
                        </label>
                        <input
                            type="text"
                            required
                            value={form.perks}
                            onChange={(e) =>
                                setForm({ ...form, perks: e.target.value })
                            }
                            className={inputClass}
                        />
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
                            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition"
                        >
                            <Plus className="w-4 h-4" />{" "}
                            {processing
                                ? "Menyimpan..."
                                : "Publikasikan Event Sekarang"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
