"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes"; // Dark mode support
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // ✅ Import toast
import "react-toastify/dist/ReactToastify.css"; // ✅ Import toast styles

export default function SignIn() {
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ✅ Validation: Check if fields are empty
    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required!"); // 🚨 Show error toast
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });

      const { id, token, role } = response.data;

      if (token) {
        // ✅ Store token and role
        localStorage.setItem("token", token);
        localStorage.setItem("user_id", String(id));
        localStorage.setItem("role", role);

        window.dispatchEvent(new Event("authChange")); // ✅ Update state

        toast.success("Login successful! Redirecting..."); // ✅ Success toast

        setTimeout(() => {
          router.push(role === "admin" ? "/admin" : "/");
        }, 1500);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Invalid email or password.";
      setError(errorMessage);
      toast.error(errorMessage); // 🚨 Show error toast
    }
  };

  return (
<div className="flex items-center justify-center min-h-screen bg-yellow-50 dark:bg-yellow-900 transition-colors duration-300">

    {/* ✅ ToastContainer */}
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

    <div className="w-full max-w-md bg-white dark:bg-gray-900 dark:text-white shadow-lg rounded-lg p-8 transition-all duration-300">
      {/* Logo + Title */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <a href="/" className="flex items-center gap-2">
          <img src="/favicon.ico" alt="Logo" className="w-10 h-10" />
          <span className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
            ARBT
          </span>
        </a>
      </div>

   
      <p className="text-sm text-center text-gray-700 dark:text-yellow-200 mt-1 mb-6">
  Access your construction services account.
</p>

      {/* Form */}
      <form onSubmit={handleLogin}>
        {/* Email */}
        <div className="mb-4 relative">
          <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            placeholder="Enter email"
            className={`w-full pl-10 pr-4 py-2 border ${
              email && !/^\S+@\S+\.\S+$/.test(email)
                ? "border-red-500"
                : "border-yellow-400 dark:border-yellow-600"
            } bg-yellow-100 dark:bg-yellow-800 text-black dark:text-white rounded-lg focus:outline-none focus:ring-2 ${
              email && !/^\S+@\S+\.\S+$/.test(email)
                ? "focus:ring-red-500"
                : "focus:ring-yellow-500"
            } transition`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {email && !/^\S+@\S+\.\S+$/.test(email) && (
            <p className="text-red-500 text-sm mt-1">
              Please enter a valid email address.
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4 relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full pl-10 pr-10 py-2 border border-yellow-400 dark:border-yellow-600 bg-yellow-100 dark:bg-yellow-800 text-black dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-600 dark:text-gray-300"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-yellow-500 dark:bg-yellow-600 text-gray-900 dark:text-white py-2 rounded-lg font-medium hover:bg-yellow-600 dark:hover:bg-yellow-700 transition"
        >
          Login
        </button>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-700 dark:text-yellow-200">
          Don't have an account?{" "}
          <Link href="/signup" className="text-yellow-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  </div>
  );
}
