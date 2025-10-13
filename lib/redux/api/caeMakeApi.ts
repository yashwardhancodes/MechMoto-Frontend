import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

interface CarMakeResponse {
	data: {
		carMakes: CarMake[];
		total: number;
		page: number;
		limit: number;
	};
}

// Define proper types
export interface CarMake {
	id: number;
	name: string;
	created_at?: string;
	updated_at?: string;
	success?: any;
}

export interface CreateCarMakeDto {
	name?: string;
}

export interface UpdateCarMakeDto {
	id: string | number;
	name: string;
}

export const carMakeApi = createApi({
	reducerPath: "carMakeApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth?.token;
			if (token) headers.set("Authorization", `Bearer ${token}`);
			headers.set("Content-Type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["CarMake"],
	endpoints: (builder) => ({
		getAllCarMakes: builder.query<CarMakeResponse, { page?: number; limit?: number }>({
			query: ({ page = 1, limit = 10 }) => ({
				url: "car_makes",
				params: { page, limit },
			}),
			providesTags: ["CarMake"],
		}),
		createCarMake: builder.mutation<CarMake, CreateCarMakeDto>({
			query: (carMakeData) => ({
				url: "car_makes",
				method: "POST",
				body: carMakeData,
			}),
			invalidatesTags: ["CarMake"],
		}),
		getCarMake: builder.query<CarMake, string | number>({
			query: (id) => `car_makes/${id}`,
			providesTags: ["CarMake"],
		}),
		updateCarMake: builder.mutation<CarMake, UpdateCarMakeDto>({
			query: ({ id, ...data }) => ({
				url: `car_makes/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["CarMake"],
		}),
		deleteCarMake: builder.mutation<void, string | number>({
			query: (id) => ({
				url: `car_makes/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["CarMake"],
		}),
	}),
});

export const {
	useGetAllCarMakesQuery,
	useCreateCarMakeMutation,
	useGetCarMakeQuery,
	useUpdateCarMakeMutation,
	useDeleteCarMakeMutation,
} = carMakeApi;
