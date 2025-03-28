"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import {
  FaMoneyBillWave,
  FaClipboardCheck,
  FaUsers,
  FaChartLine,
  FaBox,
  FaShoppingCart,
} from "react-icons/fa";

interface ReportData {
  totalRevenue: number;
  totalBookings: number;
  activeClients: number;
}

interface ShopReport {
  totalSales: number;
  totalRevenue: number;
  mostSoldProduct: { name: string; quantity: number } | null;
  leastSoldProduct: { name: string; quantity: number } | null;
  recentSales: { id?: number; name: string; quantity: number; date: string }[];
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportData>({
    totalRevenue: 0,
    totalBookings: 0,
    activeClients: 0,
  });

  const [shopReport, setShopReport] = useState<ShopReport | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/booking-report")
      .then((response) => response.json())
      .then((data) => setReport(data))
      .catch((error) =>
        console.error("Error fetching approved booking report:", error)
      );
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/shop-report")
      .then((response) => response.json())
      .then((data) => setShopReport(data))
      .catch((error) => {
        console.error("Error fetching completed shop sales report:", error);
      });
  }, []);

  return (
    <div className="flex pl-0 md:pl-60 bg-gray-100 dark:bg-gray-900 min-h-screen overflow-hidden">     
      <Sidebar />

      <div className="flex-1 px-4 md:px-6 transition-all md:ml-14">
        <header className="relative flex items-center justify-between bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 shadow-md px-4 md:px-6 py-4 rounded-lg mt-14">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
            Dashboard Overview
          </h1>
        </header>

        <div className="pt-6 pl-6">
          {/* ✅ Booking Reports Section */}
          <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white mb-4 ml-3">
            🔖 Approved Booking Reports
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <FaMoneyBillWave />,
                title: "Total Revenue",
                value: `₱ ${report.totalRevenue.toLocaleString()}`, // Added a space after the peso sign
              },
              {
                icon: <FaClipboardCheck />,
                title: "Approved Bookings",
                value: report.totalBookings,
              },
              {
                icon: <FaUsers />,
                title: "Active Clients",
                value: report.activeClients,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4 border-l-4 border-green-500"
              >
                <div className="text-green-500 text-4xl">{item.icon}</div>
                <div>
                  <h2 className="text-sm md:text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {item.title}
                  </h2>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Shop Reports Section */}
          <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white mt-8 mb- ml-3">
            🛒 Approved Shop Sales Reports
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: <FaChartLine />,
                title: "Total Revenue (Sales)",
                value: `₱ ${shopReport?.totalRevenue?.toLocaleString() || 0}`,
              },                                           
              {
                icon: <FaShoppingCart />,
                title: "Total Sales",
                value: shopReport?.totalSales || 0,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4 border-l-4 border-blue-500"
              >
                <div className="text-blue-500 text-4xl">{item.icon}</div>
                <div>
                  <h2 className="text-sm md:text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {item.title}
                  </h2>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Best & Worst Selling Products */}
          <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white mt-8 mb-4 ml-3">
            🏆 Best & Worst Selling Products
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: <FaBox />,
                title: "Most Sold Product",
                name: shopReport?.mostSoldProduct?.name || "N/A",
                quantity: shopReport?.mostSoldProduct?.quantity || 0,
              },
              {
                icon: <FaBox />,
                title: "Least Sold Product",
                name: shopReport?.leastSoldProduct?.name || "N/A",
                quantity: shopReport?.leastSoldProduct?.quantity || 0,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4 border-l-4 border-yellow-500"
              >
                <div className="text-yellow-500 text-4xl">{item.icon}</div>
                <div>
                  <h2 className="text-sm md:text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {item.title}
                  </h2>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {item.name} ({item.quantity} units)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
