import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    Calendar,
    Ticket,
    Users,
    Sparkles,
    Plus,
    Printer,
    QrCode,
    Bot,
    Award,
    X,
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

    const [selectedEvent, setSelectedEvent] = useState(events[0] || null);
    const [ticketForm, setTicketForm] = useState({
        participant_name: "",
        participant_phone: "",
        payment_method: "qris",
    });

    const [newEventForm, setNewEventForm] = useState({
        title: "",
        category: "Coffee Masterclass",
        event_date: new Date().toISOString().split("T")[0],
        event_time: "16:00 - 19:00 WITA",
        speaker: "Head Barista",
        ticket_price: 100000,
        quota: 25,
        perks: "Free Signature Coffee + Sertifikat + 25x Kuota AI Co-Worker",
    });

    const [selectedPrintTicket, setSelectedPrintTicket] = useState(null);

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

    const handleSellTicket = (e) => {
        e.preventDefault();
        if (!selectedEvent) return;
        router.post(
            route("events.tickets.sell"),
            {
                event_id: selectedEvent.id,
                ...ticketForm,
            },
            {
                onSuccess: () =>
                    setTicketForm({
                        ...ticketForm,
                        participant_name: "",
                        participant_phone: "",
                    }),
            },
        );
    };

    const handleCreateEvent = (e) => {
        e.preventDefault();
        router.post(route("events.store"), newEventForm, {
            onSuccess: () => setNewEventForm({ ...newEventForm, title: "" }),
        });
    };

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Event Komunitas & Tiket Workshop Barista - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* 1. DAFTAR EVENT KOMUNITAS & WORKSHOP BARISTA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {events.map((ev) => {
                        const isSelected = selectedEvent?.id === ev.id;
                        const remainingSeats = Math.max(
                            0,
                            Number(ev.quota) - Number(ev.sold_count || 0),
                        );

                        return (
                            <div
                                key={ev.id}
                                onClick={() => setSelectedEvent(ev)}
                                className={`cursor-pointer p-6 rounded-3xl flex flex-col justify-between transition ${
                                    isSelected
                                        ? "ring-4 ring-emerald-500 bg-emerald-500/15 border border-emerald-500 text-white"
                                        : cardClass
                                }`}
                            >
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-black uppercase text-[10px]">
                                            🎪 {ev.category}
                                        </span>
                                        <span className="font-mono font-bold text-amber-400">
                                            📅 {ev.event_date} • {ev.event_time}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-black">
                                        {ev.title}
                                    </h3>
                                    <p className="text-xs opacity-75">
                                        Pemateri / Host:{" "}
                                        <strong>{ev.speaker}</strong>
                                    </p>
                                    <p className="text-xs text-emerald-400 font-semibold">
                                        🎁 Benefit Peserta: {ev.perks}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-current/10 flex justify-between items-center">
                                    <div>
                                        <span className="text-xl font-black text-emerald-400">
                                            Rp{" "}
                                            {Number(
                                                ev.ticket_price,
                                            ).toLocaleString("id-ID")}
                                        </span>
                                        <span className="text-[11px] opacity-70 ml-2">
                                            (Terjual: {ev.sold_count}/{ev.quota}{" "}
                                            Kursi • Sisa {remainingSeats})
                                        </span>
                                    </div>
                                    <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs">
                                        {isSelected
                                            ? "✓ Event Dipilih"
                                            : "Pilih Event"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 2. GRID FORM REGISTRASI TIKET PESERTA (KIRI) & DAFTAR E-TICKET (KANAN) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 space-y-6">
                        {/* Form Jual Tiket Event */}
                        <form
                            onSubmit={handleSellTicket}
                            className={`p-6 rounded-3xl space-y-4 ${cardClass}`}
                        >
                            <div className="border-b border-current/10 pb-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                    Registrasi Peserta & Cetak E-Ticket
                                </span>
                                <h2 className="font-black text-base mt-0.5">
                                    {selectedEvent?.title ||
                                        "Pilih Event di Atas"}
                                </h2>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Nama Lengkap Peserta *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Nama Peserta Workshop..."
                                    value={ticketForm.participant_name}
                                    onChange={(e) =>
                                        setTicketForm({
                                            ...ticketForm,
                                            participant_name: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        No. WhatsApp Peserta *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="0812..."
                                        value={ticketForm.participant_phone}
                                        onChange={(e) =>
                                            setTicketForm({
                                                ...ticketForm,
                                                participant_phone:
                                                    e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold opacity-75">
                                        Metode Pembayaran
                                    </label>
                                    <select
                                        value={ticketForm.payment_method}
                                        onChange={(e) =>
                                            setTicketForm({
                                                ...ticketForm,
                                                payment_method: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    >
                                        <option value="qris">QRIS</option>
                                        <option value="cash">
                                            Tunai (Cash)
                                        </option>
                                        <option value="va">
                                            Transfer Bank / VA
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                            >
                                <Ticket className="w-4 h-4" /> Terbitkan
                                E-Ticket Peserta & Catat Omzet
                            </button>
                        </form>

                        {/* Form Buat Event / Workshop Baru */}
                        <form
                            onSubmit={handleCreateEvent}
                            className={`p-6 rounded-3xl space-y-3 ${cardClass}`}
                        >
                            <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-purple-400">
                                <Plus className="w-4 h-4" /> Buat Jadwal Event /
                                Workshop Baru
                            </h3>
                            <input
                                type="text"
                                required
                                placeholder="Judul Event / Workshop..."
                                value={newEventForm.title}
                                onChange={(e) =>
                                    setNewEventForm({
                                        ...newEventForm,
                                        title: e.target.value,
                                    })
                                }
                                className={`w-full ${inputClass}`}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    required
                                    value={newEventForm.event_date}
                                    onChange={(e) =>
                                        setNewEventForm({
                                            ...newEventForm,
                                            event_date: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                />
                                <input
                                    type="text"
                                    required
                                    placeholder="Jam (15:00 - 18:00)"
                                    value={newEventForm.event_time}
                                    onChange={(e) =>
                                        setNewEventForm({
                                            ...newEventForm,
                                            event_time: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    type="text"
                                    required
                                    placeholder="Pemateri"
                                    value={newEventForm.speaker}
                                    onChange={(e) =>
                                        setNewEventForm({
                                            ...newEventForm,
                                            speaker: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                />
                                <input
                                    type="number"
                                    required
                                    placeholder="Harga Tiket"
                                    value={newEventForm.ticket_price}
                                    onChange={(e) =>
                                        setNewEventForm({
                                            ...newEventForm,
                                            ticket_price: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                />
                                <input
                                    type="number"
                                    required
                                    placeholder="Kuota"
                                    value={newEventForm.quota}
                                    onChange={(e) =>
                                        setNewEventForm({
                                            ...newEventForm,
                                            quota: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                />
                            </div>
                            <input
                                type="text"
                                required
                                placeholder="Fasilitas Peserta (Perks)..."
                                value={newEventForm.perks}
                                onChange={(e) =>
                                    setNewEventForm({
                                        ...newEventForm,
                                        perks: e.target.value,
                                    })
                                }
                                className={`w-full ${inputClass}`}
                            />
                            <button
                                type="submit"
                                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs"
                            >
                                + Publikasikan Event Baru
                            </button>
                        </form>
                    </div>

                    {/* Daftar Peserta Terdaftar & Tombol Cetak E-Ticket */}
                    <div
                        className={`lg:col-span-7 p-6 rounded-3xl space-y-4 h-fit ${cardClass}`}
                    >
                        <h2 className="font-extrabold text-base border-b border-current/10 pb-3 flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-500" />{" "}
                            Daftar Peserta Workshop & E-Ticket Pass (
                            {tickets.length})
                        </h2>

                        <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                            {tickets.length === 0 ? (
                                <p className="text-center py-12 text-xs opacity-60">
                                    Belum ada peserta yang didaftarkan. Gunakan
                                    form di sebelah kiri untuk menerbitkan
                                    E-Ticket.
                                </p>
                            ) : (
                                tickets.map((tix) => (
                                    <div
                                        key={tix.id}
                                        className="p-4 rounded-2xl bg-black/15 border border-current/10 flex flex-wrap justify-between items-center gap-4 text-xs"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono font-black">
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
                                                Jadwal: {tix.event_date} (
                                                {tix.event_time}) • Token AI:{" "}
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
                                            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center gap-1.5 shadow"
                                        >
                                            <Printer className="w-3.5 h-3.5" />{" "}
                                            Cetak E-Ticket
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL CETAK E-TICKET EVENT RESMI */}
            {selectedPrintTicket && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-950 border-2 border-emerald-500 text-white rounded-3xl max-w-md w-full p-7 shadow-2xl space-y-5 text-center">
                        <div className="border-b border-slate-800 pb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                OFFICIAL COMMUNITY EVENT PASS
                            </span>
                            <h2 className="text-xl font-black mt-1">
                                {selectedPrintTicket.event_title}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {cafe?.name}
                            </p>
                        </div>

                        <div className="p-3 rounded-2xl bg-white w-fit mx-auto">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(selectedPrintTicket.ticket_code)}`}
                                alt="QR Ticket"
                                className="w-36 h-36 mx-auto"
                            />
                        </div>

                        <div className="space-y-1 text-xs">
                            <p className="text-slate-400">Nama Peserta:</p>
                            <p className="text-lg font-black text-emerald-400">
                                {selectedPrintTicket.participant_name}
                            </p>
                            <p className="font-mono text-xs text-amber-300">
                                Kode Tiket: {selectedPrintTicket.ticket_code} •{" "}
                                {selectedPrintTicket.event_date}
                            </p>
                            <p className="font-mono text-[11px] text-purple-300 pt-1">
                                Bonus Token AI Co-Worker:{" "}
                                {selectedPrintTicket.ai_token}
                            </p>
                        </div>

                        <div className="flex gap-2 pt-2 no-print print:hidden">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex-1 py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2"
                            >
                                <Printer className="w-4 h-4" /> Print E-Ticket
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedPrintTicket(null)}
                                className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CaffeOSLayout>
    );
}
