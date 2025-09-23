"use client";

import { useState } from "react";
import { CheckCircle2, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { setRedirect } from "@/lib/redux/slices/redirectSlice";
import { useDispatch } from "react-redux";
import { useGetAllPlansQuery } from "@/lib/redux/api/planApi";

// Define TypeScript interfaces for the API response
interface Module {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

interface PlanModule {
  id: number;
  planId: number;
  moduleId: number;
  quota: number;
  quota_unit: string | null;
  module: Module;
}

interface Plan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  period: "monthly" | "yearly";
  interval: number;
  razorpay_plan_id: string | null;
  status: "PENDING" | "ACTIVE";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  plan_modules: PlanModule[];
}

// Define interface for the component's plans array
interface ComponentPlan {
  name: string;
  price: string;
  duration: string;
  features: string[];
  highlight: boolean;
  tag?: string;
  link: string;
}

export default function Pricing() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; link: string } | null>(null);
  const dispatch = useDispatch();

  const { data: allPlans, isLoading, isError } = useGetAllPlansQuery({});

  // Transform and filter API data
  const plans: ComponentPlan[] = allPlans
    ? allPlans
        .filter((plan: Plan) => plan.status === "ACTIVE")
        .map((plan: Plan) => ({
          name: plan.name,
          price: plan.price.toString(),
          duration: plan.period === "monthly" ? "Monthly" : "Yearly",
          features: plan.plan_modules.length
            ? plan.plan_modules.map(
                (module) => `${module.module.name} (Quota: ${module.quota})`
              )
            : ["Quick roadside assistance", "Certified expert mechanics"],
          highlight: plan.name.toLowerCase().includes("premium"),
          tag: plan.name.toLowerCase().includes("premium") ? "Most Popular" : undefined,
          link: `/plans/${plan.name.toLowerCase().replace(/\s+/g, "-")}`,
        }))
    : [];

  const handleRedirect = (plan: { name: string; link: string }) => {
    const isLoggedIn = localStorage.getItem("auth");

    if (isLoggedIn) {
      router.push(plan.link);
    } else {
      setSelectedPlan(plan);
      setShowModal(true);
    }
  };

  if (isLoading) {
    return <div className="text-center mt-32">Loading plans...</div>;
  }

  if (isError) {
    return <div className="text-center mt-32 text-red-600">Error loading plans</div>;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-center items-center gap-12 mt-32 px-6 md:px-36">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative w-[350px] md:w-[380px] rounded-2xl p-[1.5px] bg-gradient-to-r from-[#9AE144] via-green-700 to-black shadow-xl transition-all duration-300 hover:scale-101 hover:shadow-xl`}
          >
            {/* Inner Card */}
            <div
              className={`rounded-2xl p-8 h-full flex flex-col py-12 justify-between relative
                ${plan.highlight ? "bg-gradient-to-b from-white to-green-50" : "bg-white"}
              `}
            >
              {/* Badge */}
              {plan.tag && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-l from-[#9AE144] to-green-700 text-black font-semibold px-4 py-1 rounded-full shadow-md">
                  {plan.tag}
                </span>
              )}

              {/* Arrow Icon (Top Right) */}
              <button
                onClick={() => handleRedirect(plan)}
                className="absolute top-4 right-4 bg-[#9AE144] hover:bg-green-600 transition rounded-full p-2"
              >
                <ArrowUpRight className="w-5 h-5 text-black" />
              </button>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{plan.name}</h2>
              <p className="text-base text-gray-600 mb-6">
                Get a certified mechanic to your location.
              </p>

              {/* Price */}
              <div className="text-5xl font-semibold text-gray-900 mb-4">
                Rs. {plan.price}/-
              </div>
              <p className="text-green-700 text-sm font-medium mb-6">
                {plan.duration}
              </p>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center text-gray-700 text-base font-medium"
                  >
                    <CheckCircle2 className="text-green-600 w-6 h-6 mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              You have selected the <span className="text-green-700">{selectedPlan.name}</span> plan
            </h3>
            <p className="text-gray-600 mb-6">Login to continue.</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  dispatch(setRedirect(selectedPlan.link));
                  router.push("/auth/login");
                }}
                className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}