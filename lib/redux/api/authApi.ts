import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logout } from "../slices/authSlice";
import type { RootState } from "../store"; // 👈 import RootState

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token; 
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (userData) => ({
        url: "auth/signup",
        method: "POST",
        body: userData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (err) {
          console.error("Signup error:", err);
        }
      },
    }),
    login: builder.mutation({
      query: (userData) => ({
        url: "auth/login",
        method: "POST",
        body: userData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("data", data);
          dispatch(setCredentials(data.data));
        } catch (err) {
          console.error("Login error:", err);
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch }) {
        dispatch(logout());
      },
    }),
  }),
});

export const { useSignupMutation, useLoginMutation, useLogoutMutation } = authApi;
