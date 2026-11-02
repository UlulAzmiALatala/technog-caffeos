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

            setCustomerName: (name) => set({ customerName: name }),
            setCustomerPhone: (phone) => set({ customerPhone: phone }),
            setTableId: (id) => set({ tableId: id }),
            setOrderType: (type) => set({ orderType: type }),
            setPaymentMethod: (method) => set({ paymentMethod: method }),

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

            getTotal: () => {
                return get().cart.reduce(
                    (sum, item) => sum + item.price * item.qty,
                    0,
                );
            },

            clearCart: () =>
                set({
                    cart: [],
                    customerName: "",
                    customerPhone: "",
                    tableId: "",
                }),
        }),
        {
            name: "caffeos-cart-storage", // Tersimpan otomatis di LocalStorage browser
        },
    ),
);
