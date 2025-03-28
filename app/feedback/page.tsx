"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

type Review = {
  id: number;
  user: { name: string };
  comment: string;
  image: string | null;
  created_at: string;
  published: boolean;
};

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/reviews")
      .then((response) => {
        const publishedReviews = response.data.filter((review: Review) => review.published);
        setReviews(publishedReviews);
      })
      .catch((err) => console.error("Error fetching reviews:", err));
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-32">
      <h2 className="text-2xl sm:text-3xl font-semibold text-[#4E342E] dark:text-[#D7CCC8] mb-6">
        Customer Reviews
      </h2>

      {/* Swiper for Reviews Carousel */}
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        className="relative mt-2 sm:mt-8 pb-28"
      >
        {reviews.length > 0 ? (
          reviews.map((review: Review) => (
            <SwiperSlide key={review.id}>
              <div
                className="shadow-lg rounded-lg overflow-hidden flex p-6 cursor-pointer transition-transform duration-300 transform hover:scale-105 motion-safe:animate-fadeIn"
                style={{
                  backgroundImage: "url('/wood-pattern.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: "#3E2723",
                  border: "2px solid #795548",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                  borderRadius: "12px",
                }}
                onClick={() => setSelectedReview(review)}
              >
                <div className="flex-shrink-0">
                  {review.image && (
                    <img
                      src={review.image}
                      alt={review.user.name}
                      className="w-24 h-24 object-cover rounded-full border-4 border-[#8D6E63] shadow-md"
                    />
                  )}
                </div>

                <div className="ml-4 flex-1">
                  <p className="text-sm font-semibold text-[#4E342E]">Reviewed by: {review.user.name}</p>
                  <p className="text-lg mt-2 line-clamp-2">
                    {review.comment.length > 100 ? `${review.comment.substring(0, 100)}...` : review.comment}
                  </p>
                  <p className="text-sm text-[#6D4C41] mt-5">
                    Submitted on: {new Date(review.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-300 text-center col-span-4">
            No reviews available.
          </p>
        )}
      </Swiper>

      {/* Modal for Full Review */}
      {selectedReview && (
        <Modal 
          isOpen={!!selectedReview} 
          onOpenChange={(isOpen) => {
            if (!isOpen) setSelectedReview(null);
          }}
        >
          <ModalContent className="bg-[#D7CCC8] dark:bg-[#5D4037] p-6 rounded-lg max-w-lg mx-auto transition-opacity duration-300">
            <ModalHeader className="text-lg font-bold text-[#3E2723] dark:text-white">
              Review by {selectedReview?.user.name}
            </ModalHeader>
            <ModalBody className="text-[#4E342E] dark:text-[#D7CCC8] mt-4">
              {selectedReview?.comment}
            </ModalBody>
            <ModalFooter className="flex justify-center">
              <Button onClick={() => setSelectedReview(null)} className="bg-[#795548] text-white px-4 py-2 rounded-md">
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
