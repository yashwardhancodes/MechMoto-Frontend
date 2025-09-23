"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket, { joinUserRoom } from "@/lib/utils/subscriptionSocket";
import { setSubscriptionId, clearSubscriptionId } from "@/lib/redux/slices/authSlice";

export default function SubscriptionListener() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    if (user?.id) {
      // join user-specific socket room
      joinUserRoom(user.id);

      // listen for subscription updates
      socket.on("subscription:update", (data) => {
        console.log("🔔 Subscription update received:", data);

        if (data.status === "ACTIVE") {
          dispatch(setSubscriptionId(data.subscriptionId));
        } else if (data.status === "INACTIVE") {
          dispatch(clearSubscriptionId());
        }
      });

      return () => {
        socket.off("subscription:update");
      };
    }
  }, [user, dispatch]);

  return null; // component doesn’t render UI, just manages sockets
}
