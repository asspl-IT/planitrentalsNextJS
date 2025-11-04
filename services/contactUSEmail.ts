import axios from "axios";

export class contactUSEmail {
  static async sendEmail(contactData: {
    name: string;
    email: string;
    phone: string;
    message: string;
  }) {
    try {
      let apiEndpoint: string;

      if (process.env.NODE_ENV === "development") {
        // In development → Next.js API route proxy
        apiEndpoint = "/api/contactus"; // You’ll create this API route in /pages/api/contactus.ts or /app/api/contactus/route.ts
      } else {
        // In production → direct AWS or backend API endpoint
        apiEndpoint = `${process.env.NEXT_PUBLIC_AWS_API_URL}contactus`;
      }

      const messageData = {
        contactUs: {
          name: contactData.name,
          email: contactData.email,
          phone: contactData.phone,
          message: contactData.message,
        },
      };

      const response = await axios.post(apiEndpoint, messageData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = response.data;

      if (responseData) {
        return responseData;
      } else {
        throw new Error(responseData?.message || "Unexpected error occurred.");
      }
    } catch (error: any) {
      const errorMessage = error.response
        ? `API Response Error: ${JSON.stringify(error.response.data)}`
        : error.request
        ? `API Request Error: ${error.request}`
        : `Error: ${error.message}`;

      console.error(errorMessage);
      throw new Error("Failed to send Email. Please try again later.");
    }
  }
}
