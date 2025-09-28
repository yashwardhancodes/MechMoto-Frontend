import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store"; // Adjust path to your store

interface PartBrandResponse {
	success: boolean;
	data: PartBrand[];
}


// Define interfaces for type safety
interface PartBrand {
  id: string;
  name: string;
  success?: any;
  data?: any
 }

interface PartBrandInput {
  name?: string;
  // Add other fields as needed
}

export const partBrandApi = createApi({
	reducerPath: "partBrandApi",
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
	tagTypes: ["PartBrand"],
	endpoints: (builder) => ({
		getAllPartBrands: builder.query<PartBrandResponse, void>({
			query: () => "/part_brands",
			providesTags: ["PartBrand"],
		}),
		createPartBrand: builder.mutation<PartBrand, PartBrandInput>({
			query: (partBrandData) => ({
				url: "/part_brands",
				method: "POST",
				body: partBrandData,
			}),
			invalidatesTags: ["PartBrand"],
		}),
		getPartBrand: builder.query<PartBrand, string>({
			query: (id) => `/part_brands/${id}`,
			providesTags: ["PartBrand"],
		}),
		updatePartBrand: builder.mutation<PartBrand, { id: string; data: PartBrandInput }>({
			query: ({ id, ...data }) => ({
				url: `/part_brands/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["PartBrand"],
		}),
		deletePartBrand: builder.mutation<void, string>({
			query: (id) => ({
				url: `/part_brands/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["PartBrand"],
		}),
	}),
});

export const {
  useGetAllPartBrandsQuery,
  useCreatePartBrandMutation,
  useGetPartBrandQuery,
  useUpdatePartBrandMutation,
  useDeletePartBrandMutation,
} = partBrandApi;