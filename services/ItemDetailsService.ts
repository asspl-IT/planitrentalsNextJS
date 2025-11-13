import axios from "axios";

/**
 * Service for fetching item details (static from MySQL or dynamic from Salesforce).
 */
export class ItemDetailsService {
  /**
   * Fetch static item details from MySQL using URL_Route__c.
   * @param itemSlug - The URL slug of the item (e.g., 'itemname').
   * @returns The static item details from MySQL.
   */
  static async fetchItemDetailsMySql(itemSlug: string): Promise<any> {
  try {
    // ✅ Use SSR-safe env variable first, fallback to NEXT_PUBLIC for client-side use
    const baseUrl = process.env.NEXT_PUBLIC_AWS_BLOGS;

    if (!baseUrl) {
      throw new Error("AWS_BLOGS_URL is not defined in environment variables");
    }

    const apiEndpoint = `${baseUrl}items/${itemSlug}`;
    console.log("📡 Fetching static item details from:", apiEndpoint);

    const response = await axios.get(apiEndpoint, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.data) throw new Error("Item not found.");
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch static item details from MySQL:", error);

    if (error.response?.status === 404) {
      throw new Error("Item not found.");
    } else if (error.response) {
      throw new Error(
        `Error ${error.response.status}: ${error.response.statusText}`
      );
    } else if (error.request) {
      throw new Error("No response received from the server.");
    } else {
      throw new Error(`Server request failed: ${error.message}`);
    }
  }
}

  /**
   * Fetch dynamic item details from Salesforce API.
   */
  static async fetchItemDetails(
    itemId: string,
    locationData: {
      incomingCategory: string;
      incomingDateRange: Array<any>;
      incomingLocation: string;
    }
  ): Promise<any> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_AWS_API_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_AWS_API_URL is not defined in environment variables");
      }

      const apiEndpoint = "/aws/itemdetails";

      const payload = {
        incomingCategory: locationData.incomingCategory,
        incomingDateRange: locationData.incomingDateRange,
        incomingLocation: locationData.incomingLocation,
        incomingItem: itemId,
      };

      console.log("📡 Fetching dynamic item details from:", apiEndpoint, "Payload:", payload);

      const response = await axios.post(apiEndpoint, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error("Failed to fetch item details:", error);

      if (error.response) {
        switch (error.response.status) {
          case 401:
            throw new Error("Unauthorized: Please check your token.");
          case 404:
            throw new Error("Item not found.");
          default:
            throw new Error(`Error ${error.response.status}: ${error.response.statusText}`);
        }
      } else if (error.request) {
        throw new Error("No response received from the server.");
      } else {
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  }
}
