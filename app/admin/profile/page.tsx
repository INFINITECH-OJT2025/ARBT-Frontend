"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/components/sidebar";

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
    password_confirmation: "",
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      user.name === formData.name &&
      user.email === formData.email &&
      !formData.password &&
      !formData.password_confirmation
    ) {
      toast.info("No changes detected.");
      return;
    }

    if (/\d/.test(formData.name)) {
      return;
    }

    const confirmUpdate = window.confirm(
      "Are you sure you want to update your profile?"
    );
    if (!confirmUpdate) return;

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://127.0.0.1:8000/api/profile/update",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(response.data.user);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="flex pl-0 md:pl-60 bg-gray-100 dark:bg-gray-900 min-h-screen overflow-hidden">
      {" "}
      <Sidebar />
      <div className="flex-1 px-4 md:px-6 transition-all md:ml-14">
        <header className="relative flex items-center justify-between bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 shadow-md px-4 md:px-6 py-4 rounded-lg mt-14">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
            Profile Management
          </h1>
        </header>

        {/* ✅ Main content wrapper */}
        <div className="flex-1 flex justify-center items-center px-4 pt-20">
          <div className="w-full max-w-md bg-white shadow-lg p-6 rounded-lg">
            {/* ✅ Profile Update Form */}
            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="mb-4">
                <label className="block font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label className="block font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* New Password Field */}
              <div className="mb-4 relative">
                <label className="block font-medium">New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>

              {/* ✅ Confirm Password Field (Fix Applied Here) */}
              <div className="mb-4 relative">
                <label className="block font-medium">Confirm Password</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
              >
                Update Profile
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer autoClose={3000} />
    </div>
  );
}
