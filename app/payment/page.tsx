"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

type Product = {
  id: number;
  name: string;
  image: string;
  price: number | string;
  quantity: number;
};

export default function PaymentPage() {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("gcash");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [serviceFee, setServiceFee] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // Add state for userId
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return; // ✅ Ensure client-side execution
  
    try {
      // ✅ Get cart data safely
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart)); // ✅ Handle potential JSON errors
        } catch (err) {
          console.error("❌ Error parsing cart data:", err);
          setCartItems([]); // Fallback to empty cart
        }
      }
  
      // ✅ Fetch userId from localStorage safely
      const fetchedUserId = localStorage.getItem("user_id") || "";
      setUserId(fetchedUserId);
  
      // ✅ Fetch service fee only if userId exists
      const fetchServiceFee = async () => {
        if (!fetchedUserId) return;
  
        try {
          const response = await fetch("http://127.0.0.1:8000/api/shipping-fee", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ user_id: fetchedUserId }),
          });
  
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
          const data = await response.json();
          setServiceFee(data.shipping_fee);
        } catch (error) {
          console.error("❌ Service fee fetch failed:", error);
        }
      };
  
      fetchServiceFee();
    } catch (error) {
      console.error("❌ Error in useEffect:", error);
    }
  }, []); // ✅ Empty dependency array to run once on mount

  // ✅ Calculate total price
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const totalAmount = totalPrice + serviceFee;

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPaymentProof(e.target.files[0]);
      setQrCode(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handlePayment = async () => {
    if (paymentMethod === "gcash" && !paymentProof) {
      alert("❌ Please upload a payment proof image for GCash.");
      return; // Stop the payment process
    }
  
    setLoading(true);
  
    if (typeof window === "undefined") {
      console.error("❌ Window object not available.");
      setLoading(false);
      return;
    }
  
    const token = localStorage.getItem("token");
  
    if (!token || !userId) {
      alert("❌ Error: User not logged in. Please log in again.");
      setLoading(false);
      return;
    }
  
    // ✅ Create FormData for file upload
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("total", totalAmount.toString());
    formData.append("payment_method", paymentMethod);
  
    cartItems.forEach((item, index) => {
      formData.append(`items[${index}][product_id]`, item.id.toString());
      formData.append(`items[${index}][quantity]`, item.quantity.toString());
    });
  
    // ✅ Append `payment_proof` only if it exists and method is "gcash"
    if (paymentProof && paymentMethod === "gcash") {
      formData.append("payment_proof", paymentProof as Blob); // Ensure correct type
    }
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/payment-process", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // ✅ Sending as `FormData`
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert("✅ Payment Successful! Redirecting...");
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdate"));
  
        if (typeof router !== "undefined") {
          router.push("/tracker");
        } else {
          console.warn("⚠️ Router is not available.");
        }
      } else {
        alert(`❌ Payment failed: ${data.error || "Unknown error"}`);
      }
    } catch (error: unknown) {
      console.error("❌ Payment failed:", error);
  
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
  
      alert(`❌ Payment failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="min-h-screen py-6 px-4 flex flex-col items-center bg-yellow-50">
  <h1 className="text-3xl font-bold text-center mb-6 text-yellow-700">💳 Payment</h1>

  {cartItems.length === 0 ? (
    <p className="text-center text-yellow-600">Your cart is empty.</p>
  ) : (
    <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-6">
      {/* 🛒 Order Summary */}
      <div className="flex justify-end mb-4">
  <button
    onClick={() => (window.location.href = "/cart")}
    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-all"
  >
    <ArrowLeft size={18} />
    <span className="text-sm font-medium">Back</span>
  </button>
</div>
      <h2 className="text-lg font-semibold flex items-center gap-2 ml-4 text-yellow-700">
        🛒 Order Summary
      </h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-yellow-200">
            <th className="p-3 text-left">Item</th>
            <th className="p-3 text-center">Qty</th>
            <th className="p-3 text-center">Price</th>
            <th className="p-3 text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-3 flex items-center gap-2">
                <Image src={item.image || "/default-product.jpg"} alt={item.name} width={50} height={50} className="rounded" />
                <span>{item.name}</span>
              </td>
              <td className="p-3 text-center">{item.quantity}</td>
              <td className="p-3 text-center">₱ {Number(item.price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
              <td className="p-3 text-center">₱ {(Number(item.price) * item.quantity).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 💰 Total Summary */}
      <div className="mt-6 border-t pt-4">
        <h2 className="text-lg font-semibold mb-2 text-yellow-700">💰 Total Summary</h2>
        <div className="flex justify-between">
          <p>Subtotal:</p>
          <p>₱ {totalPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="flex justify-between">
          <p>Service Fee:</p>
          <p>₱ {serviceFee.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <p>Total Amount:</p>
          <p>₱ {totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-yellow-700">Payment Method:</h2>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full border rounded-md p-2 mt-2"
        >
          <option value="gcash">GCash</option>
        </select>
      </div>

      {/* Show GCash Details */}
      {paymentMethod === "gcash" && (
        <div className="mt-4  p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-yellow-800">📌 GCash Payment Details:</h2>
          <p><strong>Name:</strong> Angela Samarita Ramirez</p>
          <p><strong>GCash Number:</strong> 09660283179</p>
          <Image src="/images/gcash.png" alt="GCash QR Code" width={200} height={200} className="rounded shadow-md mx-auto" />
          <input type="file" accept="image/*" onChange={handleQrUpload} className="mt-2 border rounded-md p-2 w-full" />
          {qrCode && (
            <Image src={qrCode} alt="Uploaded Proof" width={150} height={150} className="rounded shadow-md mx-auto mt-2" />
          )}
        </div>
      )}

      <button
        onClick={handlePayment}
        className="mt-6 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold rounded-full hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300"
        disabled={loading}
      >
        {loading ? "Processing..." : "Confirm Payment"}
      </button>
    </div>
  )}
</div>

  );
}
