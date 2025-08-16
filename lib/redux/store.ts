import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { authApi } from "./api/authApi";
import { vendorApi } from "./api/vendorApi";
import { vehicleApi } from "./api/vehicleApi";
import { carMakeApi } from "./api/caeMakeApi";  
import { engineTypeApi } from "./api/engineTypeApi";
import { categoryApi } from "./api/categoriesApi";
import { subcategoryApi } from "./api/subCategoriesApi";
import { partBrandApi } from "./api/partBrandApi";
import { partApi } from "./api/partApi";

export const makeStore = () =>
	configureStore({
		reducer: {
			auth: authReducer,
			[authApi.reducerPath]: authApi.reducer,
			[vendorApi.reducerPath]: vendorApi.reducer,
			[vehicleApi.reducerPath]: vehicleApi.reducer,
			[carMakeApi.reducerPath]: carMakeApi.reducer,
			[engineTypeApi.reducerPath]: engineTypeApi.reducer,
			[categoryApi.reducerPath]: categoryApi.reducer,
			[subcategoryApi.reducerPath]: subcategoryApi.reducer,
			[partBrandApi.reducerPath]: partBrandApi.reducer,
			[partApi.reducerPath]: partApi.reducer,
			
			
		},
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(authApi.middleware, vendorApi.middleware, vehicleApi.middleware,partApi.middleware,
				engineTypeApi.middleware,carMakeApi.middleware, categoryApi.middleware,subcategoryApi.middleware,partBrandApi.middleware),
	});

export type RootState = ReturnType<ReturnType<typeof makeStore>["getState"]>;
export type AppDispatch = ReturnType<typeof makeStore>["dispatch"];
