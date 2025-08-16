import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const partBrandApi = createApi({
  reducerPath: "partBrandApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["PartBrand"],
  endpoints: (builder) => ({
    getAllPartBrands: builder.query({
      query: () => "/part_brands",
      providesTags: ["PartBrand"],
    }),
    createPartBrand: builder.mutation({
      query: (partBrandData) => ({
        url: "/part_brands",
        method: "POST",
        body: partBrandData,
      }),
      invalidatesTags: ["PartBrand"],
    }),
    getPartBrand: builder.query({
      query: (id) => `/part_brands/${id}`,
      providesTags: ["PartBrand"],
    }),
    updatePartBrand: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/part_brands/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["PartBrand"],
    }),
    deletePartBrand: builder.mutation({
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
