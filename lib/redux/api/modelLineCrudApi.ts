// src/lib/redux/api/modelLineCrudApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export const modelLineCrudApi = createApi({
	reducerPath: "modelLineCrudApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth?.token;
			if (token) headers.set("Authorization", `Bearer ${token}`);
			headers.set("Content-Type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["ModelLine"],
	endpoints: (builder) => ({
		getAllModelLines: builder.query({
			query: ({ page = 1, limit = 10 }) => `/model-lines?page=${page}&limit=${limit}`,
			providesTags: ["ModelLine"],
		}),
		createModelLine: builder.mutation({
			query: (body) => ({
				url: "/model-lines",
				method: "POST",
				body,
			}),
			invalidatesTags: ["ModelLine"],
		}),
		getModelLine: builder.query({
			query: (id) => `/model-lines/${id}`,
			providesTags: ["ModelLine"],
		}),
		updateModelLine: builder.mutation({
			query: ({ id, ...data }) => ({
				url: `/model-lines/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["ModelLine"],
		}),
		deleteModelLine: builder.mutation({
			query: (id) => ({
				url: `/model-lines/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["ModelLine"],
		}),
	}),
});

export const {
	useGetAllModelLinesQuery,
	useCreateModelLineMutation,
	useGetModelLineQuery,
	useUpdateModelLineMutation,
	useDeleteModelLineMutation,
} = modelLineCrudApi;
