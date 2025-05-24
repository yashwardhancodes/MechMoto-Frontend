import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const signupSlice = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://mec-moto-be.onrender.com/api/v1/' }),
  endpoints: (builder) => ({
    signupUser: builder.mutation({
      query: (userData) => ({
        url: 'auth/signup',
        method: 'POST',
        body: userData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
  }),
});

export const { useSignupUserMutation } = signupSlice;
