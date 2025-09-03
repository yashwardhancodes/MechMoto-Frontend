import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const planApi = createApi({
	reducerPath: "planApi",
	baseQuery: fetchBaseQuery({
		baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}plans/`,
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
	tagTypes: ["Plan"],
	endpoints: (builder) => ({
		getAllPlans: builder.query({
			query: () => "",
			providesTags: ["Plan"],
		}),
		createPlan: builder.mutation({
			query: (planData) => ({
				url: "create",
				method: "POST",
				body: planData,
			}),
			invalidatesTags: ["Plan"],
		}),
		getPlan: builder.query({
			query: (id) => `${id}`,
			providesTags: ["Plan"],
		}),
		updatePlan: builder.mutation({
			query: ({ id, ...data }) => ({
				url: `${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Plan"],
		}),
		deletePlan: builder.mutation({
			query: (id) => ({
				url: `${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Plan"],
		})
	}),
});

export const {
  useGetAllPlansQuery,
  useCreatePlanMutation,
  useGetPlanQuery,
  useUpdatePlanMutation,
  useDeletePlanMutation,
} = planApi;