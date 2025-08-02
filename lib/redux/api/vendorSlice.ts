import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const vendorSlice = createApi({
  reducerPath: 'vendorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/v1/',
    prepareHeaders: (headers) => {
      const authData = localStorage.getItem('auth');

      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          const token = parsed?.token;

          if (token) {
            headers.set('Authorization', `Bearer ${token}`);
          } else {
            console.warn('⚠️ Token not found in parsed auth data.');
          }
        } catch (error) {
          console.error('❌ Failed to parse auth data from localStorage:', error);
        }
      } else {
        console.warn('⚠️ No auth data found in localStorage.');
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    createVendor: builder.mutation({
      query: (vendorData) => ({
        url: 'vendors',
        method: 'POST',
        body: vendorData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),

    getAllVendors: builder.query({
      query: () => ({
        url: 'vendors',
        method: 'GET',
      }),
    }),
  }),
});

export const { useCreateVendorMutation, useGetAllVendorsQuery } = vendorSlice;
