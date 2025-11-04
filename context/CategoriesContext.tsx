"use client"; // 👈 Required since this file uses React hooks and window object

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { CategoriesService } from "@/services/CategoriesService";
import { locationLoader } from "@/config/locationLoader";

const CategoriesContext = createContext();

// ✅ Custom hook
export const useCategories = () => useContext(CategoriesContext);

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { LOCATION } = locationLoader();

  // ✅ Safe way to access window only on client side
  const locationId = useMemo(() => {
    if (typeof window === "undefined") return LOCATION.UT_LOCATION_ID;
    const path = window.location.pathname;
    return path.startsWith("/cedar-park")
      ? LOCATION.CE_LOCATION_ID
      : LOCATION.UT_LOCATION_ID;
  }, [LOCATION]);

  // ✅ Fetch categories when locationId changes
  useEffect(() => {
  const fetchCategoriesData = async () => {
    setIsLoading(true);
    try {
      const cacheKey = `categories`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        setCategories(JSON.parse(cachedData));
      } else {
        const data = await CategoriesService.fetchCategories(); // ✅ no locationId
        const normalizedData = data.map((category) => ({
          ...category,
          URL_Route__c: category.URL_Route__c?.toLowerCase() || "",
        }));
        sessionStorage.setItem(cacheKey, JSON.stringify(normalizedData));
        setCategories(normalizedData);
      }
    } catch (err) {
      console.error("Categories fetch error:", err);
      setError(err.message || "Failed to fetch categories.");
    } finally {
      setIsLoading(false);
    }
  };

  fetchCategoriesData();
}, []);


  return (
    <CategoriesContext.Provider value={{ categories, isLoading, error }}>
      {children}
    </CategoriesContext.Provider>
  );
};
