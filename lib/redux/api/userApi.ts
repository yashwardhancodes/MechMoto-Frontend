// frontend/lib/redux/api/userApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the type for the Redux state
interface RootState {
	auth: {
		token?: string; // Token is optional, as it might not always be present
	};
}

interface UserResponse {
	data: {
		users: any[];
		total: number;
		page: number;
		limit: number;
	};
}

export const userApi = createApi({
	reducerPath: "userApi",
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
		prepareHeaders: (headers, { getState }) => {
			const state = getState() as RootState; // Specify the RootState type
			const token = state.auth.token;
			console.log("token", token);
			if (token) {
				headers.set("Authorization", `Bearer ${token}`);
			}
			headers.set("Content-Type", "application/json");
			return headers;
		},
	}),
	tagTypes: ["User"],
	endpoints: (builder) => ({
		getAllUsers: builder.query<UserResponse, { page?: number; limit?: number }>({
			query: ({ page = 1, limit = 10 }) => ({
				url: "/admin/users", // Assuming mounted under /admin
				params: { page, limit },
			}),
			providesTags: ["User"],
		}),
		createUser: builder.mutation({
			query: (userData) => ({
				url: "/admin/users",
				method: "POST",
				body: userData,
			}),
			invalidatesTags: ["User"],
		}),
		getUser: builder.query({
			query: (id) => `/admin/users/${id}`,
			providesTags: ["User"],
		}),
		updateUser: builder.mutation({
			query: ({ id, ...data }) => ({
				url: `/admin/users/${id}`,
				method: "PUT",
				body: data,
			}),
			invalidatesTags: ["User"],
		}),
		deleteUser: builder.mutation({
			query: (id) => ({
				url: `/admin/users/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["User"],
		}),
	}),
});

export const {
	useGetAllUsersQuery,
	useCreateUserMutation,
	useGetUserQuery,
	useUpdateUserMutation,
	useDeleteUserMutation,
} = userApi;
