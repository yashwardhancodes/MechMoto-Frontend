"use client";

import {
	useGetNotificationsQuery,
	useGetUnreadNotificationsQuery,
	useMarkAsReadMutation,
	useMarkAllAsReadMutation,
	useDeleteNotificationMutation,
	Notification,
} from "@/lib/redux/api/notificationApi";
import { io, Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { RootState } from "@/lib/redux/store";
import { useSelector } from "react-redux";

interface UseNotificationsOptions {
	limit?: number;
	offset?: number;
	read?: boolean;
}

interface UseNotificationsReturn {
	notifications: Notification[];
	total: number;
	unreadNotifications: Notification[];
	unreadCount: number;
	isLoading: boolean;
	markAsRead: (id: string) => void;
	markAllAsRead: () => void;
	deleteNotification: (id: string) => void;
	refetch: () => void;
}

let socket: Socket | null = null;

export const useNotifications = (options?: UseNotificationsOptions): UseNotificationsReturn => {
	// RTK Query calls
	const { data: paginatedData, isLoading, refetch } = useGetNotificationsQuery(options || {});
	const { data: unreadData } = useGetUnreadNotificationsQuery({ limit: 5 });

	// Local state for real-time updates
	const [localUnreadNotifications, setLocalUnreadNotifications] = useState<Notification[]>(
		unreadData?.data?.notifications || [],
	);
	const [localUnreadCount, setLocalUnreadCount] = useState<number>(unreadData?.data?.total || 0);

	const notifications = paginatedData?.data?.notifications || [];
	const total = paginatedData?.data?.total || 0;

	const [markAsRead] = useMarkAsReadMutation();
	const [markAllAsRead] = useMarkAllAsReadMutation();
	const [deleteNotification] = useDeleteNotificationMutation();

	const token = useSelector((state: RootState) => state.auth?.token);
	const isAuthenticated = !!token;
	const socketRef = useRef(socket);

	// Keep local state in sync when RTK Query updates
	useEffect(() => {
		if (unreadData?.data) {
			setLocalUnreadNotifications(unreadData.data.notifications);
			setLocalUnreadCount(unreadData.data.total);
		}
	}, [unreadData]);

	// Socket setup
	useEffect(() => {
		if (!isAuthenticated || socketRef.current) return;

		socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
			auth: { token },
			transports: ["websocket", "polling"],
		});

		socketRef.current = socket;

		socket.on("connect", () => console.log("Socket connected for notifications"));

		socket.on("newNotification", (newNotification: Notification) => {
			console.log("Received new notification:", newNotification);
			// Update local state instantly
			setLocalUnreadNotifications((prev) => [newNotification, ...prev]);
			setLocalUnreadCount((prev) => prev + 1);
			refetch(); // optional: refetch all notifications for full list
		});

		socket.on("disconnect", () => console.log("Socket disconnected"));
		socket.on("connect_error", (error) => console.error("Socket connection error:", error));

		return () => {
			socket?.disconnect();
			socket = null;
			socketRef.current = null;
		};
	}, [isAuthenticated, token, refetch]);

	// Handler functions
	const handleMarkAsRead = async (id: string) => {
		try {
			await markAsRead(id).unwrap();
			setLocalUnreadNotifications((prev) => prev.filter((n) => n.id.toString() !== id));
			setLocalUnreadCount((prev) => Math.max(prev - 1, 0));
			refetch();
		} catch (error) {
			console.error("Failed to mark as read:", error);
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await markAllAsRead().unwrap();
			setLocalUnreadNotifications([]);
			setLocalUnreadCount(0);
			refetch();
		} catch (error) {
			console.error("Failed to mark all as read:", error);
		}
	};

	const handleDeleteNotification = async (id: string) => {
		try {
			await deleteNotification(id).unwrap();
			setLocalUnreadNotifications((prev) => prev.filter((n) => n.id.toString() !== id));
			setLocalUnreadCount((prev) => Math.max(prev - 1, 0));
			refetch();
		} catch (error) {
			console.error("Failed to delete notification:", error);
		}
	};

	return {
		notifications,
		total,
		unreadNotifications: localUnreadNotifications,
		unreadCount: localUnreadCount,
		isLoading,
		markAsRead: handleMarkAsRead,
		markAllAsRead: handleMarkAllAsRead,
		deleteNotification: handleDeleteNotification,
		refetch,
	};
};
