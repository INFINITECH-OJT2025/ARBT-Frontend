// "use client";

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/components/sidebar";

interface Team {
  id: number;
  name: string;
  role: string;
  description: string;
  image_url: string;
  status: "Active" | "Archived";
  imageFile?: File;
}

const TeamManagement = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState<Team | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showArchived, setShowArchived] = useState<boolean>(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.error("Error fetching teams:", err));
  }, []);

  const openForm = (team?: Team) => {
    setIsEditing(!!team);
    setNewTeam(
      team || {
        id: 0,
        name: "",
        role: "",
        description: "",
        image_url: "",
        status: "Active",
      }
    );
    setPreviewImage(null);
  };

  const closeForm = () => {
    setNewTeam(null);
    setIsEditing(false);
    setPreviewImage(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setNewTeam((prev) =>
      prev ? { ...prev, [e.target.name]: e.target.value } : null
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPreviewImage(URL.createObjectURL(file));
      setNewTeam((prev) => (prev ? { ...prev, imageFile: file } : null));
    }
  };

  const handleSaveTeam = async () => {
    if (
      !newTeam?.name.trim() ||
      !newTeam?.role.trim() ||
      !newTeam?.description.trim()
    ) {
      toast.error("Name, role, and description are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", newTeam.name);
    formData.append("role", newTeam.role);
    formData.append("description", newTeam.description);
    formData.append("status", newTeam.status);

    if (newTeam.imageFile) {
      formData.append("image", newTeam.imageFile);
    } else if (newTeam.image_url) {
      formData.append("image_url", newTeam.image_url);
    }

    const API_URL = "http://127.0.0.1:8000/api/teams";
    let url = API_URL;
    let method = "POST";

    if (isEditing) {
      url = `${API_URL}/${newTeam.id}`;
      formData.append("_method", "PUT");
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const text = await response.text();
      console.log("Raw Response:", text);

      const savedTeam = JSON.parse(text);

      if (!savedTeam || !savedTeam.id) {
        toast.error("Invalid response from server.");
        return;
      }

      setTeams((prev) =>
        isEditing
          ? prev.map((t) =>
              t.id === savedTeam.id
                ? {
                    ...savedTeam,
                    image_url: `${API_URL}/storage/team_images/${savedTeam.image_url}`,
                  }
                : t
            )
          : [
              ...prev,
              {
                ...savedTeam,
                image_url: `${API_URL}/storage/team_images/${savedTeam.image_url}`,
              },
            ]
      );

      toast.success(
        isEditing ? "Team updated successfully!" : "Team added successfully!"
      );
      closeForm();
    } catch (error) {
      console.error("Error updating team:", error);
      toast.error("Error updating team.");
    }
  };

  const handleArchiveTeam = async (id: number) => {
    if (!window.confirm("Are you sure you want to archive this team member?"))
      return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/teams/${id}/archive`,
        {
          method: "PATCH",
          headers: { Accept: "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to archive team");
      }

      setTeams((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "Archived" } : t))
      );
      toast.success("Team member archived successfully!");
    } catch (err) {
      console.error("Error archiving team member:", err);
      toast.error("Failed to archive team member.");
    }
  };

  const handleUnarchiveTeam = async (id: number) => {
    if (!window.confirm("Are you sure you want to unarchive this team member?"))
      return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/teams/${id}/unarchive`,
        {
          method: "PATCH",
          headers: { Accept: "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unarchive team");
      }

      setTeams((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "Active" } : t))
      );
      toast.success("Team member unarchived successfully!");
    } catch (err) {
      console.error("Error unarchiving team member:", err);
      toast.error("Failed to unarchive team member.");
    }
  };

  return (
    <div className="flex pl-0 md:pl-60 bg-gray-100 dark:bg-gray-900 min-h-screen overflow-hidden">     
      <Sidebar />
      <div className="flex-1 px-4 md:px-6 transition-all md:ml-14 overflow-hidden">
      <header className="relative flex items-center justify-between bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 shadow-md px-4 md:px-6 py-4 rounded-lg mt-14">
          <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
            Team Management
          </h1>
        </header>

        <ToastContainer />

        <div className="pl-6">
          <div className="flex gap-4 mb-4 pt-5 ">
            <button
              onClick={() => openForm()}
              className="bg-green-500 text-white px-4 py-2 text-sm rounded-lg font-bold"
            >
              Add New Member
            </button>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="bg-gray-500 text-white px-4 py-2 text-sm rounded-lg font-bold"
            >
              {showArchived ? "Show Active Members" : "Show Archived Members"}
            </button>
          </div>

          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded-md mb-4"
          />

          {newTeam && (
            <div className="relative bg-white p-4 rounded-lg shadow-md mb-6 w-full max-w-md sm:max-w-lg mx-auto">
              {/* ✅ Close Button */}

              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {isEditing ? "Edit" : "New"} Member
              </h2>

              {/* ✅ Input Fields */}
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={newTeam.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md mb-2"
              />
              <input
                type="text"
                name="role"
                placeholder="Role"
                value={newTeam.role}
                onChange={handleChange}
                className="w-full p-2 border rounded-md mb-2"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={newTeam.description}
                onChange={handleChange}
                className="w-full p-2 border rounded-md mb-2"
              />

              {/* ✅ Image Upload */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded-md mb-2"
              />

              {/* ✅ Image Preview */}
              {previewImage && (
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={150}
                  height={100}
                  className="rounded-md object-cover mb-2 mx-auto"
                />
              )}

              {/* ✅ Save Button (Full Width on Mobile) */}
              <button
                onClick={handleSaveTeam}
                className="bg-green-500 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
              >
                Save
              </button>
              <button
                onClick={closeForm}
                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 text-xs rounded-full"
              >
                ✕
              </button>
            </div>
          )}

          <div className="w-full px-4">
            <h2 className="text-lg font-bold mb-2">
              {showArchived ? "Archived Members" : "Active Members"}
            </h2>

            {/* ✅ Switch between LIST (mobile) & GRID (desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {teams
                .filter((t) =>
                  showArchived ? t.status === "Archived" : t.status === "Active"
                )
                .filter(
                  (t) =>
                    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.role.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((team) => (
                  <div
                    key={team.id}
                    className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center"
                  >
                    {/* ✅ Image Section (Centered & Responsive) */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden">
                      <Image
                        src={team.image_url || "/default-placeholder.jpg"}
                        alt={team.name}
                        width={100}
                        height={100}
                        className="object-cover w-full h-full"
                      />
                    </div>

                    {/* ✅ Member Details (Centered) */}
                    <h3 className="text-lg font-bold text-gray-800 mt-2">
                      {team.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{team.role}</p>

                    {/* ✅ Button Actions (Full Width on Mobile) */}
                    <div className="flex flex-col sm:flex-row justify-center gap-2 mt-3 w-full">
                      {team.status === "Active" ? (
                        <>
                          <button
                            onClick={() => openForm(team)}
                            className="bg-blue-500 text-white px-3 py-1 text-xs rounded-lg w-full sm:w-auto"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleArchiveTeam(team.id)}
                            className="bg-yellow-500 text-white px-3 py-1 text-xs rounded-lg w-full sm:w-auto"
                          >
                            Archive
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUnarchiveTeam(team.id)}
                          className="bg-yellow-500 text-white px-3 py-1 text-xs rounded-lg w-full sm:w-auto"
                        >
                          Unarchive
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
