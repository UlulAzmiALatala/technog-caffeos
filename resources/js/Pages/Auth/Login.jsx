import React from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import {
    LogIn,
    Sparkles,
    ShieldCheck,
    Lock,
    Mail,
    Zap,
    ArrowLeft,
} from "lucide-react";

export default function Login({ status }) {
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

    const handleInstantRoleLogin = (role) => {
        router.post(route("saas.quick-demo"), { role });
    };

    return (
        <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden">
            <Head title="Login Otoritas Staf & Owner — TechnoG CaffeOS" />

            <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md space-y-6 relative z-10">
                {/* Brand Header */}
                <div className="text-center space-y-2">
                    <Link
                        href={route("welcome")}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-bold mb-2"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Portal
                        Depan SaaS
                    </Link>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-slate-950 text-2xl mx-auto shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                        T
                    </div>
                    <h1 className="text-2xl font-black tracking-tight">
                        TechnoG{" "}
                        <span className="text-emerald-400">CaffeOS</span> Portal
                    </h1>
                    <p className="text-xs text-slate-400">
                        Masuk ke ruang kerja Owner, Kasir POS, atau Dapur
                        Barista
                    </p>
                </div>

                {status && (
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                        {status}
                    </div>
                )}

                {/* Card Login */}
                <div className="p-7 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-slate-800 shadow-2xl space-y-5">
                    <form onSubmit={submit} className="space-y-4 text-xs">
                        <div>
                            <label className="font-bold text-slate-300 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-emerald-400" />{" "}
                                Email Akun Kafe
                            </label>
                            <input
                                type="email"
                                required
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
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
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                placeholder="••••••••"
                                className="w-full mt-1.5 rounded-xl bg-slate-950 border-slate-800 text-xs text-white py-2.5"
                            />
                            {errors.password && (
                                <p className="text-rose-400 text-[11px] font-bold mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                    className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                                />
                                <span>Ingat Sesi Perangkat Ini</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition"
                        >
                            <LogIn className="w-4 h-4" /> Masuk ke Workspace
                            CaffeOS
                        </button>
                    </form>

                    {/* Pintasan 1-Klik Login per Role */}
                    <div className="pt-4 border-t border-slate-800 space-y-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-1">
                            <Zap className="w-3.5 h-3.5" /> Pintasan Masuk Cepat
                            (1-Klik Demo Role)
                        </span>
                        <div className="grid grid-cols-3 gap-2 text-[11px] font-black">
                            <button
                                type="button"
                                onClick={() => handleInstantRoleLogin("owner")}
                                className="py-2 rounded-xl bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 border border-slate-800 text-emerald-400 transition"
                            >
                                👑 Owner
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleInstantRoleLogin("cashier")
                                }
                                className="py-2 rounded-xl bg-slate-950 hover:bg-cyan-400 hover:text-slate-950 border border-slate-800 text-cyan-400 transition"
                            >
                                💻 Cashier
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleInstantRoleLogin("barista")
                                }
                                className="py-2 rounded-xl bg-slate-950 hover:bg-amber-400 hover:text-slate-950 border border-slate-800 text-amber-400 transition"
                            >
                                ☕ Barista
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
