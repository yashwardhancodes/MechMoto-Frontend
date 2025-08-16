import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const partApi = createApi({
  reducerPath: "partApi",
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
  tagTypes: ["Part"],
  endpoints: (builder) => ({
    getAllParts: builder.query({
      query: () => "/parts",
      providesTags: ["Part"],
    }),
    createPart: builder.mutation({
      query: (partData) => ({
        url: "/parts",
        method: "POST",
        body: partData,
      }),
      invalidatesTags: ["Part"],
    }),
    getPart: builder.query({
      query: (id) => `/parts/${id}`,
      providesTags: ["Part"],
    }),
    updatePart: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/parts/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Part"],
    }),
    deletePart: builder.mutation({
      query: (id) => ({
        url: `/parts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Part"],
    }),
  }),
});

export const {
  useGetAllPartsQuery,
  useCreatePartMutation,
  useGetPartQuery,
  useUpdatePartMutation,
  useDeletePartMutation,
} = partApi;
