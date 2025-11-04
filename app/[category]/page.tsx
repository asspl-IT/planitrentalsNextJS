"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaGreaterThan,
  FaShuttleVan,
  FaExclamationTriangle,
} from "react-icons/fa";
import { BsPeopleFill } from "react-icons/bs";
import { IoMdCar } from "react-icons/io";
import {
  MdPerson,
  MdGroups,
  MdGroupAdd,
  MdWaterDrop,
  MdSunny,
  MdLocalShipping,
  MdFireTruck,
  MdCircle,
  MdSavings,
} from "react-icons/md";
import { CategoriesService } from "@/services/CategoriesService";
import { CategoriesItemService } from "../../services/CategoriesItemService";
import { CartService } from "@/services/CartService";
import { locationLoader } from "@/config/locationLoader";
import { cartStore } from "@/zustand/cartStore";
import { useCategories } from "@/context/CategoriesContext";
import categoryData from "@/public/data/categorymetaprod.json";
import Link from "next/link";
import Meta from "@/components/Meta"; // Assuming Meta component exists in Next.js project
import star from "@/public/starr.webp"; // Adjust path as needed

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="w-[200px] h-[200px] bg-gray-200 rounded"></div>
    <div className="mt-4">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
    </div>
  </div>
);

const RentalItemsPage = () => {
  const params = useParams();
  const router = useRouter();
  const category = params?.category as string;

  const {
    selectDate,
    setSelectDate,
    days,
    setDays,
    setSalesTax,
    setHolidayList,
    holidayList,
    holiday,
    checkHolidays,
  } = cartStore();

  const [categoryItems, setCategoryItems] = useState<any[]>([]);
  const [staticCategoryItems, setStaticCategoryItems] = useState<any[]>([]);
  const [categoryDetails, setCategoryDetails] = useState<any>(null);
  const [loadingStatic, setLoadingStatic] = useState(true);
  const [loadingDynamic, setLoadingDynamic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [hasInteracted, setHasInteracted] = useState(
    typeof window !== "undefined" &&
      sessionStorage.getItem("hasInteracted") === "true"
  );
  const popupShownRef = useRef(false);
  const [categoryDetailsLoading, setCategoryDetailsLoading] = useState(true);
  const { LOCATION } = locationLoader();
  const incomingLocation = LOCATION.UT_LOCATION_ID;

  // Find the matching category in the JSON data
  const matchedCategory = useMemo(() => {
    return (
      categoryData.data.find(
        (cat: any) => cat.URL_Route__c?.toLowerCase() === category?.toLowerCase()
      ) || null
    );
  }, [category]);

  const iconComponents = {
    person: MdPerson,
    people: BsPeopleFill,
    groups: MdGroups,
    "group add": MdGroupAdd,
    water_drop: MdWaterDrop,
    sunny: MdSunny,
    directions_car: IoMdCar,
    airport_shuttle: FaShuttleVan,
    local_shipping: MdLocalShipping,
    fire_truck: MdFireTruck,
    circle: MdCircle,
  };

  // Calculate min and max prices across all staticCategoryItems
  const getPriceRange = () => {
    if (!staticCategoryItems || staticCategoryItems.length === 0) {
      return {
        minPrice: "N/A",
        maxPrice: "N/A",
        minPriceNumeric: 0,
        maxPriceNumeric: 0,
      };
    }

    const prices = staticCategoryItems
      .flatMap((item) => [
        Number(item.Weekday_Cost__c) || 0,
        Number(item.Weekend_Cost__c) || 0,
      ])
      .filter((price) => price > 0); // Only include valid, non-zero prices

    if (prices.length === 0) {
      return {
        minPrice: "N/A",
        maxPrice: "N/A",
        minPriceNumeric: 0,
        maxPriceNumeric: 0,
      };
    }

    const minPriceNumeric = Math.min(...prices);
    const maxPriceNumeric = Math.max(...prices);

    return {
      minPrice: `$${minPriceNumeric}/day`,
      maxPrice: `$${maxPriceNumeric}/day`,
      minPriceNumeric,
      maxPriceNumeric,
    };
  };

  const { minPrice, maxPrice, minPriceNumeric, maxPriceNumeric } =
    getPriceRange();

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: matchedCategory?.Name__c || categoryDetails?.Name__c || "Category",
    image: [
      matchedCategory?.Original_Image_URL__c ||
        "https://www.planitrentals.com/assets/blue-green-O-Bcg1-Yq_.png",
    ],
    description: `${
      matchedCategory?.Name__c || categoryDetails?.Name__c || "Category"
    } Rentals in Utah - Explore affordable and high-quality ${
      matchedCategory?.Name__c || categoryDetails?.Name__c || "items"
    } with Plan-it Rentals.`,
    url: `https://www.planitrentals.com/${
      matchedCategory?.URL_Route__c?.toLowerCase() ||
      categoryDetails?.URL_Route__c?.toLowerCase() ||
      category
    }`,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: maxPriceNumeric || 50,
      availability: "http://schema.org/InStock",
      image: [
        matchedCategory?.Original_Image_URL__c ||
          "https://www.planitrentals.com/assets/blue-green-O-Bcg1-Yq_.png",
      ],
    },
  };

  // Initialize default date if not set
  useEffect(() => {
    if (!selectDate) {
      const today = moment().startOf("day").valueOf();
      setSelectDate(today);
      cartStore.getState().setReturnDate(today, days);
    }
  }, [selectDate, setSelectDate, days]);

  // Persist hasInteracted in sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("hasInteracted", hasInteracted.toString());
    }
  }, [hasInteracted]);

  // Fetch category details
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        setCategoryDetailsLoading(true);
        const categoriesData = await CategoriesService.fetchCategories();
        const matchedCategory = categoriesData.find(
          (cat: any) => cat.URL_Route__c.toLowerCase() === category.toLowerCase()
        );
        if (matchedCategory) {
          setCategoryDetails(matchedCategory);
        } else {
          setError("Category not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch category details.");
      } finally {
        setCategoryDetailsLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [category]);

  const categoryId = categoryDetails?.Id;
  const reservationDay = selectDate;
  const dayIndex = moment(reservationDay).day();
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeek = daysOfWeek[dayIndex];

  // Fetch static items
  const fetchStaticItems = async () => {
    try {
      setLoadingStatic(true);
      const data = await CategoriesItemService.fetchStaticCategoryItems(
        category
      );
      const sortedData = data.sort((a: any, b: any) => {
        const aOrder = a.sortOrder == null ? 999 : Number(a.sortOrder);
        const bOrder = b.sortOrder == null ? 999 : Number(b.sortOrder);
        return aOrder - bOrder || a.Name__c.localeCompare(b.Name__c);
      });
      setStaticCategoryItems(sortedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingStatic(false);
    }
  };

  const checkAndAdjustForHoliday = (
    startEpoch: number,
    rentalDays: number,
    isUserInteraction: boolean = false
  ) => {
    const selectedEndDate = moment(startEpoch)
      .add(rentalDays - 1, "days")
      .valueOf();
    const isHoliday = checkHolidays(startEpoch);

    const overlappingHoliday = holidayList.find((hd: any) => {
      const holidayStart = moment(hd.Start_Date__c).startOf("day").valueOf();
      const holidayEnd = moment(hd.End_Date__c).endOf("day").valueOf();
      const selectedStart = startEpoch;
      return (
        (selectedStart >= holidayStart && selectedStart <= holidayEnd) ||
        (selectedEndDate >= holidayStart && selectedEndDate <= holidayEnd) ||
        (selectedStart <= holidayStart && selectedEndDate >= holidayEnd)
      );
    });

    if (overlappingHoliday) {
      const holidayStartEpoch = moment(overlappingHoliday.Start_Date__c)
        .startOf("day")
        .valueOf();
      const holidayDays = overlappingHoliday.Days__c
        ? parseInt(overlappingHoliday.Days__c, 10)
        : 1;

      if (isUserInteraction && !popupShownRef.current) {
        setPopupMessage(
          overlappingHoliday.Text__c ||
            `Your selected date range includes a holiday period (${
              overlappingHoliday.Header__c
            }). The rental period has been adjusted to start on ${moment(
              holidayStartEpoch
            ).format("MMMM D, YYYY")} with ${holidayDays} rental day(s).`
        );
        setShowPopup(true);
        popupShownRef.current = true;
      }

      setSelectDate(holidayStartEpoch);
      setDays(holidayDays);
      cartStore.getState().setReturnDate(holidayStartEpoch, holidayDays);
      return true;
    } else if (isHoliday) {
      const startEpoch = moment(isHoliday.Start_Date__c).valueOf();
      const holidayDays = isHoliday.Days__c
        ? parseInt(isHoliday.Days__c, 10)
        : 1;

      if (isUserInteraction && !popupShownRef.current) {
        setPopupMessage(isHoliday.Text__c);
        setShowPopup(true);
        popupShownRef.current = true;
      }

      setSelectDate(startEpoch);
      setDays(holidayDays);
      cartStore.getState().setReturnDate(startEpoch, holidayDays);
      return true;
    }
    return false;
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;

    const epoch = date.getTime();
    setHasInteracted(true); // Mark as interacted on any click, including today
    popupShownRef.current = false;
    setSelectDate(epoch);

    console.log("handleDateChange called with date:", epoch);

    // Perform holiday check and adjust date/days if needed
    const adjusted = checkAndAdjustForHoliday(epoch, days, true);

    if (!adjusted) {
      const selectedDay = moment(epoch).day();
      if (selectedDay === 0) {
        const prevSaturday = moment(epoch).subtract(1, "days").valueOf();
        if (!popupShownRef.current) {
          setPopupMessage(
            "Good news! You selected a Sunday. Plan-it Rentals is closed on Sunday, which means this is a free rental day for you! You will need to pick up your item(s) on Saturday morning, and your item(s) will be due back Monday morning before 9:00 AM. Your reservation date will now be set to Saturday."
          );
          setShowPopup(true);
          popupShownRef.current = true;
        }
        setSelectDate(prevSaturday);
        setDays(1);
        cartStore.getState().setReturnDate(prevSaturday, 1);
      } else if (selectedDay === 6) {
        if (!popupShownRef.current) {
          setPopupMessage(
            "You have selected a Saturday rental. Saturday rentals are due Monday by 9 AM, and Sunday is a free rental day because we are closed on Sunday!"
          );
          setShowPopup(true);
          popupShownRef.current = true;
        }
        setSelectDate(epoch);
        setDays(1);
        cartStore.getState().setReturnDate(epoch, 1);
      } else {
        if (holiday) setDays(1);
        cartStore.getState().setReturnDate(epoch, days);
      }
    }
  };

  const handleCalendarClose = () => {
    if (selectDate) {
      setHasInteracted(true); // Ensure interaction is marked
      console.log("handleCalendarClose called with selectDate:", selectDate);
      const adjusted = checkAndAdjustForHoliday(selectDate, days, true);
      if (!adjusted) {
        cartStore.getState().setReturnDate(selectDate, days);
      }
    }
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDays = parseInt(e.target.value);
    setDays(newDays);
    setHasInteracted(true); // Mark user interaction
    popupShownRef.current = false;
  };

  const handleItemClick = (urlRoute: string, name: string, linkUrl: string) => {
    router.push(`/${categoryDetails?.URL_Route__c}/${urlRoute}`, {
      // In Next.js, state passing might need alternative like query params or context
    });
  };

  useEffect(() => {
    if (!selectDate || !hasInteracted) {
      // console.log("Holiday check skipped: hasInteracted is false");
      return;
    }
    // console.log("Holiday check triggered: hasInteracted is true");
    const adjusted = checkAndAdjustForHoliday(selectDate, days, true);
    if (!adjusted) {
      cartStore.getState().setReturnDate(selectDate, days);
    }
  }, [days, selectDate, holidayList, holiday, checkHolidays, hasInteracted]);

  const dayClassName = (date: Date) => {
    const todayEpoch = moment().startOf("day").valueOf();
    const dateEpoch = moment(date).startOf("day").valueOf();
    if (dateEpoch < todayEpoch) return "previous-date";
    return "";
  };

  const getPricing = (weekdayCost: number, weekendCost: number) =>
    !weekdayCost && !weekendCost
      ? "Pricing not found"
      : weekdayCost === weekendCost
      ? `$${weekdayCost}/day`
      : `$${weekdayCost}/day, $${weekendCost} Fri or Sat`;

  const buildBannerIcons = (item: any) => {
    if (!item?.detail?.Banner_Items__c && !item?.Banner_Items__c) return [];
    const iconMappings = {
      "1 Person": { helpText: "Requires 1 person", icon: "person" },
      "2 People": { helpText: "Requires 2 people", icon: "people" },
      "3 People": { helpText: "Requires 3 people", icon: "groups" },
      "4 People": { helpText: "Requires 4 people", icon: "group add" },
      "Wet Use": { helpText: "Wet Use Allowed", icon: "water_drop" },
      "Dry Use": { helpText: "Dry Use Allowed", icon: "sunny" },
      Car: { helpText: "Can Fit In a Car", icon: "directions_car" },
      Van: { helpText: "Can Fit In a Van", icon: "airport_shuttle" },
      SUV: { helpText: "Can Fit In an SUV", icon: "local_shipping" },
      Truck: { helpText: "Can Fit In a Truck", icon: "fire_truck" },
      "Ball Pit": { helpText: "Is a ball pit bouncer", icon: "circle" },
    };
    return Object.entries(iconMappings)
      .filter(([key]) =>
        (item.detail?.Banner_Items__c || item.Banner_Items__c || "").includes(
          key
        )
      )
      .map(([, value]) => value);
  };

  useEffect(() => {
    fetchStaticItems();
  }, [category]);

  useEffect(() => {
    const fetchDiscountAndPickupData = async () => {
      try {
        if (!incomingLocation) return;
        const data = await CartService.getlocationData(
          incomingLocation,
          dayOfWeek,
          moment(reservationDay).toISOString().split("T")[0]
        );
        setHolidayList(data.holidayList);
        setSalesTax(data.accountDetails.Sales_Tax__c);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDiscountAndPickupData();
  }, [incomingLocation, reservationDay, dayOfWeek]);

  useEffect(() => {
    const fetchCategoryItemsData = async () => {
      if (categoryDetailsLoading) {
        setLoadingDynamic(false);
        return;
      }
      if (!categoryId) {
        router.push("/", { scroll: false });
        return;
      }
      if (!selectDate || !days || !hasInteracted) {
        // console.log("Availability check skipped: hasInteracted is false");
        setLoadingDynamic(false);
        return;
      }
      // console.log("Availability check triggered: hasInteracted is true");

      setLoadingDynamic(true);
      try {
        const inputData = {
          incomingCategory: categoryId,
          incomingDateRange: cartStore
            .getState()
            .generateDateRange(selectDate, days),
          incomingLocation,
        };
        let data = await CategoriesItemService.fetchCategoryItems(inputData);
        data.sort((a: any, b: any) =>
          a.sortOrder === null
            ? 1
            : b.sortOrder === null
            ? -1
            : a.sortOrder - b.sortOrder
        );
        data = data.map((item: any) => ({
          ...item,
          detail: {
            ...item.detail,
            URL_Route__c: item.detail.URL_Route__c?.toLowerCase(),
          },
        }));
        setCategoryItems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingDynamic(false);
      }
    };
    fetchCategoryItemsData();
  }, [
    categoryId,
    selectDate,
    days,
    incomingLocation,
    categoryDetailsLoading,
    hasInteracted,
  ]);

  return (
    <>
      <Meta
        title={`${
          categoryDetails?.Name__c || "Category"
        } Rentals in Utah | Plan-it Rentals`}
        description={`${
          categoryDetails?.Name__c || "Category"
        } Rentals in Utah - Explore affordable and high-quality ${
          categoryDetails?.Name__c || "items"
        } with Plan-it Rentals. Perfect for parties, school events, or corporate gatherings. Book your ${
          categoryDetails?.Name__c || "items"
        } in American Fork, Utah today! Call Now 801-319-5524`}
        keywords="Party Rentals, Equipment Rentals"
        ogTitle={`${
          categoryDetails?.Name__c || "Category"
        } Rentals in Utah | Plan-it Rentals`}
        ogDescription={`${
          categoryDetails?.Name__c || "Category"
        } Rentals in Utah - Explore affordable and high-quality ${
          categoryDetails?.Name__c || "items"
        } with Plan-it Rentals. Perfect for parties, school events, or corporate gatherings. Book your ${
          categoryDetails?.Name__c || "items"
        } in American Fork, Utah today! Call Now 801-319-5524`}
        ogUrl={`https://www.planitrentals.com/${categoryDetails?.URL_Route__c?.toLowerCase()}`}
        canonicalUrl={`https://www.planitrentals.com/${categoryDetails?.URL_Route__c?.toLowerCase()}`}
        ogType="website"
        ogSiteName="Planitrentals"
        priceAmount={maxPriceNumeric || 0}
        priceCurrency="USD"
        structuredData={structuredData}
      />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />

      <div className="min-h-screen">
        <div className="page-header md:mt-[100px] breadcrumb-wrap mb-7">
          <div className="flex flex-wrap gap-2 text-sm font-semibold pirBlue--text mt-2 md:mt-0">
            <Link href="/" className="pirGreen--text">
              Home
            </Link>
            <span>
              <FaGreaterThan className="mt-1" />
            </span>
            <Link href={`/${categoryDetails?.URL_Route__c?.toLowerCase()}`}>
              {categoryDetails?.Name__c || "Category"}
            </Link>
          </div>
        </div>

        <div className="px-4 md:px-8">
          <h1 className="text-2xl md:text-3xl font-bold pirBlue--text text-center mb-4">
            {categoryDetails?.Name__c || "Category"} Rentals
          </h1>
          {categoryDetails?.Name__c === "Bounce Houses" && (
            <>
              <h2 className="text-2xl md:text-3xl font-bold pirBlue--text text-center mb-4">
                A New Approach To The Bounce House Industry!
              </h2>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6 fade-in-out max-w-4xl mx-auto">
                <p className="pirBlue--text text-justify font-semibold text-md leading-relaxed">
                  We believe the bounce house industry is not practical for a
                  kids backyard party. Beyond the prices being incredibly
                  expensive, you have 2-4 guys coming into your yard to deliver
                  a massively heavy unit for just a couple hours of use, and
                  then you have to wait around while they deflate and take it
                  away. All of our inflatables are custom built for our company.
                  We have unique designs that no other company has, and they are
                  built to be incredibly durable and lightweight for easy
                  transportation! Come pickup a unit in the morning (loaded by
                  our staff) and return the next morning (unloaded by our
                  staff). Setup is a breeze, and we include everything you need
                  with an instructional video. Come see how we’ve become Utah’s
                  top rental company with thousands and thousands of rentals
                  under our belt!
                </p>
                <div className="flex flex-col md:flex-row items-center gap-2 mt-4 border-2 border-green-400">
                  <ul className="list-disc list-inside p-4 pirBlue--text font-semibold text-md flex-1">
                    <li>The Best Prices You'll Find</li>
                    <li>Lightweight & Easy To Setup</li>
                    <li>
                      All Day Rentals (Saturday renters get Sunday for free!)
                    </li>
                    <li>
                      Super Fast Pickup & Dropoff (in and out in under 5 mins,
                      usually less!)
                    </li>
                    <li>
                      Setup on your schedule without the worry of late arrivals
                      and long installs
                    </li>
                    <li>No intrusive setups with strangers in your yard</li>
                    <li>Custom & Unique Designs only our company has!</li>
                  </ul>
                  <Image
                    src={star}
                    alt="Green Star Highlight"
                    className="w-[100px] h-[100px] md:w-[100px] md:h-[100px] object-contain p-2 md:mr-6"
                  />
                </div>
              </div>
            </>
          )}

          <div className="mx-auto">
            <div className="ml-4">
              <div className="pb-4 max-w-xl bg-white">
                <h2 className="text-lg md:text-2xl font-bold text-red-600 mt-8">
                  Step 1 - Select Your Rental Date:
                </h2>
                <div className="flex flex-row md:flex-row items-center gap-5 mt-4">
                  <DatePicker
                    selected={
                      selectDate && hasInteracted ? new Date(selectDate) : null
                    }
                    onChange={handleDateChange}
                    onSelect={handleDateChange}
                    onCalendarClose={handleCalendarClose}
                    minDate={new Date()}
                    dayClassName={dayClassName}
                    dateFormat="EEEE, MMMM d, yyyy"
                    placeholderText={
                      hasInteracted ? "Select Date" : "Select Date"
                    }
                    className="pirBlue--text w-[190px] text-base md:text-md md:w-[220px] border-b border-gray-300 px-2"
                    dropdownMode="select"
                    popperPlacement="bottom-start"
                  />
                  <select
                    name="days"
                    value={days}
                    onChange={handleDaysChange}
                    className="w-[100px] pirBlue--text border-b border-gray-300 px-2 py-1 text-base md:text-md"
                    disabled={holiday}
                  >
                    {Array.from({ length: 50 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day} {day === 1 ? "day" : "days"}
                      </option>
                    ))}
                  </select>
                </div>
                <h2 className="text-lg md:text-2xl font-bold text-red-600 mt-8">
                  Step 2 - Select Your Rental Items:
                </h2>
              </div>
            </div>
          </div>
          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10">
              <div className="bg-white mt-[100px] w-[90%] max-w-[550px] max-h-[70vh] overflow-auto rounded-lg shadow-lg">
                <p className="text-md pirBlue--text text-justify p-4">
                  {popupMessage}
                </p>
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-2 py-1 m-4 text-[15px] mt-2 text-white rounded-md addbtn tracking-[0.1em] hover:text-blue-800 uppercase"
                >
                  close
                </button>
              </div>
            </div>
          )}

          {loadingStatic ? (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
              {Array(5)
                .fill()
                .map((_, index) => (
                  <SkeletonLoader key={index} />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
              {staticCategoryItems.map((staticItem: any) => {
                const dynamicItem = categoryItems.find(
                  (item: any) => item.detail.URL_Route__c === staticItem.URL_Route__c
                );
                const details = dynamicItem?.detail || staticItem;
                const imageUrl =
                  staticItem?.image_url ||
                  "https://pirstore.s3.us-west-2.amazonaws.com/pirstore/ComingSoon.jpg";
                const imageName = staticItem?.images?.[0]?.url
                  ? details.Name__c
                  : "No Image Available";
                const price = getPricing(
                  staticItem.Weekday_Cost__c,
                  staticItem.Weekend_Cost__c
                );
                const iconMap = buildBannerIcons(staticItem);
                const hrefURL = `/${
                  categoryDetails?.URL_Route__c || category
                }/${staticItem.URL_Route__c}`;

                return (
                  <div key={staticItem.Id} className="category-items">
                    {staticItem.Discount_Eligible__c == 1 ? (
                      <div className="discount-badge mt-2">
                        <p className="flex items-center px-2 py-1 pirGreen--text bg-yellow-300 text-[12px] md:text-[13px] lg:text-[15px] text-center rounded-lg">
                          <MdSavings className="pr-1 text-[12px] md:text-[13px] lg:text-[17px] pb-[3px]" />
                          50% off with another item!
                        </p>
                      </div>
                    ) : null}
                    {!loadingDynamic &&
                      hasInteracted &&
                      dynamicItem &&
                      !dynamicItem.availableByDay?.isAvailable && (
                        <div className="flex flex-row justify-center m-2">
                          <p className="flex items-center px-2 py-1 text-white bg-red-500 text-[12px] md:text-[13px] lg:text-[11px] text-center rounded-lg">
                            <FaExclamationTriangle className="mr-1 font-bold text-[12px] md:text-[15px] lg:text-[13px] pb-[3px]" />
                            Unavailable for the selected date(s)
                          </p>
                        </div>
                      )}
                    <div className="image-container">
                      <Link
                        href={hrefURL}
                        onClick={(e) => {
                          e.preventDefault();
                          handleItemClick(
                            staticItem.URL_Route__c,
                            staticItem.Name__c,
                            staticItem.Link_URL__c
                          );
                        }}
                      >
                        <Image
                          src={imageUrl}
                          alt={imageName}
                          width={400}
                          height={250}
                          className="image-items"
                          style={{ cursor: "pointer" }}
                        />
                      </Link>
                    </div>
                    <div className="flex justify-center gap-1">
                      {iconMap.map((b: any, index: number) => {
                        const IconComponent = iconComponents[b.icon] || null;
                        return (
                          IconComponent && (
                            <div key={index} className="itemicons relative">
                              <span className="icon-container">
                                <IconComponent />
                              </span>
                              <span className="help-text">{b.helpText}</span>
                            </div>
                          )
                        );
                      })}
                    </div>
                    <div className="p-2">
                      <h4
                        className="text-lg font-bold pirBlue--text text-center"
                        onClick={() =>
                          handleItemClick(
                            staticItem.URL_Route__c,
                            staticItem.Name__c,
                            staticItem.Link_URL__c
                          )
                        }
                      >
                        <Link
                          href={hrefURL}
                          rel="noopener noreferrer"
                          style={{
                            cursor: "pointer",
                            textDecoration: "none",
                            color: "inherit",
                          }}
                        >
                          {staticItem.Name__c || "Unnamed Item"}
                        </Link>
                      </h4>
                      <p className="text-sm text-green-500 font-semibold mt-1 text-center">
                        {price}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <h2 className="text-lg md:text-3xl font-bold pirBlue--text text-center mb-4">
            {categoryDetails?.Name__c || "Category"} Rentals in Utah
          </h2>
          {categoryDetails?.SEO__c && (
            <div
              className="category-items text-justify pirBlue--text p-2 mb-3"
              dangerouslySetInnerHTML={{ __html: categoryDetails.SEO__c }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default RentalItemsPage;