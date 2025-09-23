"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import { useGetCouponsQuery, useDeleteCouponMutation } from "@/lib/redux/api/partApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { toast } from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";

export default function ManageCoupons() {
	const { user } = useAuth();
	const router = useRouter();
	const [deleteCoupon] = useDeleteCouponMutation();

	// Fetch coupons
	const { data, isLoading, isError } = useGetCouponsQuery({});
	const coupons = Array.isArray(data) ? data : data?.data ?? [];

	// Define table columns
	const columns: TableColumn[] = [
		{
			key: "id",
			header: "Coupon ID",
		},
		{
			key: "code",
			header: "Coupon Code",
		},
		{
			key: "description",
			header: "Description",
			render: (value) => value.description || "N/A",
		},
		{
			key: "discount_type",
			header: "Discount Type",
		},
		{
			key: "discount_value",
			header: "Discount Value",
			render: (value) =>
				`${value.discount_value}${value.discount_type === "percentage" ? "%" : "₹"}`,
		},
		{
			key: "max_discount",
			header: "Max Discount",
			render: (value) =>
				value.max_discount ? `₹${value.max_discount.toLocaleString()}` : "N/A",
		},
		{
			key: "min_order_amount",
			header: "Min Order Amount",
			render: (value) =>
				value.min_order_amount ? `₹${value.min_order_amount.toLocaleString()}` : "N/A",
		},
		{
			key: "valid_from",
			header: "Valid From",
			render: (value) =>
				value.valid_from ? new Date(value.valid_from).toLocaleDateString() : "N/A",
		},
		{
			key: "valid_until",
			header: "Valid Until",
			render: (value) =>
				value.valid_until ? new Date(value.valid_until).toLocaleDateString() : "N/A",
		},
		{
			key: "usage_limit",
			header: "Usage Limit",
			render: (value) => value.usage_limit?.toString() || "Unlimited",
		},
		{
			key: "usage_count",
			header: "Usage Count",
			render: (value) => value.usage_count?.toString() || "0",
		},
		{
			key: "is_active",
			header: "Active",
			render: (value) => (value.is_active ? "Yes" : "No"),
		},
	];

	// Define table actions (restricted to SUPER_ADMIN)
	const actions: TableAction[] =
		user?.role.name === ROLES.SUPER_ADMIN
			? [
					{
						icon: Eye,
						onClick: (coupon) => {
							if (coupon?.id && typeof coupon.id === "number") {
								router.push(`/admin/coupons-and-discounts/view/${coupon.id}`);
							} else {
								console.error("Invalid coupon ID for view:", coupon);
							}
						},
						tooltip: "View coupon",
					},
					{
						icon: Pencil,
						onClick: (coupon) => {
							if (coupon?.id && typeof coupon.id === "number") {
								router.push(`/admin/coupons-and-discounts/edit/${coupon.id}`);
							} else {
								console.error("Invalid coupon ID for edit:", coupon);
							}
						},
						tooltip: "Edit coupon",
					},
					{
						icon: Trash2,
						onClick: (coupon) => {
							if (coupon?.id && typeof coupon.id === "number") {
								if (confirm("Are you sure you want to delete this coupon?")) {
									deleteCoupon(coupon.id)
										.unwrap()
										.then(() => toast.success("Coupon deleted successfully!"))
										.catch(() => toast.error("Failed to delete coupon."));
								}
							} else {
								console.error("Invalid coupon ID for delete:", coupon);
							}
						},
						tooltip: "Delete coupon",
					},
			  ]
			: [];

	return (
		<DataTable
			title="Manage Coupons"
			data={coupons}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			addButtonText="Add Coupons"
			addButtonPath="/admin/coupons-and-discounts/add"
			emptyMessage="No coupons found."
			errorMessage="Failed to load coupons."
			loadingMessage="Loading coupons..."
			avatarConfig={{
				enabled: true,
				nameKey: "code",
				subtitleKey: "id",
				getAvatarUrl: () => "/placeholder.png", // Replace with actual avatar if available
				getAvatarAlt: (item) => item.code || "Coupon",
			}}
		/>
	);
}
