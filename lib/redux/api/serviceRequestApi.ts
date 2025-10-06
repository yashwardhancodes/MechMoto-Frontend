// lib/redux/api/serviceRequestApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

interface ServiceRequestResponse {
	success: any;
	data: ServiceRequest[];
}

interface ServiceRequest {
	id: number;
	userId: string;
	mechanicId?: number | null;
	issue_description: string | null;
	status: string;
	latitude?: number | null;
	longitude?: number | null;
	car_make?: string | null;
	car_model?: string | null;
	car_year?: string | null;
	reg_number?: string | null;
	requested_at: string;
	updated_at: string;
	geom?: string | null;
	user: {
		id: string;
		email: string | null;
		profiles: {
			full_name: string | null;
			phone: string | null;
		};
	};
	mechanic?: {
		id: number;
		full_name: string;
	} | null;
	service_center?: {
		id: number;
		name: string;
		address: string;
		latitude: number | null;
		longitude: number | null;
	} | null;
	service_request_assignments: {
		id: number;
		status: string;
		service_center: {
			id: number;
			name: string;
			userId: string;
			mechanics: Mechanic[];
			latitude: number | null;
			longitude: number | null;
		};
	}[];
}

interface Mechanic {
	city: string;
	created_at: string;
	full_name: string;
	geom: string;
	id: number;
	is_available: boolean;
	latitude: number;
	longitude: number;
	phone: string;
	rating: number;
	service_centerId: 1;
	updated_at: string;
	userId: string;
}

interface CreateServiceRequestData {
	issue_description: string;
	car_make?: string;
	car_model?: string;
	car_year?: string;
	reg_number?: string;
	latitude: number;
	longitude: number;
}

interface UpdateServiceRequestData {
	status?: string;
	mechanicId?: number;
	rating?: number;
	// other fields...
}

export const serviceRequestApi = createApi({
	reducerPath: "serviceRequestApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth?.token;
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			headers.set("Content-Type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["ServiceRequest"],
	endpoints: (builder) => ({
		getServiceRequests: builder.query<ServiceRequestResponse, void>({
			query: () => "/service-requests",
			providesTags: ["ServiceRequest"],
		}),
		getServiceRequest: builder.query<ServiceRequest, number>({
			query: (id) => `/service-requests/${id}`,
			providesTags: ["ServiceRequest"],
		}),
		createServiceRequest: builder.mutation<ServiceRequest, CreateServiceRequestData>({
			query: (data) => ({
				url: "/service-requests",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["ServiceRequest"],
		}),
		updateServiceRequest: builder.mutation<
			ServiceRequest,
			{ id: number; data: UpdateServiceRequestData }
		>({
			query: ({ id, data }) => ({
				url: `/service-requests/${id}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: ["ServiceRequest"],
		}),
		acceptServiceRequest: builder.mutation<ServiceRequest, { id: number; mechanicId: number }>({
			query: ({ id, mechanicId }) => ({
				url: `/service-requests/${id}/accept`,
				method: "POST",
				body: { mechanicId },
			}),
			invalidatesTags: ["ServiceRequest"],
		}),
	}),
});

export const {
	useGetServiceRequestsQuery,
	useGetServiceRequestQuery,
	useCreateServiceRequestMutation,
	useUpdateServiceRequestMutation,
	useAcceptServiceRequestMutation,
} = serviceRequestApi;
