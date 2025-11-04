"use client"; // Only if you’re using Next.js App Router

import { useState, ChangeEvent, FormEvent } from "react";
import { contactUSEmail } from "../services/contactUSEmail";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validation
  const validateForm = () => {
    const { name, email, phone, message } = formData;
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      return "All fields are required.";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address.";
    }
    if (!/^\d+$/.test(phone)) {
      return "Phone number should contain only numbers.";
    }
    return null;
  };

  // Submit form
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const response = await contactUSEmail.sendEmail(formData);
      if (response?.data?.success) {
        setSuccessMessage(response?.data?.message || "Your message has been sent successfully!");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        throw new Error(response?.data?.message || "Unexpected error occurred.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <div className="w-auto p-6 bg-white shadow-lg shadow-gray-600/70 rounded-lg">
        <h2 className="text-2xl font-bold text-green-600 mb-4 text-center">Contact Us</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {successMessage && <p className="text-green-400 text-sm mb-4">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-900 text-blue-950"
              placeholder="Name"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-900 text-blue-950"
              placeholder="Email"
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-900 text-blue-800"
              placeholder="Phone"
              required
            />
          </div>
          <div className="mb-4">
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-900 text-blue-950"
              placeholder="Message"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-40 text-sm py-4 rounded-lg ${
              loading
                ? "bg-gray-500 text-gray-800 cursor-not-allowed"
                : "bg-blue-950 text-white hover:bg-gray-200 hover:text-blue-950"
            }`}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
