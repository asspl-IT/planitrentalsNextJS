"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaGreaterThan } from "react-icons/fa6";
import thankYouImage from "@/public/bluelogo.png";
import { cartStore } from "../../zustand/cartStore";

const Thankyou = () => {
  const { orderName } = cartStore();

  return (
    <>
      {/* Breadcrumb */}
      <div className="page-header md:mt-[100px] breadcrumb-wrap mb-7">
        <div className="flex gap-2 text-sm font-semibold mt-2">
          <Link href="/" className="pirGreen--text">
            Home
          </Link>
          <FaGreaterThan className="mt-1" />
          <span className="pirBlue--text">Thanks</span>
        </div>
      </div>

      {/* Main Section */}
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-2">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-lg w-full md:max-w-2xl lg:max-w-3xl">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            ✅ Your Order is Confirmed!
          </h2>
          <p className="text-gray-600 mt-3 text-lg">
            Thank you for shopping with us! 🎉
          </p>

          {/* Display Order ID */}
          <p className="text-gray-700 text-lg font-semibold mt-4">
            Your Order Id:{" "}
            <span className="text-green-600">
              {orderName ? orderName : "N/A"} 📦
            </span>
          </p>

          {/* Illustration */}
          <div className="relative my-8 flex justify-center">
            <Image
              src={thankYouImage}
              alt="Order Confirmed"
              width={400}
              height={240}
              className="rounded-md object-contain"
              priority
            />
          </div>

          {/* Buttons Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md text-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              🏡 Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Thankyou;
