"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react"; // Import icons
import axios from "axios"; // Import axios
import { toast, ToastContainer } from "react-toastify"; // ✅ Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // ✅ Import toast styles

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ✅ Validation: Check if fields are empty
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error("All fields are required!"); // 🚨 Show error toast
      return;
    }

    // ✅ Validation: Check password match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!"); // 🚨 Show error toast
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register", {
        email,
        password,
      });

      toast.success("Signup successful! Redirecting..."); // ✅ Success toast

      setTimeout(() => {
        router.push("/login"); // Redirect to login page
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Signup failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage); // 🚨 Show error toast
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-50 dark:bg-yellow-900 transition-all">
      {/* ✅ ToastContainer to render toasts */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <div className="flex items-center justify-center gap-2 mb-2">
  <a href="/" className="flex items-center gap-2">
    <img
      src="/favicon.ico"
      alt="Logo"
      className="w-10 h-10"
    />
    <span className="text-xl font-bold text-yellow-700 dark:text-yellow-300">ARBT</span>
  </a>
</div>



<p className="text-sm text-center text-gray-700 dark:text-yellow-200 mt-1 mb-6">
  Sign up to get access to ARBT tools and insights.
</p>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSignup}>
          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-yellow-200 text-sm mb-2">
              Email
            </label>
            <input
              type="email"
              className={`w-full p-2 border rounded ${
                email && !/^\S+@\S+\.\S+$/.test(email)
                  ? "border-red-500"
                  : "border-yellow-400 dark:border-yellow-600"
              } bg-yellow-100 dark:bg-yellow-800 dark:text-white focus:outline-none focus:ring-2 ${
                email && !/^\S+@\S+\.\S+$/.test(email)
                  ? "focus:ring-red-500"
                  : "focus:ring-yellow-500"
              }`}
              placeholder="Enter email"
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

          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-yellow-200 text-sm mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full p-2 pr-10 border rounded ${
                  password && password.length < 6
                    ? "border-red-500"
                    : "border-yellow-400 dark:border-yellow-600"
                } bg-yellow-100 dark:bg-yellow-800 dark:text-white focus:outline-none focus:ring-2 ${
                  password && password.length < 6
                    ? "focus:ring-red-500"
                    : "focus:ring-yellow-500"
                }`}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-700 dark:text-yellow-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password && password.length < 6 && (
              <p className="text-red-500 text-sm mt-1">
                Password must be at least 6 characters long.
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-yellow-200 text-sm mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={`w-full p-2 pr-10 border rounded ${
                  confirmPassword && confirmPassword !== password
                    ? "border-red-500"
                    : "border-yellow-400 dark:border-yellow-600"
                } bg-yellow-100 dark:bg-yellow-800 dark:text-white focus:outline-none focus:ring-2 ${
                  confirmPassword && confirmPassword !== password
                    ? "focus:ring-red-500"
                    : "focus:ring-yellow-500"
                }`}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-700 dark:text-yellow-200"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-red-500 text-sm mt-1">
                Passwords do not match.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-yellow-500 dark:bg-yellow-600 text-gray-900 dark:text-white py-2 rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-all"
          >
            Sign Up
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-700 dark:text-yellow-200">
            Already have an account?{" "}
            <Link href="/login" className="text-yellow-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
