import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const carMakeApi = createApi({
	reducerPath: "carMakeApi",
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
	tagTypes: ["CarMake"],
	endpoints: (builder) => ({
		getAllCarMakes: builder.query({
			query: () => "/car_makes",
			providesTags: ["CarMake"],
		}),
		createCarMake: builder.mutation({
			query: (carMakeData) => ({
				url: "/car_makes",
				method: "POST",
				body: carMakeData,
			}),
			invalidatesTags: ["CarMake"],
		}),
		getCarMake: builder.query({
			query: (id) => `/car_makes/${id}`,
			providesTags: ["CarMake"],
		}),
		updateCarMake: builder.mutation({
			query: ({ id, ...data }) => ({
				url: `/car_makes/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["CarMake"],
		}),
		deleteCarMake: builder.mutation({
			query: (id) => ({
				url: `/car_makes/${id}`,
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
