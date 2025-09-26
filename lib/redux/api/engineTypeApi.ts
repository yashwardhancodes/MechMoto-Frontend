import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store"; // adjust path to your store.ts

export const engineTypeApi = createApi({
  reducerPath: "engineTypeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth?.token; // ✅ no more any
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["EngineType"],
  endpoints: (builder) => ({
    getAllEngineTypes: builder.query({
      query: () => "engine_types",
      providesTags: ["EngineType"],
    }),
    createEngineType: builder.mutation({
      query: (engineTypeData) => ({
        url: "engine_types",
        method: "POST",
        body: engineTypeData,
      }),
      invalidatesTags: ["EngineType"],
    }),
    getEngineType: builder.query({
      query: (id) => `engine_types/${id}`,
      providesTags: ["EngineType"],
    }),
    updateEngineType: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `engine_types/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["EngineType"],
    }),
    deleteEngineType: builder.mutation({
      query: (id) => ({
        url: `engine_types/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EngineType"],
    }),
  }),
});

export const {
  useGetAllEngineTypesQuery,
  useCreateEngineTypeMutation,
  useGetEngineTypeQuery,
  useUpdateEngineTypeMutation,
  useDeleteEngineTypeMutation,
} = engineTypeApi;
