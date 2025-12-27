// src/lib/redux/api/modelApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export interface Model {
  success: any;
  message: string;
  id: number;
  name: string;
 model_line: {
  id: number;
  name: string;
  car_make_id: number;
  car_make?: {
    name: string;
  };
};

  created_at?: string;
}

export interface PaginatedModelsResponse {
  models: Model[];
  total: number;
  page: number;
  limit: number;
}

export const modelApi = createApi({
  reducerPath: "modelApi",
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
  tagTypes: ["Model"],
  endpoints: (builder) => ({
    getAllModels: builder.query<PaginatedModelsResponse, { page: number; limit: number }>({
      query: ({ page = 1, limit = 10 }) => `/models?page=${page}&limit=${limit}`,
      // Backend returns { data: { models, total, page, limit } }
      transformResponse: (response: { data: PaginatedModelsResponse }) => response.data,
      providesTags: (result) =>
        result
          ? [
              // Tag each individual model
              ...result.models.map(({ id }) => ({ type: "Model" as const, id })),
              // Tag the entire list (for pagination)
              { type: "Model", id: "LIST" },
            ]
          : [{ type: "Model", id: "LIST" }],
    }),

    getModel: builder.query<Model, number>({
      query: (id: number) => `/models/${id}`,
      transformResponse: (response: { data: Model }) => response.data,
      providesTags: (result, error, id) => [{ type: "Model", id }],
    }),

    getGenerationsByModelLine: builder.query<
      { id: number; name: string }[],
      number
    >({
      query: (modelLineId: number) => `/models/by-model-line/${modelLineId}`,
      transformResponse: (response: { data: { id: number; name: string }[] }) =>
        response.data,
      providesTags: (result = [], error, modelLineId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Model" as const, id })),
              { type: "Model", id: `MODEL_LINE_${modelLineId}` },
            ]
          : [{ type: "Model", id: `MODEL_LINE_${modelLineId}` }],
    }),

    createModel: builder.mutation<Model, { model_lineId: number; name: string }>({
      query: (data) => ({
        url: "/models",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Model", id: "LIST" }],
    }),

    updateModel: builder.mutation<
      Model,
      { id: number; model_lineId?: number; name?: string }
    >({
      query: ({ id, ...data }) => ({
        url: `/models/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Model", id },
        { type: "Model", id: "LIST" },
      ],
    }),

    deleteModel: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `/models/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Model", id },
        { type: "Model", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllModelsQuery,
  useGetModelQuery,
  useLazyGetGenerationsByModelLineQuery,
  useCreateModelMutation,
  useUpdateModelMutation,
  useDeleteModelMutation,
} = modelApi;