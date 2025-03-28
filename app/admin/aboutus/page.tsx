"use client";

import { useEffect, useState } from "react";
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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null); // Track which plan is being edited

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

      setPlans(response.data);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Plan
  ) => {
    if (!editingPlan) return;
    setEditingPlan({ ...editingPlan, [field]: e.target.value });
  };

  const handleFeatureChange = (index: number, value: string) => {
    if (!editingPlan) return;
    const updatedFeatures = [...editingPlan.features];
    updatedFeatures[index] = value;
    setEditingPlan({ ...editingPlan, features: updatedFeatures });
  };

  const handleSave = async () => {
    if (!editingPlan) return;

    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/subscription-plans/${editingPlan.id}`,
        editingPlan
      );
      setPlans((prev) =>
        prev.map((p) => (p.id === editingPlan.id ? editingPlan : p))
      );
      setEditingPlan(null);
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/subscription-plans/${id}`);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center gap-6 px-6 text-center text-gray-800 dark:text-gray-100">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold">Manage Subscription Plans</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Edit or remove plans for your construction business.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Loading plans...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
            >
              {editingPlan?.id === plan.id ? (
                <>
                  {/* Editable Fields */}
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) => handleInputChange(e, "name")}
                    className="border p-2 w-full mb-2"
                  />
                  <input
                    type="text"
                    value={editingPlan.price}
                    onChange={(e) => handleInputChange(e, "price")}
                    className="border p-2 w-full mb-2"
                  />
                  <textarea
                    value={editingPlan.description}
                    onChange={(e) => handleInputChange(e, "description")}
                    className="border p-2 w-full mb-2"
                  />

                  <ul className="mt-4 space-y-3 text-gray-700 dark:text-gray-400">
                    {editingPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) =>
                            handleFeatureChange(index, e.target.value)
                          }
                          className="border p-2 w-full"
                        />
                      </li>
                    ))}
                  </ul>

                  {/* Save & Cancel Buttons */}
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => setEditingPlan(null)}
                      className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-6 rounded-full"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Display Plan Details */}
                  <h2 className="text-2xl font-semibold">{plan.name}</h2>
                  <p className="text-xl text-yellow-600 font-bold mt-2">
                    {plan.price}
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

                  {/* Edit & Delete Buttons */}
                  <div className="mt-auto pt-6 flex justify-center gap-2">
                    <button
                      onClick={() => setEditingPlan(plan)}
                      className={buttonStyles({
                        color: "primary",
                        radius: "full",
                      })}
                    >
                      Edit
                    </button>
                    {/* <button
                      onClick={() => handleDelete(plan.id)}
                      className={buttonStyles({
                        color: "danger",
                        radius: "full",
                      })}
                    >
                      Delete
                    </button> */}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
