import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BASE_URL}subscriptions/`,
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
  tagTypes: ["Subscription"],
  endpoints: (builder) => ({
    getAllSubscriptions: builder.query({
      query: () => "",
      providesTags: ["Subscription"],
    }),
    createSubscription: builder.mutation({
      query: (subscriptionData) => ({
        url: "create",
        method: "POST",
        body: subscriptionData,
      }),
      invalidatesTags: ["Subscription"],
    }),
    getSubscription: builder.query({
      query: (id) => `${id}`,
      providesTags: ["Subscription"],
    }),
    updateSubscription: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),
    deleteSubscription: builder.mutation({
      query: (id) => ({
        url: `${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subscription"],
    }),
  }),
});

export const {
  useGetAllSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useGetSubscriptionQuery,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
} = subscriptionApi;
