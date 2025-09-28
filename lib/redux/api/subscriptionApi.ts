import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the type for the Redux state
interface RootState {
  auth: {
    token?: string; // Token is optional, as it might not always be present
  };
}

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}subscriptions/`,
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
  tagTypes: ["Subscription"],
  endpoints: (builder) => ({
    // Get all subscriptions
    getAllSubscriptions: builder.query({
      query: () => "",
      providesTags: ["Subscription"],
    }),

    // Create subscription
    createSubscription: builder.mutation({
      query: (subscriptionData) => ({
        url: "create",
        method: "POST",
        body: subscriptionData,
      }),
      invalidatesTags: ["Subscription"],
    }),

    // Get single subscription
    getSubscription: builder.query({
      query: (id) => `${id}`,
      providesTags: ["Subscription"],
    }),

    // Update subscription
    updateSubscription: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),

    // Delete subscription (soft delete in backend)
    deleteSubscription: builder.mutation({
      query: (id) => ({
        url: `${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subscription"],
    }),

    // Get subscription status (maps to controller.getSubscriptionStatus)
    getSubscriptionStatus: builder.query({
      query: (id) => `status/${id}`,
      providesTags: ["Subscription"],
    }),

    // Get active subscription with modules (maps to controller.getUserModules)
    getActiveSubscriptionWithModules: builder.query({
      query: () => `active`,
      providesTags: ["Subscription"],
    }),
  }),
});

export const {
  useGetAllSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useGetSubscriptionQuery,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useGetSubscriptionStatusQuery,
  useGetActiveSubscriptionWithModulesQuery,
} = subscriptionApi;