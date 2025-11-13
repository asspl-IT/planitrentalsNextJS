import axios from "axios";

export class CartService {
  static async getLocationData(
    incomingLocation: string,
    dayOfWeekText: string,
    startDate: string
  ) {
    try {
      // ✅ Always hit the Next.js rewrite endpoint (NO CORS)
      const apiUrl = "/aws/location";

      const payload = { 
  incomingLocation,
  dayOfWeek: dayOfWeekText,
  dayOfWeekText,              
  startDate,
};

      console.log("📡 Fetching holiday/location data from:", apiUrl);

      const response = await axios.post(apiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Failed to fetch location data:", error);

      if (error.response) {
        switch (error.response.status) {
          case 400:
            throw new Error("Bad Request: Invalid request sent to server.");
          case 401:
            throw new Error("Unauthorized: Check your credentials or token.");
          case 403:
            throw new Error("Forbidden: Access denied for this resource.");
          case 404:
            throw new Error("Not Found: The API endpoint doesn’t exist.");
          case 500:
            throw new Error("Server Error: Something went wrong on backend.");
          default:
            throw new Error(
              `Error ${error.response.status}: ${error.response.statusText}`
            );
        }
      } else if (error.request) {
        throw new Error("No response received from the server.");
      } else {
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  }
}
