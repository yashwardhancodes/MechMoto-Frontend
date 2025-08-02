import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
import { signupSlice } from './api/signupSlice';
import { loginSlice } from './api/loginSlice';
import { vendorSlice } from './api/vendorSlice';


export const makeStore = () =>
  configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      [signupSlice.reducerPath]: signupSlice.reducer,
      [loginSlice.reducerPath]: loginSlice.reducer,
      [vendorSlice.reducerPath] : vendorSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware , signupSlice.middleware, loginSlice.middleware,vendorSlice.middleware),
  });
