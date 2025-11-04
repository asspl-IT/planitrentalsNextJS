import axios from "axios";

export class CartService {
  static async getLocationData(incomingLocation, dayOfWeekText, startDate) {
    try {
      let apiUrl;

      if (process.env.NODE_ENV === "development") {
        // In development, use API routes or proxy
        apiUrl = "/api/location"; // You can create this route in Next.js under /pages/api/location.js
      } else {
        // In production, use the full AWS API URL from environment variable
        apiUrl = `${process.env.NEXT_PUBLIC_AWS_API_URL}location`;
      }
      const payload = {
        incomingLocation,
        dayOfWeekText,
        startDate,
      };

      const response = await axios.post(apiUrl, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch location data:", error);

      if (error.response) {
        switch (error.response.status) {
          case 401:
            throw new Error("Unauthorized: Please check your credentials.");
          case 404:
            throw new Error("Location not found.");
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
