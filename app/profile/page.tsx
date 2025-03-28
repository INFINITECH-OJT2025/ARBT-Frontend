"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons
import "react-toastify/dist/ReactToastify.css";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contact_number: "",
    password_confirmation: "",
  });

  // ✅ Fetch User Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get("http://127.0.0.1:8000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
        setFormData({
          ...response.data,
          password: "",
          password_confirmation: "",
        });
      } catch (err) {
        toast.error("Failed to load profile!", { position: "top-right" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // ✅ Handle Form Input Changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle Profile Update with Toast
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://127.0.0.1:8000/api/profile/update",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(response.data.user);
      toast.success("Profile updated successfully!", { position: "top-right" });
    } catch (err) {
      toast.error("Failed to update profile. Please try again.", {
        position: "top-right",
      });
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="bg-yellow-50 min-h-screen  justify-center px-4 p-6">
      <div className="max-w-lg mx-auto mt-10 bg-white shadow-xl p-6 rounded-lg">
        <h2 className="text-2xl font-semibold text-center text-yellow-800 dark:text-yellow-200">
          Update Your Profile
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Full Name Field */}
          <div className="mb-4">
            <label className="block font-medium text-yellow-900 dark:text-yellow-200 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-yellow-300 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Contact Number Field */}
          <div>
            <label className="block text-yellow-900 dark:text-yellow-200 mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              pattern="09[0-9]{9}" // Ensures PH number format (09xxxxxxxxx)
              placeholder="09XXXXXXXXX"
              className="w-full p-3 border border-yellow-300 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block font-medium text-yellow-900 dark:text-yellow-200 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-yellow-300 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* New Password Field */}
          <div className="mb-4">
            <label className="block font-medium text-yellow-900 dark:text-yellow-200 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 pr-10 border border-yellow-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {/* Eye Icon for password visibility */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-600 dark:text-gray-300"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label className="block font-medium text-yellow-900 dark:text-yellow-200 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                className="w-full p-3 pr-10 border border-yellow-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white dark:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {/* Eye Icon for password visibility */}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-600 dark:text-gray-300"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={20} />
                ) : (
                  <FaEye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full  bg-gradient-to-r from-yellow-500 to-yellow-600 font-semibold text-white py-3 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
          >
            Update Profile
          </button>
        </form>

        {/* ✅ Toast Notifications */}
        <ToastContainer autoClose={3000} />
      </div>
    </div>
  );
}
