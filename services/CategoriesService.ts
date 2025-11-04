import axios from "axios";

interface Category {
  Id: string;
  Name: string;
  URL_Route__c: string;
  [key: string]: any;
}

interface ApiResponse {
  success: boolean;
  data: Category[];
}

export class CategoriesService {
  static async fetchCategories(): Promise<Category[]> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_AWS_BLOGS;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_AWS_BLOG is not defined in environment variables");
      }

      const apiEndpoint = `${baseUrl}categories`;

      const response = await axios.get<ApiResponse>(apiEndpoint);

      if (response.data?.success && Array.isArray(response.data.data)) {
        console.log("✅ Fetched categories:", response.data.data);
        return response.data.data;
      } else {
        console.error("⚠️ Unexpected API response structure:", response.data);
        throw new Error("Invalid API response format.");
      }
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      throw new Error("Failed to fetch categories.");
    }
  }
}
