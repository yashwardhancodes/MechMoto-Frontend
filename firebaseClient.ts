import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, MessagePayload } from "firebase/messaging";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);

let messaging: ReturnType<typeof getMessaging> | null = null;

export const getMessagingClient = () => {
	if (typeof window !== "undefined") {
		if (!messaging) {
			messaging = getMessaging(app);
		}
		return messaging;
	}
	return null;
};

export const requestNotificationPermission = async (userId: string) => {
	if (typeof window === "undefined") return; // avoid SSR

	try {
		const permission = await Notification.requestPermission();
		if (permission === "granted") {
			const messagingClient = getMessagingClient();
			if (!messagingClient) return;
			console.log("key is ", process.env.NEXT_PUBLIC_VAPID_KEY);
			const token = await getToken(messagingClient, {
				vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
			});

			console.log('token ', token);

			if (token) {
				await fetch(process.env.NEXT_PUBLIC_BASE_URL + "firebase/register-token", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ userId, token }),
				});
			}
		}
	} catch (err) {
		console.error("FCM Error:", err);
	}
};

export const listenForMessages = (callback: (payload: MessagePayload) => void) => {
	if (typeof window === "undefined") return; // avoid SSR
	const messagingClient = getMessagingClient();
	if (!messagingClient) return;

	onMessage(messagingClient, (payload) => {
		callback(payload);
	});
};
