import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store"; // adjust path!

interface MechanicResponse {
	data: {
		mechanics: any[];
		total: number;
		page: number;
		limit: number;
	};
}

export const mechanicApi = createApi({
	reducerPath: "mechanicApi",
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
	tagTypes: ["Mechanic"],
	endpoints: (builder) => ({
		getAllMechanics: builder.query<MechanicResponse, { page?: number; limit?: number }>({
			query: ({ page = 1, limit = 10 }) => ({
				url: "mechanics",
				params: { page, limit },
			}),
			providesTags: ["Mechanic"],
		}),
		createMechanic: builder.mutation({
			query: (mechanicData) => ({
				url: "mechanics",
				method: "POST",
				body: mechanicData,
			}),
			invalidatesTags: ["Mechanic"],
		}),
		getMechanic: builder.query({
			query: (id) => `mechanics/${id}`,
			providesTags: ["Mechanic"],
		}),
		updateMechanic: builder.mutation({
			query: ({ id, ...data }) => ({
				url: `mechanics/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Mechanic"],
		}),
		deleteMechanic: builder.mutation({
			query: (id) => ({
				url: `mechanics/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Mechanic"],
		}),
	}),
});

export const {
	useGetAllMechanicsQuery,
	useCreateMechanicMutation,
	useGetMechanicQuery,
	useUpdateMechanicMutation,
	useDeleteMechanicMutation,
} = mechanicApi;
