"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/sidebar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";


type User = {
  id: number;
  name: string;
  email: string;
  contact_number: string;
};

type Booking = {
  id: number;
  name: string;
  email: string;
  service: string;
  contact_number: string;
  datetime: string;
  status: "Pending" | "Approved" | "Declined";
  user: User | null; 
};

export default function AdminBookingTracker() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvedBookings, setApprovedBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBookings, setSelectedBookings] = useState<Booking[]>([]);

  // Pagination states for table
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

  // Pagination states for selected date bookings
  const [selectedPage, setSelectedPage] = useState(1);
  const selectedBookingsPerPage = 9;
  const totalSelectedPages = Math.ceil(
    selectedBookings.length / selectedBookingsPerPage
  );

  // ✅ Fetch All Bookings
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/bookings")
      .then((response) => {
        // Explicitly define the type of 'booking' as 'Booking'
        setBookings(response.data.map((booking: Booking) => ({
          ...booking,
          user: booking.user || null,  // Ensure user is included
        })));
        setApprovedBookings(
          response.data.filter((booking: Booking) => booking.status === "Approved")
        );
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load bookings. Please try again.");
        setLoading(false);
      });
  }, []);
  // ✅ Format Date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // ✅ Update Booking Status
  const handleStatusUpdate = async (
    id: number,
    status: "Approved" | "Declined"
  ) => {
    const toastId = toast.info("Updating booking status...", {
      position: "top-right",
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
      icon: false,
    });

    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/bookings/${id}`,
        { status },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const updatedBooking = response.data.booking;

      // Update `bookings` state immediately
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === id
            ? { ...booking, status: updatedBooking.status }
            : booking
        )
      );

      // Update `approvedBookings` in real-time
      setApprovedBookings((prevApproved) => {
        if (status === "Approved") {
          return [...prevApproved, updatedBooking];
        } else {
          return prevApproved.filter((booking) => booking.id !== id);
        }
      });

      const icon =
        status === "Approved" ? (
          <FaCheckCircle className="text-green-500 text-lg" />
        ) : (
          <FaTimesCircle className="text-red-500 text-lg" />
        );

      toast.update(toastId, {
        render: (
          <div className="flex items-center gap-2">
            {icon} <span>Booking {status.toLowerCase()} successfully!</span>
          </div>
        ),
        type: status === "Approved" ? "success" : "error",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        isLoading: false,
        icon: false,
      });
    } catch (error) {
      toast.update(toastId, {
        render: (
          <div className="flex items-center gap-2">
            <FaTimesCircle className="text-red-500 text-lg" />
            <span>Failed to update booking status!</span>
          </div>
        ),
        type: "error",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        isLoading: false,
        icon: false,
      });
    }
  };

  // ✅ Get approved bookings for a specific date
  const getBookingsForDate = (date: Date) =>
    approvedBookings.filter(
      (booking) =>
        new Date(booking.datetime).toDateString() === date.toDateString()
    );

  // ✅ Handle Clicking a Date
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedBookings(getBookingsForDate(date));
  };

  // Pagination for the bookings table
  const displayedBookings = bookings.slice(
    (currentPage - 1) * bookingsPerPage,
    currentPage * bookingsPerPage
  );

  // Pagination for the selected date's bookings
  const displayedSelectedBookings = selectedBookings.slice(
    (selectedPage - 1) * selectedBookingsPerPage,
    selectedPage * selectedBookingsPerPage
  );



  return (



      <div className="flex pl-0 md:pl-60 bg-gray-100 dark:bg-gray-900 min-h-screen overflow-hidden">     

      
      
      <Sidebar />

      <div className="flex-1 px-4 md:px-6 transition-all md:ml-14">
        <header className="relative flex items-center justify-between bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 shadow-md px-4 md:px-6 py-4 rounded-lg mt-14">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
            Client Booking Tracker
          </h1>
        </header>

        <ToastContainer position="top-right" autoClose={3000} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 md:ml-6 lg:ml-10">
          <div className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📅 Approved Bookings
            </h2>
            <Calendar
              tileContent={({ date }) =>
                getBookingsForDate(date).length > 0 ? (
                  <div className="flex justify-center items-center">
                    <span className="text-red-500 text-xl">•</span>
                  </div>
                ) : null
              }
              onClickDay={handleDateClick}
            />

            {selectedDate && selectedBookings.length > 0 && (
              <div className="mt-4 p-4 border rounded-lg shadow bg-gray-100">
                <h3 className="text-md font-bold">
                  Bookings on {selectedDate.toDateString()}:
                </h3>
                <ul>
                  {displayedSelectedBookings.map((booking) => (
                    <li key={booking.id} className="text-sm">
                      {booking.name} - {booking.service} at{" "}
                      {new Date(booking.datetime).toLocaleTimeString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Table Section */}
          <div className="md:col-span-3">
            {loading ? (
              <p className="text-gray-600 text-center">Loading bookings...</p>
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : bookings.length === 0 ? (
              <p className="text-gray-600 text-center">No bookings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 bg-white rounded-lg shadow-lg">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-3 text-left">User</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Contact</th>
                      <th className="p-3 text-left">Service</th>
                      <th className="p-3 text-left">Date & Time</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedBookings.map((booking) => (
                      <tr key={booking.id} className="border-t border-gray-300">
                        <td className="p-3">{booking.name}</td>
                        <td className="p-3">{booking.email}</td>
                        <td className="p-3"> {booking.contact_number}</td>
                        <td className="p-3">{booking.service}</td>
                        <td className="p-3">{formatDate(booking.datetime)}</td>
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
                              onClick={() =>
                                handleStatusUpdate(booking.id, "Approved")
                              }
                              disabled={booking.status !== "Pending"}
                              className={`px-3 py-1 text-xs font-semibold rounded-md ${
                                booking.status === "Pending"
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
                              }`}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleStatusUpdate(booking.id, "Declined")
                              }
                              disabled={booking.status !== "Pending"}
                              className={`px-3 py-1 text-xs font-semibold rounded-md ${
                                booking.status === "Pending"
                                  ? "bg-red-600 text-white hover:bg-red-700"
                                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
                              }`}
                            >
                              Decline
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination for the table */}
                {bookings.length > bookingsPerPage && (
                  <div className="flex justify-center items-center mt-4 space-x-2 w-full">
                    {/* Previous Button */}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-md border bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-4 py-2 rounded-md border ${
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
                      className="px-4 py-2 rounded-md border bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
