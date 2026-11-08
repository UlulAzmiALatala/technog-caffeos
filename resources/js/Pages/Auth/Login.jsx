import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import { LogIn, Lock, Mail } from "lucide-react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout
            title="Login Otoritas Staf & Owner"
            subtitle="Masukkan kredensial akun kafe Anda untuk membuka workspace."
        >
            <Head title="Login — TechnoG CaffeOS" />

            {status && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4 text-xs">
                <div>
                    <label className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email
                        Akun Kafe
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

                <div>
                    <label className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />{" "}
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        placeholder="••••••••"
                        className="w-full mt-1.5 rounded-xl bg-slate-950 border-slate-800 text-xs text-white py-2.5"
                    />
                    {errors.password && (
                        <p className="text-rose-400 text-[11px] font-bold mt-1">
                            {errors.password}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) =>
                                setData("remember", e.target.checked)
                            }
                            className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                        />
                        <span>Ingat Sesi Saya</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className="text-emerald-400 hover:underline font-bold"
                        >
                            Lupa Password?
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
                >
                    <LogIn className="w-4 h-4" /> Masuk ke Workspace CaffeOS
                </button>

                <div className="text-center pt-3 border-t border-slate-800 text-slate-400">
                    Belum punya akun staf?{" "}
                    <Link
                        href={route("register")}
                        className="text-emerald-400 font-bold hover:underline"
                    >
                        Daftar Akun Baru
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
