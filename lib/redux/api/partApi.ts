import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store"; // Adjust path to your store

// Define interfaces for type safety
interface Shipment {
	id: string;
	orderId: string;
	status: string;
	// Add other fields as needed
}

interface UpdateShipmentData {
	status?: string;
	// Add other fields as needed
}

interface ShipmentResponse {
	id: string;
	status: string;
	// Add other fields as needed
}

interface PartResponse {
	data: {
		parts: any[];
		total: number;
		page: number;
		limit: number;
	};
}

interface CouponResponse {
	data: {
		coupons: any[];
		total: number;
		page: number;
		limit: number;
	};
}

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
		getAllParts: builder.query<PartResponse, { page?: number; limit?: number }>({
			query: ({ page = 1, limit = 10 }) => ({
				url: "/parts",
				params: { page, limit },
			}),
			providesTags: ["Part"],
		}),
		getAllPartsByVendor: builder.query({
			query: () => "/parts/vendor",
			providesTags: ["Part"],
		}),
		getPartsByFilters: builder.query({
			query: ({ subcategoryId, vehicleId, make, model, year, engine, brand, category }) => ({
				url: `/parts/filter`,
				params: {
					subcategoryId,
					vehicleId,
					...(make && { make: Array.isArray(make) ? make : [make] }),
					...(model && { model: Array.isArray(model) ? model : [model] }),
					...(year && { year: Array.isArray(year) ? year : [year] }),
					...(engine && { engine: Array.isArray(engine) ? engine : [engine] }),
					...(brand && { brand: Array.isArray(brand) ? brand : [brand] }),
					...(category && { category: Array.isArray(category) ? category : [category] }),
				},
			}),
			providesTags: ["Part"],
		}),
		getFilterOptions: builder.query({
			query: () => "/parts/filter-options",
			providesTags: [],
		}),
		createPart: builder.mutation({
			query: (partData) => ({
				url: "/parts",
				method: "POST",
				body: partData,
			}),
			invalidatesTags: ["Part"],
		}),
		getPart: builder.query({
			query: (id) => `/parts/${id}`,
			providesTags: ["Part"],
		}),
		updatePart: builder.mutation({
			query: ({ id, ...data }) => ({
				url: `/parts/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Part"],
		}),
		deletePart: builder.mutation({
			query: (id) => ({
				url: `/parts/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Part"],
		}),
		getCartItems: builder.query({
			query: () => "/carts",
			providesTags: ["Cart"],
		}),
		addToCart: builder.mutation({
			query: (data) => ({
				url: "/carts",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Cart"],
		}),
		addToWishlist: builder.mutation({
			query: (data) => ({
				url: "wishlist/toggle",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Wishlist"],
		}),
		getWishlists: builder.query({
			query: () => "/wishlist",
			providesTags: ["Wishlist"],
		}),
		updateCartItem: builder.mutation({
			query: ({ id, quantity }) => ({
				url: `/carts/${id}`,
				method: "PUT",
				body: { quantity },
			}),
			invalidatesTags: ["Cart"],
		}),
		removeFromCart: builder.mutation({
			query: (id) => ({
				url: `/carts/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Cart"],
		}),
		getAddresses: builder.query({
			query: () => "/addresses",
			providesTags: ["Address"],
		}),
		createAddress: builder.mutation({
			query: (data) => ({
				url: "/addresses",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Address"],
		}),
		updateAddress: builder.mutation({
			query: ({ id, ...data }) => ({
				url: `/addresses/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Address"],
		}),
		deleteAddress: builder.mutation({
			query: (id) => ({
				url: `/addresses/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Address"],
		}),
		createOrder: builder.mutation({
			query: (data) => ({
				url: "/orders",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Order", "Cart"],
		}),
		getOrder: builder.query({
			query: (id) => `/orders/${id}`,
			providesTags: ["Order"],
		}),
		getOrders: builder.query({
			query: () => "/orders",
			providesTags: ["Order"],
		}),
		updateOrderStatus: builder.mutation({
			query: ({ id, status }) => ({
				url: `/orders/${id}/status`,
				method: "PATCH",
				body: { status },
			}),
			invalidatesTags: ["Order"],
		}),
		getShipmentsByOrder: builder.query<Shipment[], string>({
			query: (orderId) => `/shipments/order/${orderId}`,
		}),
		updateShipment: builder.mutation<
			ShipmentResponse,
			{ id: string; data: UpdateShipmentData }
		>({
			query: ({ id, data }) => ({
				url: `/shipments/${id}`,
				method: "PATCH",
				body: data,
			}),
		}),
		getCoupons: builder.query<CouponResponse, { page?: number; limit?: number }>({
			query: ({ page = 1, limit = 10 }) => ({
				url: "/coupons",
				params: { page, limit },
			}),
			providesTags: ["Coupon"],
		}),
		getCoupon: builder.query({
			query: (id) => `/coupons/${id}`,
			providesTags: ["Coupon"],
		}),
		createCoupon: builder.mutation({
			query: (data) => ({
				url: "/coupons",
				method: "POST",
				body: data,
			}),
			invalidatesTags: ["Coupon"],
		}),
		updateCoupon: builder.mutation({
			query: ({ id, ...data }) => ({
				url: `/coupons/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["Coupon"],
		}),
		deleteCoupon: builder.mutation({
			query: (id) => ({
				url: `/coupons/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Coupon"],
		}),

		// Add these endpoints
		addCompatibility: builder.mutation({
			query: ({ partId, vehicleId }) => ({
				url: `/parts/${partId}/compatibility`,
				method: "POST",
				body: { vehicleId },
			}),
			invalidatesTags: (result, error, { partId }) => [{ type: "Part", id: partId }],
		}),

		removeCompatibility: builder.mutation({
			query: ({ partId, vehicleId }) => ({
				url: `/parts/${partId}/compatibility/${vehicleId}`,
				method: "DELETE",
			}),
			invalidatesTags: (result, error, { partId }) => [{ type: "Part", id: partId }],
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
} = partApi;
