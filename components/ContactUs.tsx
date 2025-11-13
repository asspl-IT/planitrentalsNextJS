"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
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

  // Arithmetic CAPTCHA states
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, operator: "+" });
  const [captchaInput, setCaptchaInput] = useState("");
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  // Generate arithmetic captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    const operators = ["+", "-", "*"];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    setCaptcha({ num1, num2, operator });
    setCaptchaInput("");
    setIsCaptchaValid(false);
  };

  // Calculate correct answer
  const calculateAnswer = () => {
    const { num1, num2, operator } = captcha;
    switch (operator) {
      case "+":
        return num1 + num2;
      case "-":
        return num1 - num2;
      case "*":
        return num1 * num2;
      default:
        return 0;
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    const correct = calculateAnswer();
    setIsCaptchaValid(parseInt(captchaInput) === correct);
  }, [captchaInput]);

  // Handle form change
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
    if (!isCaptchaValid) {
      return "Incorrect captcha answer. Please try again.";
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
      generateCaptcha();
      return;
    }

    try {
      const response = await contactUSEmail.sendEmail(formData);
      if (response?.data?.success) {
        setSuccessMessage(
          response?.data?.message ||
            "Your message has been sent successfully!"
        );
        setFormData({ name: "", email: "", phone: "", message: "" });
        generateCaptcha();
      } else {
        throw new Error(response?.data?.message || "Unexpected error occurred.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10">
      <div className="w-auto p-6 bg-white shadow-lg shadow-gray-600/70 rounded-lg">
        <h2 className="text-xl font-bold text-green-500 mb-4 text-center">
          Contact Us
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {successMessage && (
          <p className="text-green-400 text-sm mb-4">{successMessage}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-blue-950"
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
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-blue-950"
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
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-blue-950"
              placeholder="Phone"
              required
            />
          </div>

          <div className="mb-4">
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-blue-950"
              placeholder="Message"
              rows={4}
              required
            />
          </div>

          {/* ✅ Arithmetic CAPTCHA Added */}
          <div className="mb-4 flex justify-center items-center gap-3">
            <span className="font-semibold text-green-700">
              {captcha.num1} {captcha.operator} {captcha.num2} = ?
            </span>

            <input
              type="text"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className="w-24 px-3 py-2 border rounded text-center focus:ring-1 focus:ring-blue-950 text-blue-900"
              placeholder="Answer"
              required
            />

            <button
              type="button"
              onClick={generateCaptcha}
              className="text-sm text-blue-900 hover:underline"
            >
              Refresh
            </button>
          </div>

          <button
            type="submit"
            className={`w-40 text-sm py-4 rounded-lg ${
              loading || !isCaptchaValid
                ? "bg-gray-300 text-gray-800 cursor-not-allowed"
                : "bg-blue-950 text-white hover:bg-gray-200 hover:text-blue-950"
            }`}
            disabled={loading || !isCaptchaValid}
          >
            {loading ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
