// lib/redux/api/notificationApi.ts (unchanged)
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store"; // Adjust path to your store

// Define interfaces for type safety
export interface Notification {
	id: number;
	userId: string | null;
	type: string;
	title: string;
	message: string;
	is_read: boolean;
	created_at: Date;
}

interface CreateNotificationInput {
	userId?: string;
	type: string;
	title: string;
	message: string;
}

interface PaginatedNotifications {
	data?: {
		notifications: Notification[];
		total: number;
	};
}

interface GetNotificationsOptions {
	read?: boolean;
	limit?: number;
	offset?: number;
}

interface MarkAllAsReadResponse {
	markedCount: number;
}

export const notificationApi = createApi({
	reducerPath: "notificationApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth?.token;
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			headers.set("Content-Type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["Notification"],
	endpoints: (builder) => ({
		getNotifications: builder.query<PaginatedNotifications, GetNotificationsOptions>({
			query: (options = {}) => ({
				url: "/notifications",
				params: options,
			}),
			providesTags: ["Notification"],
		}),
		getUnreadNotifications: builder.query<
			PaginatedNotifications,
			{ limit?: number; offset?: number }
		>({
			query: ({ limit, offset } = {}) => ({
				url: "/notifications/unread",
				params: { limit, offset },
			}),
			providesTags: ["Notification"],
		}),
		createNotification: builder.mutation<Notification, CreateNotificationInput>({
			query: (data) => ({
				url: "/notifications",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Notification"],
		}),
		markAsRead: builder.mutation<Notification, string>({
			query: (id) => ({
				url: `/notifications/${id}/read`,
				method: "PATCH",
			}),
			invalidatesTags: ["Notification"],
		}),
		markAllAsRead: builder.mutation<MarkAllAsReadResponse, void>({
			query: () => ({
				url: "/notifications/read-all",
				method: "PATCH",
			}),
			invalidatesTags: ["Notification"],
		}),
		deleteNotification: builder.mutation<void, string>({
			query: (id) => ({
				url: `/notifications/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Notification"],
		}),
	}),
});

export const {
	useGetNotificationsQuery,
	useGetUnreadNotificationsQuery,
	useCreateNotificationMutation,
	useMarkAsReadMutation,
	useMarkAllAsReadMutation,
	useDeleteNotificationMutation,
} = notificationApi;
