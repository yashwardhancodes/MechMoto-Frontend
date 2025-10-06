import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

// Define the expected response structure
interface ModelLinesResponse {
  data: string[];
  success: boolean;
}

// Optional stricter filter type
type ModelLineFilter = Record<string, string | number | boolean>;

export const modelLineApi = createApi({
  reducerPath: "modelLineApi",
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
  tagTypes: ["ModelLine"],
  endpoints: (builder) => ({
    getModelLines: builder.query<ModelLinesResponse, ModelLineFilter>({
      query: (filter) => {
        const filterString = Object.entries(filter)
          .map(([key, value]) => `${key}=${value}`)
          .join(",");
        return `/model-lines?filter=[${filterString}]`;
      },
      providesTags: ["ModelLine"],
    }),
  }),
});

export const { useGetModelLinesQuery, useLazyGetModelLinesQuery } = modelLineApi;