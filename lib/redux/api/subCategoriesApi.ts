import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface RootState {
	auth: {
		token?: string; // Token is optional, as it might not always be present
	};
}

interface SubcategoryResponse {
	data: {
		subcategories: any[];
		total: number;
		page: number;
		limit: number;
	};
}

export const subcategoryApi = createApi({
	reducerPath: "subcategoryApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
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
	tagTypes: ["Subcategory"],
	endpoints: (builder) => ({
		getAllSubcategories: builder.query<SubcategoryResponse, { page?: number; limit?: number }>({
			query: ({ page = 1, limit = 10 }) => ({
				url: "/subcategories",
				params: { page, limit },
			}),
			providesTags: ["Subcategory"],
		}),
		createSubcategory: builder.mutation({
			query: (subcategoryData) => ({
				url: "/subcategories",
				method: "POST",
				body: subcategoryData,
			}),
			invalidatesTags: ["Subcategory"],
		}),
		getSubcategory: builder.query({
			query: (id) => `/subcategories/${id}`,
			providesTags: ["Subcategory"],
		}),
		getSubcategoriesByCategoryId: builder.query({
			query: (categoryId) => `/subcategories/category/${categoryId}`,
			providesTags: ["Subcategory"],
		}),
		updateSubcategory: builder.mutation({
			query: ({ id, ...data }) => ({
				url: `/subcategories/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Subcategory"],
		}),
		deleteSubcategory: builder.mutation({
			query: (id) => ({
				url: `/subcategories/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Subcategory"],
		}),
	}),
});

export const {
	useGetAllSubcategoriesQuery,
	useCreateSubcategoryMutation,
	useGetSubcategoryQuery,
	useLazyGetSubcategoriesByCategoryIdQuery,
	useUpdateSubcategoryMutation,
	useDeleteSubcategoryMutation,
} = subcategoryApi;
