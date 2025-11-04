import axios from "axios";

interface CategoryItem {
  Id: string;
  Name__c: string;
  Description__c?: string;
  Weekday_Cost__c?: number;
  Original_Image_URL__c?: string;
  URL_Route__c?: string;
  [key: string]: any;
}

interface CategoryItemsResponse {
  success?: boolean;
  data: CategoryItem[];
}

export class CategoriesItemService {
  /**
   * Fetch dynamic category items (from AWS Lambda / Express)
   * @param data - Request payload with categoryId, dateRange, and locationId
   */
  static async fetchCategoryItems(data: Record<string, any>): Promise<CategoryItem[]> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_AWS_API_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_AWS_API_URL is not defined in environment variables");
      }

      // Ensure correct endpoint (backend route is /dev/categoriesitem)
      const apiEndpoint = `${baseUrl}categoriesitem`;

      console.log("📡 Fetching dynamic items from:", apiEndpoint, "with payload:", data);

      const response = await axios.post<CategoryItemsResponse>(apiEndpoint, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data?.data && Array.isArray(response.data.data)) {
        console.log("✅ Category items fetched:", response.data.data.length);
        return response.data.data;
      } else {
        console.error("⚠️ Unexpected API response for category items:", response.data);
        throw new Error("Invalid response format while fetching category items.");
      }
    } catch (error: any) {
      if (error.response) {
        console.error("❌ API Response Error:", error.response.data);
      } else if (error.request) {
        console.error("❌ No response received from API:", error.request);
      } else {
        console.error("❌ Error setting up request:", error.message);
      }

      throw new Error("Failed to fetch category items. Please try again later.");
    }
  }

  /**
   * Fetch static category items from MySQL by category slug
   */
  static async fetchStaticCategoryItems(categorySlug: string): Promise<CategoryItem[]> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_AWS_BLOGS;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_AWS_BLOG is not defined in environment variables");
      }

      const apiEndpoint = `${baseUrl}categoriesitem/${encodeURIComponent(categorySlug)}`;
      console.log("📡 Fetching static category items from:", apiEndpoint);

      const response = await axios.get<CategoryItemsResponse>(apiEndpoint);

      const items = response.data?.data;

      if (!Array.isArray(items)) {
        console.error(`⚠️ Invalid data for category '${categorySlug}':`, response.data);
        throw new Error(`Invalid category items data received from server.`);
      }

      return items;
    } catch (error) {
      console.error("❌ Failed to fetch static category items:", error);
      throw new Error("Failed to fetch static category items from the API.");
    }
  }
}
