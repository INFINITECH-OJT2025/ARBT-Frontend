"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/sidebar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

type Payment = {
  id: number;
  order_id: number;
  user_name: string;
  amount_paid: number;
  status: string;
  payment_proof: string | null;
  created_at: string;
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
};
// ✅ Payment Proof Component (Handles Image Modal)
function PaymentProof({ proofUrl }: { proofUrl: string | null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  if (!proofUrl) return <span>No Proof</span>;

  return (
    <>
      <img
        src={proofUrl}
        alt="Payment Proof"
        className="h-16 rounded w-16 cursor-pointer hover:scale-105 object-cover transition"
        onClick={() => setIsModalOpen(true)}
      />
      {isModalOpen && (
        <div
          className="flex bg-black bg-opacity-50 justify-center fixed inset-0 items-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white p-4 rounded-lg shadow-lg max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="text-gray-600 absolute hover:text-red-500 right-4 top-4"
              onClick={() => setIsModalOpen(false)}
            >
              ✖
            </button>
            <img
              src={proofUrl}
              alt="Full Payment Proof"
              className="rounded max-h-[80vh] max-w-full"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 4; // ✅ Loads 5 per page

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/admin/payments"
        );
        setPayments(response.data);
      } catch (err) {
        setError("Failed to load payments.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // ✅ Pagination Logic
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = payments.slice(
    indexOfFirstPayment,
    indexOfLastPayment
  );
  const totalPages = Math.ceil(payments.length / paymentsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAcceptPayment = async (paymentId: number) => {
    const toastId = toast.info("Processing payment...", {
      position: "top-right",
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
      icon: false, // ✅ Prevent default Toastify icon
    });

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.update(toastId, {
          render: "❌ You are not logged in!",
          type: "error",
          autoClose: 3000,
          isLoading: false,
        });
        return;
      }

      await axios.put(
        `http://127.0.0.1:8000/api/admin/payments/${paymentId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setPayments((prevPayments) =>
        prevPayments.map((p) =>
          p.id === paymentId ? { ...p, status: "Completed" } : p
        )
      );

      // ✅ Update toast with success
      toast.update(toastId, {
        render: (
          <div className="flex gap-2 items-center">
            <FaCheckCircle className="text-green-500 text-lg" />{" "}
            {/* ✅ Green Check Icon */}
            <span>Payment Accepted Successfully!</span>
          </div>
        ),
        type: "success",
        autoClose: 3000,
        isLoading: false,
        icon: false, // ✅ No default icon
      });
    } catch (err: any) {
      toast.update(toastId, {
        render: (
          <div className="flex gap-2 items-center">
            <FaTimesCircle className="text-lg text-red-500" />{" "}
            {/* ❌ Red Error Icon */}
            <span>
              {err.response?.data?.message || "Something went wrong."}
            </span>
          </div>
        ),
        type: "error",
        autoClose: 3000,
        isLoading: false,
        icon: false,
      });
    }
  };

  // ✅ Handle Decline Payment (Kept your pattern)
  const handleDeclinePayment = async (paymentId: number) => {
    const toastId = toast.info("Processing decline...", {
      position: "top-right",
      autoClose: false,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: false,
      icon: false,
    });

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.update(toastId, {
          render: "❌ You are not logged in!",
          type: "error",
          autoClose: 3000,
          isLoading: false,
        });
        return;
      }

      await axios.put(
        `http://127.0.0.1:8000/api/admin/payments/${paymentId}/decline`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setPayments((prevPayments) =>
        prevPayments.map((p) =>
          p.id === paymentId ? { ...p, status: "Failed" } : p
        )
      );

      // ✅ Show a red toast with a single ❌ icon
      toast.update(toastId, {
        render: (
          <div className="flex gap-2 items-center">
            <FaTimesCircle className="text-lg text-red-500" />{" "}
            {/* ❌ Red Cross Icon */}
            <span>Payment Declined Successfully!</span>
          </div>
        ),
        type: "error",
        autoClose: 3000,
        isLoading: false,
        icon: false,
      });
    } catch (err: any) {
      toast.update(toastId, {
        render: (
          <div className="flex gap-2 items-center">
            <FaTimesCircle className="text-lg text-red-500" />
            <span>
              {err.response?.data?.message || "Something went wrong."}
            </span>
          </div>
        ),
        type: "error",
        autoClose: 3000,
        isLoading: false,
        icon: false,
      });
    }
  };

  return (
    <div className="flex pl-0 md:pl-60 bg-gray-100 dark:bg-gray-900 min-h-screen overflow-hidden">
      {" "}
      <div className="flex-1 md:ml-14 md:px-6 px-4 transition-all">
        <header className="relative flex items-center justify-between bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 shadow-md px-4 md:px-6 py-4 rounded-lg mt-14">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
            Online Transaction
          </h1>
        </header>

        <ToastContainer position="top-right" autoClose={3000} />

        <div className="flex flex-1 flex-col">
          <div className="p-6 w-full">
            {loading ? (
              <p className="text-center text-gray-600">Loading payments...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <>
                {/* ✅ Desktop Table Layout */}
                <div className="hidden md:block overflow-x-auto">
                  <div className="bg-white border border-gray-300 rounded-lg shadow-lg">
                    <table className="w-full min-w-[700px] md:min-w-[1000px] border-collapse">
                      <thead className="bg-gray-200 sticky top-0 z-10">
                        <tr>
                          <th className="p-3 text-left w-[120px]">Order ID</th>
                          <th className="p-3 text-left w-[150px]">User</th>
                          <th className="p-3 text-left w-[130px]">
                            Order Details
                          </th>
                          <th className="p-3 text-left w-[130px]">Status</th>
                          <th className="p-3 text-left w-[180px]">
                            Payment Proof
                          </th>
                          <th className="p-3 text-left w-[200px]">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPayments.map((payment) => (
                          <tr key={payment.id} className="border text-center">
                            <td className="p-3 font-semibold text-gray-800">
                              #{payment.order_id}
                            </td>
                            <td className="p-3 font-semibold whitespace-nowrap">
                              {payment.user_name}
                            </td>
                            <td className="p-3 text-sm text-left">
                              {payment.items?.length > 0 ? (
                                <ul className="space-y-1">
                                  {payment.items.map((item, idx) => (
                                    <li
                                      key={idx}
                                      className="flex justify-between items-center"
                                    >
                                      <span className="whitespace-nowrap">
                                        {item.name} ({item.quantity}x)
                                      </span>
                                      <span className="font-semibold font-mono text-right min-w-[100px]">
                                        ₱{" "}
                                        {(
                                          item.price * item.quantity
                                        ).toLocaleString("en-PH", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="italic text-gray-400">
                                  No items
                                </span>
                              )}

                              <hr className="my-2" />
                              <p className="text-right text-sm font-mono">
                                Subtotal: ₱{" "}
                                {payment.items
                                  .reduce(
                                    (sum, item) =>
                                      sum + item.price * item.quantity,
                                    0
                                  )
                                  .toLocaleString("en-PH", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                              </p>
                              <p className="text-right text-sm font-mono">
                                Service Fee: ₱ 50.00
                              </p>
                              <p className="text-right font-bold font-mono">
                                Total: ₱{" "}
                                {(
                                  payment.items.reduce(
                                    (sum, item) =>
                                      sum + item.price * item.quantity,
                                    0
                                  ) + 50
                                ).toLocaleString("en-PH", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                            </td>

                            <td className="p-3">
                              <span
                    className={`px-4 py-2 text-sm font-semibold rounded-full inline-block ${
                      payment.status === "Completed"
                                    ? "bg-green-500 text-white"
                                    : payment.status === "Pending"
                                      ? "bg-yellow-500 text-white"
                                      : "bg-red-500 text-white"
                                }`}
                              >
                                {payment.status}
                              </span>
                            </td>
                            <td className="flex justify-center p-3 items-center">
                              <PaymentProof proofUrl={payment.payment_proof} />
                            </td>
                            <td className="p-3">
                              {payment.status === "Pending" ? (
                                <div className="flex flex-col md:flex-row justify-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleAcceptPayment(payment.id)
                                    }
                                    className="bg-green-500 rounded-md text-white hover:bg-green-600 px-3 py-1"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeclinePayment(payment.id)
                                    }
                                    className="bg-red-500 rounded-md text-white hover:bg-red-600 px-3 py-1"
                                  >
                                    Decline
                                  </button>
                                </div>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ✅ Mobile Card Layout */}
                <div className="md:hidden space-y-4">
                  {currentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-white border border-gray-300 rounded-lg shadow-md p-4"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                          #{payment.order_id}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === "Completed"
                              ? "bg-green-500 text-white"
                              : payment.status === "Pending"
                                ? "bg-yellow-500 text-white"
                                : "bg-red-500 text-white"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        <strong>User:</strong> {payment.user_name}
                      </p>
                      <p className="text-gray-600">
                        <strong>Amount Paid:</strong> ₱
                        {Number(payment.amount_paid).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <div className="flex justify-center my-3">
                        <PaymentProof proofUrl={payment.payment_proof} />
                      </div>
                      {payment.status === "Pending" ? (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleAcceptPayment(payment.id)}
                            className="bg-green-500 rounded-md text-white hover:bg-green-600 px-3 py-1"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclinePayment(payment.id)}
                            className="bg-red-500 rounded-md text-white hover:bg-red-600 px-3 py-1"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* ✅ Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-4 space-x-4">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 text-white rounded-md ${
                        currentPage === 1
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      Previous
                    </button>
                    <div className="flex space-x-2">
                      {Array.from({ length: totalPages }, (_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => goToPage(index + 1)}
                          className={`px-3 py-2 border rounded-md ${
                            currentPage === index + 1
                              ? "bg-blue-500 text-white"
                              : "hover:bg-gray-200"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 text-white rounded-md ${
                        currentPage === totalPages
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
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
