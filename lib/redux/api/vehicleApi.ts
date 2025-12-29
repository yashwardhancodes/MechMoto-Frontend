import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the type for the Redux state
interface RootState {
	auth: {
		token?: string;
	};
}
interface ProductionYearsResponse {
	success: boolean;
	data: number[];
}
	
// Updated response shape to match the current backend
// - Includes direct `model` (primary)
// - Includes `modification.models` (fallback for old vehicles)
interface VehicleResponse {
	data: {
		vehicles: Array<{
      car_make: any;
      model_line: string;
			id: number;
			production_year: number;

			// Direct relation (new vehicles)
			model?: {
				id: number;
				name: string;
				model_line: {
					id: number;
					name: string;
					car_make: {
						id: number;
						name: string;
					};
				};
			} | null;

			// Modification with nested models (fallback for legacy data)
			modification?: {
				id: number;
				name: string;
				models?: Array<{
					id: number;
					name: string;
					model_line: {
						id: number;
						name: string;
						car_make: {
							id: number;
							name: string;
						};
					};
				}>;
			} | null;

			engine_type?: {
				id: number;
				name: string;
			} | null;

			// Optional _count if you use it in list view
			_count?: {
				parts: number;
				compatibility: number;
			};
		}>;
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
			const state = getState() as RootState;
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
		getAllVehicles: builder.query<
			VehicleResponse,
			{
				page?: number;
				limit?: number;
				make?: string;
				modelLine?: string;
				modification?: string;
				engineType?: string;
				productionYearFrom?: number;
				productionYearTo?: number;
				sortBy?: "newest" | "oldest";
			}
		>({
			query: (params) => ({
				url: "vehicles",
				params,
			}),
			providesTags: ["Vehicle"],
		}),

		createVehicle: builder.mutation<any, any>({
			query: (vehicleData) => ({
				url: "vehicles",
				method: "POST",
				body: vehicleData,
			}),
			invalidatesTags: ["Vehicle"],
		}),

		getVehicle: builder.query<any, string>({
			query: (id) => `vehicles/${id}`,
			providesTags: ["Vehicle"],
		}),

		updateVehicle: builder.mutation<any, { id: string; data: any }>({
			query: ({ id, ...data }) => ({
				url: `vehicles/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Vehicle"],
		}),

		deleteVehicle: builder.mutation<any, string>({
			query: (id) => ({
				url: `vehicles/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Vehicle"],
		}),

		getProductionYears: builder.query<ProductionYearsResponse, number>({
	query: (modelLine) => `vehicles/production-years?model-line=${modelLine}`,
	providesTags: ["Vehicle"],
}),


		getModifications: builder.query<any, { modelLine: string; productionYear: number }>({
			query: ({ modelLine, productionYear }) =>
				`vehicles/modifications?model-line=${modelLine}&production-year=${productionYear}`,
			providesTags: ["Vehicle"],
		}),

		getFilteredVehicles: builder.query<any, {
			carMakeId?: number;
			modelLine?: string;
			productionYear?: number;
			modification?: string;
		}>({
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