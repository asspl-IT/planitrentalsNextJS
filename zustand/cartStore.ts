"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import moment from "moment";

export const cartStore = create(
  persist(
    (set, get) => ({
      selectDate: get()?.selectDate || moment().startOf("day").valueOf(),
      days: get()?.days || 1,
      incomingLocation: "",
      orderData: {},
      reservationDay: "",
      returnDate: "",
      holiday: null,

      setReservationDay: (date) => set({ reservationDay: date }),

      setReturnDate: (startEpoch, duration) => {
        const holiday = get().checkHolidays(startEpoch);
        if (holiday) {
          const dropOffEpoch = moment(holiday.Drop_Off_Date__c)
            .startOf("day")
            .valueOf();
          set({ returnDate: dropOffEpoch });
        } else {
          let returnDate = moment(startEpoch);
          let daysCounted = 0;
          while (daysCounted < duration) {
            returnDate.add(1, "days");
            if (returnDate.day() !== 0) {
              daysCounted++;
            }
          }
          set({ returnDate: returnDate.valueOf() });
        }
      },

      setSelectDate: (epoch) => {
        const currentDays = get().days;
        const holidayList = get().holidayList || [];
        let selectedHoliday = get().checkHolidays(epoch);

        const endOfRange = moment(epoch).add(currentDays - 1, "days").valueOf();
        const overlappingHoliday = holidayList.find((hd) => {
          const holidayStart = moment(hd.Start_Date__c).startOf("day").valueOf();
          const holidayEnd = moment(hd.End_Date__c).endOf("day").valueOf();
          return (
            (epoch >= holidayStart && epoch <= holidayEnd) ||
            (endOfRange >= holidayStart && endOfRange <= holidayEnd) ||
            (epoch < holidayStart && endOfRange > holidayEnd)
          );
        });

        if (overlappingHoliday) {
          const startEpoch = moment(overlappingHoliday.Start_Date__c)
            .startOf("day")
            .valueOf();
          const holidayDays = overlappingHoliday.Days__c;
          set({
            selectDate: startEpoch,
            holiday: overlappingHoliday,
            days: holidayDays,
          });
          get().setReturnDate(startEpoch, holidayDays);
        } else {
          set({
            selectDate: epoch,
            holiday: selectedHoliday || null,
            days: selectedHoliday ? 1 : currentDays,
          });
        }
      },

      setDays: (days) => {
        if (!get().holiday) {
          set({ days });
          const startEpoch = get().selectDate;
          const holidayList = get().holidayList || [];
          const endOfRange = moment(startEpoch).add(days - 1, "days").valueOf();
          const overlappingHoliday = holidayList.find((hd) => {
            const holidayStart = moment(hd.Start_Date__c).startOf("day").valueOf();
            const holidayEnd = moment(hd.End_Date__c).endOf("day").valueOf();
            return (
              (startEpoch >= holidayStart && startEpoch <= holidayEnd) ||
              (endOfRange >= holidayStart && endOfRange <= holidayEnd) ||
              (startEpoch < holidayStart && endOfRange > holidayEnd)
            );
          });

          if (overlappingHoliday) {
            const startEpoch = moment(overlappingHoliday.Start_Date__c)
              .startOf("day")
              .valueOf();
            const holidayDays =
              moment(overlappingHoliday.End_Date__c).diff(
                moment(overlappingHoliday.Start_Date__c),
                "days"
              ) + 1;
            set({
              selectDate: startEpoch,
              holiday: overlappingHoliday,
              days: holidayDays,
            });
            get().setReturnDate(startEpoch, holidayDays);
          }
        }
      },

      setIncomingLocation: (location) => set({ incomingLocation: location }),

      paymentOption: "deposit",
      setPaymentOption: (paymentOption) => set({ paymentOption }),

      pickupTime: "",
      setPickupTime: (pickupTime) => set({ pickupTime }),

      orderData: {},
      setOrderData: (orderData) => set({ orderData }),

      orderId: null,
      setOrderName: (orderName) => set({ orderName }),
      setOrderErrorMessage: (message) => set({ message }),

      salesTax: 0,
      setSalesTax: (salesTax) => set({ salesTax }),

      discountList: [],
      setDiscountList: (discountList) => set({ discountList }),

      totalWithTax: 0,
      totalAmount: 0,
      salesTaxAmount: 0,
      totalItems: 0,
      subtotal: 0,

      discountAmount: 0,
      setDiscountAmount: (discountAmount) => set({ discountAmount }),

      discountCode: "",
      setDiscountCode: (discountCode) => set({ discountCode }),

      holidayList: [],
      setHolidayList: (holidayList) => {
        set({ holidayList });
        const currentDate = get().selectDate;
        if (currentDate) {
          const isHoliday = get().checkHolidays(currentDate);
          if (isHoliday) {
            set({ holiday: isHoliday, days: 1 });
          } else if (get().holiday) {
            set({ holiday: null });
          }
        }
      },

      checkHolidays: (epoch) => {
        const holidayList = get().holidayList || [];
        return holidayList.find((hd) => {
          const startEpoch = moment(hd.Start_Date__c).startOf("day").valueOf();
          const endEpoch = moment(hd.End_Date__c).endOf("day").valueOf();
          return epoch >= startEpoch && epoch <= endEpoch;
        });
      },

      generateDateRange: (startEpoch, numOfDays) => {
        const dateRange = [];
        const holiday = get().checkHolidays(startEpoch);
        if (holiday) {
          let currentMoment = moment(holiday.Start_Date__c).startOf("day");
          const endMoment = moment(holiday.End_Date__c).endOf("day");
          let daysCounted = 0;
          while (daysCounted < holiday.Days__c && currentMoment <= endMoment) {
            const epoch = currentMoment.valueOf();
            dateRange.push({
              text: currentMoment.toISOString().split("T")[0],
              dte: epoch,
              dayOfWeek: currentMoment.day(),
              dayOfWeekText: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                currentMoment.day()
              ],
              isHoliday: true,
              multiplier: holiday.Multiplier__c / 100,
              rateType: holiday.Rate_Type__c,
            });
            currentMoment.add(1, "days");
            daysCounted++;
          }
        } else {
          let currentMoment = moment(startEpoch).startOf("day");
          if (currentMoment.day() === 0) currentMoment.subtract(1, "days");
          let daysCounted = 0;
          while (daysCounted < numOfDays) {
            const dateMoment = currentMoment.clone();
            if (dateMoment.day() !== 0) {
              const epoch = dateMoment.valueOf();
              dateRange.push({
                text: dateMoment.toISOString().split("T")[0],
                dte: epoch,
                dayOfWeek: dateMoment.day(),
                dayOfWeekText: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                  dateMoment.day()
                ],
                isHoliday: false,
                multiplier: 1,
                rateType: null,
              });
              daysCounted++;
            }
            currentMoment.add(1, "days");
          }
        }
        return dateRange;
      },

      calculateTotalAmount: (items) =>
        set((state) => {
          let itemTotal = items.reduce(
            (total, item) => total + (item.amount || 0),
            0
          );
          let addonTotal = items.reduce(
            (total, item) =>
              total +
              (item.addons?.reduce(
                (sum, addon) => sum + addon.amount * addon.quantity,
                0
              ) || 0),
            0
          );
          let subtotal = itemTotal + addonTotal;
          let orderTotal = subtotal;
          let discountCodeAmount = state.discountAmount || 0;
          let salesTaxAmount = 0;

          if (discountCodeAmount > 0) {
            orderTotal -= discountCodeAmount;
          }
          if (state.salesTax > 0) {
            salesTaxAmount = orderTotal * (state.salesTax / 100);
            salesTaxAmount = Math.round(salesTaxAmount * 100) / 100;
            orderTotal += salesTaxAmount;
          }
          orderTotal = Math.round(orderTotal * 100) / 100;

          return {
            subtotal,
            salesTaxAmount,
            totalWithTax: orderTotal,
            totalAmount: orderTotal,
            totalItems: items.reduce((total, item) => total + item.quantity, 0),
          };
        }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
