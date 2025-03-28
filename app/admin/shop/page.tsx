"use client";
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify"; // ✅ Import toast
import "react-toastify/dist/ReactToastify.css"; // ✅ Import toast styles
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import {
  PlusIcon,
  PencilIcon,
  ArchiveBoxXMarkIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Sidebar from "@/components/sidebar";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  image?: string | File | null;
  price: number;
  quantity: number;
  tag?: string;
  description?: string;
  status: "Active" | "Archived";
  addedQuantity?: number; // ✅ Add this line
};

export default function AdminInventoryManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5; // ✅ Show 10 per page
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [showArchived, setShowArchived] = useState(false);
  const router = useRouter();
  const API_URL = "http://127.0.0.1:8000/api"; // ✅ Ensure this is Laravel's URL


  
  type EditableProduct = Product & {
    addedQuantity?: number;
  };


  const downloadReport = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/export/csv`, {
        responseType: "blob",
        headers: {
          Accept: "text/csv",
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // ✅ Show success toast
      toast.success("Report exported successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("🚨 Error downloading CSV:", error);

      // ❌ Show error toast
      toast.error("❌ Failed to export report. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const [newProduct, setNewProduct] = useState<Product>({
    id: 0,
    name: "",
    price: 0,
    quantity: 1,
    tag: "",
    description: "",
    status: "Active",
    image: null,
  });

  // ✅ Fetch inventory items
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/products")
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load inventory. Please try again.");
        setLoading(false);
      });
  }, []);

  // ✅ Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === "price" || name === "quantity" ? Number(value) : value,
    }));
  };

  // ✅ Handle image selection & preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewProduct((prev) => ({
        ...prev,
        image: file, // ✅ Save the new image
      }));

      // ✅ Show a preview of the newly selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  // ✅ Open Modal for Add / Edit
  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setNewProduct({
        ...product,
        image: null, // ✅ Ensure it does not overwrite the existing image
      });

      // ✅ Fix: Show existing image in the preview
      if (product.image && typeof product.image === "string") {
        setPreviewImage(`${product.image}`);
      } else {
        setPreviewImage(null);
      }
    } else {
      setEditingProduct(null);
      setNewProduct({
        id: 0,
        name: "",
        price: 0,
        quantity: 1,
        tag: "",
        description: "",
        status: "Active",
        image: null,
      });
      setPreviewImage(null);
    }
    setShowModal(true);
  };

  // ✅ Save Product (Create or Update)
  const handleSaveProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
  
    // ✅ Validation
    if (!newProduct.name.trim()) {
      toast.error("Product name is required!");
      return;
    }
    if (newProduct.price <= 0) {
      toast.error("Price must be greater than 0!");
      return;
    }
  
    // ✅ Special case: editing with addedQuantity
    const finalQuantity =
      editingProduct && typeof newProduct.addedQuantity === "number"
        ? editingProduct.quantity + newProduct.addedQuantity
        : newProduct.quantity;
  
    if (finalQuantity <= 0) {
      toast.error("Quantity must be at least 1!");
      return;
    }
  
    try {
      const formData = new FormData();
  
      if (newProduct.name !== editingProduct?.name)
        formData.append("name", newProduct.name);
      if (newProduct.price !== editingProduct?.price)
        formData.append("price", String(newProduct.price));
      if (
        editingProduct &&
        typeof newProduct.addedQuantity === "number" &&
        newProduct.addedQuantity > 0
      ) {
        formData.append("quantity", String(finalQuantity));
      } else if (!editingProduct && newProduct.quantity > 0) {
        formData.append("quantity", String(newProduct.quantity));
      }
  
      if (newProduct.status !== editingProduct?.status)
        formData.append("status", newProduct.status || "Active");
  
      if (newProduct.tag !== editingProduct?.tag)
        formData.append("tag", newProduct.tag || "");
      if (newProduct.description !== editingProduct?.description)
        formData.append("description", newProduct.description || "");
  
      if (newProduct.image instanceof File) {
        formData.append("image", newProduct.image);
      }
  
      if (editingProduct) {
        formData.append("_method", "PATCH");
  
        if (
          !formData.has("name") &&
          !formData.has("price") &&
          !formData.has("quantity") &&
          !formData.has("status") &&
          !formData.has("image")
        ) {
          toast.info("No changes detected, nothing to update.");
          return;
        }
  
        await axios.post(`${API_URL}/products/${editingProduct.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
  
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  ...newProduct,
                  quantity: finalQuantity, // ✅ Use the updated total
                  image: editingProduct.image,
                }
              : p
          )
        );
  
        toast.success("Product updated successfully!");
      } else {
        const { data } = await axios.post(`${API_URL}/products`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
  
        setProducts([...products, data]);
        toast.success("Product added successfully!");
      }
  
      setShowModal(false);
      setEditingProduct(null);
      setPreviewImage(null);
    } catch (error: any) {
      console.error("❌ Error saving product:", error.response?.data || error);
      toast.error("❌ Failed to save product. Please try again.");
    }
  };
  

  // ✅ Pagination Logic
  // Step 1: Filter products based on the search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const tableMinHeight = 350;

  // Ensure the current page doesn't exceed the total number of pages
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Optional: A function to reset the page number to 1 when a new search term is entered
  useEffect(() => {
    setCurrentPage(1); // Reset to the first page when search term changes
  }, [searchTerm]);

  const handleArchiveProduct = async (
    productId: number,
    currentStatus: string
  ) => {
    try {
      const newStatus = currentStatus === "Active" ? "Archived" : "Active";

      await axios.patch(`http://127.0.0.1:8000/api/products/${productId}`, {
        status: newStatus,
      });

      // ✅ Update UI instantly
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId ? { ...product, status: newStatus } : product
        )
      );

      alert(`Product ${newStatus.toLowerCase()} successfully.`);
    } catch (error) {
      console.error("Error updating product status:", error);
      alert("Failed to update the product. Please try again.");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token"); // ✅ Get stored token
        const response = await axios.get("http://127.0.0.1:8000/api/products", {
          headers: {
            Accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "", // ✅ Add authentication if available
          },
        });
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load inventory. Please try again.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Call this function after a successful payment to refresh the inventory list
  const refreshProducts = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/products");
      setProducts(response.data); // Update the frontend with the latest product data
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Assuming you call this function after a successful payment
  const handlePaymentSuccess = () => {
    // Simulating a successful payment
    console.log("Payment completed successfully.");

    // Now refresh the products after payment is successful
    refreshProducts();
  };

  return (
    <div className="flex pl-0 md:pl-60 bg-gray-100 dark:bg-gray-900 min-h-screen overflow-hidden">
      <Sidebar />

      {/* ✅ Main content wrapper */}
      <div className="flex-1 md:ml-14 md:px-6 overflow-hidden px-4 transition-all ">
        <header className="relative flex items-center justify-between bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 shadow-md px-4 md:px-6 py-4 rounded-lg mt-14">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
            Inventory Management
          </h1>

          <div className="flex flex-col gap-2 items-start md:flex-row md:gap-4 md:items-center">
            <div className="flex gap-2">
              {/* Buttons & Search (Mobile: Stack, Desktop: Inline) */}
              <div className="flex flex-col w-full gap-2 md:flex-row md:gap-4 md:items-center md:w-auto">
                {/* Buttons (Side by Side Always) */}
                <div className="flex gap-2">
                  <button
                    onClick={downloadReport}
                    className="flex bg-blue-600 rounded-md shadow-md text-white duration-200 ease-in-out hover:bg-blue-700 items-center px-4 py-2 transition"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 fill-white mr-2" />{" "}
                    Export Report
                  </button>
                </div>

                {/* Search Bar (Below Buttons in Mobile) */}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="border p-2 rounded-md w-full md:w-64"
                />
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="flex bg-green-600 rounded-md shadow-md text-white duration-200 ease-in-out hover:bg-green-700 items-center px-4 py-2 transition"
            >
              <PlusCircleIcon className="h-5 w-5 fill-white mr-2" /> Add Product
            </button>

            <button
              onClick={() => router.push("/admin/shop/archive")}
              className="flex bg-gray-500 text-white px-4 py-2 text-sm rounded-lg font-bold items-center transition duration-200 ease-in-out hover:bg-gray-600"
            >
              Show Archived Products
            </button>
          </div>
          {showModal && (
            <Dialog
              open={showModal}
              onClose={() => setShowModal(false)}
              className="flex bg-black bg-opacity-50 justify-center backdrop-blur-sm fixed inset-0 items-center z-50"
            >
              <DialogPanel className="bg-white p-6 rounded-lg shadow-lg w-96">
                <DialogTitle className="text-lg font-semibold mb-4">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </DialogTitle>

                {/* ✅ Complete Form for Adding / Editing Product */}
                <form onSubmit={handleSaveProduct}>
                  <div className="flex flex-col gap-3">
                    {/* ✅ Product Name */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newProduct.name}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                        className="border p-2 rounded-md w-full"
                        required
                      />
                    </div>

                    {/* ✅ Price */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1">Price</label>
                      <input
                        type="number"
                        name="price"
                        value={newProduct.price || ""}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="border p-2 rounded-md w-full"
                        required
                      />
                    </div>

                    {/* ✅ Quantity */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1">
                        Quantity
                      </label>

                      {/* For Add Product: No value */}
                 {!editingProduct ? (
  // Add mode: just show normal quantity input
  <input
    type="number"
    name="quantity"
    onChange={handleInputChange}
    placeholder="Enter stock quantity"
    className="border p-2 rounded-md w-full"
    required
  />
) : (
  // Edit mode: show current, add, and total
  <>
    {/* Current Quantity (Read-Only) */}
    <div className="mb-2">
      <label className="block text-sm text-gray-700">Current Quantity</label>
      <input
        type="number"
        value={newProduct.quantity || 0}
        readOnly
        className="border p-2 rounded-md w-full bg-gray-100 text-gray-600"
      />
    </div>

    {/* Quantity to Add */}
    <div className="mb-2">
      <label className="block text-sm text-gray-700">Restock</label>
      <input
        type="number"
        name="addedQuantity"
        value={newProduct.addedQuantity || ""}
        onChange={(e) =>
          setNewProduct((prev) => ({
            ...prev,
            addedQuantity: Number(e.target.value),
          }))
        }
        placeholder="Enter quantity to restock"
        className="border p-2 rounded-md w-full"
      />
    </div>

    {/* Total Quantity */}
    <div>
      <label className="block text-sm text-gray-700">Total Quantity</label>
      <input
        type="number"
        readOnly
        value={
          (newProduct.quantity || 0) + (newProduct.addedQuantity || 0)
        }
        className="border p-2 rounded-md w-full bg-gray-100 font-semibold"
      />
    </div>
  </>
)}

                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1">Tag</label>
                      <input
                        type="text"
                        name="tag"
                        value={newProduct.tag}
                        onChange={handleInputChange}
                        placeholder="e.g. paint, cement, wood"
                        className="border p-2 rounded-md w-full"
                      />
                    </div>

                    {/* ✅ Description (Optional) */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={newProduct.description}
                        onChange={handleInputChange}
                        placeholder="Enter description"
                        className="border p-2 rounded-md w-full"
                      />
                    </div>

                    {/* ✅ Upload Image */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium mb-1">
                        Upload Image{" "}
                        {editingProduct ? "(Optional)" : "(Required)"}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="border p-2 rounded-md w-full"
                        required={!editingProduct}
                      />

                      {/* ✅ Show the correct image preview */}
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          alt="Preview"
                          width={100}
                          height={100}
                          unoptimized
                          className="rounded-md mt-2"
                        />
                      ) : editingProduct &&
                        editingProduct.image &&
                        typeof editingProduct.image === "string" ? (
                        <Image
                          src={`${editingProduct.image}`}
                          alt="Product Image"
                          width={100}
                          height={100}
                          className="rounded-md mt-2"
                        />
                      ) : null}
                    </div>
                  </div>

                  {/* ✅ Modal Buttons */}
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="bg-gray-400 rounded-md text-white hover:bg-gray-500 px-4 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 rounded-md text-white hover:bg-blue-700 px-4 py-2"
                    >
                      {editingProduct ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </Dialog>
          )}
        </header>

        <ToastContainer position="top-right" autoClose={3000} />
        <div className="flex flex-1 flex-col">
          {/* Inventory Table */}
          <div className="p-6 w-full">
            {loading ? (
              <p className="text-center text-gray-600">Loading inventory...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <>
                <div className="w-full overflow-x-auto">
                  <div className="bg-white border border-gray-300 rounded-lg shadow-lg">
                    {/* ✅ Table Container with fixed height */}
                    <div className="max-h-[500px] overflow-auto">
                      <table className="table-fixed border-collapse w-full text-center">
                        {/* ✅ Header Sticks & Has Fixed Widths */}
                        <thead className=" bg-blue-300 text-gray-800 sticky top-0 z-10">
                          <tr>
                            <th className="p-3 text-left w-[100px]">Image</th>
                            <th className="p-3 text-left w-[200px]">
                              Product Name
                            </th>
                            <th className="p-3 text-left w-[120px]">Price</th>
                            <th className="p-3 text-left w-[100px]">
                              Quantity
                            </th>
                            <th className="p-3 text-left w-[150px]">Tag</th>
                            <th className="p-3 text-left w-[250px]">
                              Description
                            </th>
                            <th className="p-3 text-left w-[180px]">Actions</th>
                          </tr>
                        </thead>

                        {/* ✅ Table Body Now Scrolls with Header Sticking */}
                        <tbody>
                          {loading ? (
                            <tr>
                              <td colSpan={7} className="p-6 text-center ">
                                Loading inventory...
                              </td>
                            </tr>
                          ) : displayedProducts.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-6 text-center">
                                No products available.
                              </td>
                            </tr>
                          ) : (
                            displayedProducts.map((product) => (
                              <tr
                                key={product.id}
                                className="border-gray-300 border-t"
                              >
                                <td className="p-3 w-[100px]">
                                  {product.image ? (
                                    <Image
                                      src={
                                        typeof product.image === "string" &&
                                        product.image.startsWith("")
                                          ? product.image
                                          : `${product.image}`
                                      }
                                      alt={product.name}
                                      width={60}
                                      height={60}
                                      unoptimized
                                      className="rounded-md"
                                    />
                                  ) : (
                                    "No Image"
                                  )}
                                </td>
                                <td className="p-3 w-[200px]">
                                  {product.name}
                                </td>
                                <td className="p-3 w-[120px]">
                                  ₱{" "}
                                  {Number(product.price).toLocaleString(
                                    "en-PH",
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
                                </td>
                                <td className="p-3 w-[100px]">
                                  {product.quantity}
                                </td>
                                <td className="p-3 w-[150px]">
                                  {product.tag || "—"}
                                </td>
                                <td className="p-3 w-[250px]">
                                  {product.description || "No description"}
                                </td>
                                <td className="p-3 w-[180px] flex justify-center gap-2">
                                  {/* Edit Button */}
                                  <button
                                    onClick={() => openModal(product)}
                                    className="flex bg-blue-600 rounded-md text-white text-xs font-semibold hover:bg-blue-700 items-center px-3 py-1 shadow-md"
                                  >
                                    <PencilSquareIcon className="h-5 w-5 fill-white mr-1" />
                                    <span>Edit</span>
                                  </button>

                                  {/* Archive / Unarchive Button */}
                                  <button
                                    onClick={() =>
                                      handleArchiveProduct(
                                        product.id,
                                        product.status
                                      )
                                    }
                                    className={`px-3 py-1 text-xs font-semibold rounded-md shadow-md flex items-center ${
                                      product.status === "Active"
                                        ? "bg-gray-600 hover:bg-gray-700"
                                        : "bg-green-600 hover:bg-green-700"
                                    } text-white`}
                                  >
                                    {product.status === "Active" ? (
                                      <ArchiveBoxXMarkIcon className="h-5 w-5 fill-white mr-1" />
                                    ) : (
                                      <ArchiveBoxIcon className="h-5 w-5 fill-white mr-1" />
                                    )}
                                    <span>
                                      {product.status === "Active"
                                        ? "Archive"
                                        : "Unarchive"}
                                    </span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-16 space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
