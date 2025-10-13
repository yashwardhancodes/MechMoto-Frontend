import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store"; // adjust path

interface CategoryResponse {
	data: {
		categories: any[];
		total: number;
		page: number;
		limit: number;
	};
}

export const categoryApi = createApi({
	reducerPath: "categoryApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth?.token; // ✅ properly typed
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			headers.set("Content-Type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["Category"],
	endpoints: (builder) => ({
		getAllCategories: builder.query<CategoryResponse, { page?: number; limit?: number }>({
			query: ({ page = 1, limit = 10 }) => ({
				url: "/categories",
				params: { page, limit },
			}),
			providesTags: ["Category"],
		}),
		createCategory: builder.mutation({
			query: (categoryData) => ({
				url: "/categories",
				method: "POST",
				body: categoryData,
			}),
			invalidatesTags: ["Category"],
		}),
		getCategory: builder.query({
			query: (id) => `/categories/${id}`,
			providesTags: ["Category"],
		}),
		updateCategory: builder.mutation({
			query: ({ id, ...data }) => ({
				url: `/categories/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Category"],
		}),
		deleteCategory: builder.mutation({
			query: (id) => ({
				url: `/categories/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Category"],
		}),
	}),
});

export const {
	useGetAllCategoriesQuery,
	useCreateCategoryMutation,
	useGetCategoryQuery,
	useUpdateCategoryMutation,
	useDeleteCategoryMutation,
} = categoryApi;
