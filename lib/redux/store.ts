import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import checkoutReducer from "./slices/checkoutSlice";
import { authApi } from "./api/authApi";
import { vendorApi } from "./api/vendorApi";
import { vehicleApi } from "./api/vehicleApi";
import { carMakeApi } from "./api/caeMakeApi";  
import { engineTypeApi } from "./api/engineTypeApi";
import { categoryApi } from "./api/categoriesApi";
import { subcategoryApi } from "./api/subCategoriesApi";
import { partBrandApi } from "./api/partBrandApi";
import { partApi } from "./api/partApi";
import { modelLineApi } from "./api/modelLineApi";
import redirectReducer from "./slices/redirectSlice";
import breadcrumbReducer from "./slices/breadcrumbSlice";
import { planApi } from "./api/planApi";
import { subscriptionApi } from "./api/subscriptionApi";
import { moduleApi } from "./api/moduleApi";
import { serviceCenterApi } from "./api/serviceCenterApi";
import { mechanicApi } from "./api/mechanicApi";
import { liveCallApi } from "./api/liveCallApi";
import { serviceRequestApi } from "./api/serviceRequestApi";
import { notificationApi } from "./api/notificationApi";


export const makeStore = () =>
	configureStore({
		reducer: {
			auth: authReducer,
			checkout: checkoutReducer,
			redirect: redirectReducer,
			breadcrumb: breadcrumbReducer,
			[authApi.reducerPath]: authApi.reducer,
			[vendorApi.reducerPath]: vendorApi.reducer,
			[vehicleApi.reducerPath]: vehicleApi.reducer,
			[carMakeApi.reducerPath]: carMakeApi.reducer,
			[engineTypeApi.reducerPath]: engineTypeApi.reducer,
			[categoryApi.reducerPath]: categoryApi.reducer,
			[subcategoryApi.reducerPath]: subcategoryApi.reducer,
			[partBrandApi.reducerPath]: partBrandApi.reducer,
			[partApi.reducerPath]: partApi.reducer,
			[modelLineApi.reducerPath]: modelLineApi.reducer,
			[planApi.reducerPath]:planApi.reducer,
			[subscriptionApi.reducerPath]:subscriptionApi.reducer,
			[moduleApi.reducerPath] : moduleApi.reducer,
			[serviceCenterApi.reducerPath]: serviceCenterApi.reducer,
			[mechanicApi.reducerPath]: mechanicApi.reducer,
			[liveCallApi.reducerPath]: liveCallApi.reducer,
			[serviceRequestApi.reducerPath]: serviceRequestApi.reducer,
			[notificationApi.reducerPath]: notificationApi.reducer,
		},
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(
				authApi.middleware,
				vendorApi.middleware,
				vehicleApi.middleware,
				partApi.middleware,
				engineTypeApi.middleware,
				carMakeApi.middleware,
				categoryApi.middleware,
				subcategoryApi.middleware,
				partBrandApi.middleware,
				modelLineApi.middleware,
				planApi.middleware,
				subscriptionApi.middleware,
				moduleApi.middleware,
				serviceCenterApi.middleware,
				mechanicApi.middleware,
				liveCallApi.middleware,
				serviceRequestApi.middleware,
				notificationApi.middleware,
			),
	});

export type RootState = ReturnType<ReturnType<typeof makeStore>["getState"]>;
export type AppDispatch = ReturnType<typeof makeStore>["dispatch"];
