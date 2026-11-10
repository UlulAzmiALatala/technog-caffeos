import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Briefcase, Plus, X } from "lucide-react";

export default function CreatePackageModal({ isOpen, onClose }) {
    const [form, setForm] = useState({
        name: "",
        type: "coworking",
        price: 55000,
        ai_quota: 35,
        perks: "Meja Co-Working + Free Signature Kopi + 35x Token AI Co-Worker",
    });

    const [processing, setProcessing] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route("coworking.packages.store"), form, {
            preserveScroll: true,
            onSuccess: () => {
                setForm({ ...form, name: "" });
                onClose();
            },
            onFinish: () => setProcessing(false),
        });
    };

    const inputClass =
        "w-full mt-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 focus:border-purple-500 text-xs text-white py-2.5 px-3.5";

    return (
        <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900/95 border border-purple-500/40 text-slate-100 rounded-[2.5rem] max-w-md w-full p-7 shadow-[0_25px_70px_rgba(0,0,0,0.8)] space-y-5 relative overflow-hidden">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                                Katalog Co-Working & B2B
                            </span>
                            <h3 className="text-lg font-black text-white">
                                Buat Paket Pass / Catering Baru
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

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                        <label className="font-bold text-slate-300">
                            Nama Paket *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Weekly Digital Nomad Pass"
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            className={inputClass}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                        <div>
                            <label className="font-bold text-slate-300">
                                Tipe Paket
                            </label>
                            <select
                                value={form.type}
                                onChange={(e) =>
                                    setForm({ ...form, type: e.target.value })
                                }
                                className={inputClass}
                            >
                                <option value="coworking">Co-Working</option>
                                <option value="catering">B2B Catering</option>
                            </select>
                        </div>
                        <div>
                            <label className="font-bold text-slate-300">
                                Harga (Rp) *
                            </label>
                            <input
                                type="number"
                                required
                                value={form.price}
                                onChange={(e) =>
                                    setForm({ ...form, price: e.target.value })
                                }
                                className={`${inputClass} font-mono text-emerald-400 font-bold`}
                            />
                        </div>
                        <div>
                            <label className="font-bold text-slate-300">
                                Kuota AI *
                            </label>
                            <input
                                type="number"
                                required
                                value={form.ai_quota}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        ai_quota: e.target.value,
                                    })
                                }
                                className={`${inputClass} font-mono`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="font-bold text-slate-300">
                            Deskripsi Fasilitas (Perks) *
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
                            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Plus className="w-4 h-4" /> Simpan ke Katalog
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
