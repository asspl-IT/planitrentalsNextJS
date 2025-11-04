"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaGreaterThan } from "react-icons/fa6";
import Meta from "@/components/Meta";
import { locationLoader } from "@/config/locationLoader";
import { CartService } from "@/services/CartService";
import { cartStore } from "@/zustand/cartStore";

// ✅ Define types for holiday items
interface HolidayItem {
  title: string;
  content: string;
}

const Holidays: React.FC = () => {
  const { LOCATION } = locationLoader();
  const incomingLocation = LOCATION.UT_LOCATION_ID;

  const [holidayItems, setHolidayItems] = useState<HolidayItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { setHolidayList } = cartStore();

  // ✅ Fetch holidays
  useEffect(() => {
    const fetchHolidayData = async () => {
      setLoading(true);
      try {
        const cacheKey = `holidayList_${incomingLocation}`;
        const cachedHolidayList = sessionStorage.getItem(cacheKey);

        if (cachedHolidayList) {
          const parsedList = JSON.parse(cachedHolidayList);
          const formatted = parsedList.map((holiday: any) => ({
            title:
              holiday.Header__c ||
              `${holiday.Name__c} - ${holiday.Start_Date__c}`,
            content: holiday.Description__c || "No details available.",
          }));
          setHolidayItems(formatted);
          setHolidayList(parsedList);
        } else {
          const today = new Date().toISOString().split("T")[0];
          const data = await CartService.getLocationData(
    incomingLocation,
    "Mon",
    today
  );

          const fetchedList = data.holidayList || [];
          const formatted = fetchedList.map((holiday: any) => ({
            title:
              holiday.Header__c ||
              `${holiday.Name__c} - ${holiday.Start_Date__c}`,
            content: holiday.Description__c || "No details available.",
          }));

          setHolidayItems(formatted);
          setHolidayList(fetchedList);
          sessionStorage.setItem(cacheKey, JSON.stringify(fetchedList));
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch holiday data.");
      } finally {
        setLoading(false);
      }
    };

    fetchHolidayData();
  }, [incomingLocation, setHolidayList]);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader" aria-label="Loading"></div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      <Meta
        title="Plan-it Rentals | Holiday Pricing & Details - Utah"
        description="Holiday pricing and details for Plan-it Rentals in Utah. Check rental policies for holidays."
        keywords="Party Rentals, Equipment Rentals, Holiday Pricing"
        ogTitle="Plan-it Rentals | Holiday Pricing & Details - Utah"
        ogDescription="Holiday pricing and details for Plan-it Rentals in Utah. Check rental policies for holidays."
        ogUrl="https://www.planitrentals.com/holidays"
        canonicalUrl="https://www.planitrentals.com/holidays"
      />

      {/* Breadcrumbs */}
      <div className="page-header md:mt-[100px] breadcrumb-wrap mb-7">
        <div className="flex flex-wrap gap-2 text-sm font-semibold text-pirBlue mt-2 md:mt-0">
          <Link href="/" className="text-pirGreen">
            Home
          </Link>
          <span>
            <FaGreaterThan className="mt-1" />
          </span>
          <span>Holiday Pricing & Details</span>
        </div>
      </div>

      {/* Page Content */}
      <div className="container px-4 md:px-8">
        <div className="m-10">
          <p className="text-gray-600 text-center mb-5 px-4 sm:px-0 font-semibold text-xl text-pirBlue">
            <strong>
              Holidays not listed below are regular price, and regular pickup
              (day of rental between 9:30-Noon by appointment) and drop-off
              (before 9:00am the following business day).
            </strong>
          </p>

          {holidayItems.length === 0 ? (
            <p className="text-center text-pirBlue">
              No holidays available for this location.
            </p>
          ) : (
            <div className="space-y-4">
              {holidayItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-green-300 rounded-lg shadow-md"
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full flex justify-between items-center p-4 text-left font-semibold text-pirBlue transition duration-300 ease-in-out hover:bg-gray-100 rounded-lg"
                  >
                    <span>{item.title}</span>
                    <span className="text-lg font-bold">
                      {activeIndex === index ? "−" : "+"}
                    </span>
                  </button>

                  {activeIndex === index && (
                    <div className="p-4 bg-gray-50 text-pirBlue text-sm leading-relaxed border-t border-gray-200 rounded-b-lg text-justify">
                      <p>{item.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Holidays;
