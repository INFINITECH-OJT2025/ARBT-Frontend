"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Import Next.js router
import axios from "axios";
import { button as buttonStyles } from "@heroui/theme";
import { CheckIcon } from "@heroicons/react/24/solid";

type Plan = {
  id: number;
  name: string;
  price: string;
  description: string;
  features: string[];
};

export default function SubscriptionSection() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // ✅ Initialize router

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/subscription-plans",
        {
          headers: { Accept: "application/json" },
        }
      );

      // Ensure "features" is always an array
      const formattedPlans = response.data.map((plan: any) => ({
        ...plan,
        features: Array.isArray(plan.features)
          ? plan.features
          : JSON.parse(plan.features),
      }));

      setPlans(formattedPlans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
    } finally {
      setLoading(false);
    }
  };


  const handlePlanSelection = (planName: string) => {
    if (typeof window === "undefined") return; // ✅ Ensure it's running on the client
  
    const router = useRouter(); // ✅ Define router inside the function
    const token = localStorage.getItem("token"); // ✅ Get stored token
  
    // ✅ Determine the navigation route
    const destination = token
      ? `/booking?plan=${encodeURIComponent(planName)}` // If logged in, go to booking
      : "/login"; // If NOT logged in, go to login
  
    router.push(destination);
  };

  return (
    <section className="flex flex-col items-center justify-center gap-6 px-6 text-center text-gray-800 dark:text-gray-100 min-h-screen bg-yellow-50 dark:bg-yellow-900">
      {/* Header Section */}
      <div className="max-w-2xl">
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Choose the perfect plan for your construction business.
        </p>
      </div>

      {/* Pricing Cards */}
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Loading plans...
        </p>
      ) : !plans ? (
        <p className="text-gray-600 dark:text-gray-400 text-center">
          No plans available.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col p-6 bg-white dark:bg-yellow-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              <h2 className="text-2xl font-semibold text-yellow-600 dark:text-yellow-300">
                {plan.name}
              </h2>
              <p className="text-xl text-blue-600 font-bold mt-2">
                ₱ {parseFloat(plan.price).toLocaleString()}
              </p>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                {plan.description}
              </p>
              <ul className="mt-6 space-y-3 text-gray-700 dark:text-gray-400">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      <CheckIcon className="w-4 h-4" />
                    </span>
                    <span className="flex-1 text-left">{feature}</span>
                  </li>
                ))}
              </ul>
              {/* "Choose Plan" Button */}
              <div className="mt-auto pt-6 flex justify-center">
                <button
                  onClick={() => handlePlanSelection(plan.name)}
                  className={`${buttonStyles({ color: "primary", radius: "full" })}  bg-gradient-to-r from-yellow-500 to-yellow-600 font-semibold text-white hover:bg-green-600 transition-all duration-300`}
                >
                  Choose Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
