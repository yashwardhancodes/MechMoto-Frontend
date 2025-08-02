'use client';

import { Pencil, Eye, Trash2, Plus, Settings, SlidersHorizontal } from "lucide-react";
import { useGetAllVendorsQuery } from "@/lib/redux/api/vendorSlice";

export default function Mvendor({ onAddVendor }: { onAddVendor: () => void }) {
  const { data, isLoading, isError } = useGetAllVendorsQuery();

  // Safely extract vendors array from API response

  console.log("Vendors Data:", data);
  const vendors = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="p-6 bg-white rounded shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Listed Vendors</h2>
        <div className="flex gap-2">
          <button onClick={onAddVendor} className="flex items-center font-semibold text-black px-3 py-2 gap-2 rounded text-sm">
            <div className="flex items-center bg-[#9AE144] text-white p-2 rounded">
              <Plus className="w-4 h-4" />
            </div>
            Add Vendors
          </button>
          <button className="flex items-center">
            <div className="flex items-center bg-[#9AE144] text-white p-2 rounded">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      <hr />

      <div className="w-full h-[480px] pt-2 overflow-y-auto">
        {isLoading ? (
          <p className="text-sm text-gray-500 p-4">Loading vendors...</p>
        ) : isError ? (
          <p className="text-sm text-red-500 p-4">Failed to load vendors.</p>
        ) : (
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="font-medium">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Purchases</th>
                <th className="px-4 py-2">Orders</th>
                <th className="px-4 py-2">Revenue</th>
                <th className="px-4 py-2">Total Products</th>
                <th className="px-4 py-2">Action Buttons</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor: any, i: number) => (
                <tr key={vendor.id} className="hover:bg-[#9AE144]/20">
                   <td className="flex items-center gap-2 px-4 py-2">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${vendor.name}`}
                      alt={vendor.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{vendor.name}</div>
                      <div className="text-xs text-gray-500">{vendor.user?.email || "-"}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2">-</td> {/* Purchases – leave empty */}
                  <td className="px-4 py-2">{vendor.user?.role?.name || ""}</td> {/* Orders = role */}
                  <td className="px-4 py-2">-</td> {/* Revenue – leave empty */}
                  <td className="px-4 py-2">-</td> {/* Products – leave empty */}
                  <td className="px-4 py-2">
                    <div className="flex gap-2 text-gray-600">
                      <Pencil className="w-4 h-4 cursor-pointer" />
                      <Eye className="w-4 h-4 cursor-pointer" />
                      <Trash2 className="w-4 h-4 cursor-pointer" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">
          Showing {vendors.length} of {vendors.length} vendors
        </p>
        <div className="flex items-center gap-2">
          <button className="text-gray-500 text-sm">Prev</button>
          <button className="w-6 h-6 rounded-full bg-[#9AE144] text-white text-sm">1</button>
          <button className="w-6 h-6 rounded-full text-sm text-[#9AE144] bg-gray-200">2</button>
          <button className="text-gray-500 text-sm">Next</button>
        </div>
      </div>
    </div>
  );
}
