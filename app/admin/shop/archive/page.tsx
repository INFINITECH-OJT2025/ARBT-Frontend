"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/components/sidebar";
import { useRouter } from "next/navigation"; // Import useRouter for navigation

interface Product {
  id: number;
  name: string;
  price: number | string;
  quantity: number;
  status: "Active" | "Archived";
  created_at: string;
  updated_at: string;
}

export default function AdminArchivedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5; // Change this number to adjust products per page
  const totalPages = Math.ceil(products.length / productsPerPage);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    // ✅ Ensure this runs only in the browser
    if (typeof window === "undefined") {
      console.warn("fetchProducts was called in a non-browser environment.");
      return;
    }
  
    setLoading(true); // Start loading
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User authentication failed. Please log in.");
        setLoading(false);
        return;
      }
  
      const response = await axios.get("http://127.0.0.1:8000/api/products", {
        params: { status: "Archived" }, // Fetch archived products only
        headers: { Authorization: `Bearer ${token}` },
      });
  
      setProducts(response.data);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      setError("❌ Failed to fetch products.");
    } finally {
      setLoading(false); // Ensure loading stops even on errors
    }
  };
  
  // ✅ Call function only in client-side rendering
  if (typeof window !== "undefined") {
    fetchProducts();
  }

  const toggleStatus = async (productId: number, currentStatus: string) => {
    if (typeof window === "undefined") return; // ✅ Prevent SSR issues
  
    const newStatus = currentStatus === "Active" ? "Archived" : "Active";
    const actionText = newStatus === "Active" ? "restore" : "archive";
  
    // ✅ Use toast instead of window.confirm for better UX (optional)
    const confirmed = window.confirm(`Are you sure you want to ${actionText} this product?`);
    if (!confirmed) return;
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ Authentication error. Please log in.");
        return;
      }
  
      // ✅ Make API request to update product status
      await axios.patch(
        `http://127.0.0.1:8000/api/products/${productId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // ✅ Update the local state for better UI response
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId ? { ...product, status: newStatus } : product
        )
      );
  
      toast.success(`✅ Product successfully ${actionText}d!`);
    } catch (err) {
      console.error("❌ Error updating product status:", err);
      toast.error("❌ Failed to update product status. Please try again.");
    }
  };

  const displayedProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <div className="flex pl-0 md:pl-60 bg-gray-100 dark:bg-gray-900 min-h-screen overflow-hidden">
      {" "}
      <Sidebar />
      <div className="flex-1 md:ml-14 md:px-6 overflow-hidden px-4 transition-all">
        <header className="relative flex items-center justify-between bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 shadow-md px-4 md:px-6 py-4 rounded-lg mt-14">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
            Archived Products
          </h1>

          <button
            onClick={() => router.push("/admin/shop")}
            className="flex bg-gray-500 text-white px-4 py-2 text-sm rounded-lg font-bold items-center transition duration-200 ease-in-out hover:bg-gray-600"
          >
            Show Active Products
          </button>
        </header>

        <div className="p-6 w-full">
          {loading ? (
            <p>Loading archived products...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="max-h-[500px] overflow-auto">
                  <table className="table-auto w-full text-left border-collapse">
                    <thead className="bg-blue-300 text-gray-800">
                      <tr>
                        <th className="p-3 text-left">Product Name</th>
                        <th className="p-3 text-left">Price</th>
                        <th className="p-3 text-left">Quantity</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="border-t border-gray-200"
                        >
                          <td className="p-3">{product.name}</td>
                          <td className="p-3">
                            ₱{" "}
                            {typeof product.price === "number"
                              ? product.price.toFixed(2)
                              : "0.00"}
                          </td>
                          <td className="p-3">{product.quantity}</td>
                          <td className="p-3">{product.status}</td>
                          <td className="p-3">
                            <button
                              onClick={async () => {
                                // Optimistically update the product status in the UI
                                const newStatus =
                                  product.status === "Active"
                                    ? "Archived"
                                    : "Active";

                                // Update the UI immediately without waiting for the server response
                                setProducts((prev) =>
                                  prev.map((p) =>
                                    p.id === product.id
                                      ? { ...p, status: newStatus }
                                      : p
                                  )
                                );

                                try {
                                  // Send the status update request to the server
                                  await axios.patch(
                                    `http://127.0.0.1:8000/api/products/${product.id}`,
                                    { status: newStatus },
                                    {
                                      headers: {
                                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                                      },
                                    }
                                  );

                                  // Show success message
                                  toast.success(
                                    `Product ${newStatus === "Active" ? "restored" : "archived"} successfully!`
                                  );
                                } catch (err) {
                                  // Revert the UI change in case of error
                                  setProducts((prev) =>
                                    prev.map((p) =>
                                      p.id === product.id
                                        ? { ...p, status: product.status }
                                        : p
                                    )
                                  );

                                  // Show error message
                                  toast.error(
                                    "Failed to update product status."
                                  );
                                }
                              }}
                              className={`${
                                product.status === "Active"
                                  ? "bg-gray-600 hover:bg-gray-700"
                                  : "bg-blue-600 hover:bg-blue-700"
                              } text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2`}
                            >
                              {/* Icon */}
                              <span>
                                {product.status === "Active" ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M15 12H9m3-3l-3 3 3 3"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M15 12H9m3-3l-3 3 3 3"
                                    />
                                  </svg>
                                )}
                              </span>
                              <span>
                                {product.status === "Active"
                                  ? "Archive"
                                  : "Restore"}
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-16 space-x-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md border transition-all duration-200 ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 rounded-md border transition-all duration-200 ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              >
                {index + 1}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md border transition-all duration-200 ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
