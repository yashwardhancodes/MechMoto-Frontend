import { ROLES } from "@/constants/roles";
import { User } from "./redux/slices/authSlice";
import { Permission } from "./redux/api/rolesApi";

export type Role = keyof typeof USERROLES;

export type UserPermission = (typeof USERROLES)[Role][number];

const USERROLES = {
	SuperAdmin: [
		"read:dashboard",
		"read:user_management",
		"read:vendor",
		"read:part",
		"read:category",
		"read:subcategory",
		"read:part_brand",
		"read:coupon",
		"read:order",
		"read:service_request",
		"read:mechanics",
		"read:vehicle",
		"read:car_make",
		"read:model-line",
		"read:engine_type",
		"read:financials",
		"read:analytics",
		"read:support",
		"read:plan",
		"read:plan-add",
		"read:plan-edit",
		"read:shipments",
		"read:shipments",
		"read:service_center",
		"read:expert_help",
		"read:role",
	],

	Vendor: [
		"read:dashboard",
		"read:part",
		"read:order",
		"read:shipment",
	],

	Mechanic: ["read:dashboard", "read:service_request"],

	ServiceCenter: ["read:dashboard", "read:service_request", "read:mechanics"],

	Customer: ["read:dashboard", "read:order", "read:support", "read:service_center"],
} as const;

export function createPermissions(permissions: Permission[]): string[] {
	return permissions.map((permission) => {
		if (!permission.module) {
			throw new Error(`Module is missing for permission id: ${permission.id}`);
		}
		return `${permission.action}:${permission.module.name}`;
	});
}

export function hasPermission({ user, permission }: { user: User; permission: UserPermission }) {
	const role = user?.role?.name;
	if (
		role === ROLES.VENDOR ||
		role == ROLES.MECHANIC ||
		role === ROLES.SERVICE_CENTER ||
		role == ROLES.USER
	) {
		return (USERROLES[role] as readonly UserPermission[]).includes(permission);
	}
	const customPermissions = createPermissions(user.role.permissions);
	console.log("custom permissions", customPermissions);
	console.log("result: ", permission, customPermissions.includes(permission));
	return customPermissions.includes(permission);
}
