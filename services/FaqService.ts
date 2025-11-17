import axios from "axios";

// ✅ Use Next.js environment variable format
const API_BASE = process.env.NEXT_PUBLIC_AWS_BLOG;
const API_BASES = process.env.NEXT_PUBLIC_AWS_BLOGS;

export const FaqService = {
  fetchFaqsByCategory: async (urlRoute: string) => {
    try {
      // Fetch all categories
      const categoriesResponse = await axios.get(`${API_BASES}categories`);
      console.log("categoriesResponse.data:", categoriesResponse.data);

      // Normalize categories array
      const categories = Array.isArray(categoriesResponse.data)
        ? categoriesResponse.data
        : categoriesResponse.data?.data || [];

      if (!categories || categories.length === 0) {
        console.error("No categories found in response");
        return [];
      }

      // Match category by URL_Route__c
      const category = categories.find(
        (cat: any) => cat.URL_Route__c?.toLowerCase() === urlRoute?.toLowerCase()
      );

      if (!category || !category.Id) {
        console.error("Category not found for URL_Route__c:", urlRoute);
        return [];
      }

      // Fetch FAQs using categoryId
      const response = await axios.get(`${API_BASES}faqs`, {
        params: { categoryId: category.Id },
      });

      return response.data || [];
    } catch (error: any) {
      console.error("❌ Failed to fetch FAQs:", error.message || error);
      return [];
    }
  },
};
