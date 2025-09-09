import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Module {
  id: number;
  name: string;
  description: string | null;
  created_at: string; // 👈 should be string (API sends ISO string, not Date)
}

export const moduleApi = createApi({
  reducerPath: "moduleApi",
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
  tagTypes: ["Module"],
  endpoints: (builder) => ({
    getModules: builder.query<Module[], { filter?: Record<string, any> }>({
      query: (params) => {
        if (!params?.filter) {
          return "/modules";
        }
        const filterString = Object.entries(params.filter)
          .map(([key, value]) => `${key}=${value}`)
          .join(",");
        return `/modules?filter=[${filterString}]`;
      },
      transformResponse: (response: { success: boolean; data: Module[] }) =>
        response.data, // 👈 unwrap only the array
      providesTags: ["Module"],
    }),
  }),
});

export const { useGetModulesQuery, useLazyGetModulesQuery } = moduleApi;
