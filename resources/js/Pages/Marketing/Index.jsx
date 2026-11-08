import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    Megaphone,
    Gift,
    Crown,
    Send,
    Users,
    Ticket,
    Sparkles,
    CheckCircle2,
    MessageCircle,
    Plus,
} from "lucide-react";

export default function MarketingIndex({
    customers = [],
    rewardCatalog = [],
    vouchers = [],
    templates = [],
    tables = [],
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";

    const [selectedVoucherCode, setSelectedVoucherCode] = useState(
        vouchers[0]?.code || "HEMAT20",
    );
    const [campaignMessage, setCampaignMessage] = useState(
        `Halo Kak {nama}! ☕ Terima kasih telah menjadi pelanggan setia ${auth.cafe?.name || "Kafe Kami"}. Khusus hari ini, gunakan kode promo *{voucher}* untuk mendapatkan diskon spesial saat memesan kopi favoritmu ya!`,
    );

    const [rewardForm, setRewardForm] = useState({
        title: "",
        points_cost: 15,
    });
    const [selectedReward, setSelectedReward] = useState(
        rewardCatalog[0] || null,
    );

    const cardClass = isBrutal
        ? "bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        : isWood
          ? "bg-white border border-amber-200 text-stone-800 shadow-sm"
          : "bg-slate-900 border border-slate-800 text-slate-100";

    const inputClass = isBrutal
        ? "rounded-xl bg-yellow-100 border-2 border-black text-black font-bold text-xs"
        : isWood
          ? "rounded-xl bg-amber-50/50 border-stone-300 text-stone-800 text-xs"
          : "rounded-xl bg-slate-950 border-slate-800 text-white text-xs";

    // Format Nomor HP ke Standar Internasional WhatsApp (628...)
    const formatWaNumber = (phone) => {
        if (!phone) return "";
        let cleaned = phone.replace(/\D/g, "");
        if (cleaned.startsWith("0")) {
            cleaned = "62" + cleaned.substring(1);
        }
        return cleaned;
    };

    const generateWaLink = (cust) => {
        const text = campaignMessage
            .replace("{nama}", cust.name)
            .replace("{voucher}", selectedVoucherCode)
            .replace("{poin}", cust.available_points);
        return `https://wa.me/${formatWaNumber(cust.phone)}?text=${encodeURIComponent(text)}`;
    };

    const handleRedeemPoints = (cust) => {
        if (!selectedReward) return;
        router.post(route("marketing.redeem"), {
            customer_id: cust.id,
            points_cost: selectedReward.points_cost,
            reward_title: selectedReward.title,
        });
    };

    const handleAddReward = (e) => {
        e.preventDefault();
        router.post(route("marketing.rewards.store"), rewardForm, {
            onSuccess: () => setRewardForm({ title: "", points_cost: 15 }),
        });
    };

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Loyalty Point Member & WhatsApp Marketing Blast - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* 3 Kartu Indikator CRM & Loyalitas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Total Member Terdaftar</span>
                            <Users className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-black text-emerald-500 mt-2">
                            {customers.length} Member
                        </p>
                        <p className="text-[11px] opacity-65 mt-1">
                            Otomatis mendapat 1 Poin setiap belanja Rp 10.000
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Member Tier VIP Sultan & Gold</span>
                            <Crown className="w-4 h-4 text-amber-400" />
                        </div>
                        <p className="text-3xl font-black text-amber-400 mt-2">
                            {
                                customers.filter(
                                    (c) =>
                                        c.tier === "VIP SULTAN" ||
                                        c.tier === "GOLD",
                                ).length
                            }{" "}
                            Pelanggan Loyal
                        </p>
                        <p className="text-[11px] opacity-65 mt-1">
                            Prioritas penerima promo eksklusif kafe
                        </p>
                    </div>

                    <div className={`p-5 rounded-2xl ${cardClass}`}>
                        <div className="flex justify-between items-center text-xs opacity-75 font-bold">
                            <span>Katalog Hadiah Tukar Poin</span>
                            <Gift className="w-4 h-4 text-purple-400" />
                        </div>
                        <p className="text-3xl font-black text-purple-400 mt-2">
                            {rewardCatalog.length} Jenis Reward
                        </p>
                        <p className="text-[11px] opacity-65 mt-1">
                            Bisa ditukar langsung oleh kasir/owner
                        </p>
                    </div>
                </div>

                {/* Grid Utama: Studio WhatsApp Blast & Katalog Reward (Kiri) + Tabel Member & Redeem (Kanan) */}
                <div className="grid grid-cols-12 gap-6">
                    {/* KOLOM KIRI (5): STUDIO WHATSAPP CAMPAIGN & KATALOG HADIAH */}
                    <div className="col-span-12 lg:col-span-5 space-y-6">
                        <div
                            className={`p-6 rounded-2xl space-y-4 ${cardClass}`}
                        >
                            <h2 className="font-extrabold text-base flex items-center gap-2 text-emerald-500 border-b border-current/10 pb-2">
                                <Megaphone className="w-5 h-5" /> WhatsApp Promo
                                Campaign Generator
                            </h2>

                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Sisipkan Kode Voucher Aktif
                                </label>
                                <select
                                    value={selectedVoucherCode}
                                    onChange={(e) =>
                                        setSelectedVoucherCode(e.target.value)
                                    }
                                    className={`w-full mt-1 font-mono ${inputClass}`}
                                >
                                    {vouchers.map((v) => (
                                        <option key={v.id} value={v.code}>
                                            🏷️ {v.code} - {v.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Template Pesan Personalisasi (Gunakan tag{" "}
                                    {"{nama}"}, {"{voucher}"}, {"{poin}"})
                                </label>
                                <textarea
                                    rows="4"
                                    value={campaignMessage}
                                    onChange={(e) =>
                                        setCampaignMessage(e.target.value)
                                    }
                                    className={`w-full mt-1 leading-relaxed ${inputClass}`}
                                />
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCampaignMessage(
                                            `Halo Kak {nama}! 🎉 Saldo poin member Anda di ${auth.cafe?.name} saat ini adalah *{poin} Poin*. Yuk mampir ngopi hari ini dan pakai kode *{voucher}* untuk diskon spesial!`,
                                        )
                                    }
                                    className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-[10px] font-bold"
                                >
                                    ✨ Template Info Poin
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCampaignMessage(
                                            `Selamat Pagi Kak {nama}! ☕ Awali harimu dengan Signature Coffee dari ${auth.cafe?.name}. Tunjukkan pesan ini di kasir dengan kode *{voucher}* untuk potongan harga langsung!`,
                                        )
                                    }
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold"
                                >
                                    ☕ Template Promo Pagi
                                </button>
                            </div>
                        </div>

                        {/* Katalog Hadiah Tukar Poin */}
                        <div
                            className={`p-6 rounded-2xl space-y-4 ${cardClass}`}
                        >
                            <h3 className="font-extrabold text-base flex items-center gap-2 text-purple-400 border-b border-current/10 pb-2">
                                <Gift className="w-5 h-5" /> Katalog Hadiah
                                Tukar Poin (Pilih untuk Redeem)
                            </h3>

                            <div className="space-y-2">
                                {rewardCatalog.map((rew) => {
                                    const active =
                                        selectedReward?.id === rew.id;
                                    return (
                                        <div
                                            key={rew.id}
                                            onClick={() =>
                                                setSelectedReward(rew)
                                            }
                                            className={`cursor-pointer p-3 rounded-xl border flex justify-between items-center text-xs transition ${
                                                active
                                                    ? "bg-purple-500/20 border-purple-400 text-purple-200 font-bold"
                                                    : "bg-black/15 border-current/10 opacity-80 hover:opacity-100"
                                            }`}
                                        >
                                            <span>🎁 {rew.title}</span>
                                            <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-mono font-black">
                                                {rew.points_cost} Poin
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <form
                                onSubmit={handleAddReward}
                                className="pt-2 border-t border-current/10 flex gap-2"
                            >
                                <input
                                    type="text"
                                    required
                                    placeholder="Nama Hadiah Baru..."
                                    value={rewardForm.title}
                                    onChange={(e) =>
                                        setRewardForm({
                                            ...rewardForm,
                                            title: e.target.value,
                                        })
                                    }
                                    className={`flex-1 ${inputClass}`}
                                />
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={rewardForm.points_cost}
                                    onChange={(e) =>
                                        setRewardForm({
                                            ...rewardForm,
                                            points_cost: e.target.value,
                                        })
                                    }
                                    className={`w-20 font-mono ${inputClass}`}
                                />
                                <button
                                    type="submit"
                                    className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* KOLOM KANAN (7): DAFTAR MEMBER, TIER, REDEEM POIN & 1-CLICK KIRIM WA */}
                    <div
                        className={`col-span-12 lg:col-span-7 p-6 rounded-2xl space-y-4 h-fit ${cardClass}`}
                    >
                        <div className="border-b border-current/10 pb-3">
                            <h2 className="font-extrabold text-base">
                                Klasemen Tier Member, Penukaran Poin & Kirim
                                Promo WhatsApp
                            </h2>
                            <p className="text-xs opacity-70">
                                Hadiah Aktif Dipilih:{" "}
                                <strong>
                                    {selectedReward?.title} (
                                    {selectedReward?.points_cost} Poin)
                                </strong>
                            </p>
                        </div>

                        <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                            {customers.length === 0 ? (
                                <p className="text-center py-12 text-xs opacity-60">
                                    Belum ada member terdaftar. Input nomor
                                    WhatsApp pelanggan saat checkout di Kasir
                                    POS untuk menambah member otomatis.
                                </p>
                            ) : (
                                customers.map((cust) => {
                                    const tierBadge = {
                                        "VIP SULTAN":
                                            "bg-amber-400 text-slate-950 font-black",
                                        GOLD: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-black",
                                        SILVER: "bg-slate-400/20 text-slate-200 border border-slate-400/40 font-bold",
                                        BRONZE: "bg-orange-700/20 text-orange-300 border border-orange-700/40 font-bold",
                                    }[cust.tier];

                                    const canRedeem =
                                        selectedReward &&
                                        cust.available_points >=
                                            selectedReward.points_cost;

                                    return (
                                        <div
                                            key={cust.id}
                                            className="p-4 rounded-2xl bg-black/15 border border-current/10 flex flex-wrap justify-between items-center gap-4 text-xs"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-[10px] ${tierBadge}`}
                                                    >
                                                        👑 {cust.tier}
                                                    </span>
                                                    <span className="font-extrabold text-sm">
                                                        {cust.name}
                                                    </span>
                                                    <span className="font-mono text-[11px] opacity-65">
                                                        ({cust.member_code})
                                                    </span>
                                                </div>
                                                <p className="text-[11px] opacity-80">
                                                    WA:{" "}
                                                    <strong>
                                                        {cust.phone}
                                                    </strong>{" "}
                                                    • {cust.orders_count}x
                                                    Kunjungan • Total Belanja:{" "}
                                                    <strong className="text-emerald-400">
                                                        Rp{" "}
                                                        {Number(
                                                            cust.total_spent,
                                                        ).toLocaleString(
                                                            "id-ID",
                                                        )}
                                                    </strong>
                                                </p>
                                                <div className="flex items-center gap-3 pt-0.5">
                                                    <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-extrabold">
                                                        ⭐ Saldo Poin:{" "}
                                                        {cust.available_points}{" "}
                                                        Poin
                                                    </span>
                                                    {cust.used_points > 0 && (
                                                        <span className="text-[10px] opacity-60">
                                                            (Sudah Ditukar:{" "}
                                                            {cust.used_points}{" "}
                                                            Poin)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    disabled={!canRedeem}
                                                    onClick={() =>
                                                        handleRedeemPoints(cust)
                                                    }
                                                    className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-black flex items-center gap-1 transition"
                                                >
                                                    <Gift className="w-3.5 h-3.5" />{" "}
                                                    Tukar (
                                                    {selectedReward?.points_cost ||
                                                        0}{" "}
                                                    Poin)
                                                </button>

                                                <a
                                                    href={generateWaLink(cust)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center gap-1.5 shadow transition"
                                                >
                                                    <MessageCircle className="w-4 h-4" />{" "}
                                                    Kirim WA ↗
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CaffeOSLayout>
    );
}
