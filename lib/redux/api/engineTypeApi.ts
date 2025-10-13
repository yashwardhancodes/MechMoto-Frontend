import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store"; // adjust path to your store.ts

interface EngineTypeResponse {
	data: {
		engineTypes: EngineType[];
		total: number;
		page: number;
		limit: number;
	};
}

interface GetEngineTypeResponse {
	data: {
		id: number;
		name: string;
	};
	success: boolean;
}

interface UpdateEngineTypeResponse {
	data: {
		id: number,
		name: string,
	},
	message: string,
	success: boolean
}

export interface EngineType {
	id: number;
	name: string;
	created_at?: string;
	updated_at?: string;
}

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
		getAllEngineTypes: builder.query<EngineTypeResponse, { page?: number; limit?: number }>({
			query: ({ page = 1, limit = 10 }) => ({
				url: "engine_types",
				params: { page, limit },
			}),
			providesTags: ["EngineType"],
		}),
		createEngineType: builder.mutation<EngineType, { name?: string }>({
			query: (engineTypeData) => ({
				url: "engine_types",
				method: "POST",
				body: engineTypeData,
			}),
			invalidatesTags: ["EngineType"],
		}),
		getEngineType: builder.query<GetEngineTypeResponse, string | number>({
			query: (id) => `engine_types/${id}`,
			providesTags: ["EngineType"],
		}),
		updateEngineType: builder.mutation<
			UpdateEngineTypeResponse,
			{ id: string | number; name?: string }
		>({
			query: ({ id, ...data }) => ({
				url: `engine_types/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["EngineType"],
		}),
		deleteEngineType: builder.mutation<void, string | number>({
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
