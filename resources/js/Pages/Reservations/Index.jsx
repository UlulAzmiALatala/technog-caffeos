import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    CalendarClock,
    MapPin,
    Users,
    CheckCircle2,
    Clock,
    Ban,
    Sparkles,
    QrCode,
} from "lucide-react";

export default function ReservationsIndex({
    tables = [],
    reservations = [],
    templates = [],
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const isBrutal = auth.activeTemplate === "neo-brutal";

    // State Form Booking Reservasi Meja Baru
    const [bookingForm, setBookingForm] = useState({
        table_id: tables[0]?.id || "",
        customer_name: "",
        customer_phone: "",
        guest_count: 2,
        reservation_time: new Date(Date.now() + 3600 * 1000)
            .toISOString()
            .slice(0, 16),
        dp_amount: 50000,
        notes: "",
    });

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

    // Klik Meja di Denah untuk Merotasi Status: Available -> Occupied -> Reserved
    const handleCycleTableStatus = (table) => {
        const nextStatusMap = {
            available: "occupied",
            occupied: "reserved",
            reserved: "available",
        };
        const nextStatus = nextStatusMap[table.status] || "available";
        router.post(route("reservations.tables.status", table.id), {
            status: nextStatus,
        });
    };

    const handleStoreReservation = (e) => {
        e.preventDefault();
        router.post(route("reservations.store"), bookingForm, {
            onSuccess: () =>
                setBookingForm({
                    ...bookingForm,
                    customer_name: "",
                    customer_phone: "",
                    notes: "",
                }),
        });
    };

    const availableCount = tables.filter(
        (t) => t.status === "available",
    ).length;
    const occupiedCount = tables.filter((t) => t.status === "occupied").length;
    const reservedCount = tables.filter((t) => t.status === "reserved").length;

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Denah Meja Interaktif & Reservasi - TechnoG CaffeOS" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                {/* 1. DENAH MEJA VISUAL INTERAKTIF (LIVE FLOOR PLAN) */}
                <div className={`p-6 rounded-3xl space-y-5 ${cardClass}`}>
                    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-current/10 pb-4">
                        <div>
                            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" /> Interactive Cafe
                                Floor Plan
                            </span>
                            <h1 className="text-xl font-black mt-0.5">
                                Denah Ketersediaan Meja Real-Time (Klik Meja
                                untuk Ubah Status)
                            </h1>
                        </div>

                        {/* Legenda Status Meja */}
                        <div className="flex items-center gap-3 text-xs font-bold">
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                                🟢 Kosong (Available): {availableCount}
                            </span>
                            <span className="px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400">
                                🔴 Terisi (Occupied): {occupiedCount}
                            </span>
                            <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                                🟡 Dibooking (Reserved): {reservedCount}
                            </span>
                        </div>
                    </div>

                    {/* Grid Visual Meja Kafe */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {tables.map((t) => {
                            const statusColors = {
                                available:
                                    "bg-emerald-500/15 border-emerald-500 text-emerald-400 hover:bg-emerald-500/25",
                                occupied:
                                    "bg-red-500/15 border-red-500 text-red-400 hover:bg-red-500/25",
                                reserved:
                                    "bg-amber-500/20 border-amber-500 text-amber-300 hover:bg-amber-500/30",
                            };

                            return (
                                <div
                                    key={t.id}
                                    onClick={() => handleCycleTableStatus(t)}
                                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
                                        statusColors[t.status] ||
                                        statusColors.available
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-black/20">
                                            {t.location}
                                        </span>
                                        <QrCode className="w-4 h-4 opacity-70" />
                                    </div>

                                    <div className="text-center py-2">
                                        <p className="text-3xl font-black">
                                            MEJA #{t.table_number}
                                        </p>
                                        <p className="text-xs font-extrabold uppercase tracking-wider mt-1">
                                            {t.status === "available"
                                                ? "🟢 TERSEDIA"
                                                : t.status === "occupied"
                                                  ? "🔴 SEDANG TERISI"
                                                  : "🟡 RESERVED / BOOKED"}
                                        </p>
                                    </div>

                                    <div className="text-[10px] text-center opacity-75 border-t border-current/20 pt-2">
                                        Klik untuk ganti status meja
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. FORM BOOKING RESERVASI & DAFTAR JADWAL RESERVASI */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Form Input Reservasi Baru */}
                    <form
                        onSubmit={handleStoreReservation}
                        className={`col-span-12 lg:col-span-4 p-6 rounded-2xl space-y-4 h-fit ${cardClass}`}
                    >
                        <h2 className="font-extrabold text-base text-emerald-500 border-b border-current/10 pb-2 flex items-center gap-2">
                            <CalendarClock className="w-5 h-5" /> + Buat
                            Reservasi / Booking Meja
                        </h2>

                        <div>
                            <label className="text-[11px] font-bold opacity-75">
                                Pilih Meja Kafe *
                            </label>
                            <select
                                value={bookingForm.table_id}
                                onChange={(e) =>
                                    setBookingForm({
                                        ...bookingForm,
                                        table_id: e.target.value,
                                    })
                                }
                                className={`w-full mt-1 ${inputClass}`}
                            >
                                {tables.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        Meja #{t.table_number} ({t.location}) -
                                        [{t.status.toUpperCase()}]
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold opacity-75">
                                Nama Pemesan / Instansi *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Bpk. Rizki (Meeting Tim)"
                                value={bookingForm.customer_name}
                                onChange={(e) =>
                                    setBookingForm({
                                        ...bookingForm,
                                        customer_name: e.target.value,
                                    })
                                }
                                className={`w-full mt-1 ${inputClass}`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    No. WhatsApp *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="0812..."
                                    value={bookingForm.customer_phone}
                                    onChange={(e) =>
                                        setBookingForm({
                                            ...bookingForm,
                                            customer_phone: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Jumlah Tamu (Pax)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={bookingForm.guest_count}
                                    onChange={(e) =>
                                        setBookingForm({
                                            ...bookingForm,
                                            guest_count: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Waktu Kedatangan *
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={bookingForm.reservation_time}
                                    onChange={(e) =>
                                        setBookingForm({
                                            ...bookingForm,
                                            reservation_time: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold opacity-75">
                                    Uang DP Masuk (Rp)
                                </label>
                                <input
                                    type="number"
                                    value={bookingForm.dp_amount}
                                    onChange={(e) =>
                                        setBookingForm({
                                            ...bookingForm,
                                            dp_amount: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold opacity-75">
                                Catatan Khusus Acara
                            </label>
                            <input
                                type="text"
                                placeholder="Misal: Sediakan colokan kabel roll & meja VIP"
                                value={bookingForm.notes}
                                onChange={(e) =>
                                    setBookingForm({
                                        ...bookingForm,
                                        notes: e.target.value,
                                    })
                                }
                                className={`w-full mt-1 ${inputClass}`}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition"
                        >
                            Simpan Reservasi & Kunci Meja
                        </button>
                    </form>

                    {/* Daftar Jadwal Reservasi Aktif */}
                    <div
                        className={`col-span-12 lg:col-span-8 p-6 rounded-2xl space-y-4 h-fit ${cardClass}`}
                    >
                        <h2 className="font-extrabold text-base border-b border-current/10 pb-3">
                            Daftar Jadwal Booking & Check-In Tamu Reservasi
                        </h2>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                            {reservations.length === 0 ? (
                                <p className="text-center py-12 text-xs opacity-60">
                                    Belum ada jadwal reservasi meja yang
                                    tercatat.
                                </p>
                            ) : (
                                reservations.map((res) => (
                                    <div
                                        key={res.id}
                                        className="p-4 rounded-2xl bg-black/10 border border-current/10 flex flex-wrap justify-between items-center gap-4 text-xs"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-extrabold">
                                                    {res.booking_code}
                                                </span>
                                                <span className="font-extrabold text-sm">
                                                    Meja #
                                                    {res.table?.table_number} (
                                                    {res.table?.location})
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase text-[10px]">
                                                    {res.status}
                                                </span>
                                            </div>
                                            <p className="font-bold">
                                                Tamu: {res.customer_name} (
                                                {res.customer_phone}) •{" "}
                                                {res.guest_count} Orang
                                            </p>
                                            <p className="text-[11px] opacity-75">
                                                Jadwal:{" "}
                                                <strong>
                                                    {new Date(
                                                        res.reservation_time,
                                                    ).toLocaleString("id-ID")}
                                                </strong>{" "}
                                                • DP: Rp{" "}
                                                {Number(
                                                    res.dp_amount,
                                                ).toLocaleString("id-ID")}
                                            </p>
                                            {res.notes && (
                                                <p className="text-[11px] italic opacity-70">
                                                    Catatan: "{res.notes}"
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {res.status === "booked" && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.post(
                                                            route(
                                                                "reservations.status",
                                                                res.id,
                                                            ),
                                                            {
                                                                status: "checked_in",
                                                            },
                                                        )
                                                    }
                                                    className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 font-extrabold flex items-center gap-1"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                                    Check-In Tamu
                                                </button>
                                            )}
                                            {res.status === "checked_in" && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.post(
                                                            route(
                                                                "reservations.status",
                                                                res.id,
                                                            ),
                                                            {
                                                                status: "completed",
                                                            },
                                                        )
                                                    }
                                                    className="px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 font-extrabold flex items-center gap-1"
                                                >
                                                    Selesai & Kosongkan Meja
                                                </button>
                                            )}
                                            {res.status !== "cancelled" &&
                                                res.status !== "completed" && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            router.post(
                                                                route(
                                                                    "reservations.status",
                                                                    res.id,
                                                                ),
                                                                {
                                                                    status: "cancelled",
                                                                },
                                                            )
                                                        }
                                                        className="px-3 py-2 rounded-xl bg-red-500/20 text-red-400 font-bold flex items-center gap-1"
                                                    >
                                                        <Ban className="w-3.5 h-3.5" />{" "}
                                                        Batal
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CaffeOSLayout>
    );
}
