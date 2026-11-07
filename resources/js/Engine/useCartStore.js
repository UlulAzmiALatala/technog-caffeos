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
            appliedVoucher: null, // Menyimpan objek voucher yang dipilih

            setCustomerName: (name) => set({ customerName: name }),
            setCustomerPhone: (phone) => set({ customerPhone: phone }),
            setTableId: (id) => set({ tableId: id }),
            setOrderType: (type) => set({ orderType: type }),
            setPaymentMethod: (method) => set({ paymentMethod: method }),
            setAppliedVoucher: (voucher) => set({ appliedVoucher: voucher }),

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

            clearCart: () =>
                set({
                    cart: [],
                    customerName: "",
                    customerPhone: "",
                    tableId: "",
                    appliedVoucher: null,
                }),
        }),
        {
            name: "caffeos-cart-storage",
        },
    ),
);
