"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { rehydrateAuth } from "@/lib/redux/thunks/authThunks";
import { AppDispatch } from "@/lib/redux/store";
import useAuth from "@/hooks/useAuth";
import Loading from "@/components/custom/Loading";
// import socket from "@/lib/utils/subscriptionSocket";
// import { joinUserRoom } from "@/lib/utils/subscriptionSocket";
import { setSubscriptionId, clearSubscriptionId } from "@/lib/redux/slices/authSlice";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
	const dispatch = useDispatch<AppDispatch>();
	const { loading, user } = useAuth();

	// 🔹 Request notifications & listen for messages
	useEffect(() => {
		if (!user?.id) return;

		import("@/firebaseClient").then(({ requestNotificationPermission, listenForMessages }) => {
			requestNotificationPermission(user.id);
			listenForMessages((payload) => {
				console.log("Foreground message:", payload);
			});
		});
	}, [user?.id]);

	// 🔹 Rehydrate user + token from localStorage on mount
	useEffect(() => {
		dispatch(rehydrateAuth());
	}, [dispatch]);

	// 🔹 Setup subscription lifecycle socket listener
	// useEffect(() => {
	// 	if (!user?.id) return;

	// 	joinUserRoom(user.id);

	// 	socket.on("subscription:update", (data) => {
	// 		console.log("🔔 Subscription update:", data);

	// 		if (data.status === "ACTIVE") {
	// 			dispatch(setSubscriptionId(data.subscriptionId));
	// 		} else if (data.status === "INACTIVE") {
	// 			dispatch(clearSubscriptionId());
	// 		}
	// 	});

	// 	return () => {
	// 		socket.off("subscription:update");
	// 	};
	// }, [user?.id, dispatch]);

	if (loading) return <Loading />;

	return <>{children}</>;
}
