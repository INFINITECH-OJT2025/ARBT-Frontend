"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Team {
  id: number;
  name: string;
  role: string;
  description: string;
  image_url: string;
  status: "Active" | "Archived";
}

const ActiveTeamMembers = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchActiveTeams = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/teams?status=Active"
        );
        const data = await response.json();
        setTeams(data.filter((team: Team) => team.status === "Active"));
      } catch (error) {
        console.error("Error fetching active teams:", error);
      }
    };

    fetchActiveTeams();
  }, []);

  return (
    <div className="p-6 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Team Management
      </h1>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
          {teams
            .filter(
              (t) =>
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.role.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((team) => (
              <div
                key={team.id}
                className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg flex flex-col items-center text-center border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <Image
                  src={team.image_url || "/default-placeholder.jpg"}
                  alt="Member"
                  width={300}
                  height={200}
                  className="rounded-md object-cover w-full border border-gray-300 dark:border-gray-600"
                />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-3">
                  {team.name}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  {team.role}
                </p>

                {/* ✅ Justified Description */}
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 text-justify">
                  {team.description}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveTeamMembers;
