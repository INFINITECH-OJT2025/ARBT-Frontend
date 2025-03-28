"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; // ✅ Import toast
import "react-toastify/dist/ReactToastify.css"; // ✅ Import toast styles


type ReviewModalProps = {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
};

type OrderDetails = {
  items: { name: string; price: number; quantity: number }[];
  subtotal: number;
};

export default function ReviewModal({ orderId, isOpen, onClose }: ReviewModalProps) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const shippingFee = 50;

  useEffect(() => {
    if (!isOpen) return;
    setFetching(true);
    setComment("");
    setOrderDetails(null);
    setError(null);
    setHasReviewed(false);

    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/orders/${orderId}`);
        setOrderDetails(response.data);
      } catch (err) {
        setError("Order not found or cannot be retrieved.");
      }
    };

    const checkExistingReview = async () => {
      try {
        if (typeof window === "undefined") return; // ✅ Ensure this runs only on the client side
    
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("⚠️ No authentication token found.");
          return;
        }
    
        const response = await axios.get("http://127.0.0.1:8000/api/reviews", {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        const existingReview = response.data.find((review: any) => review.order_id === orderId);
        if (existingReview) setHasReviewed(true);
      } catch (err) {
        console.error("❌ Failed to check review:", err);
      }
    };

    Promise.all([fetchOrderDetails(), checkExistingReview()]).finally(() => setFetching(false));
  }, [isOpen, orderId]);

  const calculatedSubtotal = orderDetails
    ? orderDetails.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  const computedTotal = calculatedSubtotal + shippingFee;

  const handleSubmit = async () => {
    if (!comment.trim()) {
      alert("Please enter a comment before submitting.");
      return;
    }
  
    const confirmSubmit = window.confirm("Are you sure you want to submit this review?");
    if (!confirmSubmit) return; // Stop execution if user cancels
  
    setLoading(true);
    try {
      if (typeof window === "undefined") return; // ✅ Ensure client-side execution
  
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ You are not logged in! Please log in to submit a review.");
        return;
      }
  
      await axios.post(
        "http://127.0.0.1:8000/api/reviews",
        { order_id: orderId, comment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // ✅ Ensure toast fires correctly
      toast.success("✅ Review submitted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
  
      setHasReviewed(true);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "❌ Something went wrong.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
  
<div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ${isOpen ? "visible" : "invisible"}`}>

        <div>
    </div>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md md:max-w-lg p-6 relative animate-fadeIn">
        {/* ❌ Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-lg">
          ✖
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Leave a Review</h2>

        {/* ⚠️ Show error message */}
        {error ? (
          <p className="text-red-500 text-center text-sm">{error}</p>
        ) : orderDetails ? (
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold text-lg">Order Summary</p>
            <div className="mt-2 space-y-2">
              {orderDetails.items.length > 0 ? (
                orderDetails.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm text-gray-700">
                    <span className="w-3/4 truncate">{item.name} ({item.quantity}x)</span>
                    <span className="font-medium text-right">₱{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No items found</p>
              )}
            </div>

            <hr className="border-gray-300 my-3" />

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">₱{calculatedSubtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Fee:</span>
              <span className="font-semibold">₱{shippingFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-lg font-bold mt-2">
              <span>Total:</span>
              <span className="text-blue-500">₱{computedTotal.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Loading order details...</p>
        )}

        {/* 🚀 Prevent multiple reviews */}
        {hasReviewed ? (
          <p className="text-green-500 text-center mt-4 font-medium">You have already reviewed this order.</p>
        ) : (
          <>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg mt-4 focus:ring focus:ring-blue-200 resize-none"
              placeholder="Write your review here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            {/* 🚀 Buttons */}
            <div className="mt-4 flex justify-between">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-4 py-2 text-white rounded-md transition ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>

    
  );
}
