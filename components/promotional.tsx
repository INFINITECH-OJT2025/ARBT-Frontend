"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

// ✅ Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// ✅ Define TypeScript interface for campaigns
interface CampaignImage {
  id: number;
  image: string; // Full URL from backend
}

interface Campaign {
  id: number;
  title: string;
  image: string;
  content: string;
  images?: CampaignImage[]; // ← Add this line
  archived?: boolean;
}

export default function PromotionalCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  const getFullImageUrl = (path?: string) => {
    if (!path) return "/default-placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `http://127.0.0.1:8000${path}`;
  };

  // ✅ Fetch only active campaigns dynamically
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/news")
      .then((res) => res.json())
      .then((data) => {
        const activeCampaigns = data.filter((c: Campaign) => !c.archived);
        setCampaigns(activeCampaigns);
      })
      .catch((err) => console.error("Error fetching campaigns:", err));
  }, []);

  // ✅ Show Modal
  const handleShowMore = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };

  // ✅ Hide Modal
  const closeModal = () => {
    setSelectedCampaign(null);
  };

  function CampaignCard({
    campaign,
    onClick,
  }: {
    campaign: Campaign;
    onClick: (c: Campaign) => void;
  }) {
    return (
      <button
      onClick={() => onClick(campaign)}
      className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden flex flex-col justify-between cursor-pointer text-left
        h-[450px] sm:h-[450px] md:h-[500px] w-full"
    >
        <div className="relative w-full h-[200px] sm:h-[250px] md:h-[300px]">
          <Image
            src={getFullImageUrl(
              campaign.images?.length
                ? campaign.images[0].image
                : campaign.image
            )}
            alt={campaign.title}
            layout="fill"
            objectFit="contain" 
            unoptimized // ← helpful for localhost
            className="rounded-t-lg mt-4 flex justify-center items-center"          />
        </div>
        <div className="p-4 sm:px-6 flex flex-col flex-grow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {campaign.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm line-clamp-3 flex-grow">
            {campaign.content}
          </p>
        </div>
      </button>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-32">
     <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-5">
          <span className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 text-transparent bg-clip-text">
           Promotional Campaigns
          </span>
        </h2>

      {/* ✅ Swiper Carousel for Mobile & Tablet */}
      <div className="lg:hidden ">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
          }}
          navigation
          pagination={{ clickable: true }}
          className="mt-6 pb-16"
        >
          {campaigns.length > 0 ? (
            campaigns.map((campaign) => (
              <SwiperSlide key={campaign.id} className="px-2">
                <CampaignCard campaign={campaign} onClick={handleShowMore} />
              </SwiperSlide>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-300 text-center">
              No active campaigns available.
            </p>
          )}
        </Swiper>
      </div>

      {/* ✅ Grid Layout for Desktop */}
      <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-6">
        {campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onClick={handleShowMore}
            />
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-300 col-span-full text-center">
            No active campaigns available.
          </p>
        )}
      </div>

      {/* ✅ Modal for Full Content */}
      {selectedCampaign && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className=" bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg relative w-[90%] max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
            {selectedCampaign.images && selectedCampaign.images.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={10}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                className="w-full h-[250px] sm:h-[300px] rounded-md mb-4 "
              >
                {selectedCampaign.images.map((img, index) => (
                  <SwiperSlide key={img.id}>
                    <div className="relative w-full h-[250px] sm:h-[300px] ">
                      <Image
                        src={getFullImageUrl(img.image)} // ✅ builds full image URL
                        alt={`Campaign Image ${index + 1}`}
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md"
                        unoptimized // ✅ use this for local dev (avoids domain issues)
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <Image
                src={getFullImageUrl(selectedCampaign.image)}
                alt={selectedCampaign.title}
                width={600}
                height={350}
                className="w-full h-[250px] sm:h-[300px] object-cover rounded-md mb-4"
                unoptimized // ✅ same here
              />
            )}
            <h3 className="text-lg font-semibold">{selectedCampaign.title}</h3>
            <p className="text-sm sm:text-base text-gray-600">
              {selectedCampaign.content}
            </p>

            <button
              className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ✅ Navigation Fix for Mobile */}
      <style jsx>{`
        .swiper-button-prev,
        .swiper-button-next {
          width: 30px;
          height: 30px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ✅ Keep arrows inside the Swiper container */
        .swiper-button-prev {
          left: 5px;
        }

        .swiper-button-next {
          right: 5px;
        }

        /* ✅ Adjust for smaller screens */
        @media (max-width: 640px) {
          .swiper-button-prev,
          .swiper-button-next {
            width: 24px;
            height: 24px;
          }

          .swiper-button-prev {
            left: 2px;
          }

          .swiper-button-next {
            right: 2px;
          }
        }
      `}</style>
    </div>
  );
}
