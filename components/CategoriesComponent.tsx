"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoriesService } from "@/services/CategoriesService";

interface Category {
  Id: string;
  Original_Image_URL__c: string;
  Name__c: string;
  URL_Route__c: string;
  Description__c?: string;
}

const CategoryCard = ({ category }: { category: Category }) => {
  const { Id, Original_Image_URL__c, Name__c, URL_Route__c, Description__c } =
    category;
  const itemUrl = `/${URL_Route__c?.toLowerCase() || ""}`;

  return (
    <div key={Id} className="item-container rounded-lg overflow-hidden">
      <Link href={itemUrl} className="block relative w-full h-[300px]">
        <Image
          src={Original_Image_URL__c}
          alt={Name__c || "Category Image"}
          fill
          className="object-cover rounded-lg"
          priority
        />
      </Link>
      <div className="p-4 text-center">
        <Link
          href={itemUrl}
          className="inline-block bg-green-600 px-4 py-2 text-white text-sm rounded hover:bg-green-700 transition"
        >
          Browse Items
        </Link>
        <h4 className="font-extrabold text-blue-950 mt-3 text-xl">{Name__c}</h4>
        {Description__c && (
          <p className="text-gray-700 text-sm mt-1 line-clamp-3">
            {Description__c}
          </p>
        )}
      </div>
    </div>
  );
};

const CategoriesComponent = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showRetry, setShowRetry] = useState<boolean>(false);

  const fetchCategoriesData = async () => {
    setIsLoading(true);
    setShowRetry(false);

    const retryTimer = setTimeout(() => setShowRetry(true), 10000);

    try {
      const cachedData =
        typeof window !== "undefined"
          ? sessionStorage.getItem("categories_all")
          : null;

      let normalizedData: Category[];

      if (cachedData) {
        normalizedData = JSON.parse(cachedData);
      } else {
        const data = await CategoriesService.fetchCategories();
        normalizedData = data.map((category: Category) => ({
          ...category,
          URL_Route__c: category.URL_Route__c?.toLowerCase(),
        }));
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "categories_all",
            JSON.stringify(normalizedData)
          );
        }
      }

      // Sort categories alphabetically
      normalizedData.sort((a, b) =>
        (a.Name__c || "Unnamed Category").localeCompare(
          b.Name__c || "Unnamed Category"
        )
      );

      setCategories(normalizedData);
    } catch (err: any) {
      setError(err.message || "Failed to load categories.");
    } finally {
      clearTimeout(retryTimer);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={fetchCategoriesData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        {showRetry ? (
          <button
            onClick={fetchCategoriesData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        ) : (
          <div className="loader" aria-label="Loading"></div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {categories.map((category) => (
          <CategoryCard key={category.Id} category={category} />
        ))}
      </div>
    </div>
  );
};

export default CategoriesComponent;
