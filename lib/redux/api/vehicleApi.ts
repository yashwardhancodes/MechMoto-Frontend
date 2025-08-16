import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const vehicleApi = createApi({
  reducerPath: "vehicleApi",
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
  tagTypes: ["Vehicle"],  
  endpoints: (builder) => ({
    getAllVehicles: builder.query({
      query: () => "vehicles",
      providesTags: ["Vehicle"],  
    }),
    createVehicle: builder.mutation({
      query: (vehicleData) => ({
        url: "vehicles",
        method: "POST",
        body: vehicleData,
      }),
      invalidatesTags: ["Vehicle"],  
    }),
    getVehicle: builder.query({
      query: (id) => `vehicles/${id}`,
      providesTags: ["Vehicle"], // optional
    }),
    updateVehicle: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `vehicles/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Vehicle"],  
    }),
    deleteVehicle: builder.mutation({
      query: (id) => ({
        url: `vehicles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Vehicle"],  
    }),
  }),
});

export const {
  useGetAllVehiclesQuery,
  useCreateVehicleMutation,
  useGetVehicleQuery,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} = vehicleApi;
