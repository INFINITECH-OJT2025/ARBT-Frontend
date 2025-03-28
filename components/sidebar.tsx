"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaHome,
  FaBoxOpen,
  FaBook,
  FaUser,
  FaClipboardList,
  FaUsers,
  FaChartBar,
  FaBullhorn,
  FaCreditCard,
  FaComments,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";
import { Logo } from "@/components/icons";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [aboutDropdown, setAboutDropdown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.dispatchEvent(new Event("authChange"));

    // Show toast notification
    toast.success("Successfully logged out!", {
      position: "top-right",
      autoClose: 3000, // Auto close in 3 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    // Redirect after a short delay to allow toast to be seen
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };
  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  return (
    <>
      {/* ✅ Floating Menu Button for Mobile */}
      <div className="fixed top-5 left-5 z-50 md:hidden">
        <button
          className="p-3 bg-white/80 dark:bg-gray-800 backdrop-blur-lg rounded-full shadow-md hover:bg-white/90 dark:hover:bg-gray-700 transition-all"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <FaTimes className="w-6 h-6 text-blue-600 dark:text-gray-300" />
          ) : (
            <FaBars className="w-6 h-6 text-blue-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      <ToastContainer />
      {/* ✅ Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-blue-200 to-blue-50 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 z-50 flex flex-col shadow-lg overflow-y-auto transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-72"} 
        md:translate-x-0`}
      >
        {/* ✅ Header */}
        <div className="flex items-center justify-center p-6 relative">
          {/* Logo - Left Aligned */}
          <div className="absolute left-6">
            <Logo />
          </div>

          {/* Admin - Centered */}
          <p className="text-xl font-bold text-blue-700 dark:text-gray-300">
          Admin Panel
          </p>

          {/* Close Button - Right Aligned */}
          <div className="absolute right-6">
            <button
              className="p-2 bg-white/80 dark:bg-gray-700 rounded-full shadow-md hover:bg-white/90 dark:hover:bg-gray-600 transition-all md:hidden"
              onClick={() => setIsOpen(false)}
            >
              <FaTimes className="w-6 h-6 text-blue-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* ✅ Navigation */}
        <nav className="mt-5 flex-1 space-y-2">
          {[
            {
              label: "Dashboard",
              icon: <FaHome className="w-6 h-6 text-green-500" />,
              path: "/admin",
            },
            {
              label: "Inventory Management",
              icon: <FaBoxOpen className="w-6 h-6 text-blue-500" />,
              path: "/admin/shop",
            },
            {
              label: "Booking",
              icon: <FaBook className="w-6 h-6 text-orange-500" />,
              path: "/admin/client",
            },
            {
              label: "Order Management",
              icon: <FaClipboardList className="w-6 h-6 text-purple-500" />,
              path: "/admin/orders",
            },
            {
              label: "Profile",
              icon: <FaUser className="w-6 h-6 text-pink-500" />,
              path: "/admin/profile",
            },
          ].map(({ label, icon, path }) => (
            <button
              key={label}
              className={`w-full flex items-center gap-4 px-6 py-3 text-lg rounded-md transition-all ${
                isActive(path)
                  ? "bg-blue-400 text-white dark:bg-gray-700 dark:text-gray-300"
                  : "hover:bg-white/30 dark:hover:bg-gray-600"
              }`}
              onClick={() => {
                router.push(path);
                setIsOpen(false);
              }}
            >
              {icon} {label}
            </button>
          ))}

          {/* ✅ About Us Dropdown */}
          <div>
            <button
              className="w-full flex items-center justify-between px-6 py-3 text-lg rounded-md transition-all hover:bg-white/30 dark:hover:bg-gray-600"
              onClick={() => setAboutDropdown(!aboutDropdown)}
            >
              <span className="flex items-center gap-4">
                <FaUsers className="w-6 h-6 text-yellow-500" /> About Us
              </span>
              <FaChevronDown
                className={`w-5 h-5 transition-transform ${aboutDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {aboutDropdown && (
              <div className="ml-8 space-y-0">
                {[
                  {
                    label: "Subscription Services",
                    icon: <FaCreditCard className="w-6 h-6 text-green-500" />,
                    path: "/admin/aboutus/subscription",
                  },
                  {
                    label: "Promotional Campaigns",
                    icon: <FaBullhorn className="w-6 h-6 text-blue-500" />,
                    path: "/admin/aboutus/promotional",
                  },
                  {
                    label: "Our Team",
                    icon: <FaUsers className="w-6 h-6 text-purple-500" />,
                    path: "/admin/aboutus/team",
                  },
                  {
                    label: "Feedback",
                    icon: <FaComments className="w-6 h-6 text-pink-500" />,
                    path: "/admin/aboutus/feedback",

                  },
                ].map(({ label, icon, path }) => (
                  <button
                    key={label}
                    className="w-full flex items-center gap-4 px-6 py-2 text-lg rounded-md transition-all hover:bg-white/30 dark:hover:bg-gray-600"
                    onClick={() => {
                      router.push(path);
                      setIsOpen(false);
                    }}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ✅ Reports & Analytics */}
          <button
            className="w-full flex items-center gap-4 px-6 py-3 text-lg rounded-md transition-all hover:bg-white/30 dark:hover:bg-gray-600"
            onClick={() => {
              router.push("/admin/aboutus/reports");
              setIsOpen(false);
            }}
          >
            <FaChartBar className="w-6 h-6 text-red-500" /> Reports
          </button>
        </nav>

        {/* ✅ Logout Button */}
        <button
          className="mx-auto mb-4 w-[90%] flex items-center justify-center gap-3 px-4 py-3 text-white font-bold bg-red-500 rounded-full shadow-md hover:bg-red-600 transition-all"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="w-6 h-6 text-white" /> Logout
        </button>
      </div>
    </>
  );
};

export default Sidebar;
