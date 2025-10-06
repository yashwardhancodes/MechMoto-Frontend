import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

interface LiveCallRequestResponse {
	success: any,
	data: LiveCallRequest[]
}

interface LiveCallRequest {
	id: number;
	userId: string;
	issue_description: string | null;
	status: string;
	scheduled_at: string | null;
	call_duration: number | null;
	call_notes: string | null;
	rating: number | null;
	created_at: string;
	updated_at: string;
}

interface CreateLiveCallRequestData {
	issue_description: string;
}

interface UpdateLiveCallRequestData {
	status?: string;
	scheduled_at?: string;
	call_duration?: number;
	call_notes?: string;
	rating?: number;
}

export const liveCallApi = createApi({
	reducerPath: "liveCallApi",
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
	tagTypes: ["LiveCall"],
	endpoints: (builder) => ({
		getLiveCallRequests: builder.query<LiveCallRequestResponse, void>({
			query: () => "/live-call-requests",
			providesTags: ["LiveCall"],
		}),
		getLiveCallRequest: builder.query<LiveCallRequest, number>({
			query: (id) => `/live-call-requests/${id}`,
			providesTags: ["LiveCall"],
		}),
		createLiveCallRequest: builder.mutation<LiveCallRequest, CreateLiveCallRequestData>({
			query: (data) => ({
				url: "/live-call-requests",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["LiveCall"],
		}),
		updateLiveCallRequest: builder.mutation<
			LiveCallRequest,
			{ id: number; data: UpdateLiveCallRequestData }
		>({
			query: ({ id, data }) => ({
				url: `/live-call-requests/${id}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: ["LiveCall"],
		}),
	}),
});

export const {
	useGetLiveCallRequestsQuery,
	useGetLiveCallRequestQuery,
	useCreateLiveCallRequestMutation,
	useUpdateLiveCallRequestMutation,
} = liveCallApi;
