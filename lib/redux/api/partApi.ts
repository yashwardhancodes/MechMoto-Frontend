import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

// --------------------
// TYPE DEFINITIONS
// --------------------
interface Shipment {
  id: string;
  orderId: string;
  status: string;
}

interface UpdateShipmentData {
  status?: string;
}

interface ShipmentResponse {
  id: string;
  status: string;
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
    getAllParts: builder.query<
      PartResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: "/parts",
        params: { page, limit },
      }),
      providesTags: ["Part"],
    }),

    // ✅ FIXED: PAGINATED VENDOR PARTS
    getAllPartsByVendor: builder.query<
      any,
      { page: number; limit: number }
    >({
      query: ({ page, limit }) => ({
        url: "/parts/vendor",
        params: { page, limit },
      }),

      // 🔑 ensure pagination refetch works correctly
      serializeQueryArgs: ({ endpointName }) => endpointName,

      forceRefetch({ currentArg, previousArg }) {
        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?.limit !== previousArg?.limit
        );
      },

      providesTags: ["Part"],
    }),

    getPartsByFilters: builder.query({
      query: ({
        subcategoryId,
        vehicleId,
        make,
        model,
        year,
        engine,
        brand,
        category,
      }) => ({
        url: "/parts/filter",
        params: {
          subcategoryId,
          vehicleId,
          ...(make && { make: Array.isArray(make) ? make : [make] }),
          ...(model && { model: Array.isArray(model) ? model : [model] }),
          ...(year && { year: Array.isArray(year) ? year : [year] }),
          ...(engine && { engine: Array.isArray(engine) ? engine : [engine] }),
          ...(brand && { brand: Array.isArray(brand) ? brand : [brand] }),
          ...(category && {
            category: Array.isArray(category) ? category : [category],
          }),
        },
      }),
      providesTags: ["Part"],
    }),

    getFilterOptions: builder.query({
      query: () => "/parts/filter-options",
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

    // --------------------
    // CART
    // --------------------
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

    // --------------------
    // WISHLIST
    // --------------------
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

    // --------------------
    // ADDRESS
    // --------------------
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

    // --------------------
    // ORDERS
    // --------------------
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

    // --------------------
    // SHIPMENTS
    // --------------------
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

    // --------------------
    // COUPONS
    // --------------------
    getCoupons: builder.query<
      CouponResponse,
      { page?: number; limit?: number }
    >({
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

    // --------------------
    // COMPATIBILITY
    // --------------------
    addCompatibility: builder.mutation({
      query: ({ partId, vehicleId }) => ({
        url: `/parts/${partId}/compatibility`,
        method: "POST",
        body: { vehicleId },
      }),
      invalidatesTags: (result, error, { partId }) => [
        { type: "Part", id: partId },
      ],
    }),
	

    removeCompatibility: builder.mutation({
      query: ({ partId, vehicleId }) => ({
        url: `/parts/${partId}/compatibility/${vehicleId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { partId }) => [
        { type: "Part", id: partId },
      ],
    }),
  }),
});

// --------------------
// EXPORT HOOKS
// --------------------
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
