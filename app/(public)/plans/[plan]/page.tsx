"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { setRedirect } from "@/lib/redux/slices/redirectSlice";
import { useDispatch, useSelector } from "react-redux";
import { useGetAllPlansQuery } from "@/lib/redux/api/planApi";
import { useCreateSubscriptionMutation } from "@/lib/redux/api/subscriptionApi";
import { setSubscriptionId } from "@/lib/redux/slices/authSlice";
import { RootState } from "@/lib/redux/store";

// ------------------
// Types
// ------------------
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
  id: string;
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

interface ComponentPlan {
  title: string;
  description: string;
  features: string[];
}

export default function PlanPage() {
  const params = useParams();
  const plan = params.plan as string;
  const [checked, setChecked] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  // ✅ Get subscription info from Redux auth state
  const subscriptionId = useSelector((state: RootState) => state.auth.user?.razorpaySubscriptionId);

  console.log("subscriptionId plan page", subscriptionId);

  const { data: allPlans, isLoading, isError } = useGetAllPlansQuery();
  const [createSubscription, { isLoading: isCreating }] =
    useCreateSubscriptionMutation();

  // Active plans
  const activePlans: Plan[] = allPlans
    ? allPlans.filter((plan: Plan) => plan.status === "ACTIVE")
    : [];

  // Selected plan from URL
  const selectedPlan = activePlans.find(
    (p: Plan) => p.name.toLowerCase().replace(/\s+/g, "-") === plan
  );

  // Component plan structure
  const data: ComponentPlan | undefined = selectedPlan
    ? {
      title: selectedPlan.name,
      description:
        selectedPlan.description ||
        "Get a certified mechanic to your location with this plan.",
      features: selectedPlan.plan_modules.length
        ? selectedPlan.plan_modules.map(
          (module) => `${module.module.name} (Quota: ${module.quota})`
        )
        : ["Quick roadside assistance", "Certified expert mechanics"],
    }
    : undefined;

  // -------------------------
  // Handle subscription create
  // -------------------------
  const handleRedirect = async () => {
    const storageKey = "auth";

    // ✅ Check localStorage first (persistent)
    let authData = localStorage.getItem(storageKey);
    if (!authData) {
      // Fallback to sessionStorage (current session)
      authData = sessionStorage.getItem(storageKey);
    }
    if (!authData) {
      router.push("/auth/login");
      dispatch(setRedirect(`/plans/${plan}`));
      return;
    }

    if (!selectedPlan) return;

    const newTab = window.open("", "_blank");

    try {
      const parsedAuth = JSON.parse(authData);
      const userId = parsedAuth?.user?.id;

      const payload = {
        userId,
        planId: selectedPlan.id,
        
      };


      const res = await createSubscription(payload).unwrap();

      if (res?.short_url && newTab) {
        newTab.location.href = res.short_url;

        const interval = setInterval(async () => {
          try {
            const checkRes = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}subscriptions/status/${res.id}`,
              {
                headers: {
                  Authorization: `Bearer ${parsedAuth?.token}`,
                },
              }
            );
            const statusData = await checkRes.json();

            if (
              statusData?.status === "active" ||
              statusData?.status === "completed"
            ) {
              clearInterval(interval);

              dispatch(
                setSubscriptionId(statusData?.razorpaySubscriptionId || null)
              );

              router.push(`/plans/${plan}/checkout/success`);
            }

            if (
              statusData?.status === "failed" ||
              statusData?.status === "cancelled" ||
              statusData?.status === "expired"
            ) {
              clearInterval(interval);
              router.push(`/plans/${plan}/checkout/failure`);
            }
          } catch (err) {
            console.error("Error checking subscription status:", err);
          }
        }, 5000);
      }
    } catch (err) {
      console.error("Error creating subscription:", err);
      if (newTab) newTab.close();
    }
  };

  // -------------------------
  // Render UI
  // -------------------------
  if (isLoading) {
    return <div className="p-10 text-center text-gray-600">Loading plan...</div>;
  }

  if (isError) {
    return (
      <div className="p-10 text-center text-red-500">Error loading plan</div>
    );
  }

  if (!data) {
    return <div className="p-10 text-center text-red-500">Plan not found</div>;
  }

  // ✅ Case 1: Already Purchased
  if (subscriptionId) {
    return (
      <div className="mx-auto py-16 px-6 md:px-32">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-12 text-center">
          <h2 className="text-3xl font-bold">
            🎉 You’ve already purchased the{" "}
            <span className="text-[#6BDE23]">{data.title}</span> Plan!
          </h2>
          <p className="text-gray-600 mt-4">
            You can manage your subscription in your{" "}
            <span
              onClick={() => router.push("/dashboard")}
              className="text-[#6BDE23] font-semibold cursor-pointer"
            >
              profile
            </span>
            .
          </p>
        </div>
      </div>
    );
  }

  // ✅ Case 2: Show normal checkout flow
  return (
    <div className="mx-auto bg-[rgba(154,225,68,0.023)] py-16 px-6 md:px-32">
      {/* Plan Section */}
      <div className="max-w-6xl mx-auto rounded-2xl bg-gradient-to-b from-[#000000] to-[#ECFFFB] p-[2px] shadow-lg">
        <div className="bg-white rounded-2xl p-10">
          {/* Title */}
          <h1 className="text-4xl font-bold text-center mb-12">
            You’ve selected the <br />
            <span className="text-[#6BDE23]">{data.title}</span>{" "}
            <span className="text-4xl font-bold">Plan</span>
          </h1>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left - Features */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                What you <span className="text-[#6BDE23]">get?</span>
              </h2>
              <ul className="space-y-5">
                {data.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-center text-lg text-black">
                    <CheckCircle2 className="text-[#6BDE23] w-6 h-6 mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right - Description */}
            <div>
              <p className="text-gray-600 leading-relaxed">{data.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-white shadow-md p-6 mt-24 rounded-xl">
        <h3 className="text-lg font-bold text-[#6BDE23] mb-3">
          Terms and Conditions
        </h3>
        <div className="h-52 overflow-y-auto rounded-md p-3 text-sm text-gray-600 leading-relaxed">
          <p>
            <strong>Last Revised:</strong> December 16, 2013
          </p>
          <p className="mt-2">
            Welcome to www.lorem-ipsum.info. This site is provided as a service
            to our visitors and may be used for informational purposes only.
          </p>
          <p className="mt-2 font-bold">1. YOUR AGREEMENT</p>
          <p>By using this Site, you agree to these Terms and Conditions...</p>
        </div>

        {/* Checkbox */}
        <label className="flex items-center space-x-2 mt-6">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="w-4 h-4 accent-[#6BDE23]"
          />
          <span className="text-sm text-gray-700">
            I confirm that I have read and accept the terms and conditions and
            privacy policy.
          </span>
        </label>
      </div>

      {/* Buy Now */}
      <div className="flex justify-end items-center">
        <button
          disabled={!checked || isCreating}
          onClick={handleRedirect}
          className={`mt-6 px-8 py-2 rounded-full text-lg font-semibold transition ${checked
              ? "bg-[#6BDE23] text-black"
              : "bg-gray-300 text-black cursor-not-allowed"
            }`}
        >
          {isCreating ? "Processing..." : "Buy Now"}
        </button>
      </div>
    </div>
  );
}
