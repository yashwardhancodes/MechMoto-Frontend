import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const subcategoryApi = createApi({
  reducerPath: "subcategoryApi",
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
  tagTypes: ["Subcategory"],
  endpoints: (builder) => ({
    getAllSubcategories: builder.query({
      query: () => "/subcategories",
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
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
} = subcategoryApi;
