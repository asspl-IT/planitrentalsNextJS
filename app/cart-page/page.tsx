"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useCart } from "../../context/cartContext";
import { CartService } from "../../services/CartService";
import moment from "moment";
import { FaGreaterThan, FaCircleQuestion } from "react-icons/fa6";
import { IoMdArrowDropdown, IoIosInformationCircle } from "react-icons/io";
import { MdArrowDropUp } from "react-icons/md";
import { cartStore } from "../../zustand/cartStore";
import "react-datepicker/dist/react-datepicker.css";
import OrderService from "../../services/OrderService";

// Dynamic import for DatePicker (SSR disabled)
const DatePicker = dynamic(
  () => import("react-datepicker").then((mod) => mod.default),
  { ssr: false }
);
const incomingLocationDefault = "001P000001teeXqIAI";
const CartPage = ({
  incomingLocation = incomingLocationDefault,
  holidayList = [],
  salesTax = 0,
  selectDate = Date.now(),
  days = 1,
}) => {
  const { state, dispatch } = useCart();
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);
  const [popup, setPopup] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [pickupTimeAvailability, setPickupTimeAvailability] = useState({});
  const [pickupTimes, setPickupTimes] = useState([]);
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    creditCard: "",
    expiration: "",
    cvv: "",
    ccZip: "",
  });
  const [isOpen, setIsOpen] = useState(true);
  const [discountMessage, setDiscountMessage] = useState("");

  const {
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
    salesTax: storeSalesTax,
    setSalesTax: setStoreSalesTax,
    subtotal,
    discountAmount,
    setDiscountAmount,
    discountCode,
    setDiscountCode,
    selectDate: storeSelectDate,
    setSelectDate: setStoreSelectDate,
    days: storeDays,
    setDays: setStoreDays,
    setHolidayList,
    generateDateRange,
    holiday,
    checkHolidays,
    setReturnDate,
    setIncomingLocation,
    returnDate,
    holidayList: storeHolidayList,
  } = cartStore();

  // Initialize location
  useEffect(() => {
    setIncomingLocation(incomingLocation);
  }, [incomingLocation, setIncomingLocation]);

  // Initialize selectDate and days from localStorage or props
  useEffect(() => {
    if (!storeSelectDate) {
      const storedDate =
        parseInt(localStorage.getItem("selectedDate")) || selectDate;
      const storedDays = parseInt(localStorage.getItem("duration"), 10) || days;
      if (storedDate) setStoreSelectDate(storedDate);
      if (storedDays) setStoreDays(storedDays);
    }
  }, [
    storeSelectDate,
    storeDays,
    selectDate,
    days,
    setStoreSelectDate,
    setStoreDays,
  ]);

  // Update return date
  useEffect(() => {
    if (storeSelectDate && storeHolidayList !== undefined) {
      setReturnDate(storeSelectDate, storeDays);
    }
  }, [storeSelectDate, storeDays, storeHolidayList, setReturnDate]);

  const reservationDay = storeSelectDate;
  const dayIndex = new Date(reservationDay).getDay();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeek = daysOfWeek[dayIndex];

  const fetchDiscountAndPickupData = async () => {
    try {
      setLoading(true);

      if (!incomingLocation) {
        throw new Error("Location is missing. Please select a location.");
      }
      if (!reservationDay || isNaN(reservationDay)) {
        throw new Error("Invalid rental date.");
      }

      const formattedDate = moment(reservationDay).format("YYYY-MM-DD");
      console.log("Sending to /aws/location:", {
        incomingLocation,
        dayOfWeek,
        startDate: formattedDate,
      });

      const data = await CartService.getLocationData(
        incomingLocation,
        dayOfWeek,
        formattedDate
      );

      const times = data.pickUpTimes || [];
      setPickupTimes(times);
      const availability = {};
      times.forEach((time) => {
        availability[time] = { available: true, bookings: 0 };
      });
      setPickupTimeAvailability(availability);

      if (times.length > 0) {
        if (!times.includes(pickupTime)) {
          setPickupTime(times[0]);
          setFormErrors((prev) => ({
            ...prev,
            pickupTime:
              "Previous pickup time unavailable. Default time selected.",
          }));
        }
      } else {
        setPickupTime("");
        setFormErrors((prev) => ({
          ...prev,
          pickupTime: "No pickup times available for this date.",
        }));
      }

      setDiscountList(data.discountList || []);
      setHolidayList(data.holidayList || holidayList);
      setStoreSalesTax(data.accountDetails?.Sales_Tax__c || salesTax);
      localStorage.setItem(
        "salesTax",
        data.accountDetails?.Sales_Tax__c || salesTax
      );
    } catch (error) {
      console.error("Error fetching pickup times and data:", error);
      setFormErrors((prev) => ({
        ...prev,
        pickupTime: "Failed to fetch pickup times. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reservationDay) {
      fetchDiscountAndPickupData();
    }
  }, [incomingLocation, reservationDay, dayOfWeek]);

  const handleDateChange = (date) => {
    if (!date) return;
    const epoch = date.getTime();
    const selectedDay = moment(epoch).day();
    const isHoliday = checkHolidays(epoch);

    if (isHoliday) {
      const startEpoch = moment(isHoliday.Start_Date__c).valueOf();
      setPopupMessage(isHoliday.Text__c);
      setShowPopup(true);
      setStoreSelectDate(startEpoch);
      setStoreDays(1);
    } else if (selectedDay === 0) {
      const prevSaturday = moment(epoch).subtract(1, "days");
      const saturdayEpoch = prevSaturday.valueOf();
      setPopupMessage(
        "Good news! You selected a Sunday. Plan-it Rentals is closed on Sunday, which means this is a free rental day for you! You will need to pick up your item(s) on Saturday morning, and your item(s) will be due back Monday morning before 9:00 AM. Your reservation date will now be set to Saturday."
      );
      setShowPopup(true);
      setStoreSelectDate(saturdayEpoch);
      setStoreDays(1);
    } else if (selectedDay === 6) {
      setPopupMessage(
        "You have selected a Saturday rental. Saturday rentals are due Monday by 9 AM, and Sunday is a free rental day because we are closed on Sunday!"
      );
      setShowPopup(true);
      setStoreSelectDate(epoch);
      setStoreDays(1);
    } else {
      setStoreSelectDate(epoch);
      if (holiday) setStoreDays(1);
    }
  };

  const dayClassName = (date) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const dateEpoch = date.getTime();
    if (dateEpoch < today) {
      return "previous-date";
    }
    if (storeSelectDate && dateEpoch === storeSelectDate) {
      return "selected-date";
    }
    return "";
  };

  const handleRemoveFromCart = (id) => {
    const currentSalesTax = storeSalesTax;
    removeDiscount(true);
    dispatch({
      type: "REMOVE_FROM_CART",
      payload: { id },
    });
    setStoreSalesTax(currentSalesTax);
  };

  useEffect(() => {
    calculateTotalAmount(state.items);
  }, [
    storeSelectDate,
    storeDays,
    state.items,
    discountAmount,
    calculateTotalAmount,
  ]);

  const handleAddonQuantityChange = (itemId, addonId, quantity) => {
    dispatch({
      type: "UPDATE_ADDON_QUANTITY",
      payload: { itemId, addonId, quantity },
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "expiration") {
      let cleanedValue = value.replace(/[^0-9/]/g, "");
      if (
        cleanedValue.length < personalInfo.expiration.length &&
        cleanedValue.includes("/")
      ) {
        const [month] = cleanedValue.split("/");
        cleanedValue = month;
      } else {
        if (cleanedValue.length <= 2 && !cleanedValue.includes("/")) {
          cleanedValue = cleanedValue.slice(0, 2);
        }
        if (cleanedValue.length === 2 && !cleanedValue.includes("/")) {
          cleanedValue += "/";
        }
        if (cleanedValue.includes("/")) {
          const [month, year] = cleanedValue.split("/");
          const formattedMonth = month.slice(0, 2);
          let formattedYear = year ? year.slice(0, 4) : "";
          cleanedValue = `${formattedMonth}/${formattedYear}`;
        }
      }
      setPersonalInfo((prevInfo) => ({
        ...prevInfo,
        [name]: cleanedValue,
      }));
    } else {
      setPersonalInfo((prevInfo) => ({
        ...prevInfo,
        [name]: value,
      }));
    }
  };

  const handleApplyDiscount = () => {
    const discount = discountList.find(
      (discount) => discount.Code__c === discountCode.trim().toUpperCase()
    );
    if (discount && discount.isActive__c) {
      const discountValue = (subtotal * discount.Percentage__c) / 100;
      setDiscountAmount(discountValue);
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

  const calculateReturnDate = (startEpoch, duration) => {
    let returnDate = moment(startEpoch);
    let daysCounted = 0;

    while (daysCounted < duration) {
      returnDate.add(1, "days");
      if (returnDate.day() !== 0) {
        daysCounted++;
      }
    }
    if (returnDate.day() === 0) {
      returnDate.add(1, "days");
    }
    return returnDate.valueOf();
  };

  const formatUTCTime = (utcTime) => {
    if (!utcTime || typeof utcTime !== "string") return "Not Selected";
    try {
      const [hours, minutes] = utcTime.split(":");
      let hourNum = parseInt(hours, 10);
      const ampm = hourNum >= 12 ? "PM" : "AM";
      hourNum = hourNum % 12 || 12;
      const display = `${hourNum}:${minutes} ${ampm}`;
      const availability = pickupTimeAvailability[utcTime] || {
        available: true,
        bookings: 0,
      };
      return availability.available ? display : `${display} (Fully Booked)`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid Time";
    }
  };

  const validatePickupTime = async () => {
    if (!pickupTime) {
      setFormErrors((prev) => ({
        ...prev,
        pickupTime: "Pickup time is required",
      }));
      return false;
    }

    try {
      const formattedDate = moment(reservationDay).format("YYYY-MM-DD");
      const data = await CartService.getLocationData(
        incomingLocation,
        dayOfWeek,
        formattedDate
      );
      const times = data.pickUpTimes || [];

      const availability = {};
      times.forEach((time) => {
        availability[time] = { available: true, bookings: 0 };
      });
      setPickupTimeAvailability(availability);
      setPickupTimes(times);

      if (!times.includes(pickupTime)) {
        setFormErrors((prev) => ({
          ...prev,
          pickupTime: "Selected pickup time is no longer available",
        }));
        setPickupTime(times.length > 0 ? times[0] : "");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating pickup time:", error);
      setFormErrors((prev) => ({
        ...prev,
        pickupTime: "Error validating pickup time. Please try again.",
      }));
      return false;
    }
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!personalInfo.firstName.trim()) {
      errors.firstName = "First Name is required";
      isValid = false;
    }
    if (!personalInfo.lastName.trim()) {
      errors.lastName = "Last Name is required";
      isValid = false;
    }
    if (!personalInfo.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(personalInfo.email)
    ) {
      errors.email = "Invalid email format (e.g., user@example.com)";
      isValid = false;
    }
    if (!personalInfo.phone.trim()) {
      errors.phone = "Phone is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(personalInfo.phone)) {
      errors.phone = "Must be 10 digits (e.g., 1234567890)";
      isValid = false;
    }
    if (!personalInfo.city.trim()) {
      errors.city = "City is required";
      isValid = false;
    }
    if (!personalInfo.state.trim()) {
      errors.state = "State is required";
      isValid = false;
    }
    if (!personalInfo.address.trim()) {
      errors.address = "Address is required";
      isValid = false;
    }
    if (!personalInfo.zip.trim()) {
      errors.zip = "Zip Code is required";
      isValid = false;
    }
    if (!personalInfo.creditCard.trim()) {
      errors.creditCard = "Credit Card is required";
      isValid = false;
    } else if (!/^\d{15,16}$/.test(personalInfo.creditCard)) {
      errors.creditCard = "Must be 15 or 16 digits";
      isValid = false;
    }
    if (!personalInfo.expiration.trim()) {
      errors.expiration = "Expiration is required";
      isValid = false;
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(personalInfo.expiration)) {
      errors.expiration = "Must be MM/YY (e.g., 12/25)";
      isValid = false;
    }
    if (!personalInfo.cvv.trim()) {
      errors.cvv = "CVV is required";
      isValid = false;
    } else if (!/^\d{3,4}$/.test(personalInfo.cvv)) {
      errors.cvv = "Must be 3 or 4 digits";
      isValid = false;
    }
    if (!personalInfo.ccZip.trim()) {
      errors.ccZip = "Zip Code is required";
      isValid = false;
    } else if (!/^\d{5}$/.test(personalInfo.ccZip)) {
      errors.ccZip = "Must be 5 digits";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) return;
    const isValid = await validatePickupTime();
    if (!isValid) return;

    const startDateStr = moment(reservationDay).format("YYYY-MM-DD");
    const isHoliday = checkHolidays(reservationDay);
    let endDateStr, returnDateStr;

    if (isHoliday) {
      endDateStr = moment(isHoliday.End_Date__c).format("YYYY-MM-DD");
      returnDateStr = moment(returnDate).format("YYYY-MM-DD");
    } else {
      endDateStr = moment(
        calculateReturnDate(reservationDay, storeDays - 1)
      ).format("YYYY-MM-DD");
      returnDateStr = moment(
        calculateReturnDate(reservationDay, storeDays)
      ).format("YYYY-MM-DD");
    }

    const dateRange = generateDateRange(reservationDay, storeDays);
    const pickUpTimeMs = pickupTime
      ? moment(pickupTime, "HH:mm").diff(
          moment().startOf("day"),
          "milliseconds"
        )
      : 0;

    const orderData = {
      shoppingCart: {
        customer: {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          email: personalInfo.email,
          phone: personalInfo.phone,
          ccNUm: personalInfo.creditCard,
          ccExp: personalInfo.expiration,
          ccCvv: personalInfo.cvv,
          ccZip: personalInfo.ccZip,
          street: personalInfo.address,
          city: personalInfo.city,
          state: personalInfo.state,
          zip: personalInfo.zip,
        },
        order: {
          startDate: startDateStr,
          endDate: endDateStr,
          returnDate: returnDateStr,
          days: storeDays,
          paymentType: paymentOption,
          location: incomingLocation,
          salesTaxPercent: storeSalesTax / 100,
          salesTaxAmount: salesTaxAmount,
          discountId: null,
          discountCodeAmount: discountAmount,
          discountCodePercent: discountAmount ? discountAmount / subtotal : 0,
          dateRange: dateRange,
          isHoliday: checkHolidays(reservationDay) ? true : false,
          dayOfWeekText: daysOfWeek[new Date(reservationDay).getDay()],
          costTotal: 0,
          itemTotal: subtotal,
          orderTotal: totalAmount,
          deposit: totalAmount > 25 ? 25 : totalAmount,
          pickUpTime: pickUpTimeMs,
        },
        appliedDiscount: {},
        items: state.items.map((item) => ({
          costSetups: item.addons.map((addon) => ({
            Id: addon.id,
            quantity: addon.quantity,
            description: addon.description,
            totalCost: addon.amount * addon.quantity,
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
          discountProcessed: item.discountProcessed || false,
          amount: item.amount || item.price * item.quantity,
          baseAmount: item.baseAmount || item.price,
        })),
      },
    };

    try {
      await OrderService.processShoppingCartVerifyAvailability(
        orderData.shoppingCart
      );
      setOrderData(orderData);
      router.push("/order-confirmation");
    } catch (error) {
      console.error("Error submitting order:", error);
      setFormErrors((prev) => ({
        ...prev,
        submit: "Failed to submit order. Please try again.",
      }));
    }
  };

  const daysOptions = holiday
    ? [1]
    : Array.from({ length: 50 }, (_, i) => i + 1);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const renderInput = (name, placeholder, type = "text", extraClass = "") => (
    <div className="relative">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={personalInfo[name]}
        onChange={handleInputChange}
        className={`p-3 w-full border ${
          formErrors[name] ? "border-red-300" : "border-gray-300"
        } rounded-lg focus:outline-none hover:border-blue-800 ${extraClass}`}
        aria-label={placeholder}
      />
      {formErrors[name] && (
        <p className="text-red-500 text-xs mt-1">{formErrors[name]}</p>
      )}
    </div>
  );

  return (
    <>
      <Head>
        <title>Cart | Plan-it Rentals</title>
        <meta
          name="description"
          content="Review and checkout your rental items with Plan-it Rentals. Select pickup times, apply discounts, and enter payment information to complete your order."
        />
        <meta
          name="keywords"
          content="Cart, Party Rentals, Equipment Rentals"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta property="og:title" content="Cart | Plan-it Rentals" />
        <meta
          property="og:description"
          content="Review and checkout your rental items with Plan-it Rentals."
        />
        <meta property="og:url" content="https://www.planitrentals.com/cart" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Planitrentals" />
        <link rel="canonical" href="https://www.planitrentals.com/cart" />
      </Head>

      <div className="page-header md:mt-[100px] breadcrumb-wrap mb-7">
        <div className="flex flex-wrap gap-2 text-sm font-semibold pirBlue--text mt-2 md:mt-0">
          <Link href="/" className="pirGreen--text">
            Home
          </Link>
          <span>
            <FaGreaterThan className="mt-1" />
          </span>
          <span>Cart</span>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-bold pirBlue--text mb-4">Your Cart</h2>
        {state.items.length > 0 && (
          <>
            <p className="font-bold text-sm text-red-600 mb-4">
              Carefully check all information before checkout
            </p>
            <div className="pb-4 max-w-xl bg-white">
              <h2 className="text-lg md:text-2xl font-bold text-red-600 mt-8">
                Select Your Rental Date:
              </h2>
              <div className="flex flex-row items-center gap-5 mt-4">
                <DatePicker
                  selected={storeSelectDate ? new Date(storeSelectDate) : null}
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
                  value={storeDays}
                  onChange={(e) => setStoreDays(parseInt(e.target.value))}
                  className="w-[100px] pirBlue--text text-base border-b border-gray-300 px-2 py-1 md:text-md"
                  disabled={holiday}
                  aria-label="Select rental duration"
                >
                  {daysOptions.map((day) => (
                    <option key={day} value={day}>
                      {day} {day === 1 ? "day" : "days"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10">
            <div className="bg-white mt-[100px] w-[90%] max-w-[550px] max-h-[70vh] overflow-auto rounded-lg shadow-lg">
              <div
                className="text-md pirBlue--text text-justify p-4"
                dangerouslySetInnerHTML={{ __html: popupMessage }}
              />
              <button
                onClick={() => setShowPopup(false)}
                className="px-2 py-1 m-4 text-[15px] mt-2 text-white rounded-md addbtn tracking-[0.1em] hover:text-blue-800 uppercase"
                aria-label="Close popup"
              >
                Close
              </button>
            </div>
          </div>
        )}
        {state.items.length > 0 && (
          <div className="mt-4 flex flex-col items-center sm:items-end text-center sm:text-right">
            <p className="text-red-600 md:text-xl text-md font-bold ">
              Reservation Day:{" "}
              {moment(reservationDay).format("dddd, MMMM D, YYYY")}
            </p>
            <p className="text-red-600 md:text-lg text-md font-bold">
              Return Day: {moment(returnDate).format("dddd, MMMM D, YYYY")}{" "}
              (Before 09:00 AM)
            </p>
          </div>
        )}
        <div className="w-full p-2 mt-3">
          {state.items.length === 0 ? (
            <div className="text-center mt-10">
              <p className="text-lg pirBlue--text font-semibold">
                Your cart is empty.
              </p>
              <Link
                href="/"
                className="mt-4 px-4 py-2 bg-light-green-400 text-white rounded-md text-sm hover:text-blue-800 inline-block"
                aria-label="Continue shopping"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              {loading && (
                <div className="flex justify-center items-center h-32 mt-4">
                  <div
                    className="loader border-t-4 border-blue-500 border-solid rounded-full w-10 h-10 animate-spin"
                    aria-label="Loading"
                  ></div>
                </div>
              )}
              {!loading && (
                <>
                  {Object.keys(availabilityErrors).length > 0 && (
                    <div className="bg-red-100 p-4 rounded-md mb-4">
                      <p className="text-red-600 font-semibold">
                        Availability Issues:
                      </p>
                      {Object.values(availabilityErrors).map((error, index) => (
                        <div
                          key={index}
                          className="text-red-500"
                          dangerouslySetInnerHTML={{ __html: error }}
                        />
                      ))}
                    </div>
                  )}
                  {!loading &&
                    pickupTimes.length === 0 &&
                    !formErrors.pickupTime && (
                      <p className="text-red-500 text-xs mt-1">
                        Unable to load pickup times. Please try refreshing or
                        contact support.
                      </p>
                    )}
                  {state.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-col items-center p-2 border border-green-600 gap-4 m-3 rounded-md"
                    >
                      <div className="flex flex-row items-center justify-between w-full gap-4 px-2 py-2">
                        <div className="hidden sm:hidden lg:flex justify-center w-20">
                          <img
                             src={item.Images__r?.records?.[0]?.Original_Image_URL__c}
                            className="w-16 h-16 rounded-lg object-contain"
                            style={{ aspectRatio: "900 / 600" }}
                            alt={item.name}
                          />
                        </div>
                        <div className="text-green-600 text-sm font-semibold md:text-lg w-32 truncate">
                          {item.name}
                        </div>
                        <div className="text-green-600 text-sm font-semibold md:text-lg w-20 text-center">
                          ${item.baseAmount.toFixed(2)}
                        </div>
                        <div className="w-16 text-center">
                          <span className="px-4 md:text-lg pirBlue--text font-semibold text-sm">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="pirBlue--text font-semibold text-sm md:text-lg w-20 text-center">
                          {item.baseAmount !== item.amount ? (
                            <>
                              <del>${item.baseAmount.toFixed(2)}</del> $
                              {item.amount.toFixed(2)}
                            </>
                          ) : (
                            `$${item.baseAmount.toFixed(2)}`
                          )}
                        </div>
                        <div className="w-12 flex justify-center">
                          <button
                            className="text-red-500 hover:text-red-700 text-lg md:text-xl"
                            onClick={() => handleRemoveFromCart(item.id)}
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            Trash
                          </button>
                        </div>
                      </div>
                      {item.addons && item.addons.length > 0 && (
                        <div className="w-full mt-2 p-3 bg-gray-100 rounded-lg shadow-md border-2 border-green-300">
                          <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={toggleDropdown}
                          >
                            <h4 className="font-semibold pirBlue--text border-b-2 w-full border-gray-300">
                              Add On Items:
                            </h4>
                            <button
                              className="pirBlue--text text-xl"
                              aria-label={
                                isOpen ? "Collapse add-ons" : "Expand add-ons"
                              }
                            >
                              {isOpen ? (
                                <MdArrowDropUp />
                              ) : (
                                <IoMdArrowDropdown />
                              )}
                            </button>
                          </div>
                          {isOpen && (
                            <div className="mt-2">
                              {item.addons.map((addon, index) => (
                                <div
                                  key={index}
                                  className="flex flex-row sm:flex-row items-center justify-between gap-4 pirBlue--text text-sm p-2"
                                >
                                  <div className="pirGreen--text font-semibold w-full sm:w-1/3 text-center sm:text-left text-sm sm:text-lg">
                                    <p>
                                      {addon.description} | ${addon.amount}
                                    </p>
                                  </div>
                                  <div className="pirBlue--text font-semibold w-full sm:w-1/3 text-center sm:text-left text-lg">
                                    <p>
                                      $
                                      {(addon.amount * addon.quantity).toFixed(
                                        2
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 w-full sm:w-1/3 justify-center sm:justify-end">
                                    <button
                                      onClick={() =>
                                        handleAddonQuantityChange(
                                          item.id,
                                          addon.id,
                                          Math.max(addon.quantity - 1, 0)
                                        )
                                      }
                                      className="bg-green-600 text-white px-3 text-lg"
                                      aria-label={`Decrease quantity of ${addon.description}`}
                                    >
                                      -
                                    </button>
                                    <p className="text-lg font-semibold bg-white px-3">
                                      {addon.quantity}
                                    </p>
                                    <button
                                      onClick={() =>
                                        handleAddonQuantityChange(
                                          item.id,
                                          addon.id,
                                          addon.quantity + 1
                                        )
                                      }
                                      className="bg-green-600 text-white px-3 text-lg"
                                      aria-label={`Increase quantity of ${addon.description}`}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex flex-col sm:flex-row justify-start gap-3 p-2">
                    <button className="w-full sm:w-auto text-white bg-light-green-600 text-center text-sm rounded-md p-2">
                      Sales Tax: ${salesTaxAmount.toFixed(2)}
                    </button>
                    <button className="w-full sm:w-auto text-white bg-light-green-600 text-center text-sm rounded-md p-2">
                      Total Price: ${totalWithTax.toFixed(2)}
                    </button>
                  </div>
                  <div className="p-3 flex flex-col sm:flex-row gap-3 justify-end">
                    <Link
                      href="/"
                      className="w-full sm:w-auto px-2 py-2 addbtn rounded-md text-sm text-center font-semibold inline-block"
                      aria-label="Continue shopping"
                    >
                      KEEP SHOPPING
                    </Link>
                  </div>
                  <div className="mb-2 mt-2">
                    <h3 className="font-semibold text-xl pirBlue--text p-2">
                      Personal Information:
                    </h3>
                    <form className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderInput("firstName", "First Name")}
                        {renderInput("lastName", "Last Name")}
                        {renderInput("email", "Email", "email", "h-12")}
                        <div
                          className={`relative flex items-center border p-3 rounded-lg focus:outline-none h-12 ${
                            formErrors.phone
                              ? "border-red-300"
                              : "border-gray-300"
                          } hover:border-blue-800`}
                        >
                          <input
                            type="tel"
                            name="phone"
                            placeholder="Phone"
                            value={personalInfo.phone}
                            onChange={handleInputChange}
                            className="w-full focus:outline-none h-full"
                            aria-label="Phone number"
                          />
                          <IoIosInformationCircle
                            className="ml-2 text-gray-500 cursor-pointer"
                            onClick={() => setPopup((prev) => !prev)}
                            aria-label="Phone number information"
                          />
                          {popup && (
                            <div className="absolute left-0 top-10 w-70 bg-gray-700 text-white text-xs rounded-md p-2 shadow-md">
                              We use your phone number to link this order to
                              your previous orders. If you have ordered with us
                              before, please input the phone # you have used
                              previously.
                            </div>
                          )}
                          {formErrors.phone && (
                            <p className="absolute text-red-500 text-xs mt-[75px]">
                              {formErrors.phone}
                            </p>
                          )}
                        </div>
                        {renderInput(
                          "address",
                          "Address",
                          "text",
                          "col-span-1 sm:col-span-2"
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        {renderInput("city", "City", "text", "text-center")}
                        {renderInput("state", "State", "text", "text-center")}
                        {renderInput("zip", "Zip", "text", "text-center")}
                      </div>
                    </form>
                  </div>
                  <div className="mb-2 mr-3 pr-5">
                    <div className="flex items-center gap-4 p-2 font-semibold">
                      <h2 className="text-xl font-semibold pirBlue--text">
                        Pickup Time:
                      </h2>
                      <div className="icon-container">
                        <span>
                          <FaCircleQuestion
                            onClick={() => setShowTooltip((prev) => !prev)}
                            aria-label="Pickup time information"
                          />
                        </span>
                        {showTooltip && (
                          <div className="tooltipp w-[500px] text-xs">
                            These are available pickup slots for your rental
                            day. For more information check our policies page.
                          </div>
                        )}
                      </div>
                    </div>
                    {loading ? (
                      <div className="flex justify-center items-center h-10">
                        <div
                          className="loader border-t-4 border-blue-500 border-solid rounded-full w-6 h-6 animate-spin"
                          aria-label="Loading"
                        ></div>
                      </div>
                    ) : (
                      <>
                        <select
                          name="pickupTime"
                          className={`w-full px-3 mx-2 py-2 pirBlue--text border ${
                            formErrors.pickupTime
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded focus:border-none`}
                          value={pickupTime || ""}
                          onChange={(e) => {
                            setPickupTime(e.target.value);
                            setFormErrors((prev) => ({
                              ...prev,
                              pickupTime: "",
                            }));
                          }}
                          aria-label="Select pickup time"
                        >
                          {pickupTimes.length > 0 ? (
                            pickupTimes.map((time, index) => (
                              <option
                                key={index}
                                value={time}
                                disabled={
                                  pickupTimeAvailability[time]?.available ===
                                  false
                                }
                              >
                                {formatUTCTime(time)}
                              </option>
                            ))
                          ) : (
                            <option value="">No pickup times available</option>
                          )}
                        </select>
                        {formErrors.pickupTime && (
                          <p className="text-red-500 text-xs mt-1">
                            {formErrors.pickupTime}
                          </p>
                        )}
                      </>
                    )}
                    <button
                      className="m-2 sm:w-auto px-2 py-2 bg-light-green-400 text-white rounded-md text-sm hover:text-blue-800 disabled:opacity-50"
                      onClick={fetchDiscountAndPickupData}
                      disabled={loading}
                      aria-label="Refresh pickup times"
                    >
                      Refresh Times
                    </button>
                  </div>
                  <div className="mb-3">
                    <h2 className="text-xl pirBlue--text font-bold mb-4 p-2">
                      Payment Information:
                    </h2>
                    <div className="flex p-2">
                      <div className="flex flex-row gap-11">
                        <input
                          type="text"
                          placeholder="Discount Code"
                          value={discountCode}
                          onChange={(e) => {
                            setDiscountCode(e.target.value);
                            removeDiscount();
                          }}
                          className="flex mr-3 p-2 border border-gray-300 rounded-md focus:outline-none hover:border-blue-800 text-sm"
                          aria-label="Discount code"
                        />
                        <button
                          onClick={handleApplyDiscount}
                          className="px-2 text-white rounded-md text-sm  bg-green-500 bg-light-green-400 hover:text-blue-800"
                          aria-label="Apply discount code"
                        >
                          APPLY
                        </button>
                      </div>
                    </div>
                    {discountAmount ? (
                      <div className="bg-green-500 p-2 mb-4 m-3 w-[300px]">
                        <p className="text-white font-normal">
                          Discount Applied: - ${discountAmount.toFixed(2)}
                        </p>
                        <p className="text-white font-normal">
                          Total Amount after discount: - $
                          {totalAmount.toFixed(2)}
                        </p>
                      </div>
                    ) : discountMessage ? (
                      <div className="bg-red-500 p-2 mb-4 m-3 w-[300px]">
                        <p className="text-white font-normal">
                          {discountMessage}
                        </p>
                      </div>
                    ) : null}
                    <div className="grid grid-cols-2 gap-4 mb-4 m-2">
                      {renderInput("creditCard", "Credit Card")}
                      {renderInput("expiration", "MM/YY")}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4 m-2">
                      {renderInput("cvv", "CVV")}
                      {renderInput("ccZip", "Zip")}
                    </div>
                    {totalAmount > 25 && (
                      <div className="flex items-center p-3 m-2">
                        <input
                          type="radio"
                          name="payment"
                          id="pay-deposit"
                          className="mr-2"
                          checked={paymentOption === "deposit"}
                          onChange={() => setPaymentOption("deposit")}
                          aria-label="Pay deposit amount"
                        />
                        <label htmlFor="pay-deposit" className="text-gray-700">
                          Pay Deposit Amount: $25
                        </label>
                      </div>
                    )}
                    <div className="flex items-center p-3 m-2">
                      <input
                        type="radio"
                        name="payment"
                        id="pay-full"
                        className="mr-2"
                        checked={paymentOption === "full"}
                        onChange={() => setPaymentOption("full")}
                        aria-label="Pay full amount"
                      />
                      <label htmlFor="pay-full" className="text-gray-700">
                        Pay Full Amount: ${totalAmount.toFixed(2)}
                      </label>
                    </div>
                  </div>
                  {formErrors.submit && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.submit}
                    </p>
                  )}
                  <button
                    className="sm:w-auto px-2 py-1 text-[15px] bg-green-500 text-white rounded-md bg-light-green-400 tracking-[0.1em] hover:text-blue-800"
                    onClick={handleSubmitOrder}
                    aria-label="Submit order"
                  >
                    Submit Order
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;
