import React from "react";
import { Printer, X } from "lucide-react";

export default function PrintTicketModal({ ticket, cafeName, onClose }) {
    if (!ticket) return null;

    return (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-950 border-2 border-emerald-500 text-white rounded-[2.5rem] max-w-md w-full p-7 shadow-2xl space-y-5 text-center relative">
                <div className="border-b border-slate-800 pb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        OFFICIAL COMMUNITY EVENT PASS
                    </span>
                    <h2 className="text-xl font-black mt-1">
                        {ticket.event_title}
                    </h2>
                    <p className="text-xs text-slate-400">{cafeName}</p>
                </div>

                <div className="p-3.5 rounded-3xl bg-white w-fit mx-auto shadow-inner">
                    <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(ticket.ticket_code)}`}
                        alt="QR Ticket"
                        className="w-40 h-40 mx-auto"
                    />
                </div>

                <div className="space-y-1.5 text-xs bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                    <p className="text-slate-400">Nama Peserta Terdaftar:</p>
                    <p className="text-lg font-black text-emerald-400">
                        {ticket.participant_name}
                    </p>
                    <p className="font-mono text-xs text-amber-300">
                        Kode Tiket: {ticket.ticket_code} • {ticket.event_date}
                    </p>
                    <p className="font-mono text-[11px] text-purple-300 pt-1">
                        Bonus Token AI Co-Worker:{" "}
                        <strong>{ticket.ai_token}</strong>
                    </p>
                </div>

                <div className="flex gap-2.5 pt-2 no-print print:hidden">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Printer className="w-4 h-4" /> Cetak E-Ticket (Print /
                        PDF)
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1"
                    >
                        <X className="w-4 h-4" /> Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
