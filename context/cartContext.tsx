"use client";

import React, {
  createContext,
  useReducer,
  useEffect,
  useContext,
  useRef,
} from "react";
import { cartStore } from "../zustand/cartStore";

const CartContext = createContext();
const initialState = { items: [], isSyncing: false };

// ---------------- Reducer ---------------- //
function cartReducer(state, action) {
  const { generateDateRange, selectDate, days } = cartStore.getState();

  const recalc = (item) => {
    const { selectDate, days, generateDateRange, holiday } =
      cartStore.getState();
    const dateRange = generateDateRange(selectDate, days);
    let amount = 0;
    let baseAmount = 0;
    const effectiveDays = holiday ? Math.min(days, holiday.Days__c) : days;

    dateRange.slice(0, effectiveDays).forEach((date) => {
      if (date.dayOfWeek === 0) return;
      let price =
        [5, 6].includes(date.dayOfWeek) && !date.isHoliday
          ? item.originalWeekendPrice
          : item.originalWeekdayPrice;

      amount += item.quantity * price * (date.multiplier || 1);
      baseAmount += item.quantity * price * (date.multiplier || 1);
    });

    return {
      ...item,
      amount,
      baseAmount,
      price: amount / item.quantity,
    };
  };

  const checkDiscount = (items) => {
    if (items.length <= 1)
      return items.map((i) => ({ ...i, discountProcessed: false }));
    const total = items.reduce((t, i) => t + i.amount, 0);
    const days = cartStore.getState().days;
    const multiplier =
      cartStore.getState().generateDateRange(selectDate, days)[0]?.multiplier ||
      1;
    const threshold = 100 * multiplier;
    let discountApplied = false;

    if (total / days >= threshold) {
      return items.map((item) => {
        if (item.Discount_Eligible__c && !discountApplied) {
          const discount = (days * (item.originalWeekendPrice * multiplier)) / 2;
          const net = item.baseAmount - discount;
          discountApplied = true;
          return {
            ...item,
            amount: net,
            price: net / item.quantity,
            discountProcessed: true,
          };
        }
        return { ...item, discountProcessed: false };
      });
    }
    return items.map((i) => ({ ...i, discountProcessed: false }));
  };

  switch (action.type) {
    case "LOAD_CART":
      const loaded = action.payload.items.map(recalc);
      return { ...state, items: checkDiscount(loaded) };
    case "ADD_TO_CART": {
      const newItem = action.payload;
      const existing = state.items.find((i) => i.id === newItem.id);
      const maxQty = newItem.maxQuantity || 0;

      if (existing) {
        const updated = state.items.map((i) =>
          i.id === newItem.id
            ? {
                ...i,
                quantity: Math.min(i.quantity + newItem.quantity, maxQty),
                addons: [
                  ...i.addons,
                  ...newItem.addons.filter(
                    (a) => !i.addons.some((x) => x.id === a.id)
                  ),
                ],
              }
            : i
        );
        return { ...state, items: checkDiscount(updated.map(recalc)) };
      }
      const updated = checkDiscount(
        [...state.items, { ...newItem, maxQuantity: maxQty }].map(recalc)
      );
      return { ...state, items: updated };
    }
    case "REMOVE_FROM_CART": {
      const filtered = state.items.filter((i) => i.id !== action.payload.id);
      const updated = checkDiscount(filtered.map(recalc));
      sessionStorage.setItem("cart", JSON.stringify({ items: updated }));
      return { ...state, items: updated };
    }
    case "CLEAR_CART":
      sessionStorage.removeItem("cart");
      return initialState;
    default:
      return state;
  }
}

// ---------------- Provider ---------------- //
const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { calculateTotalAmount } = cartStore();
  const prevLocationRef = useRef(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("cart");
    if (stored) dispatch({ type: "LOAD_CART", payload: JSON.parse(stored) });
  }, []);

  useEffect(() => {
    if (state.items.length > 0) {
      sessionStorage.setItem("cart", JSON.stringify(state));
    }
    calculateTotalAmount(state.items);
  }, [state.items, calculateTotalAmount]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export { CartProvider };
