"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Booking = {
  id: number;
  name: string;
  email: string;
  service: string;
  datetime: string;
  status: "Pending" | "Approved" | "Declined";
};

export default function AdminBookingTracker() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all bookings
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/bookings")
      .then((response) => {
        setBookings(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load bookings. Please try again.");
        setLoading(false);
      });
  }, []);

  // Function to approve or decline booking
  const handleStatusUpdate = async (id: number, status: "Approved" | "Declined") => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/bookings/${id}`, { status });

      // Update UI after success
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === id ? { ...booking, status } : booking
        )
      );
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        📅 Admin Booking Tracker
      </h2>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-300 text-center">Loading bookings...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300 text-center">No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Service</th>
                <th className="p-3 text-left">Date & Time</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t border-gray-300 dark:border-gray-700">
                  <td className="p-3">{booking.name}</td>
                  <td className="p-3">{booking.email}</td>
                  <td className="p-3">{booking.service}</td>
                  <td className="p-3">{new Date(booking.datetime).toLocaleString()}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
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
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(booking.id, "Approved")}
                        className="px-3 py-1 text-xs font-semibold rounded-md bg-green-600 text-white hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, "Declined")}
                        className="px-3 py-1 text-xs font-semibold rounded-md bg-red-600 text-white hover:bg-red-700"
                      >
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
