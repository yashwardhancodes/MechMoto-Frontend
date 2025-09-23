"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetOrdersQuery, useUpdateShipmentMutation } from "@/lib/redux/api/partApi";
import useAuth from "@/hooks/useAuth";
import { toast } from "react-hot-toast";
import { Package, Pencil, Eye, X } from "lucide-react";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { Toaster } from "react-hot-toast";
import { z } from "zod";
import { updateShipmentSchema } from "@/lib/schema/shipmentsSchema";
import { ChevronDown } from "lucide-react";

export default function VendorShipments() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: ordersData, isLoading, isError } = useGetOrdersQuery({});
  const [updateShipment, { isLoading: isUpdating }] = useUpdateShipmentMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [formData, setFormData] = useState({
    carrier: "",
    tracking_number: "",
    status: "pending",
    shipped_at: "",
    estimated_delivery: "",
    delivered_at: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [dropdownOpen, setDropdownOpen] = useState({ status: false });

  // Redirect to login if not authenticated or not a vendor
  // if (!user || user.role?.name !== "VENDOR") {
  //   router.push("/login");
  //   return null;
  // }

  // Safely extract shipments from orders
  const shipments = ordersData?.data?.flatMap((order: any) =>
    order.shipments.map((shipment: any) => ({ ...shipment, order }))
  ) ?? [];

  // Define table columns
  const columns: TableColumn[] = [
    {
      key: "order.id",
      header: "Order ID",
      render: (value) => (
        <div className="flex row items-center gap-2">
          <span className="font-semibold">#{value.order.id}</span>
          <span className="text-xs">{value.order.user?.profiles?.full_name || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "order.user.profiles.full_name",
      header: "Customer",
      render: (value) => value.order.user?.profiles?.full_name || "N/A",
    },
    {
      key: "order.order_items",
      header: "Parts Ordered",
      render: (value) =>
        value.order.order_items
          .filter((item: any) => item.part?.vendorId === value.vendorId)
          .map((item: any) => item.part?.subcategory?.name)
          .join(", ") || "N/A",
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value.status === "delivered"
              ? "bg-green-100 text-green-800"
              : value.status === "shipped" || value.status === "in_transit"
              ? "bg-blue-100 text-blue-800"
              : value.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {value.status.charAt(0).toUpperCase() + value.status.slice(1)}
        </span>
      ),
    },
    {
      key: "carrier",
      header: "Carrier",
      render: (value) => value.carrier || "N/A",
    },
    {
      key: "tracking_number",
      header: "Tracking Number",
      render: (value) => value.tracking_number || "N/A",
    },
    {
      key: "shipped_at",
      header: "Shipped At",
      render: (value) => (value.shipped_at ? new Date(value.shipped_at).toLocaleDateString() : "N/A"),
    },
  ];

  // Define table actions
  const actions: TableAction[] = [
    {
      icon: Pencil,
      onClick: (shipment) => {
        setSelectedShipment(shipment);
        setFormData({
          carrier: shipment.carrier || "",
          tracking_number: shipment.tracking_number || "",
          status: shipment.status || "pending",
          shipped_at: shipment.shipped_at ? new Date(shipment.shipped_at).toISOString().slice(0, 16) : "",
          estimated_delivery: shipment.estimated_delivery
            ? new Date(shipment.estimated_delivery).toISOString().slice(0, 16)
            : "",
          delivered_at: shipment.delivered_at ? new Date(shipment.delivered_at).toISOString().slice(0, 16) : "",
        });
        setIsModalOpen(true);
      },
      tooltip: "Edit shipment",
    },
    {
      icon: Eye,
      onClick: (shipment) => router.push(`/orders/${shipment.order.id}`),
      tooltip: "View order",
    },
  ];

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle dropdown selection
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setDropdownOpen((prev) => ({ ...prev, [name]: false }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setErrors({});
      const parsedData = updateShipmentSchema.parse({
        ...formData,
        shipped_at: formData.shipped_at ? new Date(formData.shipped_at).toISOString() : undefined,
        estimated_delivery: formData.estimated_delivery
          ? new Date(formData.estimated_delivery).toISOString()
          : undefined,
        delivered_at: formData.delivered_at ? new Date(formData.delivered_at).toISOString() : undefined,
      });
      await updateShipment({ id: selectedShipment.id, data: parsedData }).unwrap();
      toast.success("Shipment updated successfully!");
      setIsModalOpen(false);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const formattedErrors: { [key: string]: string } = {};
        err.errors.forEach((e) => {
          formattedErrors[e.path[0]] = e.message;
        });
        setErrors(formattedErrors);
        toast.error("Validation failed!");
      } else {
        toast.error(err?.data?.message || "Failed to update shipment!");
      }
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="h-[calc(100vh-140px)] overflow-y-auto bg-white shadow-sm py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <DataTable
            title="Manage Shipments"
            data={shipments}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            isError={isError}
            emptyMessage="No shipments found."
            errorMessage="Failed to load shipments."
            loadingMessage="Loading shipments..."
            avatarConfig={{
              enabled: true,
              nameKey: "order.id",
              subtitleKey: "order.user.profiles.full_name",
              getAvatarUrl: () => "/placeholder.png",
              getAvatarAlt: (item) => `Order #${item.order.id}`,
            }}
          />

          {/* Edit Shipment Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-5xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Update Shipment #{selectedShipment.id}</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="carrier"
                        placeholder="Carrier"
                        value={formData.carrier}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                      />
                      {errors.carrier && (
                        <p className="text-red-500 text-sm mt-1">{errors.carrier}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="tracking_number"
                        placeholder="Tracking Number"
                        value={formData.tracking_number}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                      />
                      {errors.tracking_number && (
                        <p className="text-red-500 text-sm mt-1">{errors.tracking_number}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setDropdownOpen((prev) => ({ ...prev, status: !prev.status }))}
                        className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
                      >
                        <span className={formData.status ? "text-gray-700" : "text-gray-400"}>
                          {formData.status.charAt(0).toUpperCase() + formData.status.slice(1) || "Select Status"}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-[#9AE144] ${dropdownOpen.status ? "rotate-180" : ""}`}
                        />
                      </button>
                      {dropdownOpen.status && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
                          {["pending", "shipped", "in_transit", "delivered"].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleSelectChange("status", status)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50"
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.status && (
                        <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="datetime-local"
                        name="shipped_at"
                        placeholder="Shipped At"
                        value={formData.shipped_at}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                      />
                      {errors.shipped_at && (
                        <p className="text-red-500 text-sm mt-1">{errors.shipped_at}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="datetime-local"
                        name="estimated_delivery"
                        placeholder="Estimated Delivery"
                        value={formData.estimated_delivery}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                      />
                      {errors.estimated_delivery && (
                        <p className="text-red-500 text-sm mt-1">{errors.estimated_delivery}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="datetime-local"
                        name="delivered_at"
                        placeholder="Delivered At"
                        value={formData.delivered_at}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                      />
                      {errors.delivered_at && (
                        <p className="text-red-500 text-sm mt-1">{errors.delivered_at}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-[#9AE144] focus:ring-offset-2 outline-none mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isUpdating}
                      className="px-8 py-3 bg-[#9AE144] text-black font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-[#9AE144] focus:ring-offset-2 outline-none"
                    >
                      {isUpdating ? "Updating..." : "Update Shipment"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}