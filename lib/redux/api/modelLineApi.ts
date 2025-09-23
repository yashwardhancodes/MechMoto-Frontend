import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const modelLineApi = createApi({
	reducerPath: "modelLineApi",
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
	tagTypes: ["ModelLine"],
	endpoints: (builder) => ({
		getModelLines: builder.query({
			query: (filter: Record<string, any>) => {
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
