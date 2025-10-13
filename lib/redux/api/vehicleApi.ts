import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the type for the Redux state
interface RootState {
	auth: {
		token?: string; // Token is optional, as it might not always be present
	};
}

interface VehicleResponse {
	data: {
		vehicles: any[];
		total: number;
		page: number;
		limit: number;
	};
}

export const vehicleApi = createApi({
	reducerPath: "vehicleApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
		prepareHeaders: (headers, { getState }) => {
			const state = getState() as RootState; // Specify the RootState type
			const token = state.auth.token;
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			headers.set("Content-Type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["Vehicle"],
	endpoints: (builder) => ({
		getAllVehicles: builder.query<VehicleResponse, { page?: number; limit?: number }>({
			query: ({ page = 1, limit = 10 }) => ({
				url: "vehicles",
				params: { page, limit },
			}),
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
			providesTags: ["Vehicle"],
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
		getProductionYears: builder.query({
			query: (modelLine) => `vehicles/production-years?model-line=${modelLine}`,
			providesTags: ["Vehicle"],
		}),
		getModifications: builder.query({
			query: ({ modelLine, productionYear }) =>
				`vehicles/modifications?model-line=${modelLine}&production-year=${productionYear}`,
			providesTags: ["Vehicle"],
		}),
		getFilteredVehicles: builder.query({
			query: ({ carMakeId, modelLine, productionYear, modification }) => {
				const queryParams = new URLSearchParams();
				if (carMakeId) queryParams.append("carMakeId", carMakeId.toString());
				if (modelLine) queryParams.append("modelLine", modelLine);
				if (productionYear) queryParams.append("productionYear", productionYear.toString());
				if (modification) queryParams.append("modification", modification);
				return `vehicles/filter?${queryParams.toString()}`;
			},
			providesTags: ["Vehicle"],
		}),
	}),
});

export const {
	useGetAllVehiclesQuery,
	useCreateVehicleMutation,
	useGetVehicleQuery,
	useUpdateVehicleMutation,
	useDeleteVehicleMutation,
	useLazyGetProductionYearsQuery,
	useLazyGetModificationsQuery,
	useLazyGetFilteredVehiclesQuery,
} = vehicleApi;
