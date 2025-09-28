import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store"; // Adjust path to your store


interface Module {
	id: number;
	name: string;
	description: string | null;
	created_at: string;
}

interface PlanModule {
	id: number;
	planId: number;
	moduleId: number;
	quota: number;
	quota_unit: string | null;
	module: Module;
}

// Define interfaces for type safety
interface Plan {
	id: string;
	name: string;
	price: number;
	success?: any;
	description: string | null;
	period: "monthly" | "yearly";
	interval: number;
	razorpay_plan_id: string | null;
	status: "PENDING" | "ACTIVE";
	is_active: boolean;
	created_at: string;
	updated_at: string;
	plan_modules: PlanModule[];
	// Add other fields based on your API response
}

interface PlanInput {
  name?: string;
  price?: number;
  // Add other fields as needed
}

export const planApi = createApi({
  reducerPath: "planApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}plans/`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      console.log("token", token);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Plan"],
  endpoints: (builder) => ({
    getAllPlans: builder.query<Plan[], void>({
      query: () => "",
      providesTags: ["Plan"],
    }),
    createPlan: builder.mutation<Plan, PlanInput>({
      query: (planData) => ({
        url: "create",
        method: "POST",
        body: planData,
      }),
      invalidatesTags: ["Plan"],
    }),
    getPlan: builder.query<Plan, string>({
      query: (id) => `${id}`,
      providesTags: ["Plan"],
    }),
    updatePlan: builder.mutation<Plan, { id: string; data: PlanInput }>({
      query: ({ id, ...data }) => ({
        url: `${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Plan"],
    }),
    deletePlan: builder.mutation<void, string>({
      query: (id) => ({
        url: `${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Plan"],
    }),
  }),
});

export const {
  useGetAllPlansQuery,
  useCreatePlanMutation,
  useGetPlanQuery,
  useUpdatePlanMutation,
  useDeletePlanMutation,
} = planApi;