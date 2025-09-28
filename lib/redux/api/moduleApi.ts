import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store"; // Adjust path to your store file

export interface Module {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

type ModuleFilter = Record<string, string | number | boolean>;

export const moduleApi = createApi({
  reducerPath: "moduleApi",
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
  tagTypes: ["Module"],
  endpoints: (builder) => ({
    getModules: builder.query<Module[], { filter?: ModuleFilter}>({
      query: (params) => {
        if (!params?.filter) {
          return "/modules";
        }

        // ✅ use URLSearchParams for correct encoding
        const queryString = new URLSearchParams(
          Object.entries(params.filter).map(([k, v]) => [k, String(v)])
        ).toString();

        return `/modules?${queryString}`;
      },
      transformResponse: (response: { success: boolean; data: Module[] }) =>
        response.data,
      providesTags: ["Module"],
    }),
  }),
});

export const { useGetModulesQuery, useLazyGetModulesQuery } = moduleApi;
