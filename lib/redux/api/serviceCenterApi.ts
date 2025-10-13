import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the type for the Redux state
interface RootState {
	auth: {
		token?: string; // Token is optional, as it might not always be present
	};
}

interface ServiceCenterResponse {
	data: {
		serviceCenters: any[];
		total: number;
		page: number;
		limit: number;
	};
}

export const serviceCenterApi = createApi({
	reducerPath: "serviceCenterApi",
	baseQuery: fetchBaseQuery({
		baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}service_centers/`,
		prepareHeaders: (headers, { getState }) => {
			const state = getState() as RootState; // Specify the RootState type
			const token = state.auth.token;
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			headers.set("Content-Type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["ServiceCenter"],
	endpoints: (builder) => ({
		// Get all service centers
		getAllServiceCenters: builder.query<
			ServiceCenterResponse,
			{ page?: number; limit?: number }
		>({
			query: ({ page = 1, limit = 10 }) => ({
				url: "",
				params: { page, limit },
			}),
			providesTags: ["ServiceCenter"],
		}),

		// Create a new service center
		createServiceCenter: builder.mutation({
			query: (serviceCenterData) => ({
				url: "",
				method: "POST",
				body: serviceCenterData,
			}),
			invalidatesTags: ["ServiceCenter"],
		}),

		// Get a single service center by ID
		getServiceCenter: builder.query({
			query: (id: number) => `${id}`,
			providesTags: ["ServiceCenter"],
		}),

		// Update a service center
		updateServiceCenter: builder.mutation({
			query: ({ id, ...data }) => ({
				url: `${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["ServiceCenter"],
		}),

		// Delete a service center
		deleteServiceCenter: builder.mutation({
			query: (id) => ({
				url: `${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["ServiceCenter"],
		}),
	}),
});

export const {
	useGetAllServiceCentersQuery,
	useCreateServiceCenterMutation,
	useGetServiceCenterQuery,
	useUpdateServiceCenterMutation,
	useDeleteServiceCenterMutation,
} = serviceCenterApi;
