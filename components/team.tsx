"use client";

import Sidebar from "@/components/sidebar";
import React from "react";

const TeamPage = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow-md px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Our Team</h1>
        </header>

        {/* Content Section */}
        <main className="flex-1 p-6 bg-gray-50">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-10">
            Our Team
          </h2>
          <p className="text-center text-lg text-gray-600 mb-12">
            With Our Team, you can expect personalized attention and engaging
            designs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">            {/* Team Member 1 */}
          <div className="bg-white p-3 sm:p-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <img
                src="https://randomuser.me/api/portraits/women/44.jpg" // Example Image
                alt="Della Clover"
                className="w-full h-40 sm:h-48 object-cover rounded-t-lg"              />
              <div className="mt-4 text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">                  Della Clover
                </h3>
                <p className="text-gray-600 text-sm">UX Designer</p>
                <p className="mt-2 text-gray-500 text-sm">
                  Sed placerat luctus mi, mollis mattis nisl, accumsan mollis.
                </p>
              </div>
            </div>
            

            {/* Team Member 2 */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img
                src="https://randomuser.me/api/portraits/men/52.jpg" // Example Image
                alt="Gian Banks"
                className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-t-lg"              />
              <div className="mt-4 text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">                  Gian Banks
                </h3>
                <p className="text-gray-600 text-sm">Web Developer</p>
                <p className="mt-2 text-gray-500 text-sm">
                  Sed placerat luctus mi, mollis mattis nisl, accumsan mollis.
                </p>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img
                src="https://randomuser.me/api/portraits/women/68.jpg" // Example Image
                alt="Stella Zoe"
                className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-t-lg"              />
              <div className="mt-4 text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">                  Stella Zoe
                </h3>
                <p className="text-gray-600 text-sm">AI Expert</p>
                <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-snug">                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeamPage;
