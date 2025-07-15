import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const loginSlice = createApi({
  reducerPath: 'loginApi',
  // baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000/api/v1/' }),
  baseQuery: fetchBaseQuery({ baseUrl: 'https://mec-moto-be.onrender.com/api/v1/' }),
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (userData) => ({
        url: 'auth/login',
        method: 'POST',
        body: userData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
  }),
});

export const { useLoginUserMutation } = loginSlice;
