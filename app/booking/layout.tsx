import { Suspense } from "react";
import BookingPage from "./BookingPage";

export default function Booking() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading booking page...</div>}>
      <BookingPage />
    </Suspense>
  );
}