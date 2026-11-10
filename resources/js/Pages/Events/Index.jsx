import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import CreateEventModal from "./Modals/CreateEventModal";
import SellTicketModal from "./Modals/SellTicketModal";
import PrintTicketModal from "./Modals/PrintTicketModal";
import {
    Calendar,
    Ticket,
    Users,
    Plus,
    Printer,
    Sparkles,
    UserPlus,
} from "lucide-react";

export default function EventsIndex({
    cafe,
    events = [],
    tickets = [],
    templates = [],
    tables = [],
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";

    // State Kontrol 3 Modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeEventForTicket, setActiveEventForTicket] = useState(null);
    const [selectedPrintTicket, setSelectedPrintTicket] = useState(null);

    const cardClass = isBrutal
        ? "bg-white border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        : isWood
          ? "bg-white border border-amber-200 text-stone-800 shadow-sm"
          : "bg-slate-900 border border-slate-800 text-slate-100";

    const totalRevenueTickets = tickets.reduce(
        (sum, t) => sum + Number(t.price || 0),
        0,
    );

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Event Komunitas & Tiket Workshop Barista - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* 1. HEADER ACTION BAR & RINGKASAN EKSEKUTIF */}
                <div
                    className={`p-6 rounded-[2.5rem] flex flex-wrap justify-between items-center gap-4 ${cardClass}`}
                >
                    <div>
                        <span className="text-xs font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4" /> Community & Barista
                            Masterclass Hub
                        </span>
                        <h1 className="text-2xl font-black mt-0.5">
                            Manajemen Event Kafe & Penjualan E-Ticket (
                            {events.length} Acara Aktif)
                        </h1>
                        <p className="text-xs opacity-70 mt-0.5">
                            Total Tiket Terbit:{" "}
                            <strong>{tickets.length} E-Ticket</strong> •
                            Akumulasi Omzet Event:{" "}
                            <strong className="text-emerald-400">
                                Rp {totalRevenueTickets.toLocaleString("id-ID")}
                            </strong>
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                setActiveEventForTicket(events[0] || null)
                            }
                            className="px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition active:scale-95"
                        >
                            <UserPlus className="w-4 h-4" /> + Daftarkan Peserta
                            Baru
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-500/25 transition active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> + Buat Jadwal Event
                            Baru
                        </button>
                    </div>
                </div>

                {/* 2. GRID FULL-WIDTH KARTU EVENT & WORKSHOP */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {events.map((ev) => {
                        const remainingSeats = Math.max(
                            0,
                            Number(ev.quota) - Number(ev.sold_count || 0),
                        );

                        return (
                            <div
                                key={ev.id}
                                className={`p-6 rounded-[2.5rem] flex flex-col justify-between transition hover:scale-[1.01] ${cardClass}`}
                            >
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-black uppercase text-[10px]">
                                            🎪 {ev.category}
                                        </span>
                                        <span className="font-mono font-bold text-amber-400 text-[11px]">
                                            📅 {ev.event_date}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-black leading-snug">
                                        {ev.title}
                                    </h3>
                                    <p className="text-xs opacity-75">
                                        Pemateri: <strong>{ev.speaker}</strong>{" "}
                                        • Jam: <strong>{ev.event_time}</strong>
                                    </p>
                                    <p className="text-xs text-emerald-400 font-semibold leading-relaxed">
                                        🎁 {ev.perks}
                                    </p>
                                </div>

                                <div className="mt-5 pt-4 border-t border-current/10 flex justify-between items-center">
                                    <div>
                                        <span className="text-xl font-black text-emerald-400 block">
                                            Rp{" "}
                                            {Number(
                                                ev.ticket_price,
                                            ).toLocaleString("id-ID")}
                                        </span>
                                        <span className="text-[11px] opacity-70">
                                            Terisi: {ev.sold_count}/{ev.quota}{" "}
                                            Kursi (Sisa {remainingSeats})
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setActiveEventForTicket(ev)
                                        }
                                        className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow transition"
                                    >
                                        <Ticket className="w-3.5 h-3.5" /> Jual
                                        Tiket
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 3. TABEL FULL-WIDTH DAFTAR PESERTA & CETAK E-TICKET */}
                <div className={`p-6 rounded-[2.5rem] space-y-4 ${cardClass}`}>
                    <div className="flex justify-between items-center border-b border-current/10 pb-3">
                        <h2 className="font-extrabold text-base flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-500" />{" "}
                            Daftar Peserta Terdaftar & E-Ticket Pass (
                            {tickets.length})
                        </h2>
                    </div>

                    {tickets.length === 0 ? (
                        <p className="text-center py-12 text-xs opacity-60">
                            Belum ada peserta terdaftar. Klik tombol{" "}
                            <strong>"Jual Tiket"</strong> pada salah satu kartu
                            event di atas untuk menerbitkan E-Ticket.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {tickets.map((tix) => (
                                <div
                                    key={tix.id}
                                    className="p-4 rounded-2xl bg-black/15 border border-current/10 flex justify-between items-center gap-4 text-xs"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-mono font-black">
                                                {tix.ticket_code}
                                            </span>
                                            <span className="font-black text-sm">
                                                {tix.participant_name}
                                            </span>
                                            <span className="opacity-65">
                                                ({tix.participant_phone})
                                            </span>
                                        </div>
                                        <p className="font-bold text-amber-400">
                                            {tix.event_title}
                                        </p>
                                        <p className="text-[11px] opacity-75">
                                            Token AI Peserta:{" "}
                                            <strong className="text-purple-300 font-mono">
                                                {tix.ai_token}
                                            </strong>
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedPrintTicket(tix)
                                        }
                                        className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center gap-1.5 shadow shrink-0 transition"
                                    >
                                        <Printer className="w-3.5 h-3.5" />{" "}
                                        E-Ticket
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* KOMPONEN MODAL BLUR */}
            <CreateEventModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />

            <SellTicketModal
                isOpen={Boolean(activeEventForTicket)}
                eventItem={activeEventForTicket}
                onClose={() => setActiveEventForTicket(null)}
            />

            <PrintTicketModal
                ticket={selectedPrintTicket}
                cafeName={cafe?.name}
                onClose={() => setSelectedPrintTicket(null)}
            />
        </CaffeOSLayout>
    );
}
