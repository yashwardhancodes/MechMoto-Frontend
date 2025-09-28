"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket, { joinUserRoom } from "@/lib/utils/subscriptionSocket";
import { setSubscriptionId, clearSubscriptionId } from "@/lib/redux/slices/authSlice";
import { RootState } from "@/lib/redux/store"; // Import RootState from your store

// Define the User type based on your auth slice
interface User {
  id: string | number; // Adjust based on your user ID type (string or number)
  // Add other user properties if needed, e.g., name, email, etc.
}

export default function SubscriptionListener() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user as User | null);

  useEffect(() => {
    if (user?.id) {
      // Join user-specific socket room
      joinUserRoom(user.id);

      // Listen for subscription updates
      socket.on("subscription:update", (data: { status: string; subscriptionId?: string }) => {
        console.log("🔔 Subscription update received:", data);

        if (data.status === "ACTIVE" && data.subscriptionId) {
          dispatch(setSubscriptionId(data.subscriptionId));
        } else if (data.status === "INACTIVE") {
          dispatch(clearSubscriptionId());
        }
      });

      // Cleanup socket listener on unmount
      return () => {
        socket.off("subscription:update");
      };
    }
  }, [user, dispatch]);

  return null; // Component doesn’t render UI, just manages sockets
}