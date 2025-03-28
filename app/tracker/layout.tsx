"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // <-- Add this import
import axios from "axios";
import Image from "next/image";
import ReviewModal from "@/components/ReviewModal";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Eye } from "lucide-react";
import { toast, ToastContainer } from "react-toastify"; // ✅ Import toast
import "react-toastify/dist/ReactToastify.css"; // ✅ Import toast styles

type Product = {
  product_id: number; // ✅ Added missing property
  name: string;
  image: string | null; // ✅ Added missing property (nullable)
  quantity: number;
  price: number;
};

type Order = {
  order_id: number;
  total: number;
  status: string;
  payment_status: string;
  created_at: string; // ✅ Added missing property
  items: Product[];
};

export default function UserTrackerList() {
  // State for bookings
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");

  // State for purchases
  const [purchases, setPurchases] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(true);
  const [purchasesError, setPurchasesError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter(); // Now `useRouter` is correctly imported

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  // ✅ Handle screen size detection for mobile/tablet
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    datetime: "",
    service: "",
  });

  // ✅ Fetch logged-in user details
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (typeof window === "undefined") return; // ✅ Prevent execution on the server-side
  
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/login"); // ✅ Use `replace` to prevent going back to this page
          return;
        }
  
        const response = await axios.get("http://127.0.0.1:8000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        // ✅ Store Name & Email in State
        setFormData((prev) => ({
          ...prev,
          name: response.data.name || "",
          email: response.data.email || "",
        }));
      } catch (error) {
        console.error("❌ Failed to fetch user profile:", error);
        toast.error("Failed to load profile. Please try again.");
      }
    };
  
    fetchUserProfile();
  }, [router]);
  

  // Fetch bookings (User-side)
  useEffect(() => {
    if (!formData.email) return; // Prevent request if email is not yet fetched

    setBookingsLoading(true);
    axios
      .get(`http://127.0.0.1:8000/api/user-bookings?email=${formData.email}`)
      .then((response) => {
        setBookings(response.data);
        setBookingsLoading(false);
      })
      .catch((error) => {
        console.error("❌ Failed to load bookings:", error);
        setBookingsError("Failed to load bookings. Please try again.");
        setBookingsLoading(false);
      });
  }, [formData.email]);

  // Fetch purchases (User-side)
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/orders") // ✅ Fetch orders
      .then((response) => {
        setPurchases(response.data); // ✅ Store orders in state
        setPurchasesLoading(false);
      })
      .catch(() => {
        setPurchasesError("Failed to load orders. Please try again.");
        setPurchasesLoading(false);
      });
  }, []);

  useEffect(() => {
    console.log("Orders Data:", orders);
  }, [orders]);

  useEffect(() => {
    const fetchUserShopTracker = async () => {
      if (typeof window === "undefined") return; // ✅ Prevent execution on the server-side
  
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("❌ You are not logged in!");
          return;
        }
  
        const response = await fetch("http://127.0.0.1:8000/api/user-shop-tracker", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
  
        if (!response.ok) {
          throw new Error(`Failed to fetch shop tracker: ${response.statusText}`);
        }
  
        const data = await response.json();
        if (data?.user_shop_tracker) {
          setOrders(data.user_shop_tracker); // ✅ Update orders state
        } else {
          toast.warning("No shop tracker data found.");
        }
      } catch (error: unknown) {
        let errorMessage = "Failed to fetch shop tracker.";
  
        if (error instanceof Error) {
          errorMessage = error.message; // ✅ Get error message safely
        }
  
        console.error("❌ Error fetching shop tracker:", error);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserShopTracker();
  }, []);
  

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-yellow-50 dark:bg-gray-900 p-6 gap-6">
      {/* Left Section: Orders List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700">
        <ToastContainer />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📦 My Orders
        </h2>

        {/* ✅ Mobile View: Table Layout */}
        {isMobile ? (
          <div className="overflow-x-auto overflow-y-auto max-h-[750px]">
            <table className="w-full min-w-[600px] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <thead className="bg-yellow-200 dark:bg-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left">Items</th>
                  <th className="p-3 text-left">Total Price</th>
                  <th className="p-3 text-left">Order Date</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="border-t border-gray-300 dark:border-gray-700 even:bg-yellow-100 dark:even:bg-yellow-700 hover:bg-yellow-200"
                  >
                    <td className="p-3">
                      <ul>
                        {order.items.map((item) => (
                          <li
                            key={item.product_id}
                            className="flex items-center gap-3 mb-2"
                          >
                            <Image
                              src={item.image || "/images/placeholder.png"}
                              alt={item.name}
                              width={50}
                              height={50}
                              className="rounded object-cover"
                            />
                            <span>
                              {item.name} ({item.quantity}x)
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-3 font-semibold">
                      ₱{" "}
                      {Number(order.total).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="p-3">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          order.status === "completed"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 flex justify-center">
                      {order.status === "completed" && (
                        <button
                          onClick={() => openModal(order)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Leave a Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // ✅ Desktop View: Table Layout
          <div className="overflow-y-auto max-h-[750px]">
            <table className="w-full min-w-[600px] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <thead className=" bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold dark:bg-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left">Items</th>
                  <th className="p-3 text-left">Total Price</th>
                  <th className="p-3 text-left">Order Date</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="border-t border-gray-300 dark:border-gray-700 even:bg-default dark:even:bg-yellow-700 "
                  >
                    <td className="p-3">
                      <ul>
                        {order.items.map((item) => (
                          <li
                            key={item.product_id}
                            className="flex items-center gap-3 mb-2"
                          >
                            <Image
                              src={item.image || "/images/placeholder.png"}
                              alt={item.name}
                              width={50}
                              height={50}
                              className="rounded object-cover"
                            />
                            <span>
                              {item.name} ({item.quantity}x)
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-3 font-semibold">
                      ₱{" "}
                      {Number(order.total).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    <td className="p-3">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-4 py-2 text-sm font-semibold rounded-full inline-block ${
                          order.status === "completed"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}{" "}
                      </span>
                    </td>
                    <td className="p-3 flex justify-center">
                      {order.status === "completed" && (
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => openModal(order)}
                            className="w-10 h-10 bg-yellow-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ✅ Review Modal */}
        {selectedOrder && (
          <ReviewModal
            orderId={selectedOrder.order_id}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        )}
      </div>

      {/* Right Section: Bookings Section */}
      <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📅 My Bookings
        </h2>

        <div className="overflow-y-auto max-h-[750px]">
          <table className="min-w-[600px] w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <thead className=" bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left">Service</th>
                <th className="p-3 text-left">Date & Time</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking: any) => (
                <tr
                  key={booking.id}
                  className="border-t border-gray-300 dark:border-gray-700 even:bg-default dark:even:bg-gray-700  dark:hover:bg-gray-600"
                >
                  <td className="p-3">{booking.service}</td>
                  <td className="p-3">
                    {new Date(booking.datetime).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-4 py-2 text-sm font-semibold rounded-full inline-block ${
                        booking.status === "Approved"
                          ? "bg-green-500 text-white"
                          : booking.status === "Pending"
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
