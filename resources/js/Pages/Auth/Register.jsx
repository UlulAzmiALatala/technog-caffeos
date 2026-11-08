import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import { UserPlus, User, Mail, Lock } from "lucide-react";

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout
            title="Registrasi Akun Personel"
            subtitle="Buat akun baru untuk terhubung ke sistem manajemen TechnoG CaffeOS."
        >
            <Head title="Register — TechnoG CaffeOS" />

            <form onSubmit={submit} className="space-y-4 text-xs">
                <div>
                    <label className="font-bold text-slate-300 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-400" /> Nama
                        Lengkap
                    </label>
                    <input
                        type="text"
                        required
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        placeholder="Nama Lengkap Anda"
                        className="w-full mt-1.5 rounded-xl bg-slate-950 border-slate-800 text-xs text-white py-2.5"
                    />
                    {errors.name && (
                        <p className="text-rose-400 text-[11px] font-bold mt-1">
                            {errors.name}
                        </p>
                    )}
                </div>

                <div>
                    <label className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-400" /> Alamat
                        Email
                    </label>
                    <input
                        type="email"
                        required
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        placeholder="nama@kafe.com"
                        className="w-full mt-1.5 rounded-xl bg-slate-950 border-slate-800 text-xs text-white py-2.5"
                    />
                    {errors.email && (
                        <p className="text-rose-400 text-[11px] font-bold mt-1">
                            {errors.email}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="font-bold text-slate-300 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-emerald-400" />{" "}
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            placeholder="Min. 8 karakter"
                            className="w-full mt-1.5 rounded-xl bg-slate-950 border-slate-800 text-xs text-white py-2.5"
                        />
                    </div>
                    <div>
                        <label className="font-bold text-slate-300 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-emerald-400" />{" "}
                            Konfirmasi
                        </label>
                        <input
                            type="password"
                            required
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            placeholder="Ulangi password"
                            className="w-full mt-1.5 rounded-xl bg-slate-950 border-slate-800 text-xs text-white py-2.5"
                        />
                    </div>
                </div>
                {errors.password && (
                    <p className="text-rose-400 text-[11px] font-bold">
                        {errors.password}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                    <UserPlus className="w-4 h-4" /> Daftarkan Akun Sekarang
                </button>

                <div className="text-center pt-3 border-t border-slate-800 text-slate-400">
                    Sudah punya akun?{" "}
                    <Link
                        href={route("login")}
                        className="text-emerald-400 font-bold hover:underline"
                    >
                        Login di Sini
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
