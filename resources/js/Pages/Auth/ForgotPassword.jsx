import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Mail, Send } from "lucide-react";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <GuestLayout
            title="Pemulihan Password Akun"
            subtitle="Masukkan email terdaftar Anda untuk menerima tautan reset password."
        >
            <Head title="Lupa Password — TechnoG CaffeOS" />

            {status && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4 text-xs">
                <div>
                    <label className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email
                        Akun Terdaftar
                    </label>
                    <input
                        type="email"
                        required
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        placeholder="owner@technog.id"
                        className="w-full mt-1.5 rounded-xl bg-slate-950 border-slate-800 text-xs text-white py-2.5"
                    />
                    {errors.email && (
                        <p className="text-rose-400 text-[11px] font-bold mt-1">
                            {errors.email}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                    <Send className="w-4 h-4" /> Kirim Link Reset Password
                </button>

                <div className="text-center pt-3 border-t border-slate-800">
                    <Link
                        href={route("login")}
                        className="text-slate-400 hover:text-emerald-400 font-bold"
                    >
                        ← Kembali ke Halaman Login
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
