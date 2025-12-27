// src/lib/redux/api/partApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

// --------------------
// TYPE DEFINITIONS
// --------------------
interface Part {
	category: any;
	reviews: boolean;
	wishlists: boolean;
	order_items: boolean;
	id: number;
	part_number: string;
	description: string;
	price: number;
	quantity: number;
	image_urls: string[];
	availability_status: string;
	origin: string;
	remarks?: string;
	created_at: string;
	updated_at: string;
	vehicle?: any;
	subcategory?: any;
	part_brand?: any;
	discount?: any;
	vendor?: any;
	compatibility?: any[];
	part_positions?: any[];
}

interface PartListResponse {
	data: {
		parts: Part[];
		total: number;
		page: number;
		limit: number;
	};
}

interface VendorPartsResponse {
	data: {
		data: Part[];
		meta: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	};
}

interface PartResponse {
	success?: boolean;
	data: Part;
	message?: string;
}


interface CouponResponse {
	data: {
		coupons: any[];
		total: number;
		page: number;
		limit: number;
	};
}

interface UpdateShipmentData {
	[key: string]: any;
}

// --------------------
// API
// --------------------
export const partApi = createApi({
	reducerPath: "partApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as RootState).auth?.token;
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			headers.set("Content-Type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["Part", "Cart", "Wishlist", "Address", "Order", "Coupon"],

	endpoints: (builder) => ({
		// --------------------
		// PARTS
		// --------------------
		getAllParts: builder.query<PartListResponse, { page?: number; limit?: number }>({
			query: ({ page = 1, limit = 10 }) => ({
				url: "/parts",
				params: { page, limit },
			}),
			providesTags: (result) =>
				result?.data?.parts
					? [
							...result.data.parts.map(({ id }) => ({ type: "Part" as const, id })),
							{ type: "Part", id: "LIST" },
					  ]
					: [{ type: "Part", id: "LIST" }],
		}),

		getAllPartsByVendor: builder.query<VendorPartsResponse, { page: number; limit: number }>({
			query: ({ page, limit }) => ({
				url: "/parts/vendor",
				params: { page, limit },
			}),
			serializeQueryArgs: ({ endpointName }) => endpointName,
			forceRefetch({ currentArg, previousArg }) {
				return (
					currentArg?.page !== previousArg?.page ||
					currentArg?.limit !== previousArg?.limit
				);
			},
			providesTags: (result) =>
				result?.data?.data
					? [
							...result.data.data.map(({ id }) => ({ type: "Part" as const, id })),
							{ type: "Part", id: "LIST" },
					  ]
					: [{ type: "Part", id: "LIST" }],
		}),

		getPartsByFilters: builder.query<any, {
			subcategoryId?: number;
			vehicleId?: number;
			make?: string | string[];
			model?: string | string[];
			year?: string | string[];
			engine?: string | string[];
			brand?: string | string[];
			category?: string | string[];
		}>({
			query: (filters) => ({
				url: "/parts/filter",
				params: {
					...filters,
					make: filters.make ? (Array.isArray(filters.make) ? filters.make.join(",") : filters.make) : undefined,
					model: filters.model ? (Array.isArray(filters.model) ? filters.model.join(",") : filters.model) : undefined,
					year: filters.year ? (Array.isArray(filters.year) ? filters.year.join(",") : filters.year) : undefined,
					engine: filters.engine ? (Array.isArray(filters.engine) ? filters.engine.join(",") : filters.engine) : undefined,
					brand: filters.brand ? (Array.isArray(filters.brand) ? filters.brand.join(",") : filters.brand) : undefined,
					category: filters.category ? (Array.isArray(filters.category) ? filters.category.join(",") : filters.category) : undefined,
				},
			}),
			providesTags: (result) =>
				result && Array.isArray(result)
					? [
							...result.map(({ id }) => ({ type: "Part" as const, id })),
							{ type: "Part", id: "LIST" },
					  ]
					: [{ type: "Part", id: "LIST" }],
		}),

		getFilterOptions: builder.query<any, void>({
			query: () => "/parts/filter-options",
		}),

		createPart: builder.mutation<PartResponse, any>({
			query: (partData) => ({
				url: "/parts",
				method: "POST",
				body: partData,
			}),
			invalidatesTags: [{ type: "Part", id: "LIST" }],
		}),

		getPart: builder.query<PartResponse, string>({
			query: (id) => `/parts/${id}`,
			providesTags: (result, error, id) => [{ type: "Part", id }],
		}),

		updatePart: builder.mutation<PartResponse, { id: string; data: any }>({
			query: ({ id, data }) => ({
				url: `/parts/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: "Part", id },
				{ type: "Part", id: "LIST" },
			],
		}),

		deletePart: builder.mutation<void, string>({
			query: (id) => ({
				url: `/parts/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: (result, error, id) => [
				{ type: "Part", id },
				{ type: "Part", id: "LIST" },
			],
		}),

		// --------------------
		// CART
		// --------------------
		getCartItems: builder.query<any, void>({
			query: () => "/carts",
			providesTags: ["Cart"],
		}),

		addToCart: builder.mutation<any, any>({
			query: (data) => ({
				url: "/carts",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Cart"],
		}),

		updateCartItem: builder.mutation<any, { id: string; quantity: number }>({
			query: ({ id, quantity }) => ({
				url: `/carts/${id}`,
				method: "PUT",
				body: { quantity },
			}),
			invalidatesTags: ["Cart"],
		}),

		removeFromCart: builder.mutation<void, string>({
			query: (id) => ({
				url: `/carts/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Cart"],
		}),

		// --------------------
		// WISHLIST
		// --------------------
		addToWishlist: builder.mutation<any, any>({
			query: (data) => ({
				url: "wishlist/toggle",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Wishlist"],
		}),

		getWishlists: builder.query<any, void>({
			query: () => "/wishlist",
			providesTags: ["Wishlist"],
		}),

		// --------------------
		// ADDRESS
		// --------------------
		getAddresses: builder.query<any, void>({
			query: () => "/addresses",
			providesTags: ["Address"],
		}),

		createAddress: builder.mutation<any, any>({
			query: (data) => ({
				url: "/addresses",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Address"],
		}),

		updateAddress: builder.mutation<any, { id: string; data: any }>({
			query: ({ id, data }) => ({
				url: `/addresses/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Address"],
		}),

		deleteAddress: builder.mutation<void, string>({
			query: (id) => ({
				url: `/addresses/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Address"],
		}),

		// --------------------
		// ORDERS
		// --------------------
		createOrder: builder.mutation<any, any>({
			query: (data) => ({
				url: "/orders",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Order", "Cart"],
		}),

		getOrder: builder.query<any, string>({
			query: (id) => `/orders/${id}`,
			providesTags: ["Order"],
		}),

		getOrders: builder.query<any, void>({
			query: () => "/orders",
			providesTags: ["Order"],
		}),

		updateOrderStatus: builder.mutation<any, { id: string; status: string }>({
			query: ({ id, status }) => ({
				url: `/orders/${id}/status`,
				method: "PATCH",
				body: { status },
			}),
			invalidatesTags: ["Order"],
		}),

		// --------------------
		// SHIPMENTS
		// --------------------
		getShipmentsByOrder: builder.query<any, string>({
			query: (orderId) => `/shipments/order/${orderId}`,
		}),

		updateShipment: builder.mutation<any, { id: string; data: UpdateShipmentData }>({
			query: ({ id, data }) => ({
				url: `/shipments/${id}`,
				method: "PATCH",
				body: data,
			}),
		}),

		// --------------------
		// COUPONS
		// --------------------
		getCoupons: builder.query<CouponResponse, { page?: number; limit?: number }>({
			query: ({ page = 1, limit = 10 }) => ({
				url: "/coupons",
				params: { page, limit },
			}),
			providesTags: (result) =>
				result?.data?.coupons
					? [
							...result.data.coupons.map(({ id }) => ({ type: "Coupon" as const, id })),
							{ type: "Coupon", id: "LIST" },
					  ]
					: [{ type: "Coupon", id: "LIST" }],
		}),

		getCoupon: builder.query<any, string>({
			query: (id) => `/coupons/${id}`,
			providesTags: (result, error, id) => [{ type: "Coupon", id }],
		}),

		createCoupon: builder.mutation<any, any>({
			query: (data) => ({
				url: "/coupons",
				method: "POST",
				body: data,
			}),
			invalidatesTags: [{ type: "Coupon", id: "LIST" }],
		}),

		updateCoupon: builder.mutation<any, { id: string; data: any }>({
			query: ({ id, data }) => ({
				url: `/coupons/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: "Coupon", id },
				{ type: "Coupon", id: "LIST" },
			],
		}),

		deleteCoupon: builder.mutation<void, string>({
			query: (id) => ({
				url: `/coupons/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: (result, error, id) => [
				{ type: "Coupon", id },
				{ type: "Coupon", id: "LIST" },
			],
		}),

		// --------------------
		// COMPATIBILITY
		// --------------------
		addCompatibility: builder.mutation<any, { partId: number; vehicleId: number }>({
			query: ({ partId, vehicleId }) => ({
				url: `/parts/${partId}/compatibility`,
				method: "POST",
				body: { vehicleId },
			}),
			invalidatesTags: (result, error, { partId }) => [
				{ type: "Part", id: partId },
				{ type: "Part", id: "LIST" },
			],
		}),

    addCompatibilityBulk: builder.mutation<any, { partId: number; vehicleIds: number[] }>({
	query: ({ partId, vehicleIds }) => ({
		url: `/parts/${partId}/compatibility/bulk`,
		method: "POST",
		body: { vehicleIds },
	}),
	invalidatesTags: (result, error, { partId }) => [
		{ type: "Part", id: partId },
		{ type: "Part", id: "LIST" },
	],
}),

		removeCompatibility: builder.mutation<any, { partId: number; vehicleId: number }>({
			query: ({ partId, vehicleId }) => ({
				url: `/parts/${partId}/compatibility/${vehicleId}`,
				method: "DELETE",
			}),
			invalidatesTags: (result, error, { partId }) => [
				{ type: "Part", id: partId },
				{ type: "Part", id: "LIST" },
			],
		}),
	}),
});

export const {
	useGetAllPartsQuery,
	useGetAllPartsByVendorQuery,
	useGetPartsByFiltersQuery,
	useGetFilterOptionsQuery,
	useCreatePartMutation,
	useGetPartQuery,
	useUpdatePartMutation,
	useDeletePartMutation,
	useGetCartItemsQuery,
	useAddToCartMutation,
	useAddToWishlistMutation,
	useGetWishlistsQuery,
	useUpdateCartItemMutation,
	useRemoveFromCartMutation,
	useGetAddressesQuery,
	useCreateAddressMutation,
	useUpdateAddressMutation,
	useDeleteAddressMutation,
	useCreateOrderMutation,
	useGetOrderQuery,
	useGetOrdersQuery,
	useUpdateOrderStatusMutation,
	useGetShipmentsByOrderQuery,
	useUpdateShipmentMutation,
	useGetCouponsQuery,
	useGetCouponQuery,
	useCreateCouponMutation,
	useUpdateCouponMutation,
	useDeleteCouponMutation,
	useAddCompatibilityMutation,
	useRemoveCompatibilityMutation,
  useAddCompatibilityBulkMutation,
} = partApi;