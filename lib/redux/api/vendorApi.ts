import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const vendorApi = createApi({
	reducerPath: "vendorApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as any).auth.token;
			console.log("token", token);
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			headers.set("Content-Type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["Vendor"],
	endpoints: (builder) => ({
		getAllVendors: builder.query({
			query: () => "vendors",
			providesTags: ["Vendor"],
		}),
		createVendor: builder.mutation({
			query: (vendorData) => ({
				url: "vendors",
				method: "POST",
				body: vendorData,
			}),
			invalidatesTags: ["Vendor"],
		}),
		getVendor: builder.query({
			query: (id) => `vendors/${id}`,
			providesTags: ["Vendor"],
		}),
		updateVendor: builder.mutation({
			query: ({ id, ...data }) => ({
				url: `vendors/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Vendor"],
		}),
		deleteVendor: builder.mutation({
			query: (id) => ({
				url: `vendors/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Vendor"],
		})
	}),
});

export const {
  useGetAllVendorsQuery,
  useCreateVendorMutation,
  useGetVendorQuery,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
} = vendorApi;
