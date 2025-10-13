// src/features/permissions/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store"; // Adjust path to your store file

import type { Permission, CreatePermissionRequest } from "./rolesApi";

export const permissionsApi = createApi({
	reducerPath: "permissionsApi",
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
	tagTypes: ["Permission"],
	endpoints: (builder) => ({
		getPermissionsByRole: builder.query<Permission[], number>({
			query: (roleId) => `/permissions/role/${roleId}`,
			transformResponse: (response: { success: boolean; data: Permission[] }) =>
				response.data,
			providesTags: (result, error, roleId) => [{ type: "Permission", id: roleId }],
		}),
		createPermission: builder.mutation<Permission, CreatePermissionRequest>({
			query: (body) => ({
				url: "/permissions",
				method: "POST",
				body,
			}),
			transformResponse: (response: { success: boolean; data: Permission }) => response.data,
			invalidatesTags: ["Permission"],
		}),
		deletePermission: builder.mutation<void, number>({
			query: (id) => ({
				url: `/permissions/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Permission"],
		}),
	}),
});

export const {
	useGetPermissionsByRoleQuery,
	useCreatePermissionMutation,
	useDeletePermissionMutation,
} = permissionsApi;
