import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const vendorApi = createApi({
	reducerPath: "vendorApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as any).auth.token;
			console.log("token", token)
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			headers.set("Content-Type", "application/json");
			return headers;
		},
	}),
	endpoints: (builder) => ({
		getAllVendors: builder.query({
			query: () => "vendors",
		}),
		createVendor: builder.mutation({
			query: (vendorData) => ({
				url: "vendors",
				method: "POST",
				body: vendorData,
			}),
		}),
		getVendor: builder.query({
			query: (id) => `vendors/${id}`,
		}),
		updateVendor: builder.mutation({
			query: ({ id, ...data }) => ({
				url: `vendors/${id}`,
				method: "PUT",
				body: data,
			}),
		}),
		deleteVendor: builder.mutation({
			query: (id) => ({
				url: `vendors/${id}`,
				method: "DELETE",
			}),
		}),
	}),
});

export const {
	useGetAllVendorsQuery,
	useCreateVendorMutation,
	useGetVendorQuery,
	useUpdateVendorMutation,
	useDeleteVendorMutation,
} = vendorApi;
