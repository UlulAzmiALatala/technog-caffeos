import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
    persist(
        (set, get) => ({
            cart: [],
            customerName: "",
            customerPhone: "",
            tableId: "",
            orderType: "dine_in",
            paymentMethod: "qris",
            appliedVoucher: null,
            cashReceived: "",
            selectedCategory: "ALL",
            searchQuery: "",

            setCustomerName: (name) => set({ customerName: name }),
            setCustomerPhone: (phone) => set({ customerPhone: phone }),
            setTableId: (id) => set({ tableId: id }),
            setOrderType: (type) => set({ orderType: type }),
            setPaymentMethod: (method) => set({ paymentMethod: method }),
            setAppliedVoucher: (voucher) => set({ appliedVoucher: voucher }),
            setCashReceived: (amount) => set({ cashReceived: amount }),
            setSelectedCategory: (cat) => set({ selectedCategory: cat }),
            setSearchQuery: (q) => set({ searchQuery: q }),

            addToCart: (menu) => {
                const currentCart = get().cart;
                const existing = currentCart.find(
                    (item) => item.menu_id === menu.id,
                );

                if (existing) {
                    set({
                        cart: currentCart.map((item) =>
                            item.menu_id === menu.id
                                ? { ...item, qty: item.qty + 1 }
                                : item,
                        ),
                    });
                } else {
                    set({
                        cart: [
                            ...currentCart,
                            {
                                menu_id: menu.id,
                                name: menu.name,
                                price: parseFloat(menu.price),
                                qty: 1,
                                notes: "",
                            },
                        ],
                    });
                }
            },

            updateQty: (menuId, delta) => {
                const updated = get()
                    .cart.map((item) =>
                        item.menu_id === menuId
                            ? { ...item, qty: item.qty + delta }
                            : item,
                    )
                    .filter((item) => item.qty > 0);
                set({ cart: updated });
            },

            updateItemNotes: (menuId, notes) => {
                set({
                    cart: get().cart.map((item) =>
                        item.menu_id === menuId ? { ...item, notes } : item,
                    ),
                });
            },

            getSubtotal: () => {
                return get().cart.reduce(
                    (sum, item) => sum + item.price * item.qty,
                    0,
                );
            },

            getDiscountAmount: () => {
                const subtotal = get().getSubtotal();
                const voucher = get().appliedVoucher;
                if (
                    !voucher ||
                    subtotal < Number(voucher.min_order_amount || 0)
                ) {
                    return 0;
                }
                if (voucher.discount_type === "percent") {
                    return Math.round(
                        (subtotal * Number(voucher.discount_value)) / 100,
                    );
                }
                return Math.min(subtotal, Number(voucher.discount_value));
            },

            getTotal: () => {
                const subtotal = get().getSubtotal();
                const discount = get().getDiscountAmount();
                return Math.max(0, subtotal - discount);
            },

            getChangeAmount: () => {
                const total = get().getTotal();
                const received = Number(get().cashReceived || 0);
                if (get().paymentMethod !== "cash" || received <= total) {
                    return 0;
                }
                return received - total;
            },

            clearCart: () =>
                set({
                    cart: [],
                    customerName: "",
                    customerPhone: "",
                    tableId: "",
                    appliedVoucher: null,
                    cashReceived: "",
                }),
        }),
        {
            name: "caffeos-cart-storage",
        },
    ),
);
