"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import { Button } from "@heroui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast, ToastContainer } from "react-toastify"; // ✅ Import toast
import "react-toastify/dist/ReactToastify.css"; // ✅ Import toast styles

interface Booking {
  name: string;
  service: string;
  price: number;
}

interface BookingResponse {
  bookings: Booking[];
  totalPrice: number;
}

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const generatePDF = (title: string, headers: string[], data: any[][], totalPrice?: string) => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    const companyName = "ARBT";
    doc.text(companyName, 105, 10, { align: "center" });

    doc.setFontSize(14);
    doc.text(title, 105, 18, { align: "center" });

    doc.setFontSize(12);
    const dateRange = `From: ${formatDate(startDate)}  To: ${formatDate(endDate)}`;
    doc.text(dateRange, 105, 24, { align: "center" });

    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: data,
    });

    if (totalPrice) {
      doc.text(`Total Price: Php ${totalPrice}`, 14, doc.internal.pageSize.height - 20);
    }

    doc.save(`${title.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleDownloadBookingsReport = async () => {
    try {
      toast.info("📊 Fetching booking data...");
      const response = await fetch(
        `http://127.0.0.1:8000/api/export-approved-bookings?startDate=${startDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}`
      );
      if (!response.ok) throw new Error("Failed to fetch bookings data.");

      const data = (await response.json()) as BookingResponse;

      if (!data.bookings.length) {
        toast.info("No approved bookings found.");
        return;
      }

      generatePDF(
        "Approved Bookings Report",
        ["Client Name", "Service Availed", "Price"],
        data.bookings.map((booking) => [booking.name, booking.service, `Php ${Number(booking.price).toFixed(2)}`]),
        data.totalPrice.toLocaleString()
      );

      toast.success("Approved Bookings Report downloaded successfully!");
    } catch (error) {
      console.error("Error generating bookings report:", error);
      toast.error("Error generating bookings report.");
    }
  };




  const handleDownloadSalesReport = async () => {
    try {
      toast.info("📊 Fetching sales data...");
  
      const response = await fetch(
        `http://127.0.0.1:8000/api/get-sales-report?startDate=${startDate.toISOString().split("T")[0]}&endDate=${endDate.toISOString().split("T")[0]}`
      );
  
      if (!response.ok) throw new Error("❌ Failed to fetch sales report. Please try again.");
  
      const data = await response.json();
  
      // ✅ Improved check to prevent downloading when no sales data is found
      if (
        !data ||
        !data.totalSales ||
        data.totalSales === 0 ||
        !data.totalRevenue ||
        data.totalRevenue === 0 ||
        (!data.mostSoldProduct && !data.leastSoldProduct && (!data.recentSales || data.recentSales.length === 0))
      ) {
        toast.warning("No sales data found for the selected date range.");
        return; // Prevent download
      }
  
      // ✅ Generate PDF
      const doc = new jsPDF();
  
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("ARBT", 105, 10, { align: "center" });
  
      doc.setFontSize(14);
      doc.text("Sales Report", 105, 18, { align: "center" });
  
      doc.setFontSize(12);
      const dateRange = `From: ${formatDate(startDate)}  To: ${formatDate(endDate)}`;
      doc.text(dateRange, 105, 24, { align: "center" });
  
      // ✅ Sales Summary Table
      autoTable(doc, {
        startY: 30,
        head: [["Total Sales", "Total Revenue", "Most Sold Product", "Least Sold Product"]],
        body: [[
          data.totalSales,
          `Php ${data.totalRevenue.toLocaleString()}`,
          data.mostSoldProduct ? `${data.mostSoldProduct.name} (${data.mostSoldProduct.quantity})` : "N/A",
          data.leastSoldProduct ? `${data.leastSoldProduct.name} (${data.leastSoldProduct.quantity})` : "N/A"
        ]],
      });
  
      // ✅ Recent Sales Table
      if (data.recentSales && data.recentSales.length > 0) {
        autoTable(doc, {
          startY: 55,
          head: [["Product Name", "Quantity Sold", "Date"]],
          body: data.recentSales.map((sale: any) => [
            sale.name,
            sale.quantity,
            new Date(sale.date).toLocaleDateString()
          ]),
        });
      }
  
      // ✅ Save PDF & Show Success Toast
      const fileName = `sales_report_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
  
      toast.success("✅ Sales Report downloaded successfully!");
    } catch (error) {
      console.error("Error generating sales report:", error);
      toast.error("Error generating Sales Report.");
    }
  };

  return (
    <div className="flex pl-0 md:pl-60 bg-gray-100 dark:bg-gray-900 min-h-screen overflow-hidden">     
    <Sidebar />

    {/* ✅ Main content wrapper */}
    <div className="flex-1 px-4 md:px-6 transition-all md:ml-14 overflow-hidden">
    <header className="relative flex items-center justify-between bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 shadow-md px-4 md:px-6 py-4 rounded-lg mt-14">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
          Feedback & Reviews
          </h1>
      </header>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

       <div className="pl-6">
       <div className="bg-white p-6 rounded-lg shadow-md mt-6 ">
          <h2 className="text-xl font-semibold mb-4">Select Date Range</h2>
          <div className="flex gap-4">
            <div>
              <label className="block text-gray-700">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date as Date)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date as Date)}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Button
            onClick={handleDownloadSalesReport}
            className="bg-green-600 text-white py-2 rounded-lg"
          >
            Download Shop Sales Report
          </Button>
          <Button
            onClick={handleDownloadBookingsReport}
            className="bg-orange-600 text-white py-2 rounded-lg"
          >
            Download Bookings Report
          </Button>
        </div>
       </div>
      </div>
    </div>
  );
}
