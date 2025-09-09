"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { setRedirect } from "@/lib/redux/slices/redirectSlice";
import { useDispatch } from "react-redux";
import { useGetAllPlansQuery } from "@/lib/redux/api/planApi";
import { useCreateSubscriptionMutation } from "@/lib/redux/api/subscriptionApi";
import { setSubscriptionId } from "@/lib/redux/slices/authSlice";


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

// Define interface for the component's plan data
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

  const { data: allPlans, isLoading, isError } = useGetAllPlansQuery({});
  const [createSubscription, { isLoading: isCreating }] =
    useCreateSubscriptionMutation();

  // Transform and filter API data
  const activePlans: Plan[] = allPlans
    ? allPlans.filter((plan: Plan) => plan.status === "ACTIVE")
    : [];

  // Find the plan that matches the URL parameter
  const selectedPlan = activePlans.find(
    (p: Plan) => p.name.toLowerCase().replace(/\s+/g, "-") === plan
  );

  // Map the selected plan to the component's data structure
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

  const handleRedirect = async () => {
    const authData = localStorage.getItem("auth");

    if (!authData) {
      router.push("/auth/login");
      dispatch(setRedirect(`/plans/${plan}`));
      return;
    }

    if (!selectedPlan) return;

    // 🔑 open tab immediately on click
    const newTab = window.open("", "_blank");

    try {
      const parsedAuth = JSON.parse(authData);
      const userId = parsedAuth?.user?.id;

      const payload = {
        userId,
        planId: selectedPlan.id,
        razorpaySubscriptionId: selectedPlan.razorpay_plan_id,
      };

      const res = await createSubscription(payload).unwrap();
      console.log("Subscription created:", res);

      if (res?.short_url && newTab) {
        newTab.location.href = res.short_url; // update tab with Razorpay link

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
            console.log("statusData", statusData);

            if (
              statusData?.status === "active" ||
              statusData?.status === "completed"
            ) {
              clearInterval(interval);

              // ✅ update redux + localStorage
              dispatch(setSubscriptionId(statusData?.razorpaySubscriptionId || null));

              // ✅ redirect to success page
              router.push(`/plans/${plan}/checkout/success`);
            }
          } catch (err) {
            console.error("Error checking subscription status:", err);
          }
        }, 5000);

      } else {
        router.push(`/plans/${plan}/checkout`);
      }
    } catch (err) {
      console.error("Error creating subscription:", err);
      if (newTab) newTab.close(); // close blank tab if error
    }
  };




  // 

  if (isLoading) {
    return <div className="p-10 text-center text-gray-600">Loading plan...</div>;
  }

  if (isError) {
    return <div className="p-10 text-center text-red-500">Error loading plan</div>;
  }

  if (!data) {
    return <div className="p-10 text-center text-red-500">Plan not found</div>;
  }

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
        <div className="h-52 overflow-y-auto rounded-md p-3 text-sm text-gray-600 leading-relaxed scrollbar-green scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
          <p>
            <strong>Last Revised:</strong> December 16, 2013
          </p>
          <p className="mt-2">
            Welcome to www.lorem-ipsum.info. This site is provided as a service
            to our visitors and may be used for informational purposes only.
          </p>
          <p className="mt-2 font-bold">1. YOUR AGREEMENT</p>
          <p>
            By using this Site, you agree to be bound by, and to comply with,
            these Terms and Conditions...
          </p>
          <p className="mt-2 font-bold">2. PRIVACY</p>
          <p>
            Please review our Privacy Policy, which also governs your visit to
            this Site, to understand our practices.
          </p>
          <p className="mt-2 font-bold">3. LINKED SITES</p>
          <p>
            This Site may contain links to other independent third-party Web
            sites...
          </p>
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
