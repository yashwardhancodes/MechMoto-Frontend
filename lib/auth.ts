export type Role = keyof typeof ROLES;

export type Permission = (typeof ROLES)[Role][number];

const ROLES = {
  SuperAdmin: [
    "view:dashboard",
    "view:vendors",
    "view:parts",
    "manage:categories",
    "manage:subcategories",
    "manage:part-brands",
    "view:coupons",
    "view:orders",
    "view:service-request",
    "view:mechanics",
    "manage:vehicles",
    "manage:car-make",
    "manage:model-line",
    "manage:engine-type",
    "view:financials",
    "view:analytics",
    "view:support",
    "view:plans",
    "manage:plan-add",
    "manage:plan-edit",
    "view:shipments",
    "manage:shipments",
     "view:service-center",
    "manage:service-center",
    "manage:live-calls"
  ],

  Vendor: [
    "view:dashboard",
    "view:parts",
    "manage:parts",
    "manage:categories",
    "manage:subcategories",
    "view:orders",
    "view:coupons",
    "view:shipments"
  ],

  Mechanic: [
    "view:dashboard",
    "manage:service-requests",
    "view:vehicles",
    "manage:car-make",
    "manage:model-line",
     "view:service-center",
  ],

  ServiceCenter: [
    "view:dashboard",
    "manage:service-requests",
    "manage:mechanics"
  ],

  Customer: [
    "view:dashboard",
    "view:orders",
    "view:support",
     "view:service-center",
  ],
} as const;

export function hasPermission({
  user,
  permission,
}: {
  user: { id: string; role: Role };
  permission: Permission;
}) {
  return (ROLES[user.role] as readonly Permission[]).includes(permission);
}
