"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Product = {
  id: number;
  name: string;
  image: string;
  price: number | string;
  quantity: number;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const router = useRouter();
  const userId = localStorage.getItem("userId");
  // console.log("User ID from localStorage:", userId);
  // Check if userId is fetched correctly

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const updateQuantity = (id: number, newQuantity: number) => {
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
    );

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Dispatch update event for Navbar
    window.dispatchEvent(new Event("cartUpdate"));
  };

  const removeFromCart = (id: number) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);

    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Dispatch update event for Navbar
    window.dispatchEvent(new Event("cartUpdate"));
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-yellow-50">
      <h1 className="text-3xl font-bold text-center mb-6 text-yellow-800">
        🛒 Checkout
      </h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          {/* Scrollable Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="border-b bg-yellow-200">
                  <th className="p-3 text-left text-sm md:text-base">Item</th>
                  <th className="p-3 text-center text-sm md:text-base">Qty</th>
                  <th className="p-3 text-center text-sm md:text-base">
                    Price
                  </th>
                  <th className="p-3 text-center text-sm md:text-base">
                    Total
                  </th>
                  <th className="p-3 text-center text-sm md:text-base">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-300 text-xs md:text-sm"
                  >
                    <td className="p-3 flex items-center gap-2">
                      <Image
                        src={item.image || "/default-product.jpg"}
                        alt={item.name}
                        width={50}
                        height={50}
                        className="rounded"
                      />
                      <span>{item.name}</span>
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value))
                        }
                        min="1"
                        className="w-16 sm:w-20 text-center border rounded-md bg-yellow-100"
                      />
                    </td>

                    <td className="p-3 text-center">
                      ₱{" "}
                      {Number(item.price).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td className="p-3 text-center">
                      ₱{" "}
                      {(Number(item.price) * item.quantity).toLocaleString(
                        "en-PH",
                        { minimumFractionDigits: 2 }
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="px-3 py-1 text-xs font-semibold rounded-full bg-red-600 text-white hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center border-t pt-4">
            <p className="text-lg font-semibold mb-4 sm:mb-0 text-yellow-800">
              Total: ₱{" "}
              {totalPrice.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </p>
            <button
              onClick={() => router.push("/payment")}
              className="px-4 py-2 w-full sm:w-auto text-white font-semibold rounded-full 
          bg-gradient-to-r from-yellow-500 to-yellow-600 
          hover:from-yellow-600 hover:to-yellow-700 
          active:scale-95 transition-all duration-300 shadow"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
