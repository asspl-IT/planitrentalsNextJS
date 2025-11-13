"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
import { useCategories } from "../context/CategoriesContext";
import { cartStore } from "@/zustand/cartStore";
import { locationLoader } from "@/config/locationLoader";
import Image from "next/image";
import logo from "@/public/planitrentalsLogo.jpg";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [rentalDropdownOpen, setRentalDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const { LOCATION } = locationLoader();
  const { categories } = useCategories();
  const { setIncomingLocation, totalWithTax, totalItems } = cartStore();
  const locationId = LOCATION.UT_LOCATION_ID;

  useEffect(() => {
    setIncomingLocation(locationId);
  }, [locationId, setIncomingLocation]);

const processedCategories = useMemo(() => {
  if (!categories || categories.length === 0) return [];
  return categories
    .map((category) => ({
      name: category.Name__c,
      path: `/${category.URL_Route__c}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}, [categories]);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Rental Items", path: "#" },
    { name: "Policies", path: "/policies" },
    { name: "Holiday Info", path: "/holidays" },
    { name: "Bounce House FAQ", path: "/bouncehouseFaq" },
    { name: "Contact", path: "/contactus" },
    { name: "Blog", path: "/blog" },
  ];
  console.log("Categories:", categories);
console.log("Processed:", processedCategories);
  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 w-full z-50">
        {/* Top bar */}
        <div className="flex items-center justify-between w-full px-4 py-4 border-b border-gray-200">
          <button
            className="md:hidden text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          <div className="flex justify-center md:justify-start w-full md:w-auto">
            <Link href="/">
              <Image src={logo} alt="Logo" width={160} className="w-36 lg:w-[200px]" />
            </Link>
          </div>

          {/* Cart */}
          <div className="relative pr-9 hidden md:block">
            <Link href="/cart-page">
              <FaShoppingCart className="text-3xl text-green-600" />
              {totalItems > 0 && (
                <>
                  <span className="absolute -top-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                  <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 font-semibold text-green-600">
                    ${totalWithTax.toFixed(2)}
                  </span>
                </>
              )}
              <p className="text-blue-800 text-center">Cart</p>
            </Link>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex justify-between items-center px-6 py-3">
          <ul className="flex space-x-6 font-semibold text-blue-900">
            {menuItems.map(({ name, path }) => (
              <li key={name} className="relative group">
                {name === "Rental Items" ? (
                  <>
                    <button
                      onClick={() => setRentalDropdownOpen(!rentalDropdownOpen)}
                      className="transition duration-300"
                    >
                      {name}
                    </button>
                    {rentalDropdownOpen && (
                      <ul className="absolute left-0 bg-white w-48 shadow-lg mt-2">
                        {processedCategories.map(({ name, path }) => (
                          <li key={name}>
                            <Link
                              href={path}
                              onClick={() => setRentalDropdownOpen(false)}
                              className="block px-4 py-2 hover:text-green-500"
                            >
                              {name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link href={path} className="hover:text-green-500 transition">
                    {name}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="text-green-600 ">
            <a href="tel:8013195524" className="hover:underline font-semibold">
              801-319-5524
            </a>
            <p className="text-sm text-blue-950 text-center">Call or Text Us!</p>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-50">
          <div className="bg-white w-3/4 h-full p-6 shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-2xl text-green-600"
              onClick={() => setMenuOpen(false)}
            >
              <FaTimes />
            </button>

            <ul className="flex flex-col space-y-4 mt-8">
              {menuItems.map(({ name, path }) => (
                <li key={name}>
                  {name === "Rental Items" ? (
                    <>
                      <button
                        onClick={() =>
                          setMobileDropdownOpen(!mobileDropdownOpen)
                        }
                        className="font-semibold text-blue-900"
                      >
                        {name}
                      </button>
                      {mobileDropdownOpen && (
                        <ul className="ml-4 mt-2 space-y-2">
                          {processedCategories.map(({ name, path }) => (
                            <li key={name}>
                              <Link
                                href={path}
                                onClick={() => {
                                  setMobileDropdownOpen(false);
                                  setMenuOpen(false);
                                }}
                                className="block text-sm text-gray-700 hover:text-green-500"
                              >
                                {name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={path}
                      onClick={() => setMenuOpen(false)}
                      className="font-semibold text-blue-900 hover:text-green-500"
                    >
                      {name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
