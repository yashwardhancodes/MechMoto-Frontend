import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { authApi } from "./api/authApi";
import { vendorApi } from "./api/vendorApi";

export const makeStore = () =>
	configureStore({
		reducer: {
			auth: authReducer,
			[authApi.reducerPath]: authApi.reducer,
			[vendorApi.reducerPath]: vendorApi.reducer,
		},
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(authApi.middleware, vendorApi.middleware),
	});

export type RootState = ReturnType<ReturnType<typeof makeStore>["getState"]>;
export type AppDispatch = ReturnType<typeof makeStore>["dispatch"];
