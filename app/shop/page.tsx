"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify"; // ✅ Import Toast
import "react-toastify/dist/ReactToastify.css"; // ✅ Import Toast styles

// Define the Product type
type Product = {
  id: number;
  name: string;
  image: string;
  price: number;
  tag?: string;
  description?: string;
  quantity?: number;
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ Search state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Check authentication when the page loads
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };
  
    checkAuthStatus(); // ✅ Check auth on mount
  
    // ✅ Listen for authentication changes (e.g., login/logout)
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener("authChange", handleAuthChange);
  
    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/products");
        setProducts(response.data);
        setFilteredProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products.");
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ✅ Function to handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    // ✅ Filter products based on search term (name or tag)
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        (product.tag && product.tag.toLowerCase().includes(term))
    );
    setFilteredProducts(filtered);
  };

  // ✅ Function to Add to Cart
  const addToCart = (product: Product) => {
    try {
      // ✅ Get the cart from localStorage (default to empty array if not found)
      const cart: Product[] = JSON.parse(localStorage.getItem("cart") || "[]");
  
      // ✅ Ensure 'cart' is always an array
      if (!Array.isArray(cart)) {
        console.error("Cart data is corrupted. Resetting cart.");
        localStorage.setItem("cart", JSON.stringify([]));
        return;
      }
  
      // ✅ Find the existing product in the cart
      const existingItem = cart.find((item) => item.id === product.id);
  
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 0) + 1; // ✅ Ensure quantity is always defined
      } else {
        cart.push({ ...product, quantity: 1 });
      }
  
      // ✅ Save updated cart back to localStorage
      localStorage.setItem("cart", JSON.stringify(cart));
  
      // ✅ Dispatch cart update event (for real-time UI updates)
      window.dispatchEvent(new Event("cartUpdate"));
  
      // ✅ Show success toast notification
      toast.success("Item added to cart!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("❌ Failed to add item to cart:", error);
      toast.error("Failed to add item to cart. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  
  return (
    <section className="  bg-yellow-50 flex-col items-center justify-center gap-6 px-6 text-center">
      {/* ✅ ToastContainer to display notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Construction Materials
        </h1>

        {/* ✅ Search Bar */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search for products..."
            className="w-full max-w-md px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          />
        </div>

        {/* ✅ Products Grid (Mobile-Optimized) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center"
              >
                {/* ✅ Image with aspect ratio */}
                <div className="relative w-32 h-32">
                  {" "}
                  {/* Set width and height for a small square */}
                  <Image
                    src={product.image || "/images/placeholder.png"}
                    alt={product.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>

                {/* ✅ Product Info */}
                <div className="p-3 text-center w-full">
                  <p className="text-sm sm:text-base font-semibold truncate text-gray-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="text-sm sm:text-xl font-bold text-blue-600 dark:text-red-400">
                    ₱{product.price}
                  </p>
                  {product.tag && (
                    <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full inline-block ">
                      {product.tag}
                    </span>
                  )}
                </div>

                {/* ✅ Add to Cart Button (Better Touch Response) */}
                <div className="pl-5 pr-5">
                <button
  onClick={() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      addToCart(product);
    }
  }}
  className="w-full px-4 py-2 rounded-lg sm:rounded-full text-sm font-semibold text-white 
    bg-gradient-to-r from-yellow-500 to-yellow-600 
    hover:from-yellow-600 hover:to-yellow-700 
    active:scale-95 transition-all duration-300 shadow-md flex items-center justify-center"
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
    <path fillRule="evenodd" d="M8.5 3a2.5 2.5 0 015 0V6h3.5a.5.5 0 010 1H16V14h-1V7a.5.5 0 00-.5-.5h-7a.5.5 0 00-.5.5v7H4V7a.5.5 0 00-.5-.5H1.5a.5.5 0 010-1H3V3a2.5 2.5 0 015 0h.5z" clipRule="evenodd" />
  </svg>
</button>
</div>
              </div>
            ))
          ) : (
            <div>
              <p className="text-center text-gray-600 dark:text-gray-300 col-span-full">
                No products found.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
