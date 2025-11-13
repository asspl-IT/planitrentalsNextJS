"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCart } from "../../context/cartContext";
import { CartService } from "../../services/CartService";
import OrderService from "../../services/OrderService";
import moment from "moment";
import Link from "next/link";
import { FaGreaterThan } from "react-icons/fa6";
import { cartStore } from "../../zustand/cartStore";
import { useRouter, usePathname } from "next/navigation";
import { FaSpinner } from "react-icons/fa6";
import Swal from "sweetalert2";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";

const OrderConfirmation = () => {
  const { state, dispatch } = useCart();
  const {
    selectDate,
    days,
    paymentOption,
    orderData,
    incomingLocation,
    returnDate,
    calculateTotalAmount,
    setDiscountList,
    setSalesTax,
    totalAmount,
    setReturnDate,
  } = cartStore();

  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const reservationDay = selectDate || moment().valueOf();

  useEffect(() => {
    setReturnDate(reservationDay, days);
  }, [reservationDay, days, setReturnDate]);

  // Fetch discount and sales tax data
  useEffect(() => {
    const fetchDiscountAndPickupData = async () => {
      try {
        if (!incomingLocation) {
          console.warn("No incomingLocation set, skipping fetch.");
          return;
        }
        const formattedDate = moment(reservationDay).format("YYYY-MM-DD");
        const dayOfWeek = moment(reservationDay).format("ddd");

        const data = await CartService.getLocationData(
          incomingLocation,
          dayOfWeek,
          formattedDate
        );

        setDiscountList(data.discountList || []);
        setSalesTax(data.accountDetails?.Sales_Tax__c || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDiscountAndPickupData();
  }, [incomingLocation, reservationDay, setDiscountList, setSalesTax]);

  useEffect(() => {
    calculateTotalAmount(state.items);
  }, [state.items, calculateTotalAmount]);

  const handlePayment = async () => {
    if (!state.items.length) {
      Swal.fire({
        icon: "warning",
        title: "Empty Cart",
        text: "Your cart is empty!",
        confirmButtonText: "OK",
      });
      return;
    }

    setLoading(true);

    try {
      const result =
        await OrderService.processShoppingCartVerifyAvailability(orderData);

      if (!result?.success) {
        Swal.fire({
          icon: "error",
          title: "Payment Failed",
          text:
            result?.message ||
            "Verification failed. Please check your order details or contact support.",
          confirmButtonText: "Try Again",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Order Placed!",
          text: "Redirecting to Thank You page...",
          timer: 3000,
          showConfirmButton: false,
          willClose: () => {
            dispatch({ type: "CLEAR_CART" });
            router.push("/thankyou");
          },
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text:
          error.message ||
          "An unexpected error occurred. Please try again or contact support.",
        confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate payment amounts
  const { balanceDue, payingNow } = useMemo(() => {
    const payingNow = paymentOption === "deposit" ? 25 : totalAmount;
    const balanceDue = totalAmount - payingNow;
    return { balanceDue, payingNow };
  }, [paymentOption, totalAmount]);

  // Extract dates
  const startDate =
    orderData?.shoppingCart?.order?.startDate ||
    moment(reservationDay).format("YYYY-MM-DD");

  const returnDateStr =
    orderData?.shoppingCart?.order?.returnDate ||
    moment(returnDate).format("YYYY-MM-DD");

  const pickupTimeMs = orderData?.shoppingCart?.order?.pickUpTime || 0;

  const formatUTCTime = (milliseconds: number) => {
    if (!milliseconds && milliseconds !== 0) return "Not Selected";
    try {
      const time = moment.duration(milliseconds).asHours();
      const hours = Math.floor(time);
      const minutes = Math.round((time - hours) * 60);
      const hourNum = hours % 12 || 12;
      const ampm = hours >= 12 ? "PM" : "AM";
      return `${hourNum}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`;
    } catch {
      return "Invalid Time";
    }
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  return (
    <div className="min-h-screen pirBlue--text">
      <div className="page-header md:mt-[100px] breadcrumb-wrap mb-4">
        <div className="flex gap-2 text-sm font-semibold">
          <Link href="/" className="pirGreen--text">
            Home-+
          </Link>
          <FaGreaterThan className="mt-1" />
          <span className="text-blue-900">Order Confirmation</span>
        </div>
      </div>

      <h2 className="text-3xl font-semibold text-center p-3 text-red-600">
        You're Almost Done!
      </h2>
      <h4 className="text-xl font-semibold text-center p-2 text-red-600">
        Click "Process Payment" To Finalize
      </h4>

      <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-2 gap-8">
        {/* LEFT SIDE */}
        <div>
          {[ 
            { label: "Paying Now", value: `$${payingNow.toFixed(2)}` },
            { label: "Order Total", value: `$${totalAmount.toFixed(2)}` },
            { label: "Balance Due At Pickup", value: `$${balanceDue.toFixed(2)}` },
            { label: "Reservation Date", value: moment(startDate).format("MM-DD-YYYY") },
            { label: "Pickup Time", value: formatUTCTime(pickupTimeMs) },
            {
              label: "Due Back",
              value: `${moment(returnDateStr).format("MM-DD-YYYY")} before 9:00 AM`,
            },
          ].map(({ label, value }) => (
            <p key={label} className="pb-2 text-lg">
              <strong className="text-xl">{label}: </strong> {value}
            </p>
          ))}

          <p className="font-semibold pirBlue--text text-justify">
            Please make sure you get a receipt and confirmation email...
          </p>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePayment}
              className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin text-[20px] text-white" />
              ) : (
                "Process Payment"
              )}
            </button>

            <Link href="/">
              <button className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">
                Return to Shopping
              </button>
            </Link>
          </div>

          {loading && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
              <FaSpinner className="animate-spin text-[70px] text-white" />
            </div>
          )}
        </div>

        {/* RIGHT SIDE - ORDER SUMMARY */}
        <div className="p-4 rounded-lg border border-green-200 hover:shadow-lg h-auto">
          <h3 className="text-3xl font-semibold mb-3 border-b-2 border-gray-300 pb-2 pirGreen--text">
            Order Summary
          </h3>

          <div className="space-y-4">
            {state.items.map((item, index) => {
              const activeAddons =
                item.addons?.filter((a) => a.quantity > 0) || [];

              const hasManyAddons = activeAddons.length > 1;
              const isExpanded = expandedItems[item.id] || !hasManyAddons;

              const unitPrice = item.amount / item.quantity;

              return (
                <div key={index} className="border-b pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <img
                      src={item.Images__URL || "https://via.placeholder.com/150"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />

                    <div className="flex-1">
                      <h4 className="font-semibold text-lg pirBlue--text">
                        {item.name}
                      </h4>

                      <div className="flex justify-between mt-1">
                        <span>Qty: {item.quantity}</span>
                        <span className="font-bold">
                          ${(unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Addons */}
                  {activeAddons.length > 0 && (
                    <div className="ml-4 mt-2">
                      <div
                        className="flex justify-between cursor-pointer bg-gray-50 px-2 py-1 rounded-t-md relative"
                        onClick={() => toggleExpand(item.id)}
                      >
                        <span className="text-sm font-semibold">Add-ons ({activeAddons.length})</span>

                        <span className="text-lg">
                          {expandedItems[item.id] ? (
                            <IoMdArrowDropup />
                          ) : (
                            <IoMdArrowDropdown />
                          )}
                        </span>

                        <div
                          className={`absolute bottom-0 left-0 h-1 bg-green-600 transition-all duration-300 ${
                            expandedItems[item.id] ? "w-full" : "w-1/4"
                          }`}
                        />
                      </div>

                      {expandedItems[item.id] && (
                        <div className="bg-gray-50 rounded-b-md p-2 space-y-1">
                          {activeAddons.map((addon, aIndex) => (
                            <div
                              key={aIndex}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {addon.description} (x{addon.quantity})
                              </span>
                              <span className="font-semibold">
                                ${(addon.amount * addon.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex justify-between py-1 text-lg font-bold mt-2">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
