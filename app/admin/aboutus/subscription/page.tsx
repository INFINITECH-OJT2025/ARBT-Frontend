"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { button as buttonStyles } from "@heroui/theme";
import { CheckIcon } from "@heroicons/react/24/solid";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

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

      const formattedPlans = response.data.map((plan: any) => ({
        ...plan,
        features: Array.isArray(plan.features)
          ? plan.features
          : JSON.parse(plan.features),
      }));

      setPlans(formattedPlans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      toast.error("Failed to load plans.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingPlan) return;

    const confirmUpdate = window.confirm(
      `Are you sure you want to update the "${editingPlan.name}" plan?`
    );
    if (!confirmUpdate) return;

    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/subscription-plans/${editingPlan.id}`,
        {
          ...editingPlan,
          features: JSON.stringify(editingPlan.features),
        }
      );

      setPlans((prev) =>
        prev ? prev.map((p) => (p.id === editingPlan.id ? editingPlan : p)) : []
      );

      setEditingPlan(null);
      toast.success("Plan updated successfully!");
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update the plan.");
    }
  };

  return (
    <section className="flex pl-0 md:pl-60 bg-gray-100 dark:bg-gray-900 min-h-screen overflow-hidden">     
         <ToastContainer autoClose={3000} />
   
         <div className="flex-1 px-4 md:px-6 transition-all md:ml-14 overflow-hidden">
         <header className="relative flex items-center justify-between bg-gradient-to-r from-green-100 to-blue-100 dark:from-gray-800 dark:to-gray-900 shadow-md px-4 md:px-6 py-4 rounded-lg mt-14">
             <h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
             Services Offered
             </h1>
        </header>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Loading plans...
          </p>
        ) : !plans ? (
          <p className="text-gray-600 dark:text-gray-400 text-center">
            No plans available.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mt-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg h-full"
              >
                {editingPlan?.id === plan.id ? (
                  <>
                    <label className="block text-sm font-semibold mb-1">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={editingPlan.name}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          name: e.target.value,
                        })
                      }
                      className="border p-2 w-full mb-2"
                    />
                    <label className="block text-sm font-semibold mb-1">
                      Price
                    </label>
                    <input
                      type="text"
                      value={editingPlan.price}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          price: e.target.value,
                        })
                      }
                      className="border p-2 w-full mb-2"
                    />
                    <label className="block text-sm font-semibold mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingPlan.description}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          description: e.target.value,
                        })
                      }
                      className="border p-2 w-full mb-2"
                    />

                    {/* Features Section */}
                    <label className="block text-sm font-semibold mb-1">
                      Features
                    </label>
                    <div className="max-h-40 overflow-y-auto border p-2 rounded-md">
                      <ul className="space-y-3 text-gray-700 dark:text-gray-400">
                        {editingPlan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => {
                                const updatedFeatures = [
                                  ...editingPlan.features,
                                ];
                                updatedFeatures[index] = e.target.value;
                                setEditingPlan({
                                  ...editingPlan,
                                  features: updatedFeatures,
                                });
                              }}
                              className="border p-2 w-full"
                            />
                            {/* Remove Feature Button with Alert */}
                            <button
                              onClick={() => {
                                const confirmRemove = window.confirm(
                                  "Are you sure you want to remove this feature?"
                                );
                                if (!confirmRemove) return;

                                const updatedFeatures =
                                  editingPlan.features.filter(
                                    (_, i) => i !== index
                                  );
                                setEditingPlan({
                                  ...editingPlan,
                                  features: updatedFeatures,
                                });

                                toast.success("Feature removed.");
                              }}
                              className="bg-red-500 text-white px-2 py-1 rounded-md text-xs"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Add Feature Button */}
                    <button
                      onClick={() => {
                        setEditingPlan({
                          ...editingPlan,
                          features: [...editingPlan.features, ""],
                        });
                        toast.success("Feature added.");
                      }}
                      className="mt-2 bg-blue-500 text-white px-4 py-1 text-xs rounded-lg font-bold"
                    >
                      Add Feature
                    </button>

                    <div className="flex justify-between mt-auto pt-4">
                      <button
                        onClick={() => {
                          setEditingPlan(null);
                          toast.warning("Editing cancelled.");
                        }}
                        className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-full"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-full"
                      >
                        Save
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold">{plan.name}</h2>
                    <p className="text-xl text-yellow-600 font-bold mt-2">
  ₱ {parseFloat(plan.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    <div className="mt-auto pt-6 flex justify-center">
                      <button
                        onClick={() => {
                          setEditingPlan(plan);
                          toast.info(`Editing "${plan.name}"`);
                        }}
                        className="w-full max-w-[150px] bg-blue-500 text-white font-semibold py-2 px-6 rounded-full text-center"
                      >
                        Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
