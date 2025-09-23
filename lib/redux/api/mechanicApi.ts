import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const mechanicApi = createApi({
  reducerPath: "mechanicApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/v1/",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Mechanic"],
  endpoints: (builder) => ({
    // ✅ Get all mechanics
    getAllMechanics: builder.query({
      query: () => "mechanics",
      providesTags: ["Mechanic"],
    }),

    // ✅ Create new mechanic
    createMechanic: builder.mutation({
      query: (mechanicData) => ({
        url: "mechanics",
        method: "POST",
        body: mechanicData,
      }),
      invalidatesTags: ["Mechanic"],
    }),

    // ✅ Get single mechanic by id
    getMechanic: builder.query({
      query: (id) => `mechanics/${id}`,
      providesTags: ["Mechanic"],
    }),

    // ✅ Update mechanic
    updateMechanic: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `mechanics/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Mechanic"],
    }),

    // ✅ Delete mechanic
    deleteMechanic: builder.mutation({
      query: (id) => ({
        url: `mechanics/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Mechanic"],
    }),
  }),
});

export const {
  useGetAllMechanicsQuery,
  useCreateMechanicMutation,
  useGetMechanicQuery,
  useUpdateMechanicMutation,
  useDeleteMechanicMutation,
} = mechanicApi;
