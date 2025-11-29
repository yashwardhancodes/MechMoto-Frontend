"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { setRedirect } from "@/lib/redux/slices/redirectSlice";
import { useDispatch, useSelector } from "react-redux";
import { useGetAllPlansQuery } from "@/lib/redux/api/planApi";
import { useCreateSubscriptionMutation } from "@/lib/redux/api/subscriptionApi";
import { setSubscriptionId } from "@/lib/redux/slices/authSlice";
import { RootState } from "@/lib/redux/store";

 

export default function PlanPage() {
  const params = useParams();
  const plan = params.plan as string;

  const [checked, setChecked] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const subscriptionId = useSelector(
    (state: RootState) => state.auth.user?.razorpaySubscriptionId
  );

  const { data: allPlans, isLoading, isError } = useGetAllPlansQuery({
    page: 1,
    limit: 999999,
  });

  const [createSubscription, { isLoading: isCreating }] =
    useCreateSubscriptionMutation();

  // ======================================
  // Load Razorpay Script
  // ======================================
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => console.log("⚡ Razorpay SDK Loaded");
    script.onerror = () => console.error("❌ Razorpay SDK failed to load");

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const activePlans = allPlans
    ? allPlans.plans.filter((p) => p.status === "ACTIVE")
    : [];

  const selectedPlan = activePlans.find(
    (p) => p.name.toLowerCase().replace(/\s+/g, "-") === plan
  );

  const data = selectedPlan
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

  // ======================================================
  // 🚀 HANDLE SUBSCRIPTION CREATION + RAZORPAY CHECKOUT
  // ======================================================
  const handleRedirect = async () => {
    const storageKey = "auth";

    let authData = localStorage.getItem(storageKey);
    if (!authData) authData = sessionStorage.getItem(storageKey);

    if (!authData) {
      router.push("/auth/login");
      dispatch(setRedirect(`/plans/${plan}`));
      return;
    }

    const parsedAuth = JSON.parse(authData);

    try {
      const payload = {
        userId: parsedAuth?.user?.id,
        planId: selectedPlan?.id,
      };

      const res = await createSubscription(payload).unwrap();
      if (!res) return;

      // ================================
      // Check Razorpay SDK LOADED
      // ================================
      if (typeof window === "undefined" || !window.Razorpay) {
        alert("Razorpay SDK failed to load. Please refresh.");
        return;
      }

      // ================================
      // Razorpay Payment Options
      // ================================
      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: res?.razorpay_subscription_id,
        name: "MechMoto",
        description: selectedPlan?.name,
        image: "/logo.png",
        theme: { color: "#6BDE23" },
        handler: function (resp: any) {
          console.log("Razorpay Success:", resp);
        },
        modal: {
          ondismiss: function () {
            console.log("Checkout closed");
          },
        },
        prefill: {
          email: parsedAuth?.user?.email,
          contact: parsedAuth?.user?.phone || "",
        },
      };

      const razorpayObj = new window.Razorpay(options);
      razorpayObj.open();

      // ================================
      // Polling Subscription Status
      // ================================
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
          const s = statusData?.status?.toUpperCase();

          console.log("🔍 Subscription Status:", s);

          // SUCCESS STATES
          if (["AUTHENTICATED", "ACTIVE", "COMPLETED"].includes(s)) {
            clearInterval(interval);

            dispatch(
              setSubscriptionId(statusData?.razorpaySubscriptionId || null)
            );

            router.push(`/plans/${plan}/checkout/success`);
          }

          // FAILURE STATES
          if (["FAILED", "CANCELLED", "EXPIRED"].includes(s)) {
            clearInterval(interval);
            router.push(`/plans/${plan}/checkout/failure`);
          }
        } catch (err) {
          console.log("Polling error:", err);
        }
      }, 3000);
    } catch (err) {
      console.error("Error creating subscription:", err);
    }
  };

  // ======================================================
  // UI STATES
  // ======================================================
  if (isLoading)
    return <div className="text-center p-10">Loading plan...</div>;

  if (isError)
    return (
      <div className="text-center p-10 text-red-500">
        Error loading plan
      </div>
    );

  if (!data)
    return (
      <div className="text-center p-10 text-red-500">Plan not found</div>
    );

  // Already Purchased
  if (subscriptionId) {
    return (
      <div className="mx-auto py-16 px-6 md:px-32">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-12 text-center">
          <h2 className="text-3xl font-bold">
            🎉 You’ve already purchased the{" "}
            <span className="text-[#6BDE23]">{data.title}</span> Plan!
          </h2>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN UI
  // ======================================================
  return (
    <div className="mx-auto bg-[rgba(154,225,68,0.023)] py-16 px-6 md:px-32">

      <div className="max-w-6xl mx-auto rounded-2xl bg-gradient-to-b from-[#000000] to-[#ECFFFB] p-[2px] shadow-lg">
        <div className="bg-white rounded-2xl p-10">

          <h1 className="text-4xl font-bold text-center mb-12">
            You’ve selected the <br />
            <span className="text-[#6BDE23]">{data.title}</span>{" "}
            <span className="text-4xl font-bold">Plan</span>
          </h1>

          <div className="grid md:grid-cols-2 gap-12 items-start">
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

            <div>
              <p className="text-gray-600 leading-relaxed">{data.description}</p>
            </div>
          </div>
        </div>
      </div>

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

      <div className="flex justify-end items-center">
        <button
          disabled={!checked || isCreating}
          onClick={handleRedirect}
          className={`mt-6 px-8 py-2 rounded-full text-lg font-semibold transition ${
            checked
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
