// src/features/roles/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { Module } from "./moduleApi";

export interface Role {
	id: number;
	name: string;
	description: string | null;
	is_system: boolean;
	created_at: string;
	updated_at: string;
	permissions?: Permission[];
}

export interface Permission {
	id: number;
	roleId: number;
	moduleId: number;
	action: string;
	created_at: string;
	module?: Module;
}

export interface CreateRoleRequest {
	name: string;
	description?: string | null;
	is_system?: boolean;
}

export interface UpdateRoleRequest {
	name?: string;
	description?: string | null;
	is_system?: boolean;
}

export interface CreatePermissionRequest {
	roleId: number;
	moduleId: number;
	action: string;
}

type RoleFilter = Record<string, string | number | boolean>;

export const rolesApi = createApi({
	reducerPath: "rolesApi",
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
	tagTypes: ["Role", "Permission"],
	endpoints: (builder) => ({
		getRoles: builder.query<Role[], { filter?: RoleFilter }>({
			query: (params) => {
				if (!params?.filter) {
					return "/roles";
				}
				const queryString = new URLSearchParams(
					Object.entries(params.filter).map(([k, v]) => [k, String(v)]),
				).toString();
				return `/roles?${queryString}`;
			},
			transformResponse: (response: { success: boolean; data: Role[] }) => response.data,
			providesTags: ["Role"],
		}),
		getRole: builder.query<Role, number>({
			query: (id) => `/roles/${id}`,
			transformResponse: (response: { success: boolean; data: Role }) => response.data,
			providesTags: (result, error, id) => [{ type: "Role", id }],
		}),
		createRole: builder.mutation<Role, CreateRoleRequest>({
			query: (body) => ({
				url: "/roles",
				method: "POST",
				body,
			}),
			transformResponse: (response: { success: boolean; data: Role }) => response.data,
			invalidatesTags: ["Role"],
		}),
		updateRole: builder.mutation<Role, { id: number; body: UpdateRoleRequest }>({
			query: ({ id, body }) => ({
				url: `/roles/${id}`,
				method: "PUT",
				body,
			}),
			transformResponse: (response: { success: boolean; data: Role }) => response.data,
			invalidatesTags: (result, error, { id }) => [{ type: "Role", id }],
		}),
		deleteRole: builder.mutation<void, number>({
			query: (id) => ({
				url: `/roles/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Role"],
		}),
	}),
});

export const {
	useGetRolesQuery,
	useGetRoleQuery,
	useCreateRoleMutation,
	useUpdateRoleMutation,
	useDeleteRoleMutation,
} = rolesApi;
