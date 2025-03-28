"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // ✅ Import Toast
import "react-toastify/dist/ReactToastify.css"; // ✅ Import Toast styles

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
  const [minDateTime, setMinDateTime] = useState(""); // Initialize state for minDateTime
  const [maxDateTime, setMaxDateTime] = useState(""); // Initialize state for maxDateTime

  const [errors, setErrors] = useState({
    name: "",
    contact_number: "",
  });

  const [loadingUser, setLoadingUser] = useState(true); // ✅ Track user loading state

  // Get minDateTime and maxDateTime values

  // ✅ Fetch logged-in user details
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get("http://127.0.0.1:8000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Populate formData with the user details
        setFormData((prev) => ({
          ...prev,
          name: response.data.name,
          email: response.data.email,
          contact_number: response.data.contact_number || "",
        }));
      } catch (error) {
        console.error("❌ Failed to fetch user profile:", error);
      }
      setLoadingUser(false); // ✅ Mark user data as loaded
    };

    fetchUserProfile();
  }, [router]);

  // ✅ Set the minimum selectable date & time
  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setMinDateTime(now.toISOString().slice(0, 16));
  }, []);

  // ✅ Handle Form Input Changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Contact Number Validation
  const validateContactNumber = (contact_number: string) => {
    const regex = /^[0]{1}[9]{1}[0-9]{9}$/; // Ensures PH number format (09xxxxxxxxx)
    if (!contact_number) {
      return "Contact number is required";
    } else if (!regex.test(contact_number)) {
      return "Invalid contact number format. Use 09XXXXXXXXX";
    }
    return "";
  };

  // ✅ Handle Booking Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate contact number
    const contactNumberError = validateContactNumber(formData.contact_number);
    if (contactNumberError) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        contact_number: contactNumberError,
      }));
      setLoading(false);
      return;
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, contact_number: "" }));
    }

    // Ensure the datetime is valid
    if (!formData.datetime) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        datetime: "Date and time are required.",
      }));
      setLoading(false);
      return;
    }

    const selectedDateTime = new Date(formData.datetime);
    const day = selectedDateTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = selectedDateTime.getHours();

    // Ensure the date is within Monday to Friday and 8 AM to 4 PM
    if (day === 0 || day === 6) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        datetime: "Bookings are only allowed from Monday to Friday.",
      }));
      setLoading(false);
      return;
    } else if (hours < 8 || hours >= 16) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        datetime: "Please select a time between 8 AM and 4 PM.",
      }));
      setLoading(false);
      return;
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, datetime: "" }));
    }

    // Proceed with the booking if all validations are passed
    try {
      const token = localStorage.getItem("token");

      await axios.post("http://127.0.0.1:8000/api/bookings", formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Booking Confirmed!"); // ✅ Show success toast

      // ✅ Reset ONLY datetime and service fields after booking
      setFormData((prevData) => ({
        ...prevData, // Keep the other fields unchanged
        datetime: "", // Reset date & time
        service: "", // Reset service selection
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "❌ Something went wrong!"); // ❌ Show error toast
    }

    setLoading(false);
  };

  // Handle Date & Time Validation
  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDateTime = new Date(e.target.value);
    const day = selectedDateTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hours = selectedDateTime.getHours();
    const minutes = selectedDateTime.getMinutes();

    // Ensure the date is within Monday to Friday and 8 AM to 5 PM
    if (day === 0 || day === 6 || hours < 8 || hours >= 16) {
      toast.warning(
        "Please select a time between Monday to Friday, 8 AM to 4 PM.",
        {
          position: "top-right",
          autoClose: 3000, // Closes in 3 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } else {
      // If valid, update the form data
      handleChange(e);
    }
  };

  return (
    <div className="bg-yellow-50 min-h-screen  justify-center px-4 p-6">
      <div className="max-w-lg mx-auto mt-10 bg-white shadow-xl p-6 rounded-lg">
        {/* ✅ ToastContainer to display notifications */}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

        <h2 className="text-2xl font-semibold text-yellow-800 dark:text-yellow-200 text-center mb-4">
          Book an Appointment
        </h2>

        <p className="text-sm text-gray-700 dark:text-gray-300 text-center mb-4">
          Please make sure to update your profile, as the transaction will be
          handled via Gmail and phone call.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label className="block text-yellow-900 dark:text-yellow-200 mb-1">
              Full Name
            </label>
            {loadingUser ? ( // ✅ Show placeholder while loading
              <div className="w-full p-3 border rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse">
                Loading...
              </div>
            ) : (
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                readOnly
                className="w-full p-3 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 cursor-not-allowed"
                required
              />
            )}
          </div>

          {/* Contact Number Field */}

          <div>
            <label className="block text-yellow-900 dark:text-yellow-200 mb-1">
              Contact Number
            </label>
            <input
              id="contact_number"
              type="tel"
              name="contact_number"
              value={formData.contact_number || ""} // Default to an empty string if it's null or undefined
              onChange={handleChange}
              pattern="09[0-9]{9}" // Ensures PH number format (09xxxxxxxxx)
              placeholder="09XXXXXXXXX"
              className={`w-full p-3 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 cursor-not-allowed ${
                errors.contact_number ? "border-red-500" : "border-gray-300"
              }`}
              required
              disabled // This will disable the input field
            />

            {errors.contact_number && (
              <span className="text-red-500 text-sm">
                {errors.contact_number}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-yellow-900 dark:text-yellow-200 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ""}
              readOnly
              tabIndex={-1}
              className="w-full p-3 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 cursor-not-allowed"
            />
          </div>

          {/* Date & Time Field */}
          <div>
            <label className="block text-yellow-900 dark:text-yellow-200 mb-1">
              Select Date & Time
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Monday to Friday, 8 AM to 5 PM
            </p>
            <input
              type="datetime-local"
              name="datetime"
              value={formData.datetime}
              onChange={handleDateTimeChange} // Handle date and time validation
              min={minDateTime} // Min date-time (8 AM today)
              max={maxDateTime} // Max date-time (5 PM today)
              className="w-full p-3 border border-yellow-300 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          {/* Service Selection Field */}
          <div>
            <label className="block text-yellow-900 dark:text-yellow-200 mb-1">
              Select Service
            </label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full p-3 border border-yellow-300 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3  bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-md hover:bg-green-400 dark:hover:bg-blue-500 transition"
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
