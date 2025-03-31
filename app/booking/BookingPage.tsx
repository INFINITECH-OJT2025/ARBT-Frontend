"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_number: "",
    datetime: "",
    service: selectedPlan || "",
  });

  const services = ["Basic Plan", "Standard Plan", "Premium/Pro Plan"];
  const [loading, setLoading] = useState(false);
  const [minDateTime, setMinDateTime] = useState("");
  const [maxDateTime, setMaxDateTime] = useState("");
  const [errors, setErrors] = useState({ name: "", contact_number: "" });
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData((prev) => ({
          ...prev,
          name: response.data.name,
          email: response.data.email,
          contact_number: response.data.contact_number || "",
        }));
      } catch (error) {
        console.error("❌ Failed to fetch user profile:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setMinDateTime(now.toISOString().slice(0, 16));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateContactNumber = (contact_number: string) => {
    const regex = /^[0]{1}[9]{1}[0-9]{9}$/;
    if (!contact_number) return "Contact number is required";
    if (!regex.test(contact_number))
      return "Invalid contact number format. Use 09XXXXXXXXX";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const contactNumberError = validateContactNumber(formData.contact_number);
    if (contactNumberError) {
      setErrors((prev) => ({ ...prev, contact_number: contactNumberError }));
      setLoading(false);
      return;
    } else {
      setErrors((prev) => ({ ...prev, contact_number: "" }));
    }

    if (!formData.datetime) {
      setErrors((prev) => ({ ...prev, datetime: "Date and time are required." }));
      setLoading(false);
      return;
    }

    const selectedDateTime = new Date(formData.datetime);
    const day = selectedDateTime.getDay();
    const hours = selectedDateTime.getHours();

    if (day === 0 || day === 6) {
      setErrors((prev) => ({
        ...prev,
        datetime: "Bookings are only allowed from Monday to Friday.",
      }));
      setLoading(false);
      return;
    } else if (hours < 8 || hours >= 16) {
      setErrors((prev) => ({
        ...prev,
        datetime: "Please select a time between 8 AM and 4 PM.",
      }));
      setLoading(false);
      return;
    } else {
      setErrors((prev) => ({ ...prev, datetime: "" }));
    }

    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("❌ User authentication failed. Please log in again.");
          setLoading(false);
          return;
        }

        await axios.post("http://127.0.0.1:8000/api/bookings", formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success("✅ Booking Confirmed!");
        setFormData((prev) => ({ ...prev, datetime: "", service: "" }));
      } catch (error: any) {
        toast.error(error.response?.data?.message || "❌ Something went wrong!");
      }
    }

    setLoading(false);
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateTime = new Date(e.target.value);
    const day = selectedDateTime.getDay();
    const hours = selectedDateTime.getHours();

    if (day === 0 || day === 6 || hours < 8 || hours >= 16) {
      toast.warning("Please select a time between Monday to Friday, 8 AM to 4 PM.");
    } else {
      handleChange(e);
    }
  };

  return (
    <div className="bg-yellow-50 min-h-screen justify-center px-4 p-6">
      <div className="max-w-lg mx-auto mt-10 bg-white shadow-xl p-6 rounded-lg">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        <h2 className="text-2xl font-semibold text-yellow-800 text-center mb-4">Book an Appointment</h2>
        <p className="text-sm text-gray-700 text-center mb-4">
          Please make sure to update your profile, as the transaction will be handled via Gmail and phone call.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-yellow-900 mb-1">Full Name</label>
            {loadingUser ? (
              <div className="w-full p-3 border rounded-md bg-gray-200 animate-pulse">Loading...</div>
            ) : (
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                readOnly
                className="w-full p-3 border rounded-md bg-gray-100 text-gray-900 cursor-not-allowed"
                required
              />
            )}
          </div>

          <div>
            <label className="block text-yellow-900 mb-1">Contact Number</label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number || ""}
              onChange={handleChange}
              pattern="09[0-9]{9}"
              placeholder="09XXXXXXXXX"
              className={`w-full p-3 border rounded-md bg-gray-100 text-gray-900 cursor-not-allowed ${
                errors.contact_number ? "border-red-500" : "border-gray-300"
              }`}
              required
              disabled
            />
            {errors.contact_number && <span className="text-red-500 text-sm">{errors.contact_number}</span>}
          </div>

          <div>
            <label className="block text-yellow-900 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              readOnly
              tabIndex={-1}
              className="w-full p-3 border rounded-md bg-gray-100 text-gray-900 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-yellow-900 mb-1">Select Date & Time</label>
            <p className="text-sm text-gray-600 mb-2">Monday to Friday, 8 AM to 5 PM</p>
            <input
              type="datetime-local"
              name="datetime"
              value={formData.datetime}
              onChange={handleDateTimeChange}
              min={minDateTime}
              max={maxDateTime}
              className="w-full p-3 border border-yellow-300 rounded-md bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <div>
            <label className="block text-yellow-900 mb-1">Select Service</label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full p-3 border border-yellow-300 rounded-md bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="" disabled>
                Select a Service
              </option>
              {services.map((service, index) => (
                <option key={index} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-md hover:bg-green-400 transition"
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
