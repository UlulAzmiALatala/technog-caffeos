import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import CaffeOSLayout from "@/Layouts/CaffeOSLayout";
import {
    Coffee,
    Package,
    ClipboardList,
    QrCode,
    Users,
    Trash2,
    AlertTriangle,
    CheckCircle,
    ChefHat,
    Truck,
    Printer,
} from "lucide-react";

export default function ManagementDashboard({
    menus,
    stocks,
    tables,
    templates,
    staffs = [],
    orders,
}) {
    const { auth } = usePage().props;
    const isWood = auth.activeTemplate === "minimalist-wood";
    const [activeTab, setActiveTab] = useState("orders"); // orders | menus | stocks | tables | staffs
    const [selectedQrTable, setSelectedQrTable] = useState(null);

    // State Form Input Menu Baru + Komposisi Resep Stok
    const [menuForm, setMenuForm] = useState({
        name: "",
        category: "Coffee",
        price: "",
        discount: 0,
        description: "",
        treatment: "",
        recipes: [],
    });

    // State Form Input Stok Bahan Baku Baru
    const [stockForm, setStockForm] = useState({
        name: "",
        type: "raw_material",
        unit: "gram",
        current_qty: "",
        min_qty_alert: 100,
    });

    // State Form Input Meja Baru
    const [tableForm, setTableForm] = useState({
        table_number: "",
        location: "Indoor",
    });

    // State Form Input Staf Baru
    const [staffForm, setStaffForm] = useState({
        name: "",
        email: "",
        phone: "",
        role: "barista",
        password: "",
    });

    // State Penugasan Driver Delivery per Order
    const [driverData, setDriverData] = useState({});

    const cardClass = isWood
        ? "bg-white border border-amber-200 text-stone-800 shadow-sm"
        : "bg-slate-900 border border-slate-800 text-slate-100";

    const inputClass = isWood
        ? "rounded-xl bg-amber-50/50 border-stone-300 text-stone-800 text-sm"
        : "rounded-xl bg-slate-950 border-slate-800 text-white text-sm";

    const addRecipeRow = () => {
        setMenuForm({
            ...menuForm,
            recipes: [
                ...menuForm.recipes,
                { stock_id: stocks[0]?.id || "", qty_needed: 10 },
            ],
        });
    };

    const updateRecipeRow = (index, field, value) => {
        const updated = [...menuForm.recipes];
        updated[index][field] = value;
        setMenuForm({ ...menuForm, recipes: updated });
    };

    const removeRecipeRow = (index) => {
        setMenuForm({
            ...menuForm,
            recipes: menuForm.recipes.filter((_, i) => i !== index),
        });
    };

    const handleMenuSubmit = (e) => {
        e.preventDefault();
        router.post(route("management.menus.store"), menuForm, {
            onSuccess: () =>
                setMenuForm({
                    name: "",
                    category: "Coffee",
                    price: "",
                    discount: 0,
                    description: "",
                    treatment: "",
                    recipes: [],
                }),
        });
    };

    const handleStockSubmit = (e) => {
        e.preventDefault();
        router.post(route("management.stocks.store"), stockForm, {
            onSuccess: () =>
                setStockForm({
                    name: "",
                    type: "raw_material",
                    unit: "gram",
                    current_qty: "",
                    min_qty_alert: 100,
                }),
        });
    };

    const handleTableSubmit = (e) => {
        e.preventDefault();
        router.post(route("management.tables.store"), tableForm, {
            onSuccess: () =>
                setTableForm({ table_number: "", location: "Indoor" }),
        });
    };

    const handleStaffSubmit = (e) => {
        e.preventDefault();
        router.post(route("management.staffs.store"), staffForm, {
            onSuccess: () =>
                setStaffForm({
                    name: "",
                    email: "",
                    phone: "",
                    role: "barista",
                    password: "",
                }),
        });
    };

    const handleAssignDriver = (orderId) => {
        const data = driverData[orderId];
        if (!data?.driver_name || !data?.recipient_address) return;
        router.post(route("management.orders.driver", orderId), data);
    };

    return (
        <CaffeOSLayout templates={templates} tables={tables}>
            <Head title="Operasional Dapur, Menu & Stok - TechnoG CaffeOS" />

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Bar Navigasi Sub-Fitur Operasional */}
                <div className="flex flex-wrap gap-2.5 border-b border-slate-700/30 pb-4">
                    {[
                        {
                            id: "orders",
                            label: `1. MANAGE ORDER DAPUR (${orders.length})`,
                            icon: ClipboardList,
                        },
                        {
                            id: "menus",
                            label: `2. INPUT MENU & RESEP (${menus.length})`,
                            icon: Coffee,
                        },
                        {
                            id: "stocks",
                            label: `3. MONITOR STOCK (${stocks.length})`,
                            icon: Package,
                        },
                        {
                            id: "tables",
                            label: `4. MEJA & CETAK QR (${tables.length})`,
                            icon: QrCode,
                        },
                        {
                            id: "staffs",
                            label: `5. AKUN KARYAWAN (${staffs.length})`,
                            icon: Users,
                        },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                                    isActive
                                        ? isWood
                                            ? "bg-amber-900 text-white shadow"
                                            : "bg-emerald-500 text-slate-950 shadow"
                                        : isWood
                                          ? "bg-white text-stone-700 border border-amber-200 hover:bg-amber-100"
                                          : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                                }`}
                            >
                                <Icon className="w-4 h-4" /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* ================= TAB 1: MANAGE ORDER DAPUR & DELIVERY ================= */}
                {activeTab === "orders" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {orders.map((ord) => (
                            <div
                                key={ord.id}
                                className={`p-5 rounded-2xl flex flex-col justify-between space-y-4 ${cardClass}`}
                            >
                                <div>
                                    <div className="flex justify-between items-center border-b border-slate-700/20 pb-2">
                                        <span className="text-lg font-extrabold text-emerald-500">
                                            Antrean #{ord.queue_number}
                                        </span>
                                        <span className="text-xs uppercase px-2.5 py-1 rounded-full bg-amber-500/20 font-bold text-amber-400">
                                            {ord.order_status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold mt-2">
                                        {ord.customer_name} •{" "}
                                        <span className="uppercase text-xs opacity-75">
                                            {ord.order_type}
                                        </span>
                                        {ord.table &&
                                            ` (Meja ${ord.table.table_number})`}
                                    </p>

                                    <ul
                                        className={`mt-3 space-y-1.5 text-xs p-3 rounded-xl ${isWood ? "bg-amber-50" : "bg-slate-950"}`}
                                    >
                                        {ord.items?.map((it) => (
                                            <li
                                                key={it.id}
                                                className="flex flex-col border-b border-slate-700/10 pb-1 last:border-0"
                                            >
                                                <span className="font-bold">
                                                    {it.qty}x {it.menu?.name}
                                                </span>
                                                {it.menu?.treatment && (
                                                    <span className="text-[11px] opacity-70">
                                                        SOP: {it.menu.treatment}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Panel Khusus Pesanan Bertipe DELIVERY (Tabel Deliveries / Driver) */}
                                    {ord.order_type === "delivery" && (
                                        <div className="mt-3 p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 space-y-2 text-xs">
                                            <div className="font-bold text-blue-400 flex items-center gap-1">
                                                <Truck className="w-3.5 h-3.5" />{" "}
                                                Pengiriman Kurir / Driver
                                            </div>
                                            {ord.delivery ? (
                                                <div className="space-y-0.5 text-[11px]">
                                                    <p>
                                                        <strong>Driver:</strong>{" "}
                                                        {
                                                            ord.delivery
                                                                .driver_name
                                                        }{" "}
                                                        (
                                                        {
                                                            ord.delivery
                                                                .driver_phone
                                                        }
                                                        )
                                                    </p>
                                                    <p>
                                                        <strong>Alamat:</strong>{" "}
                                                        {
                                                            ord.delivery
                                                                .recipient_address
                                                        }
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-1.5">
                                                    <input
                                                        type="text"
                                                        placeholder="Nama Driver..."
                                                        onChange={(e) =>
                                                            setDriverData({
                                                                ...driverData,
                                                                [ord.id]: {
                                                                    ...driverData[
                                                                        ord.id
                                                                    ],
                                                                    driver_name:
                                                                        e.target
                                                                            .value,
                                                                },
                                                            })
                                                        }
                                                        className="w-full rounded-lg bg-slate-950 border-slate-800 text-xs text-white p-1.5"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="No HP Driver..."
                                                        onChange={(e) =>
                                                            setDriverData({
                                                                ...driverData,
                                                                [ord.id]: {
                                                                    ...driverData[
                                                                        ord.id
                                                                    ],
                                                                    driver_phone:
                                                                        e.target
                                                                            .value,
                                                                },
                                                            })
                                                        }
                                                        className="w-full rounded-lg bg-slate-950 border-slate-800 text-xs text-white p-1.5"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Alamat Pengantaran..."
                                                        onChange={(e) =>
                                                            setDriverData({
                                                                ...driverData,
                                                                [ord.id]: {
                                                                    ...driverData[
                                                                        ord.id
                                                                    ],
                                                                    recipient_address:
                                                                        e.target
                                                                            .value,
                                                                },
                                                            })
                                                        }
                                                        className="w-full rounded-lg bg-slate-950 border-slate-800 text-xs text-white p-1.5"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleAssignDriver(
                                                                ord.id,
                                                            )
                                                        }
                                                        className="w-full py-1.5 rounded-lg bg-blue-500 text-white font-bold"
                                                    >
                                                        Tugaskan Driver
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Tombol Status Dapur Proses -> Siap Saji -> Selesai */}
                                <div className="grid grid-cols-3 gap-2 pt-2">
                                    <button
                                        onClick={() =>
                                            router.post(
                                                route(
                                                    "management.orders.status",
                                                    ord.id,
                                                ),
                                                { order_status: "processing" },
                                            )
                                        }
                                        className="py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-xs font-bold flex items-center justify-center gap-1 transition"
                                    >
                                        <ChefHat className="w-3.5 h-3.5" />{" "}
                                        Proses
                                    </button>
                                    <button
                                        onClick={() =>
                                            router.post(
                                                route(
                                                    "management.orders.status",
                                                    ord.id,
                                                ),
                                                { order_status: "ready" },
                                            )
                                        }
                                        className="py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 text-xs font-bold flex items-center justify-center gap-1 transition"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" />{" "}
                                        Siap Saji
                                    </button>
                                    <button
                                        onClick={() =>
                                            router.post(
                                                route(
                                                    "management.orders.status",
                                                    ord.id,
                                                ),
                                                { order_status: "completed" },
                                            )
                                        }
                                        className="py-2 rounded-lg bg-slate-700/40 hover:bg-slate-700 text-xs font-bold transition"
                                    >
                                        Selesai
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ================= TAB 2: INPUT MENU & RESEP ================= */}
                {activeTab === "menus" && (
                    <div className="grid grid-cols-12 gap-6">
                        <form
                            onSubmit={handleMenuSubmit}
                            className={`col-span-12 lg:col-span-5 p-6 rounded-2xl space-y-4 h-fit ${cardClass}`}
                        >
                            <h2 className="font-bold text-base text-emerald-500 border-b border-slate-700/20 pb-2">
                                + Input Menu Kafe Baru
                            </h2>

                            <div>
                                <label className="text-xs opacity-70">
                                    Nama Menu
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Caramel Macchiato"
                                    value={menuForm.name}
                                    onChange={(e) =>
                                        setMenuForm({
                                            ...menuForm,
                                            name: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs opacity-70">
                                        Kategori
                                    </label>
                                    <select
                                        value={menuForm.category}
                                        onChange={(e) =>
                                            setMenuForm({
                                                ...menuForm,
                                                category: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    >
                                        <option value="Coffee">Coffee</option>
                                        <option value="Non-Coffee">
                                            Non-Coffee
                                        </option>
                                        <option value="Pastry">Pastry</option>
                                        <option value="Main Course">
                                            Main Course
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs opacity-70">
                                        Harga Jual (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="25000"
                                        value={menuForm.price}
                                        onChange={(e) =>
                                            setMenuForm({
                                                ...menuForm,
                                                price: e.target.value,
                                            })
                                        }
                                        className={`w-full mt-1 ${inputClass}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs opacity-70">
                                    Deskripsi Rasa (Dibaca AI Co-Worker)
                                </label>
                                <textarea
                                    rows="2"
                                    value={menuForm.description}
                                    onChange={(e) =>
                                        setMenuForm({
                                            ...menuForm,
                                            description: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>

                            <div>
                                <label className="text-xs opacity-70">
                                    SOP Takaran / Perlakuan Barista
                                </label>
                                <input
                                    type="text"
                                    value={menuForm.treatment}
                                    onChange={(e) =>
                                        setMenuForm({
                                            ...menuForm,
                                            treatment: e.target.value,
                                        })
                                    }
                                    className={`w-full mt-1 ${inputClass}`}
                                />
                            </div>

                            <div
                                className={`p-3.5 rounded-xl border space-y-2 ${isWood ? "bg-amber-50/70 border-amber-200" : "bg-slate-950 border-slate-800"}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold">
                                        Komposisi Resep (Potong Stok Otomatis)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={addRecipeRow}
                                        className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold"
                                    >
                                        + Bahan Baku
                                    </button>
                                </div>

                                {menuForm.recipes.map((rcp, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2"
                                    >
                                        <select
                                            value={rcp.stock_id}
                                            onChange={(e) =>
                                                updateRecipeRow(
                                                    idx,
                                                    "stock_id",
                                                    e.target.value,
                                                )
                                            }
                                            className={`flex-1 ${inputClass}`}
                                        >
                                            {stocks.map((st) => (
                                                <option
                                                    key={st.id}
                                                    value={st.id}
                                                >
                                                    {st.name} ({st.unit})
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            value={rcp.qty_needed}
                                            onChange={(e) =>
                                                updateRecipeRow(
                                                    idx,
                                                    "qty_needed",
                                                    e.target.value,
                                                )
                                            }
                                            className={`w-24 ${inputClass}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeRecipeRow(idx)}
                                            className="p-1.5 text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm"
                            >
                                Simpan Menu & Resep
                            </button>
                        </form>

                        <div className="col-span-12 lg:col-span-7 space-y-3">
                            {menus.map((m) => (
                                <div
                                    key={m.id}
                                    className={`p-4 rounded-2xl flex justify-between items-center ${cardClass}`}
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-base">
                                                {m.name}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                                                {m.category}
                                            </span>
                                        </div>
                                        <p className="text-xs opacity-70">
                                            {m.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {m.stocks?.map((st) => (
                                                <span
                                                    key={st.id}
                                                    className="text-[11px] px-2 py-0.5 rounded bg-slate-500/10 font-mono"
                                                >
                                                    {st.name}:{" "}
                                                    {st.pivot.qty_needed}{" "}
                                                    {st.unit}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-right space-y-2 shrink-0">
                                        <p className="font-bold text-emerald-500">
                                            Rp{" "}
                                            {Number(m.price).toLocaleString(
                                                "id-ID",
                                            )}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    router.post(
                                                        route(
                                                            "management.menus.toggle",
                                                            m.id,
                                                        ),
                                                    )
                                                }
                                                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                                    m.is_available
                                                        ? "bg-emerald-500/20 text-emerald-400"
                                                        : "bg-red-500/20 text-red-400"
                                                }`}
                                            >
                                                {m.is_available
                                                    ? "Tersedia"
                                                    : "Habis"}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    router.delete(
                                                        route(
                                                            "management.menus.destroy",
                                                            m.id,
                                                        ),
                                                    )
                                                }
                                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ================= TAB 3: MONITOR STOCK BAHAN BAKU ================= */}
                {activeTab === "stocks" && (
                    <div className="grid grid-cols-12 gap-6">
                        <form
                            onSubmit={handleStockSubmit}
                            className={`col-span-12 lg:col-span-4 p-6 rounded-2xl space-y-4 h-fit ${cardClass}`}
                        >
                            <h2 className="font-bold text-base text-emerald-500">
                                + Tambah Bahan Baku
                            </h2>
                            <input
                                type="text"
                                required
                                placeholder="Nama Bahan (Misal: Sirup Vanilla)"
                                value={stockForm.name}
                                onChange={(e) =>
                                    setStockForm({
                                        ...stockForm,
                                        name: e.target.value,
                                    })
                                }
                                className={`w-full ${inputClass}`}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={stockForm.type}
                                    onChange={(e) =>
                                        setStockForm({
                                            ...stockForm,
                                            type: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                >
                                    <option value="raw_material">
                                        Bahan Baku
                                    </option>
                                    <option value="packaging">Kemasan</option>
                                </select>
                                <input
                                    type="text"
                                    required
                                    placeholder="gram / ml / pcs"
                                    value={stockForm.unit}
                                    onChange={(e) =>
                                        setStockForm({
                                            ...stockForm,
                                            unit: e.target.value,
                                        })
                                    }
                                    className={inputClass}
                                />
                            </div>
                            <input
                                type="number"
                                required
                                placeholder="Stok Awal (Misal: 3000)"
                                value={stockForm.current_qty}
                                onChange={(e) =>
                                    setStockForm({
                                        ...stockForm,
                                        current_qty: e.target.value,
                                    })
                                }
                                className={`w-full ${inputClass}`}
                            />
                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
                            >
                                Simpan Bahan Baku
                            </button>
                        </form>

                        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stocks.map((st) => {
                                const isLow =
                                    Number(st.current_qty) <=
                                    Number(st.min_qty_alert);
                                return (
                                    <div
                                        key={st.id}
                                        className={`p-5 rounded-2xl flex justify-between items-center ${cardClass} ${isLow ? "border-red-500" : ""}`}
                                    >
                                        <div>
                                            <h3 className="font-bold">
                                                {st.name}
                                            </h3>
                                            <p className="text-2xl font-extrabold text-emerald-500 mt-1">
                                                {Number(
                                                    st.current_qty,
                                                ).toLocaleString("id-ID")}{" "}
                                                <span className="text-xs font-normal opacity-70">
                                                    {st.unit}
                                                </span>
                                            </p>
                                            {isLow && (
                                                <span className="inline-flex items-center gap-1 text-xs text-red-400 mt-1 font-bold">
                                                    <AlertTriangle className="w-3.5 h-3.5" />{" "}
                                                    Stok Menipis!
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() =>
                                                router.post(
                                                    route(
                                                        "management.stocks.restock",
                                                        st.id,
                                                    ),
                                                    { add_qty: 1000 },
                                                )
                                            }
                                            className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 text-xs font-bold transition"
                                        >
                                            + Restock 1000 {st.unit}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ================= TAB 4: KELOLA MEJA & CETAK QR VISUAL ================= */}
                {activeTab === "tables" && (
                    <div className="grid grid-cols-12 gap-6">
                        <form
                            onSubmit={handleTableSubmit}
                            className={`col-span-12 lg:col-span-4 p-6 rounded-2xl space-y-4 h-fit ${cardClass}`}
                        >
                            <h2 className="font-bold text-base text-emerald-500">
                                + Tambah Meja QR Baru
                            </h2>
                            <input
                                type="text"
                                required
                                placeholder="Nomor Meja (Misal: 05)"
                                value={tableForm.table_number}
                                onChange={(e) =>
                                    setTableForm({
                                        ...tableForm,
                                        table_number: e.target.value,
                                    })
                                }
                                className={`w-full ${inputClass}`}
                            />
                            <input
                                type="text"
                                required
                                placeholder="Lokasi (Indoor / Outdoor / VIP)"
                                value={tableForm.location}
                                onChange={(e) =>
                                    setTableForm({
                                        ...tableForm,
                                        location: e.target.value,
                                    })
                                }
                                className={`w-full ${inputClass}`}
                            />
                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
                            >
                                Buat Meja & Generate QR
                            </button>
                        </form>

                        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {tables.map((t) => {
                                const scanUrl = route(
                                    "customer.scan",
                                    t.qr_code,
                                );
                                const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(scanUrl)}`;

                                return (
                                    <div
                                        key={t.id}
                                        className={`p-5 rounded-2xl text-center space-y-3 ${cardClass}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-base font-bold">
                                                Meja #{t.table_number}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                                                {t.location}
                                            </span>
                                        </div>

                                        {/* Gambar Visual QR Code Siap Scan / Cetak */}
                                        <div className="p-3 bg-white rounded-xl inline-block mx-auto shadow-inner">
                                            <img
                                                src={qrImageUrl}
                                                alt={`QR Meja ${t.table_number}`}
                                                className="w-36 h-36 mx-auto"
                                            />
                                        </div>

                                        <p className="text-[11px] font-mono opacity-70">
                                            {t.qr_code}
                                        </p>

                                        <div className="grid grid-cols-2 gap-2">
                                            <a
                                                href={scanUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
                                            >
                                                Buka Order ↗
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedQrTable({
                                                        ...t,
                                                        qrImageUrl,
                                                        scanUrl,
                                                    })
                                                }
                                                className="py-2 rounded-xl bg-slate-500/20 text-xs font-bold flex items-center justify-center gap-1"
                                            >
                                                <Printer className="w-3.5 h-3.5" />{" "}
                                                Cetak QR
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ================= TAB 5: KELOLA AKUN KARYAWAN (BARISTA & CASHIER) ================= */}
                {activeTab === "staffs" && (
                    <div className="grid grid-cols-12 gap-6">
                        <form
                            onSubmit={handleStaffSubmit}
                            className={`col-span-12 lg:col-span-4 p-6 rounded-2xl space-y-4 h-fit ${cardClass}`}
                        >
                            <h2 className="font-bold text-base text-emerald-500">
                                + Tambah Akun Karyawan
                            </h2>
                            <input
                                type="text"
                                required
                                placeholder="Nama Lengkap Karyawan"
                                value={staffForm.name}
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        name: e.target.value,
                                    })
                                }
                                className={`w-full ${inputClass}`}
                            />
                            <input
                                type="email"
                                required
                                placeholder="Email Login (Misal: barista2@technog.id)"
                                value={staffForm.email}
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        email: e.target.value,
                                    })
                                }
                                className={`w-full ${inputClass}`}
                            />
                            <input
                                type="text"
                                placeholder="Nomor WhatsApp"
                                value={staffForm.phone}
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        phone: e.target.value,
                                    })
                                }
                                className={`w-full ${inputClass}`}
                            />
                            <select
                                value={staffForm.role}
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        role: e.target.value,
                                    })
                                }
                                className={`w-full ${inputClass}`}
                            >
                                <option value="barista">
                                    Role: Barista (Dapur & Stok)
                                </option>
                                <option value="cashier">
                                    Role: Cashier (Kasir & Validasi)
                                </option>
                                <option value="owner">
                                    Role: Co-Owner (Super Admin)
                                </option>
                            </select>
                            <input
                                type="password"
                                required
                                placeholder="Password Minimal 6 Karakter"
                                value={staffForm.password}
                                onChange={(e) =>
                                    setStaffForm({
                                        ...staffForm,
                                        password: e.target.value,
                                    })
                                }
                                className={`w-full ${inputClass}`}
                            />
                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
                            >
                                Buat Akun Staf
                            </button>
                        </form>

                        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
                            {staffs.map((st) => (
                                <div
                                    key={st.id}
                                    className={`p-5 rounded-2xl flex justify-between items-center ${cardClass}`}
                                >
                                    <div>
                                        <h3 className="font-bold text-base">
                                            {st.name}
                                        </h3>
                                        <p className="text-xs opacity-70">
                                            {st.email} • {st.phone || "-"}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">
                                        {st.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Cetak Stiker QR Code Meja */}
            {selectedQrTable && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white text-slate-950 p-8 rounded-3xl max-w-sm w-full text-center space-y-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                            {auth.cafe?.name}
                        </p>
                        <h3 className="text-3xl font-extrabold">
                            MEJA #{selectedQrTable.table_number}
                        </h3>
                        <img
                            src={selectedQrTable.qrImageUrl}
                            alt="QR Code"
                            className="w-56 h-56 mx-auto border p-2 rounded-2xl"
                        />
                        <p className="text-xs text-slate-600">
                            Scan QR Code ini untuk memesan langsung dari meja
                            Anda & membuka akses{" "}
                            <strong>AI Chatbot Co-Worker</strong>.
                        </p>
                        <div className="flex gap-2 pt-2 print:hidden">
                            <button
                                onClick={() => window.print()}
                                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                            >
                                🖨️ Print Stiker Meja
                            </button>
                            <button
                                onClick={() => setSelectedQrTable(null)}
                                className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs"
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
