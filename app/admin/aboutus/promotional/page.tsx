"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/components/sidebar";

interface CampaignImage {
  id: number;
  news_id: number;
  image: string; // this will be a full URL from Laravel
}

interface Campaign {
  id: number;
  title: string;
  image: string; // main image
  content: string;
  archived?: boolean;
  imageFile?: File[];
  images?: CampaignImage[]; // ✅ Add this
}
const PromotionalCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [newCampaign, setNewCampaign] = useState<Campaign | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/news")
      .then((res) => res.json())
      .then((data) => setCampaigns(data))
      .catch((err) => {
        console.error("Error fetching campaigns:", err);
        toast.error("Failed to load campaigns.");
      });
  }, []);

  const handleRemoveExistingImage = (index: number, imageId: number) => {
    setNewCampaign((prev) =>
      prev
        ? {
            ...prev,
            images: prev.images?.filter((_, i) => i !== index),
          }
        : null
    );
    setRemovedImageIds((prev) => [...prev, imageId]);
    // ❌ Don't clear imageFile here
  };

  // ✅ Open Modal for Viewing Details
  const openModal = async (campaign: Campaign) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/news/${campaign.id}`);
      
      // Check if the response is successful
      if (!res.ok) {
        throw new Error(`Failed to fetch campaign details: ${res.statusText}`);
      }
      
      // Log the response to verify the body content
      const textResponse = await res.text(); // Get the raw response text
      console.log("Response Body:", textResponse);
  
      // Try parsing the JSON if the response body is valid
      const data = textResponse ? JSON.parse(textResponse) : null;
  
      if (!data) {
        throw new Error("Empty response received from the API");
      }
  
      setSelectedCampaign(data); // Set the state to display campaign details
    } catch (err) {
      console.error("Error fetching campaign details:", err);
      toast.error(`Failed to load campaign details`);
    }
  };
  

  // ✅ Close Modal
  const closeModal = () => {
    setSelectedCampaign(null);
  };

  // Open Form for Adding/Editing
  const openForm = (campaign?: Campaign) => {
    setIsEditing(!!campaign);
    setNewCampaign(
      campaign || { id: 0, title: "", image: "", content: "", archived: false }
    );
    setPreviewImage(null);
  };

  // Close Form
  const closeForm = () => {
    setNewCampaign(null);
    setIsEditing(false);
    setPreviewImage(null);
  };

  // Handle Input Changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewCampaign((prev) =>
      prev ? { ...prev, [e.target.name]: e.target.value } : null
    );
  };

  // Handle Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
  
      // When in edit mode, we append new images to the existing ones
      setNewCampaign((prev) =>
        prev
          ? {
              ...prev,
              imageFile: prev.imageFile ? [...prev.imageFile, ...fileArray] : fileArray,  // Append new files to existing ones
            }
          : null
      );
    }
  };

  // Save or Update Campaign
 const handleSaveCampaign = async () => {
  if (!newCampaign?.title.trim() || !newCampaign?.content.trim()) {
    toast.error("Title and content are required.");
    return;
  }

  const formData = new FormData();
  formData.append("title", newCampaign.title);
  formData.append("content", newCampaign.content);

  // ✅ Add new images (both existing and newly selected ones)
  if (newCampaign.imageFile && newCampaign.imageFile.length > 0) {
    newCampaign.imageFile.forEach((file) => {
      formData.append("images[]", file);  // Append all selected files to FormData
    });
  }

  // ✅ Add removed images if any
  if (removedImageIds.length > 0) {
    formData.append("removed_image_ids", JSON.stringify(removedImageIds));
  }

  try {
    const url = isEditing
      ? `http://127.0.0.1:8000/api/news/${newCampaign.id}`
      : `http://127.0.0.1:8000/api/news`;

    const response = await fetch(url, {
      method: isEditing ? "POST" : "POST",
      body: formData,
    });

    if (!response.ok) {
      toast.error("Failed to save campaign.");
      return;
    }

    const { news } = await response.json();

    setCampaigns((prev) =>
      isEditing
        ? prev.map((c) => (c.id === news.id ? news : c))
        : [...prev, news]
    );

    toast.success(
      isEditing
        ? `Updated "${newCampaign.title}" successfully!`
        : `Added "${newCampaign.title}" successfully!`
    );

    closeForm();
    setRemovedImageIds([]); // ✅ reset after save
    setNewCampaign(null); // ✅ clear imageFile too
  } catch (error) {
    console.error("Error updating campaign:", error);
    toast.error("Error updating campaign.");
  }
};


  const updateCampaignLocally = (updatedCampaign: Campaign) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c))
    );
  };

  // Optional: If you want to refetch all campaigns instead
  const fetchCampaigns = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/news");
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      toast.error("Failed to refresh campaigns.");
    }
  };

  // Archive campaign
  const handleArchiveCampaign = async (id) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/news/${id}/archive`,
        {
          method: "PATCH", // Use PATCH for partial updates
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ archived: 1 }),
        }
      );

      if (!response.ok) {
        console.error("Error: ", response.statusText);
        toast.error("Failed to archive campaign.");
        return;
      }

      const res = await response.json();
      console.log(res); // Log response for debugging
      const updated = res.news;

      setCampaigns((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      toast.warn("Campaign archived.");
    } catch (error) {
      console.error("Archive error:", error);
      toast.error("Error archiving campaign.");
    }
  };

  const handleUnarchiveCampaign = async (id) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/news/${id}/unarchive`,
        {
          method: "PATCH", // Use PATCH for partial updates
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ archived: 0 }),
        }
      );

      if (!response.ok) {
        console.error("Error: ", response.statusText);
        toast.error("Failed to unarchive campaign.");
        return;
      }

      const res = await response.json();
      console.log(res); // Log response for debugging
      const updated = res.news;

      setCampaigns((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );

      toast.success("Campaign unarchived.");
    } catch (error) {
      console.error("Unarchive error:", error);
      toast.error("Error unarchiving campaign.");
    }
  };

  const getFullImageUrl = (path?: string) => {
    if (!path) return "/images/default-placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `http://127.0.0.1:8000${path}`;
  };

  return (
    <div className="flex pl-0 md:pl-60 bg-gray-100 dark:bg-gray-900 min-h-screen overflow-hidden">
      <ToastContainer autoClose={3000} />

      <div className="flex-1 px-4 md:px-6 transition-all md:ml-14 overflow-hidden">
        <header className="relative flex items-center justify-between bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 shadow-md px-4 md:px-6 py-4 rounded-lg mt-14">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
            Promotional Campaigns
          </h1>
        </header>
        <div className="pl-6">
          <div className="flex gap-4 mb-4 pt-5">
            {/* ✅ Add Campaign Button */}
            {!isEditing && (
              <button
                onClick={() => openForm()}
                className="bg-green-500 text-white px-4 py-2 text-sm rounded-lg font-bold"
              >
                Add New Campaign
              </button>
            )}

            {/* ✅ Show Archived Campaigns Button */}
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="bg-gray-500 text-white px-4 py-2 text-sm rounded-lg font-bold"
            >
              {showArchived
                ? "Show Active Campaigns"
                : "Show Archived Campaigns"}
            </button>
          </div>
        </div>
        <div className="flex justify-center w-full pb-3">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md p-2 border rounded-md"
          />
        </div>

        {/* ✅ Add/Edit Campaign Form */}
        {newCampaign && (
          <div className="relative bg-white p-4 rounded-lg shadow-md mb-6 w-full max-w-sm mx-auto pt-3">
            {/* ✅ Close Button (Top Right) */}
            <button
              onClick={closeForm}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 text-xs rounded-full"
            >
              ✕
            </button>

            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {isEditing ? "Edit" : "New"} Campaign
            </h2>

            {/* ✅ Title Input */}
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={newCampaign.title}
              onChange={handleChange}
              className="w-full p-2 border rounded-md mb-2"
            />

            <div className="w-full">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="p-2 border rounded-md mb-2"
              />
            </div>

            {newCampaign.imageFile && newCampaign.imageFile.length > 0 && (
              <div className="w-full flex gap-2 overflow-x-auto mb-2">
                {newCampaign.imageFile.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative w-28 h-28 rounded-md overflow-hidden flex-shrink-0 border"
                  >
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`New Upload ${idx + 1}`}
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ✅ Image Preview (Ensures Instant Update) */}
            {isEditing &&
              newCampaign.images &&
              newCampaign.images.length > 0 && (
                <div className="w-full flex gap-2 overflow-x-auto mb-2">
                  {newCampaign.images.map((img, idx) => (
                    <div
                      key={img.id}
                      className="relative w-28 h-28 rounded-md overflow-hidden flex-shrink-0 border"
                    >
                      <Image
                        src={getFullImageUrl(img.image)}
                        alt={`Existing Image ${idx + 1}`}
                        width={112}
                        height={112}
                        className="object-cover w-full h-full"
                      />
                      <button
                        onClick={() => handleRemoveExistingImage(idx, img.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            {/* ✅ Content Input */}
            <textarea
              name="content"
              placeholder="Content"
              value={newCampaign.content}
              onChange={handleChange}
              className="w-full p-2 border rounded-md mb-2"
            />

            {/* ✅ Save Button */}
            <button
              onClick={handleSaveCampaign}
              className="bg-green-500 text-white px-4 py-2 rounded-lg w-full"
            >
              Save
            </button>
          </div>
        )}

        {/* ✅ Active Campaigns */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 pl-6">
          Active Campaigns
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pl-6">
          {campaigns
            .filter((c) => (showArchived ? c.archived : !c.archived))
            .filter((c) =>
              c.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white p-4 rounded-lg shadow-md w-full max-w-sm mx-auto"
              >
                <div className="relative w-full h-48">
                  <div className="flex gap-2 overflow-x-auto h-48">
                    {campaign.images?.map((img, index) => (
                      <div
                        key={index}
                        className="relative min-w-[160px] h-full rounded-md overflow-hidden"
                      >
                        <Image
                          src={getFullImageUrl(img.image)}
                          alt={`Campaign Image ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                          unoptimized
                          className="rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mt-2 truncate">
                  {campaign.title}
                </h3>
                <p className="text-gray-600 text-sm truncate">
                  {campaign.content}
                </p>

                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {!showArchived && (
                    <>
                      <button
                        onClick={() => openForm(campaign)}
                        className="bg-blue-500 text-white px-3 py-1 text-xs rounded-lg w-full sm:w-auto"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openModal(campaign)}
                        className="bg-green-500 text-white px-3 py-1 text-xs rounded-lg w-full sm:w-auto"
                      >
                        See More
                      </button>
                      <button
                        onClick={() => handleArchiveCampaign(campaign.id)}
                        className="bg-yellow-500 text-white px-3 py-1 text-xs rounded-lg w-full sm:w-auto"
                      >
                        Archive
                      </button>
                    </>
                  )}
                  {showArchived && (
                    <button
                      onClick={() => handleUnarchiveCampaign(campaign.id)}
                      className="bg-yellow-500 text-white px-3 py-1 text-xs rounded-lg w-full sm:w-auto"
                    >
                      Unarchive
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* ✅ Campaign Details Modal */}
{/* Modal for viewing campaign details */}
{selectedCampaign && (
  <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-800 bg-opacity-70 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-4xl w-full overflow-auto relative">
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full text-lg font-semibold"
      >
        ✕
      </button>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedCampaign.title}</h2>
      <p className="text-gray-600 text-lg mb-6">{selectedCampaign.content}</p>

      {/* Display images if any */}
      {selectedCampaign.images && selectedCampaign.images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {selectedCampaign.images.map((img, idx) => (
            <div key={idx} className="relative w-full h-48 rounded-md overflow-hidden shadow-lg">
              <Image
                src={getFullImageUrl(img.image)}
                alt={`Campaign Image ${idx + 1}`}
                width={300}
                height={200}
                className="object-contain w-full h-full transition-transform duration-300 transform hover:scale-105"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}


      </div>
    </div>
  );
};

export default PromotionalCampaigns;
