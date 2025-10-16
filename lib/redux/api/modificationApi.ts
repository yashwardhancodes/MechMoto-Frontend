// src/lib/redux/api/modificationApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export const modificationApi = createApi({
	reducerPath: "modificationApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth?.token;
			if (token) headers.set("Authorization", `Bearer ${token}`);
			headers.set("Content-Type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["Modification"],
	endpoints: (builder) => ({
		getAllModifications: builder.query({
			query: ({ page = 1, limit = 10 }) => `/modifications?page=${page}&limit=${limit}`,
			providesTags: ["Modification"],
		}),
		getModification: builder.query({
			query: (id) => `/modifications/${id}`,
			providesTags: ["Modification"],
		}),
		createModification: builder.mutation({
			query: (data) => ({
				url: "/modifications",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Modification"],
		}),
		updateModification: builder.mutation({
			query: ({ id, ...data }) => ({
				url: `/modifications/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Modification"],
		}),
		deleteModification: builder.mutation({
			query: (id) => ({
				url: `/modifications/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Modification"],
		}),
	}),
});

export const {
	useGetAllModificationsQuery,
	useGetModificationQuery,
	useCreateModificationMutation,
	useUpdateModificationMutation,
	useDeleteModificationMutation,
} = modificationApi;
