"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSubscriptionId } from "@/lib/redux/slices/authSlice";

export default function CheckoutCallback() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { plan } = useParams();

  useEffect(() => {
    const subId = sessionStorage.getItem("pending_subscription_id");
    const token = sessionStorage.getItem("pending_subscription_token");

    if (!subId || !token) {
      router.replace(`/plans/${plan}`);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}subscriptions/status/${subId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (data?.status === "active" || data?.status === "completed") {
          dispatch(setSubscriptionId(data.razorpaySubscriptionId || null));
          sessionStorage.removeItem("pending_subscription_id");
          sessionStorage.removeItem("pending_subscription_token");
          router.replace(`/plans/${plan}/checkout/success`);
        }

        if (["failed", "cancelled", "expired", "halted"].includes(data?.status)) {
          sessionStorage.removeItem("pending_subscription_id");
          sessionStorage.removeItem("pending_subscription_token");
          router.replace(`/plans/${plan}/checkout/failure`);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 4000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      router.replace(`/plans/${plan}/checkout/failure`);
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [plan, router, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#6BDE23] border-t-transparent rounded-full mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold">Finalizing your purchase...</h2>
        <p className="text-gray-600 mt-2">Do not close or refresh this page.</p>
      </div>
    </div>
  );
}