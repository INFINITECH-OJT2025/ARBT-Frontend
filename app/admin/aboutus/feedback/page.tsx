"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/components/sidebar";

interface Review {
  id: number;
  order_id: number;
  comment: string;
  image_url: string | null;
  published: boolean;
  created_at: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComment, setSelectedComment] = useState<string | null>(null); // State to hold selected comment
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Modal visibility state

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    if (typeof window === "undefined") return; // ✅ Prevent SSR errors
  
    setLoading(true); // ✅ Ensure loading state is set before fetching
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized access. Please log in.");
        return;
      }
  
      const response = await axios.get("http://127.0.0.1:8000/api/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setReviews(response.data);
    } catch (err: any) {
      console.error("❌ Error fetching reviews:", err);
      setError(err.response?.data?.message || "Failed to fetch reviews.");
    } finally {
      setLoading(false); // ✅ Ensure loading state updates correctly
    }
  };

const toggleStatus = async (reviewId: number, currentStatus: boolean) => {
  if (typeof window === "undefined") return; // ✅ Prevent SSR errors

  const newStatus = !currentStatus;

  const confirmAction = window.confirm(
    `Are you sure you want to ${newStatus ? "publish" : "unpublish"} this review?`
  );
  if (!confirmAction) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized action. Please log in.");
      return;
    }

    await axios.patch(
      `http://127.0.0.1:8000/api/reviews/${reviewId}/toggle-publish`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId ? { ...review, published: newStatus } : review
      )
    );

    toast.success(`✅ Review ${newStatus ? "published" : "unpublished"} successfully!`);
  } catch (err: any) {
    console.error("❌ Error updating review status:", err);
    toast.error(err.response?.data?.message || "Failed to update review status.");
  }
};

  // Function to handle opening modal and setting the selected comment
  const openModal = (comment: string) => {
    setSelectedComment(comment);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedComment(null);
  };

  return (
    <div className="flex pl-0 md:pl-60 bg-gray-100 dark:bg-gray-900 min-h-screen overflow-hidden">     
      <Sidebar />

      {/* ✅ Main content wrapper */}
      <div className="flex-1 px-4 md:px-6 transition-all md:ml-14 overflow-hidden">
        <header className="relative flex items-center justify-between bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 shadow-md px-4 md:px-6 py-4 rounded-lg mt-14">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
            Customer Feedback
          </h1>
        </header>

        {/* ✅ Table Container with Scrollbar - No Page Zooming */}
        <div className="pl-6">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mt-6 overflow-hidden">
            <ToastContainer />

            {loading ? (
              <p className="text-center text-gray-600">Loading reviews...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <table
                  className="w-full min-w-[800px] border border-gray-300 text-sm md:text-base"
                  style={{
                    tableLayout: "fixed", // Prevents table from expanding
                    whiteSpace: "nowrap", // Prevents content wrapping
                  }}
                >
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2 md:p-3 text-left">Comment</th>
                      <th className="p-2 md:p-3 text-left">Status</th>
                      <th className="p-2 md:p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review) => (
                      <tr key={review.id} className="border-t border-gray-300 text-xs md:text-sm">
                        <td className="p-2 md:p-3 truncate">
                          <button
                            onClick={() => openModal(review.comment)}
                            className={`text-blue-500 underline ${
                              selectedComment === review.comment ? "text-red-500" : ""
                            }`}
                          >
                            View Comment
                          </button>
                        </td>
                        <td className="p-2 md:p-3">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              review.published ? "bg-green-500 text-white" : "bg-red-500 text-white"
                            }`}
                          >
                            {review.published ? "Published" : "Unpublished"}
                          </span>
                        </td>
                        <td className="p-2 md:p-3">
                          <button
                            onClick={() => toggleStatus(review.id, review.published)}
                            className={`px-3 py-1 text-xs md:text-sm font-semibold rounded-md ${
                              review.published
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {review.published ? "Unpublish" : "Publish"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Modal for Viewing Comment */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold text-gray-800">Comment</h2>
            <p className="mt-4 text-gray-700">{selectedComment}</p>
            <button
              onClick={closeModal}
              className="bg-red-500 text-white px-4 py-2 rounded-lg mt-4 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
