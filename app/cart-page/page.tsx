"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cartStore } from "@/zustand/cartStore";
import { locationLoader } from "@/config/locationLoader";
import moment from "moment";
import { FaGreaterThan, FaCircleQuestion } from "react-icons/fa6";
import { IoIosInformationCircle } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";
import { MdArrowDropUp } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Link from "next/link";
import { CartService } from "../../services/CartService";

const CartPage = () => {
  const router = useRouter();

  /* ----- Zustand ---------------------------------------------------------------- */
  const {
    state,
    dispatch,
    paymentOption,
    setPaymentOption,
    pickupTime,
    setPickupTime,
    setOrderData,
    calculateTotalAmount,
    totalWithTax,
    totalAmount,
    salesTaxAmount,
    discountList,
    setDiscountList,
    salesTax,
    setSalesTax,
    subtotal,
    discountAmount,
    setDiscountAmount,
    discountCode,
    setDiscountCode,
    selectDate,
    setSelectDate,
    days,
    setDays,
    setHolidayList,
    generateDateRange,
    holiday,
    checkHolidays,
    setReturnDate,
    setIncomingLocation,
    returnDate,
    holidayList,
  } = cartStore();

  /* ----- Local UI state ---------------------------------------------------------- */
  const [showTooltip, setShowTooltip] = useState(false);
  const [popup, setPopup] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availabilityErrors, setAvailabilityErrors] = useState<Record<string, string>>({});
  const [pickupTimeAvailability, setPickupTimeAvailability] = useState<Record<string, any>>({});
  const [pickupTimes, setPickupTimes] = useState<string[]>([]);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", zip: "",
    creditCard: "", expiration: "", cvv: "", ccZip: ""
  });
  const [isOpen, setIsOpen] = useState(true);
  const [discountMessage, setDiscountMessage] = useState("");

  /* ----- Location ---------------------------------------------------------------- */
  const { LOCATION } = locationLoader();
  const incomingLocation = LOCATION.UT_LOCATION_ID;

  useEffect(() => {
    setIncomingLocation(incomingLocation);
  }, [incomingLocation, setIncomingLocation]);

  /* ----- localStorage (client-only) --------------------------------------------- */
  const [initialReservationDay, setInitialReservationDay] = useState<number | null>(null);
  const [initialDuration, setInitialDuration] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const resDay = parseInt(localStorage.getItem("selectedDate") ?? "", 10) || Date.now();
      setInitialReservationDay(resDay);
      const dur = parseInt(localStorage.getItem("duration") ?? "", 10) || 1;
      setInitialDuration(dur);
    }
  }, []);

  useEffect(() => {
    if (initialReservationDay !== null && !selectDate) setSelectDate(initialReservationDay);
    if (initialDuration !== null && !days) setDays(initialDuration);
  }, [initialReservationDay, initialDuration, selectDate, days, setSelectDate, setDays]);

  useEffect(() => {
    if (selectDate && holidayList !== undefined) setReturnDate(selectDate, days);
  }, [selectDate, days, holidayList, setReturnDate]);

  /* ----- Date helpers ----------------------------------------------------------- */
  const reservationDay = selectDate;
  const dayIndex = new Date(reservationDay ?? 0).getDay();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeek = daysOfWeek[dayIndex];

  /* ----- Fetch pickup times / discounts ------------------------------------------ */
  const fetchDiscountAndPickupData = async () => {
    try {
      setLoading(true);
      if (!incomingLocation) {
        setFormErrors(prev => ({ ...prev, pickupTime: "Location not set. Please try again." }));
        return;
      }

      const formattedDate = moment(reservationDay).format("YYYY-MM-DD");
      const data = await CartService.getlocationData(incomingLocation, dayOfWeek, formattedDate);

      const times = data.pickUpTimes || [];
      setPickupTimes(times);
      const availability: Record<string, any> = {};
      times.forEach((t: string) => (availability[t] = { available: true, bookings: 0 }));
      setPickupTimeAvailability(availability);

      if (times.length > 0 && !times.includes(pickupTime ?? "")) {
        setPickupTime(times[0]);
        setFormErrors(prev => ({
          ...prev,
          pickupTime: "Previous pickup time unavailable. Default time selected."
        }));
      } else if (times.length === 0) {
        setPickupTime("");
        setFormErrors(prev => ({ ...prev, pickupTime: "No pickup times available for this date." }));
      }

      setDiscountList(data.discountList || []);
      setHolidayList(data.holidayList || []);
      setSalesTax(data.accountDetails?.Sales_Tax__c || 0);
      if (typeof window !== "undefined") {
        localStorage.setItem("salesTax", data.accountDetails?.Sales_Tax__c?.toString() ?? "0");
      }
    } catch (err) {
      console.error(err);
      setFormErrors(prev => ({ ...prev, pickupTime: "Failed to fetch pickup times." }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscountAndPickupData();
  }, [incomingLocation, reservationDay, dayOfWeek]);

  /* ----- Date picker logic ------------------------------------------------------- */
  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    const epoch = date.getTime();
    const selectedDay = moment(epoch).day();
    const isHoliday = checkHolidays(epoch);

    if (isHoliday) {
      const startEpoch = moment(isHoliday.Start_Date__c).valueOf();
      setPopupMessage(isHoliday.Text__c ?? "");
      setShowPopup(true);
      setSelectDate(startEpoch);
      setDays(1);
    } else if (selectedDay === 0) {
      const prevSat = moment(epoch).subtract(1, "days").valueOf();
      setPopupMessage(
        "Good news! You selected a Sunday. Plan-it Rentals is closed on Sunday, which means this is a free rental day for you! You will need to pick up your item(s) on Saturday morning, and your item(s) will be due back Monday morning before 9:00 AM. Your reservation date will now be set to Saturday."
      );
      setShowPopup(true);
      setSelectDate(prevSat);
      setDays(1);
    } else if (selectedDay === 6) {
      setPopupMessage(
        "You have selected a Saturday rental. Saturday rentals are due Monday by 9 AM, and Sunday is a free rental day because we are closed on Sunday!"
      );
      setShowPopup(true);
      setSelectDate(epoch);
      setDays(1);
    } else {
      setSelectDate(epoch);
      if (holiday) setDays(1);
    }
  };

  const dayClassName = (date: Date) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const epoch = date.getTime();
    if (epoch < today) return "previous-date";
    if (selectDate && epoch === selectDate) return "selected-date";
    return "";
  };

  /* ----- Cart actions ------------------------------------------------------------ */
  const handleRemoveFromCart = (id: string) => {
    const currentSalesTax = cartStore.getState().salesTax;
    removeDiscount(true);
    dispatch({ type: "REMOVE_FROM_CART", payload: { id } });
    setSalesTax(currentSalesTax);
  };

  // **FIX**: guard against `state` or `state.items` being undefined
  useEffect(() => {
    if (state?.items) {
      calculateTotalAmount(state.items);
    }
  }, [selectDate, days, state?.items, discountAmount, calculateTotalAmount]);

  const handleAddonQuantityChange = (itemId: string, addonId: string, qty: number) => {
    dispatch({ type: "UPDATE_ADDON_QUANTITY", payload: { itemId, addonId, quantity: qty } });
  };

  /* ----- Form handling ----------------------------------------------------------- */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: "" }));

    if (name === "expiration") {
      // same formatting logic as before …
      let cleaned = value.replace(/[^0-9/]/g, "");
      if (cleaned.length < personalInfo.expiration.length && cleaned.includes("/")) {
        cleaned = cleaned.split("/")[0];
      } else {
        if (cleaned.length <= 2 && !cleaned.includes("/")) cleaned = cleaned.slice(0, 2);
        if (cleaned.length === 2 && !cleaned.includes("/")) cleaned += "/";
        if (cleaned.includes("/")) {
          const [m, y] = cleaned.split("/");
          cleaned = `${m.slice(0, 2)}/${y ? y.slice(0, 4) : ""}`;
        }
      }
      setPersonalInfo(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setPersonalInfo(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleApplyDiscount = () => {
    const disc = discountList.find(d => d.Code__c === discountCode.trim().toUpperCase());
    if (disc && disc.isActive__c) {
      const val = (subtotal * disc.Percentage__c) / 100;
      setDiscountAmount(val);
      setDiscountMessage("Discount applied successfully!");
    } else {
      setDiscountMessage("Invalid discount code. Please try again.");
    }
  };

  const removeDiscount = (resetText = false) => {
    setDiscountAmount(0);
    if (resetText) setDiscountCode("");
    setDiscountMessage("");
  };

  /* ----- Misc helpers ------------------------------------------------------------ */
  const calculateReturnDate = (startEpoch: number, duration: number) => {
    let ret = moment(startEpoch);
    let counted = 0;
    while (counted < duration) {
      ret.add(1, "days");
      if (ret.day() !== 0) counted++;
    }
    if (ret.day() === 0) ret.add(1, "days");
    return ret.valueOf();
  };

  const formatUTCTime = (utc: string) => {
    if (!utc) return "Not Selected";
    const [h, m] = utc.split(":");
    let hr = parseInt(h, 10);
    const ampm = hr >= 12 ? "PM" : "AM";
    hr = hr % 12 || 12;
    const display = `${hr}:${m} ${ampm}`;
    const avail = pickupTimeAvailability[utc] ?? { available: true };
    return avail.available ? display : `${display} (Fully Booked)`;
  };

  /* ----- Validation -------------------------------------------------------------- */
  const validatePickupTime = async () => {
    if (!pickupTime) {
      setFormErrors(prev => ({ ...prev, pickupTime: "Pickup time is required" }));
      return false;
    }
    try {
      const formatted = moment(reservationDay).format("YYYY-MM-DD");
      const data = await CartService.getlocationData(incomingLocation, dayOfWeek, formatted);
      const times = data.pickUpTimes || [];
      const avail: Record<string, any> = {};
      times.forEach((t: string) => (avail[t] = { available: true, bookings: 0 }));
      setPickupTimeAvailability(avail);
      setPickupTimes(times);

      if (!times.includes(pickupTime)) {
        setFormErrors(prev => ({ ...prev, pickupTime: "Selected pickup time is no longer available" }));
        setPickupTime(times[0] ?? "");
        return false;
      }
      return true;
    } catch {
      setFormErrors(prev => ({ ...prev, pickupTime: "Error validating pickup time." }));
      return false;
    }
  };

  const validateForm = () => {
    const err: Record<string, string> = {};
    let ok = true;

    if (!personalInfo.firstName.trim()) { err.firstName = "First Name is required"; ok = false; }
    if (!personalInfo.lastName.trim()) { err.lastName = "Last Name is required"; ok = false; }
    if (!personalInfo.email.trim()) { err.email = "Email is required"; ok = false; }
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(personalInfo.email)) { err.email = "Invalid email format (e.g., user@example.com)"; ok = false; }
    if (!personalInfo.phone.trim()) { err.phone = "Phone is required"; ok = false; }
    else if (!/^\d{10}$/.test(personalInfo.phone)) { err.phone = "Must be 10 digits (e.g., 1234567890)"; ok = false; }
    if (!personalInfo.city.trim()) { err.city = "City is required"; ok = false; }
    if (!personalInfo.state.trim()) { err.state = "State is required"; ok = false; }
    if (!personalInfo.address.trim()) { err.address = "Address is required"; ok = false; }
    if (!personalInfo.zip.trim()) { err.zip = "Zip Code is required"; ok = false; }
    if (!personalInfo.creditCard.trim()) { err.creditCard = "Credit Card is required"; ok = false; }
    else if (!/^\d{15,16}$/.test(personalInfo.creditCard)) { err.creditCard = "Must be 15 or 16 digits"; ok = false; }
    if (!personalInfo.expiration.trim()) { err.expiration = "Expiration is required"; ok = false; }
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(personalInfo.expiration)) { err.expiration = "Must be MM/YY (e.g., 12/25)"; ok = false; }
    if (!personalInfo.cvv.trim()) { err.cvv = "CVV is required"; ok = false; }
    else if (!/^\d{3,4}$/.test(personalInfo.cvv)) { err.cvv = "Must be 3 or 4 digits"; ok = false; }
    if (!personalInfo.ccZip.trim()) { err.ccZip = "Zip Code is required"; ok = false; }
    else if (!/^\d{5}$/.test(personalInfo.ccZip)) { err.ccZip = "Must be 5 digits"; ok = false; }

    setFormErrors(err);
    return ok;
  };

  const handleSubmitOrder = () => {
    if (!validateForm()) return;
    validatePickupTime().then(isValid => {
      if (!isValid) return;

      const startDateStr = moment(reservationDay).format("YYYY-MM-DD");
      const isHoliday = checkHolidays(reservationDay);
      let endDateStr = "", returnDateStr = "";

      if (isHoliday) {
        endDateStr = moment(isHoliday.End_Date__c).format("YYYY-MM-DD");
        returnDateStr = moment(returnDate).format("YYYY-MM-DD");
      } else {
        endDateStr = moment(calculateReturnDate(reservationDay ?? 0, days - 1)).format("YYYY-MM-DD");
        returnDateStr = moment(calculateReturnDate(reservationDay ?? 0, days)).format("YYYY-MM-DD");
      }

      const dateRange = generateDateRange(reservationDay ?? 0, days);
      const pickUpMs = pickupTime
        ? moment(pickupTime, "HH:mm").diff(moment().startOf("day"), "milliseconds")
        : 0;

      const orderData = {
        shoppingCart: {
          customer: { ...personalInfo, ccNUm: personalInfo.creditCard, ccExp: personalInfo.expiration, ccCvv: personalInfo.cvv },
          order: {
            startDate: startDateStr,
            endDate: endDateStr,
            returnDate: returnDateStr,
            days,
            paymentType: paymentOption,
            location: incomingLocation,
            salesTaxPercent: salesTax / 100,
            salesTaxAmount: salesTaxAmount,
            discountId: null,
            discountCodeAmount: discountAmount,
            discountCodePercent: discountAmount ? discountAmount / subtotal : 0,
            dateRange,
            isHoliday: !!checkHolidays(reservationDay),
            dayOfWeekText: daysOfWeek[new Date(reservationDay ?? 0).getDay()],
            costTotal: 0,
            itemTotal: subtotal,
            orderTotal: totalAmount,
            deposit: totalAmount > 25 ? 25 : totalAmount,
            pickUpTime: pickUpMs,
          },
          appliedDiscount: {},
          items: (state?.items ?? []).map(item => ({
            costSetups: (item.addons ?? []).map((a: any) => ({
              Id: a.id,
              quantity: a.quantity,
              description: a.description,
              totalCost: a.amount * a.quantity,
            })),
            itemId: item.id,
            containerUnits: item.containerUnits || 0,
            item: {
              Id: item.id,
              Name__c: item.name,
              Container_Units__c: item.containerUnits || 0,
              Weekend_Cost__c: item.originalWeekendPrice,
              Weekday_Cost__c: item.originalWeekdayPrice,
              Discount_Eligible__c: item.Discount_Eligible__c,
              Description__c: item.description || "No description available.",
            },
            qty: item.quantity,
            discountProcessed: item.discountProcessed ?? false,
            amount: item.amount ?? item.price * item.quantity,
            baseAmount: item.baseAmount ?? item.price,
          })),
        },
      };

      setOrderData(orderData);
      router.push("/order-confirmation");
    });
  };

  /* ----- Render helpers ---------------------------------------------------------- */
  const daysOptions = holiday ? [1] : Array.from({ length: 50 }, (_, i) => i + 1);
  const toggleDropdown = () => setIsOpen(prev => !prev);

  const renderInput = (name: string, placeholder: string, type = "text", extra = "") => (
    <div className="relative">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={personalInfo[name as keyof typeof personalInfo]}
        onChange={handleInputChange}
        className={`p-3 w-full border ${formErrors[name] ? "border-red-300" : "border-gray-300"} rounded-lg focus:outline-none hover:border-blue-800 ${extra}`}
      />
      {formErrors[name] && <p className="text-red-500 text-xs mt-1">{formErrors[name]}</p>}
    </div>
  );

  /* -------------------------------------------------------------------------- */
  return (
    <>
      {/* Breadcrumb */}
      <div className="page-header md:mt-[100px] breadcrumb-wrap mb-7">
        <div className="flex flex-wrap gap-2 text-sm font-semibold pirBlue--text mt-2 md:mt-0">
          <Link href="/" className="pirGreen--text">Home</Link>
          <span><FaGreaterThan className="mt-1" /></span>
          <span>Cart</span>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-bold pirBlue--text mb-4">Your Cart</h2>

        {/* Empty cart */}
        {(!state?.items || state.items.length === 0) ? (
          <div className="text-center mt-10">
            <p className="text-lg pirBlue--text font-semibold">Your cart is empty.</p>
            <button onClick={() => router.push("/")} className="mt-4 px-4 py-2 bg-light-green-400 text-white rounded-md text-sm tracking-[0.1em] hover:text-blue-800">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Warnings & Date picker */}
            <p className="font-bold text-sm text-red-600 tracking-[0.1em] mb-4">
              Carefully check all information before checkout
            </p>

            <div className="pb-4 max-w-xl bg-white">
              <h2 className="text-lg md:text-2xl font-bold text-red-600 mt-8">
                Select Your Rental Date:
              </h2>
              <div className="flex flex-row items-center gap-5 mt-4">
                <DatePicker
                  selected={selectDate ? new Date(selectDate) : null}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  dayClassName={dayClassName}
                  dateFormat="EEEE, MMMM d, yyyy"
                  className="pirBlue--text w-[190px] text-base md:text-md md:w-[220px] border-b border-gray-300 px-2"
                  dropdownMode="select"
                  popperPlacement="bottom-start"
                />
                <select
                  name="days"
                  value={days}
                  onChange={e => setDays(parseInt(e.target.value))}
                  className="w-[100px] pirBlue--text text-base border-b border-gray-300 px-2 py-1 md:text-md"
                  disabled={holiday}
                >
                  {daysOptions.map(d => (
                    <option key={d} value={d}>
                      {d} {d === 1 ? "day" : "days"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Holiday / Sunday popup */}
            {showPopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10">
                <div className="bg-white mt-[100px] w-[90%] max-w-[550px] max-h-[70vh] overflow-auto rounded-lg shadow-lg">
                  <p className="text-md pirBlue--text text-justify p-4">{popupMessage}</p>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="px-2 py-1 m-4 text-[15px] mt-2 text-white rounded-md addbtn tracking-[0.1em] hover:text-blue-800 uppercase"
                  >
                    close
                  </button>
                </div>
              </div>
            )}

            {/* Reservation / Return dates */}
            <div className="mt-4 flex flex-col items-center sm:items-end text-center sm:text-right">
              <p className="text-red-600 md:text-xl text-md font-bold tracking-[0.1em]">
                Reservation Day: {moment(reservationDay).format("dddd, MMMM D, YYYY")}
              </p>
              <p className="text-red-600 md:text-lg text-md font-bold tracking-[0.1em]">
                Return Day: {moment(returnDate).format("dddd, MMMM D, YYYY")} (Before 09:00 AM)
              </p>
            </div>

            {/* Loading spinner */}
            {loading && (
              <div className="flex justify-center items-center h-32 mt-4">
                <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-10 h-10 animate-spin" aria-label="Loading" />
              </div>
            )}

            {/* Cart items */}
            {!loading && (
              <>
                {Object.keys(availabilityErrors).length > 0 && (
                  <div className="bg-red-100 p-4 rounded-md mb-4">
                    <p className="text-red-600 font-semibold">Availability Issues:</p>
                    {Object.values(availabilityErrors).map((e, i) => (
                      <p key={i} className="text-red-500">{e}</p>
                    ))}
                  </div>
                )}

                {state.items.map(item => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-col items-center p-2 border border-green-600 gap-4 m-3 rounded-md"
                  >
                    {/* Item row */}
                    <div className="flex flex-row items-center justify-between w-full gap-4 px-2 py-2">
                      <div className="hidden sm:hidden lg:flex justify-center w-20">
                        <img src={item.Images__URL} className="w-16 h-16 rounded-lg object-contain" style={{ aspectRatio: "900 / 600" }} />
                      </div>
                      <div className="text-green-600 text-sm font-semibold md:text-lg w-32 truncate">{item.name}</div>
                      <div className="text-green-600 text-sm font-semibold md:text-lg w-20 text-center">${item.baseAmount.toFixed(2)}</div>
                      <div className="w-16 text-center"><span className="px-4 md:text-lg pirBlue--text font-semibold text-sm">{item.quantity}</span></div>
                      <div className="pirBlue--text font-semibold text-sm md:text-lg w-20 text-center">
                        {item.baseAmount !== item.amount ? (
                          <><del>${item.baseAmount.toFixed(2)}</del> ${item.amount.toFixed(2)}</>
                        ) : (
                          "$" + item.baseAmount.toFixed(2)
                        )}
                      </div>
                      <div className="w-12 flex justify-center">
                        <button className="text-red-500 hover:text-red-700 text-lg md:text-xl" onClick={() => handleRemoveFromCart(item.id)}>Trash</button>
                      </div>
                    </div>

                    {/* Add-ons */}
                    {item.addons && item.addons.length > 0 && (
                      <div className="w-full mt-2 p-3 bg-gray-100 rounded-lg shadow-md border-2 border-green-300">
                        <div className="flex justify-between items-center cursor-pointer" onClick={toggleDropdown}>
                          <h4 className="font-semibold pirBlue--text border-b-2 w-full border-gray-300">Add On Items:</h4>
                          <button className="pirBlue--text text-xl">{isOpen ? <MdArrowDropUp /> : <IoMdArrowDropdown />}</button>
                        </div>
                        {isOpen && (
                          <div className="mt-2">
                            {item.addons.map((addon: any, idx: number) => (
                              <div key={idx} className="flex flex-row sm:flex-row items-center justify-between gap-4 pirBlue--text text-sm p-2">
                                <div className="pirGreen--text font-semibold w-full sm:w-1/3 text-center sm:text-left text-sm sm:text-lg">
                                  <p>{addon.description} | ${addon.amount}</p>
                                </div>
                                <div className="pirBlue--text font-semibold w-full sm:w-1/3 text-center sm:text-left text-lg">
                                  <p>${(addon.amount * addon.quantity).toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-1/3 justify-center sm:justify-end">
                                  <button onClick={() => handleAddonQuantityChange(item.id, addon.id, Math.max(addon.quantity - 1, 0))} className="bg-green-600 text-white px-3 text-lg">-</button>
                                  <p className="text-lg font-semibold bg-white px-3">{addon.quantity}</p>
                                  <button onClick={() => handleAddonQuantityChange(item.id, addon.id, addon.quantity + 1)} className="bg-green-600 text-white px-3 text-lg">+</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Totals */}
                <div className="flex flex-col sm:flex-row justify-start gap-3 p-2">
                  <button className="w-full sm:w-auto text-white bg-light-green-600 text-center text-sm rounded-md p-2">
                    Sales Tax: ${salesTaxAmount.toFixed(2)}
                  </button>
                  <button className="w-full sm:w-auto text-white bg-light-green-600 text-center text-sm rounded-md p-2">
                    Total Price: ${totalWithTax.toFixed(2)}
                  </button>
                </div>

                {/* Keep shopping */}
                <div className="p-3 flex flex-col flex-left sm:flex-row gap-3 justify-end">
                  <button className="w-full sm:w-auto px-2 py-2 addbtn tracking-[0.1em] rounded-md text-sm text-center font-semibold">
                    <Link href="/">KEEP SHOPPING</Link>
                  </button>
                </div>

                {/* Personal info form */}
                <div className="mb-2 mt-2">
                  <h3 className="font-semibold text-xl pirBlue--text p-2">Personal Information:</h3>
                  <form className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderInput("firstName", "First Name")}
                      {renderInput("lastName", "Last Name")}
                      {renderInput("email", "Email", "email", "h-12")}
                      <div className={`relative flex items-center border p-3 rounded-lg focus:outline-none h-12 ${formErrors.phone ? "border-red-300" : "border-gray-300"} hover:border-blue-800`}>
                        <input type="tel" name="phone" placeholder="Phone" value={personalInfo.phone} onChange={handleInputChange} className="w-full focus:outline-none h-full" />
                        <IoIosInformationCircle className="ml-2 text-gray-500 cursor-pointer" onClick={() => setPopup(p => !p)} />
                        {popup && (
                          <div className="absolute left-0 top-10 w-70 bg-gray-700 text-white text-xs rounded-md p-2 shadow-md">
                            We use your phone number to link this order to your previous orders. If you have ordered with us before, please input the phone # you have used previously.
                          </div>
                        )}
                        {formErrors.phone && <p className="absolute text-red-500 text-xs mt-[75px]">{formErrors.phone}</p>}
                      </div>
                      {renderInput("address", "Address", "text", "col-span-1 sm:col-span-2")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                      {renderInput("city", "City", "text", "text-center")}
                      {renderInput("state", "State", "text", "text-center")}
                      {renderInput("zip", "Zip", "text", "text-center")}
                    </div>
                  </form>
                </div>

                {/* Pickup time */}
                <div className="mb-2 mr-3 pr-5">
                  <div className="flex items-center gap-4 p-2 font-semibold">
                    <h2 className="text-xl font-semibold pirBlue--text">Pickup Time:</h2>
                    <FaCircleQuestion onClick={() => setShowTooltip(t => !t)} className="cursor-pointer" />
                    {showTooltip && (
                      <div className="tooltipp w-[500px] text-xs">
                        These are available pickup slots for your rental day. For more information check our policies page.
                      </div>
                    )}
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center h-10">
                      <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <select
                        name="pickupTime"
                        className={`w-full px-3 mx-2 py-2 pirBlue--text border ${formErrors.pickupTime ? "border-red-300" : "border-gray-300"} rounded focus:border-none`}
                        value={pickupTime ?? ""}
                        onChange={e => {
                          setPickupTime(e.target.value);
                          setFormErrors(prev => ({ ...prev, pickupTime: "" }));
                        }}
                      >
                        {pickupTimes.length > 0 ? (
                          pickupTimes.map((t, i) => (
                            <option key={i} value={t} disabled={pickupTimeAvailability[t]?.available === false}>
                              {formatUTCTime(t)}
                            </option>
                          ))
                        ) : (
                          <option value="">No pickup times available</option>
                        )}
                      </select>
                      {formErrors.pickupTime && <p className="text-red-500 text-xs mt-1">{formErrors.pickupTime}</p>}
                    </>
                  )}
                  <button
                    className="m-2 sm:w-auto px-2 py-2 bg-light-green-400 text-white rounded-md text-sm tracking-[0.1em] hover:text-blue-800 disabled:opacity-50"
                    onClick={fetchDiscountAndPickupData}
                    disabled={loading}
                  >
                    Refresh Times
                  </button>
                </div>

                {/* Payment */}
                <div className="mb-3">
                  <h2 className="text-xl pirBlue--text font-bold mb-4 p-2">Payment Information:</h2>

                  {/* Discount */}
                  <div className="flex p-2">
                    <div className="flex flex-row gap-11">
                      <input
                        type="text"
                        placeholder="Discount Code"
                        value={discountCode}
                        onChange={e => { setDiscountCode(e.target.value); removeDiscount(); }}
                        className="flex mr-3 p-2 border border-gray-300 rounded-md focus:outline-none hover:border-blue-800 text-sm"
                      />
                      <button onClick={handleApplyDiscount} className="px-2 text-white rounded-md text-sm tracking-[0.1em] bg-light-green-400 hover:text-blue-800">
                        APPLY
                      </button>
                    </div>
                  </div>

                  {discountAmount ? (
                    <div className="bg-green-500 p-2 mb-4 m-3 w-[300px]">
                      <p className="text-white font-normal">Discount Applied: - ${discountAmount.toFixed(2)}</p>
                      <p className="text-white font-normal">Total Amount after discount: - ${totalAmount.toFixed(2)}</p>
                    </div>
                  ) : discountMessage ? (
                    <div className="bg-red-500 p-2 mb-4 m-3 w-[300px]">
                      <p className="text-white font-normal">{discountMessage}</p>
                    </div>
                  ) : null}

                  {/* Card fields */}
                  <div className="grid grid-cols-2 gap-4 mb-4 m-2">
                    {renderInput("creditCard", "Credit Card")}
                    {renderInput("expiration", "MM/YY")}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4 m-2">
                    {renderInput("cvv", "CVV")}
                    {renderInput("ccZip", "Zip")}
                  </div>

                  {/* Payment options */}
                  {totalAmount > 25 && (
                    <div className="flex items-center p-3 m-2">
                      <input type="radio" name="payment" id="pay-deposit" className="mr-2" checked={paymentOption === "deposit"} onChange={() => setPaymentOption("deposit")} />
                      <label htmlFor="pay-deposit" className="text-gray-700">Pay Deposit Amount: $25</label>
                    </div>
                  )}
                  <div className="flex items-center p-3 m-2">
                    <input type="radio" name="payment" id="pay-full" className="mr-2" checked={paymentOption === "full"} onChange={() => setPaymentOption("full")} />
                    <label htmlFor="pay-full" className="text-gray-700">Pay Full Amount: ${totalAmount.toFixed(2)}</label>
                  </div>
                </div>

                {/* Submit */}
                <button
                  className="sm:w-auto px-2 py-1 text-[15px] text-white rounded-md bg-light-green-400 tracking-[0.1em] hover:text-blue-800"
                  onClick={handleSubmitOrder}
                >
                  Submit Order
                </button>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CartPage;