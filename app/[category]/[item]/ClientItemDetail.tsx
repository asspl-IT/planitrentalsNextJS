"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaGreaterThan, FaShuttleVan, FaExclamationTriangle } from "react-icons/fa";
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

import Meta from "@/components/Meta";
import { ItemDetailsService } from "@/services/ItemDetailsService";
import { CategoriesItemService } from "@/services/CategoriesItemService";
import { CategoriesService } from "@/services/CategoriesService";
import { CartService } from "@/services/CartService";
import { locationLoader } from "@/config/locationLoader";
import { useCart } from "@/context/cartContext";
import { cartStore } from "@/zustand/cartStore";

/** ---------- Helper: allow both static and dynamic image structures ---------- */
const FALLBACK_IMAGE = "/coming-soon.png"; // ensure this exists in /public

const ALLOWED_IMAGE_HOSTS = ["pirstore.s3.us-west-2.amazonaws.com", "planitrentals.com", "pirstore.s3.amazonaws.com"];

/** Validate and return a safe URL (or fallback) */
function getSafeImageUrl(imageUrl?: string, fallback = FALLBACK_IMAGE) {
  if (!imageUrl) return fallback;
  if (imageUrl.startsWith("/")) return imageUrl;
  try {
    const url = new URL(imageUrl);
    return ALLOWED_IMAGE_HOSTS.some((d) => url.hostname.includes(d)) ? imageUrl : fallback;
  } catch {
    return fallback;
  }
}

/** Extract an image URL from either structure at a given index */
function pickImageUrl(
  source: any,
  index = 0
): string | undefined {
  if (!source) return undefined;

  // Dynamic (Salesforce) style
  const dyn = source?.Images__r?.records?.[index]?.Original_Image_URL__c;
  if (dyn) return dyn;

  // Static JSON style
  const stat = source?.images?.[index]?.url;
  if (stat) return stat;

  // Some sources store a single top-level image_url
  const single = source?.image_url;
  if (single) return single;

  return undefined;
}

/** Build SEO structured data */
function buildStructuredData(staticItemDetail: any, itemDetail: any) {
  const first =
    pickImageUrl(itemDetail?.detail, 0) ||
    pickImageUrl(staticItemDetail, 0) ||
    FALLBACK_IMAGE;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: staticItemDetail?.Name__c || itemDetail?.detail?.Name__c || "Item",
    image: getSafeImageUrl(first),
    description: `${staticItemDetail?.Name__c || itemDetail?.detail?.Name__c || "Item"} Rentals starting at $${staticItemDetail?.Weekday_Cost__c || itemDetail?.detail?.Weekday_Cost__c || 0}/day.`,
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: staticItemDetail?.Weekday_Cost__c || itemDetail?.detail?.Weekday_Cost__c || 0,
      availability: itemDetail?.availableByDay?.isAvailable ? "http://schema.org/InStock" : "http://schema.org/OutOfStock",
    },
  };
}

/** Icons map */
const ICONS: Record<string, any> = {
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

/** Convert banner string to icon+help list */
function buildBannerIcons(bannerItems?: string) {
  if (!bannerItems) return [];
  const mappings: Record<string, { helpText: string; icon: keyof typeof ICONS }> = {
    "1 Person": { helpText: "Requires 1 person", icon: "person" },
    "2 People": { helpText: "Requires 2 people", icon: "people" },
    "3 People": { helpText: "Requires 3 people", icon: "groups" },
    "4 People": { helpText: "Requires 4 people", icon: "group add" },
    "Wet Use": { helpText: "Wet Use Allowed", icon: "water_drop" },
    "Dry Use": { helpText: "Dry Use Allowed", icon: "sunny" },
    Car: { helpText: "Fits in Car", icon: "directions_car" },
    Van: { helpText: "Fits in Van", icon: "airport_shuttle" },
    SUV: { helpText: "Fits in SUV", icon: "local_shipping" },
    Truck: { helpText: "Fits in Truck", icon: "fire_truck" },
    "Ball Pit": { helpText: "Ball Pit Bouncer", icon: "circle" },
  };
  return Object.entries(mappings)
    .filter(([key]) => bannerItems.includes(key))
    .map(([, v]) => v);
}

/** Human-friendly pricing */
function displayPricing(weekday?: number, weekend?: number) {
  if (!weekday && !weekend) return "Pricing not available";
  if (weekday === weekend) return `$${weekday}/day`;
  return `$${weekday}/day, $${weekend} Fri/Sat`;
}

/** Skeleton Loader (small) */
const SkeletonBlock = () => (
  <div className="animate-pulse">
    <div className="w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] bg-gray-200 rounded" />
    <div className="mt-4">
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
      <div className="h-4 bg-gray-200 rounded w-1/4 mt-2" />
    </div>
  </div>
);

export default function ClientItemDetail({
  staticItemDetail,
  params,
}: {
  staticItemDetail: any;
  params: { category: string; item: string };
}) {
  const router = useRouter();
  const { category: categorySlug, item: itemSlug } = params;

  const { LOCATION } = locationLoader();
  const incomingLocation = LOCATION.UT_LOCATION_ID;

  // cart + date store
  const { state, dispatch } = useCart() as {
  state: any;
  dispatch: any;
};

  const {
    setDiscountList,
    setSalesTax,
    selectDate,
    days,
    setSelectDate,
    setDays,
    generateDateRange,
    setHolidayList,
    holiday,
    checkHolidays,
    holidayList,
  } = cartStore();

  // local UI state
  const [itemDetail, setItemDetail] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingDynamic, setLoadingDynamic] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [showBookingIssue, setShowBookingIssue] = useState(false);
  const [showAddonDialog, setShowAddonDialog] = useState(false);
  const [showAcknowledgement, setShowAcknowledgement] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [availabilityPopup, setAvailabilityPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const [hasInteracted, setHasInteracted] = useState(
    typeof window !== "undefined" && sessionStorage.getItem("hasInteracted") === "true"
  );
  const popupShownRef = useRef(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const daysOptions = useMemo(() => Array.from({ length: 50 }, (_, i) => i + 1), []);

  // Accordion sections
  const [isOpen, setIsOpen] = useState({
    generalInfo: false,
    instructions: false,
    cancellation: false,
  });
  const toggleSection = (section: string) =>
    setIsOpen((prev) => ({ ...prev, [section]: !prev[section as keyof typeof prev] }));

  /** ---------- Holiday + Sunday/Saturday adjustment ---------- */
  const checkAndAdjustForHoliday = (startEpoch: number, rentalDays: number, byUser = false) => {
    const selectedEnd = moment(startEpoch).add(rentalDays - 1, "days").valueOf();

    const overlapping = holidayList.find((h: any) => {
      const hs = moment(h.Start_Date__c).startOf("day").valueOf();
      const he = moment(h.End_Date__c).endOf("day").valueOf();
      return (
        (startEpoch >= hs && startEpoch <= he) ||
        (selectedEnd >= hs && selectedEnd <= he) ||
        (startEpoch <= hs && selectedEnd >= he)
      );
    });

    if (overlapping) {
      const adjStart = moment(overlapping.Start_Date__c).startOf("day").valueOf();
      const adjDays = parseInt(overlapping.Days__c, 10) || 1;
      if (byUser && !popupShownRef.current) {
        setPopupMessage(
          overlapping.Text__c ||
            `Adjusted to ${moment(adjStart).format("MMMM D, YYYY")} for ${adjDays} day(s).`
        );
        setShowPopup(true);
        popupShownRef.current = true;
      }
      setSelectDate(adjStart);
      setDays(adjDays);
      cartStore.getState().setReturnDate(adjStart, adjDays);
      return true;
    }
    return false;
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    const epoch = date.getTime();
    setHasInteracted(true);
    sessionStorage.setItem("hasInteracted", "true");
    popupShownRef.current = false;
    setSelectDate(epoch);

    // holiday adjust
    const adjusted = checkAndAdjustForHoliday(epoch, days, true);
    if (adjusted) return;

    const day = moment(epoch).day();
    if (day === 0) {
      const sat = moment(epoch).subtract(1, "day").valueOf();
      if (!popupShownRef.current) {
        setPopupMessage("Sunday is free! Pickup Saturday, return Monday.");
        setShowPopup(true);
        popupShownRef.current = true;
      }
      setSelectDate(sat);
      setDays(1);
      cartStore.getState().setReturnDate(sat, 1);
    } else if (day === 6) {
      if (!popupShownRef.current) {
        setPopupMessage("Saturday rentals due Monday by 9 AM. Sunday is free!");
        setShowPopup(true);
        popupShownRef.current = true;
      }
      setSelectDate(epoch);
      setDays(1);
      cartStore.getState().setReturnDate(epoch, 1);
    } else {
      cartStore.getState().setReturnDate(epoch, days);
    }
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDays = parseInt(e.target.value);
    setDays(newDays);
    setHasInteracted(true);
    sessionStorage.setItem("hasInteracted", "true");
    popupShownRef.current = false;

    if (selectDate) {
      const adjusted = checkAndAdjustForHoliday(selectDate, newDays, true);
      if (!adjusted) cartStore.getState().setReturnDate(selectDate, newDays);
    }
  };

  /** ---------- Add to cart flow ---------- */
  const handleAddToCartClick = () => {
    const qty = parseInt((document.getElementById("quantity") as HTMLInputElement).value);
    const existing = state.items.find((i) => i.id === itemDetail.detail.Id);
    const total = (existing?.quantity || 0) + qty;
    const limit = itemDetail?.availableByDay?.minimumAvailable || 0;

    if (total > limit) {
      setShowBookingIssue(true);
      setPopupMessage(`Only ${limit} available. You have ${existing?.quantity || 0} in cart.`);
      return;
    }
    if (!itemDetail?.availableByDay?.isAvailable) {
      setShowAcknowledgement(true);
      setPopupMessage("Item not available for selected dates.");
      return;
    }
    setShowAcknowledgement(true);
  };

  const addItemToCart = async () => {
    const qty = parseInt((document.getElementById("quantity") as HTMLInputElement).value);
    const existing = state.items.find((i) => i.id === itemDetail.detail.Id);
    const total = (existing?.quantity || 0) + qty;

    try {
      setIsAddingToCart(true);
      const fresh = await ItemDetailsService.fetchItemDetails(itemDetail.detail.Id, {
        incomingCategory: itemDetail.category.Id,
        incomingDateRange: generateDateRange(selectDate, days),
        incomingLocation,
      });

      const limit = fresh.availableByDay?.minimumAvailable || 0;
      if (total > limit || !fresh.availableByDay?.isAvailable) {
        setShowBookingIssue(true);
        setPopupMessage(`Only ${limit} available.`);
        setIsAddingToCart(false);
        return;
      }

      const finalAddons =
        selectedAddons.length > 0
          ? itemDetail.costSetUpList
              .map((c: any) => {
                const a = selectedAddons.find((x: any) => x.id === c.Id);
                return (
                  a || {
                    id: c.Id,
                    quantity: 0,
                    description: c.Website_Description__c,
                    amount: c.Amount__c,
                  }
                );
              })
              .filter((a: any) => a.quantity > 0)
          : [];

      dispatch({
        type: "ADD_TO_CART",
        payload: {
          id: itemDetail.detail.Id,
          name: itemDetail.detail.Name__c,
          price: 0,
          originalWeekdayPrice: itemDetail.detail.Weekday_Cost__c,
          originalWeekendPrice: itemDetail.detail.Weekend_Cost__c,
          quantity: qty,
          addons: finalAddons,
          Images__URL: getSafeImageUrl(pickImageUrl(itemDetail.detail, 0)),
          containerUnits: itemDetail.detail.Container_Units__c,
          categoryId: itemDetail.category.Id,
          Discount_Eligible__c: itemDetail.detail.Discount_Eligible__c,
          maxQuantity: limit,
        },
      });

      setShowAddonDialog(false);
      setIsAddingToCart(false);
    } catch {
      setShowBookingIssue(true);
      setPopupMessage("Failed to validate availability.");
      setIsAddingToCart(false);
    }
  };

  /** ---------- Lifecycle ---------- */

  // Initialize default date
  useEffect(() => {
    if (!selectDate) {
      const today = moment().startOf("day").valueOf();
      setSelectDate(today);
      setDays(1);
      cartStore.getState().setReturnDate(today, 1);
    }
  }, [selectDate, setSelectDate, setDays]);

  // Load discounts & holidays for selected date
  useEffect(() => {
    const load = async () => {
      if (!incomingLocation || !selectDate) return;
      const day = new Date(selectDate).getDay();
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const data = await CartService.getLocationData(
        incomingLocation,
        daysOfWeek[day],
        new Date(selectDate).toISOString().split("T")[0]
      );
      setHolidayList(data.holidayList);
      setDiscountList(data.discountList);
      setSalesTax(data.accountDetails.Sales_Tax__c);
    };
    load();
  }, [incomingLocation, selectDate, setHolidayList, setDiscountList, setSalesTax]);

  // Dynamic availability + item details
  useEffect(() => {
    const fetchAll = async () => {
      if (!hasInteracted || !selectDate || !days) {
        setLoadingDynamic(false);
        return;
      }
      if (isAddingToCart) return;

      setLoadingDynamic(true);
      try {
        const cats = await CategoriesService.fetchCategories(incomingLocation);
        const cat = cats.find((c: any) => c.URL_Route__c.toLowerCase() === categorySlug);
        if (!cat) throw new Error("Category not found");

        const items = await CategoriesItemService.fetchCategoryItems({
          incomingCategory: cat.Id,
          incomingDateRange: generateDateRange(selectDate, days),
          incomingLocation,
        });

        const item = items.find((i: any) => i.detail.URL_Route__c?.toLowerCase() === itemSlug);
        if (!item) throw new Error("Item not found");

        const details = await ItemDetailsService.fetchItemDetails(item.detail.Id, {
          incomingCategory: cat.Id,
          incomingDateRange: generateDateRange(selectDate, days),
          incomingLocation,
        });

        setItemDetail({
          ...details,
          detail: {
            ...details.detail,
            URL_Route__c: details.detail.URL_Route__c?.toLowerCase(),
          },
          category: {
            ...details.category,
            URL_Route__c: details.category.URL_Route__c?.toLowerCase(),
          },
        });

        if (!details.availableByDay?.isAvailable) {
          setAvailabilityPopup(true);
          setPopupMessage("Not available for selected dates.");
        } else {
          setAvailabilityPopup(false);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingDynamic(false);
      }
    };
    fetchAll();
  }, [
    hasInteracted,
    selectDate,
    days,
    categorySlug,
    itemSlug,
    incomingLocation,
    isAddingToCart,
    generateDateRange,
  ]);

  // Image carousel auto-advance
  useEffect(() => {
    const total =
      (staticItemDetail?.Images__r?.records?.length ||
        staticItemDetail?.images?.length ||
        itemDetail?.detail?.Images__r?.records?.length ||
        1) ?? 1;

    const id = setInterval(() => setCurrentImageIndex((i) => (i + 1) % total), 3000);
    return () => clearInterval(id);
  }, [itemDetail, staticItemDetail]);

  // Persist interaction flag
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("hasInteracted", hasInteracted ? "true" : "false");
    }
  }, [hasInteracted]);

  if (error) return <div className="text-red-600 text-center py-10">Error: {error}</div>;

  // Primary image URL (unified)
  const mainImageUrl = getSafeImageUrl(
    pickImageUrl(staticItemDetail, currentImageIndex) ||
      pickImageUrl(itemDetail?.detail, currentImageIndex)
  );

  const structuredData = buildStructuredData(staticItemDetail, itemDetail);

  return (
    <>
      <Meta
        title={`${staticItemDetail?.Name__c || itemDetail?.detail?.Name__c || "Item"} | $${staticItemDetail?.Weekday_Cost__c || itemDetail?.detail?.Weekday_Cost__c || 0}/day | Plan-it Rentals`}
        description={staticItemDetail?.Store_Description__c?.slice(0, 160)}
        ogImage={mainImageUrl}
        structuredData={structuredData}
        canonicalUrl={`https://www.planitrentals.com/${categorySlug}/${itemSlug}`}
      />

      {/* Breadcrumbs */}
      <div className="page-header md:mt-[100px] breadcrumb-wrap mb-5">
        <div className="flex flex-wrap gap-1 text-sm font-semibold pirBlue--text">
          <Link href="/" className="pirGreen--text">Home</Link>
          <FaGreaterThan className="mt-1" />
          <Link
            href={`/${itemDetail?.category?.URL_Route__c || categorySlug}`}
            className="pirGreen--text"
          >
            {itemDetail?.category?.Name__c || "Category"}
          </Link>
          <FaGreaterThan className="mt-1" />
          <span className="text-blue-900">{staticItemDetail?.Name__c || itemDetail?.detail?.Name__c || "Item"}</span>
        </div>
      </div>

      {/* Date + Days */}
      <div className="">
        <div className="mx-auto">
          <div className="ml-4 pb-4 max-w-xl bg-white">
            <h2 className="text-lg md:text-2xl font-bold text-red-600 mt-8">
              Step 1 - Select Your Rental Date:
            </h2>
            <div className="flex gap-5 mt-4">
              <DatePicker
                selected={selectDate && hasInteracted ? new Date(selectDate) : null}
                onChange={handleDateChange}
                minDate={new Date()}
                dateFormat="EEEE, MMMM d, yyyy"
                placeholderText="Select Date"
                className="pirBlue--text w-[220px] border-b border-gray-300 px-2"
              />
              <select
                value={days}
                onChange={handleDaysChange}
                disabled={holiday}
                className="w-[100px] pirBlue--text border-b border-gray-300 px-2 py-1"
              >
                {daysOptions.map((d) => (
                  <option key={d} value={d}>
                    {d} {d === 1 ? "day" : "days"}
                  </option>
                ))}
              </select>
            </div>
            <h2 className="text-lg md:text-2xl font-bold text-red-600 mt-8">
              Step 2 - Select Your Rental Items:
            </h2>
          </div>
        </div>

        {/* Popups */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <p className="text-md pirBlue--text text-justify">{popupMessage}</p>
              <button
                onClick={() => setShowPopup(false)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {availabilityPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <p className="text-md pirBlue--text text-justify">{popupMessage}</p>
              <button
                onClick={() => setAvailabilityPopup(false)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="mt-4 bg-white flex flex-col md:flex-row p-4 md:p-8 gap-6">
          {/* Left: Image + badges */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            {itemDetail?.detail?.Discount_Eligible__c && (
              <p className="flex items-center px-2 py-1 bg-yellow-300 text-green-800 text-sm rounded-lg">
                <MdSavings className="mr-1" /> 50% off with another item!
              </p>
            )}
            {!loadingDynamic && hasInteracted && !itemDetail?.availableByDay?.isAvailable && (
              <p className="flex items-center px-2 py-1 bg-red-500 text-white text-sm rounded-lg">
                <FaExclamationTriangle className="mr-1" /> Unavailable
              </p>
            )}

            {loadingDynamic ? (
              <SkeletonBlock />
            ) : (
              <Image
                src={mainImageUrl}
                alt={staticItemDetail?.Name__c || itemDetail?.detail?.Name__c || "Item"}
                width={400}
                height={400}
                className="object-contain"
                priority
              />
            )}
          </div>

          {/* Right: Details */}
          <div className="w-full md:w-1/2 p-4 border-2 border-gray-200 rounded-lg hover:border-green-300">
            <h1 className="text-3xl font-bold pirBlue--text">
              {staticItemDetail?.Name__c || itemDetail?.detail?.Name__c || "Item"}
            </h1>

            {itemDetail?.category?.Name__c === "Bounce Houses" && (
              <Link href="/bouncehouseFaq" className="text-sm text-green-600 hover:underline">
                Bounce House FAQ
              </Link>
            )}

            <p className="text-green-600 text-lg font-semibold mt-2">
              {displayPricing(staticItemDetail?.Weekday_Cost__c, staticItemDetail?.Weekend_Cost__c)}
            </p>

            <Link href="/holidays" className="text-sm text-green-600 hover:underline">
              *Holiday Schedule
            </Link>

            <div className="mt-4 flex items-center gap-4">
              <input
                type="number"
                id="quantity"
                min={1}
                defaultValue={1}
                className="w-16 p-2 border-b border-gray-300 text-center"
              />
              {loadingDynamic ? (
                <div className="h-10 w-20 bg-gray-200 animate-pulse rounded" />
              ) : !hasInteracted ? (
                <p className="text-gray-400 text-lg font-semibold">Select date to check availability</p>
              ) : itemDetail?.availableByDay?.isAvailable ? (
                <button onClick={handleAddToCartClick} className="px-4 py-2 bg-green-600 text-white rounded">
                  Add
                </button>
              ) : (
                <p className="text-red-600 font-bold">Out of Stock</p>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              {buildBannerIcons(staticItemDetail?.Banner_Items__c || "").map((b: any, i: number) => {
                const Icon = ICONS[b.icon];
                return (
                  Icon && (
                    <div key={i} className="relative group">
                      <Icon className="text-2xl" />
                      <span className="absolute hidden group-hover:block bg-black text-white text-xs p-1 rounded">
                        {b.helpText}
                      </span>
                    </div>
                  )
                );
              })}
            </div>

            <p
              className="mt-6 text-justify text-blue-950"
              dangerouslySetInnerHTML={{
                __html: staticItemDetail?.Store_Description__c || "",
              }}
            />

            {/* Accordion */}
            {(["generalInfo", "instructions", "cancellation"] as const).map((section) => (
              <details key={section} className="mt-4 border border-gray-300 text-blue-950 rounded-lg p-3">
                <summary
                  className="cursor-pointer font-semibold flex justify-between"
                  onClick={() => toggleSection(section)}
                >
                  {section === "generalInfo"
                    ? "General Info"
                    : section === "instructions"
                    ? "Instructions"
                    : "Cancellation Policy"}
                  <span>{isOpen[section] ? "−" : "+"}</span>
                </summary>
                {isOpen[section] && (
                  <p
                    className="mt-2 text-justify"
                    dangerouslySetInnerHTML={{
                      __html:
                        staticItemDetail[
                          section === "generalInfo"
                            ? "General_Info__c"
                            : section === "instructions"
                            ? "Instructional_Videos__c"
                            : "Cancellation_Policy__c"
                        ] || "",
                    }}
                  />
                )}
              </details>
            ))}
          </div>
        </div>

        {/* Popular Addons */}
        {itemDetail?.popularAddonsList?.length > 0 && (
          <div className="mt-10">
            <h3 className="text-2xl font-bold text-center mb-6">Popular With This Item!</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {itemDetail.popularAddonsList.map((addon: any) => {
                const finalUrl =
                  getSafeImageUrl(
                    // try unified mapping if present in payload
                    pickImageUrl(addon, 0) || addon?.imageUrl
                  ) || FALLBACK_IMAGE;

                const toSlug = addon.url?.split("/")?.pop();
                const toCat = itemDetail?.category?.URL_Route__c?.toLowerCase();

                return (
                  <div
                    key={addon.id}
                    onClick={() => {
                      if (toSlug && toCat) router.push(`/${toCat}/${toSlug}`);
                    }}
                    className="cursor-pointer border rounded-lg p-2 hover:shadow-lg"
                  >
                    {addon.discountEligible && (
                      <p className="text-xs bg-yellow-300 text-green-800 rounded text-center">50% off!</p>
                    )}
                    <Image
                      src={finalUrl}
                      alt={addon.itemName || "Addon"}
                      width={200}
                      height={200}
                      className="object-contain"
                    />
                    <h4 className="font-bold text-center">{addon.itemName}</h4>
                    <p className="text-green-600 text-center">
                      {displayPricing(addon.weekdayCost, addon.weekendCost)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Booking Issue Modal */}
      {showBookingIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-red-600 font-bold">Booking Issue</h2>
            <p>{popupMessage}</p>
            <button
              onClick={() => setShowBookingIssue(false)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Acknowledgement Modal */}
      {showAcknowledgement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 max-h-[70vh] overflow-y-auto">
            <h2 className="text-red-600 font-bold">Rental Confirmation</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: itemDetail?.detail?.Acknowledgement__c || "",
              }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowAcknowledgement(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAcknowledgement(false);
                  setShowAddonDialog(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Addon Modal */}
      {showAddonDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 max-h-[70vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-blue-950">Add-on Items</h2>
            {itemDetail?.costSetUpList?.map((c: any) => {
              const qty = selectedAddons.find((a: any) => a.id === c.Id)?.quantity || 0;
              return (
                <div key={c.Id} className="flex justify-between items-center mb-3">
                  <p>
                    {c.Website_Description__c} - ${c.Amount__c}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setSelectedAddons((prev) =>
                          qty - 1 <= 0
                            ? prev.filter((a) => a.id !== c.Id)
                            : prev.map((a) => (a.id === c.Id ? { ...a, quantity: qty - 1 } : a))
                        )
                      }
                      className="px-2 bg-green-600 text-white"
                    >
                      -
                    </button>
                    <input type="text" value={qty} readOnly className="w-10 text-center border" />
                    <button
                      onClick={() =>
                        setSelectedAddons((prev) =>
                          prev.some((a) => a.id === c.Id)
                            ? prev.map((a) => (a.id === c.Id ? { ...a, quantity: qty + 1 } : a))
                            : [...prev, { id: c.Id, description: c.Website_Description__c, amount: c.Amount__c, quantity: 1 }]
                        )
                      }
                      className="px-2 bg-green-600 text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowAddonDialog(false)} className="px-4 py-2 bg-green-600 text-white rounded">
                Cancel
              </button>
              <button onClick={addItemToCart} className="px-4 py-2 bg-green-600 text-white rounded">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
