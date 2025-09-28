"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { serviceCenterSchema } from "@/lib/schema/serviceCenterSchema";
import {
  useGetServiceCenterQuery,
  useUpdateServiceCenterMutation,
} from "@/lib/redux/api/serviceCenterApi";
import { useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useParams } from "next/navigation";
// import RootState from your Redux store definition
import { RootState } from "@/lib/redux/store";

interface FormData {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
}

// Leaflet marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

const LocationPicker: React.FC<{
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}> = ({ latitude, longitude, onChange }) => {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
      toast.success(
        `Selected: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`
      );
    },
  });

  if (isNaN(latitude) || isNaN(longitude)) return null;

  return (
    <Marker
      position={[latitude, longitude]}
      icon={markerIcon}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          onChange(pos.lat, pos.lng);
        },
      }}
    />
  );
};

const EditServiceCenter: React.FC = () => {
  const searchParams = useParams();
  const serviceCenterId = Number(searchParams.id); // URL: ?id=123

  console.log("Editing Service Center ID:", serviceCenterId);
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.auth?.user?.id);

  // ✅ only fetch when ID is present
  const { data: serviceCenter, isLoading: fetching } = useGetServiceCenterQuery(
    serviceCenterId!,
    { skip: !serviceCenterId }
  );

  const [updateServiceCenter, { isLoading: updating }] =
    useUpdateServiceCenterMutation();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    email: "",
    country: "India",
    latitude: 20.5937,
    longitude: 78.9629,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMap, setShowMap] = useState(false);

  // ✅ Prefill form when service center data is loaded
  useEffect(() => {
    if (serviceCenter) {
      console.log("API Response:", serviceCenter);

      setFormData({
        name: serviceCenter.data.name ?? "",
        phone: serviceCenter.data.phone ?? "",
        address: serviceCenter.data.address ?? "",
        city: serviceCenter.data.city ?? "",
        state: serviceCenter.data.state ?? "",
        zip: serviceCenter.data.zip ?? "",
        email: serviceCenter.data.user.email ?? "",
        country: serviceCenter.data.country ?? "India",
        latitude: Number(serviceCenter.data.latitude) || 20.5937,
        longitude: Number(serviceCenter.data.longitude) || 78.9629,
        is_active: Boolean(serviceCenter.data.is_active),
      });
    }
  }, [serviceCenter]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setErrors({});
      if (!userId || !serviceCenterId) {
        toast.error("Invalid user or service center ID");
        return;
      }

      const submitData = { userId, id: serviceCenterId, ...formData };
      const parsedData = serviceCenterSchema.parse(submitData);

      const result = await updateServiceCenter(parsedData).unwrap();

      if (result?.success) {
        toast.success("Service Center updated successfully!");
        router.push("/admin/manage-service-center?refresh=true");
      } else {
        toast.error(result?.message || "Failed to update Service Center.");
      }
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          formattedErrors[e.path[0]] = e.message;
        });
        setErrors(formattedErrors);
        toast.error("Validation failed!");
      } else if (err instanceof Error) {
        console.error(err.message);
        toast.error(err.message);
      } else {
        console.error(err);
        toast.error("Something went wrong!");
      }
    }

  };

  if (fetching) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="h-[calc(100vh-170px)] overflow-y-auto bg-white shadow-sm py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Name & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            name="name"
            placeholder="Service Center Name"
            value={formData.name ?? ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone ?? ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
          />
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address ?? ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city ?? ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
          />
        </div>

        {/* State, Zip, Country */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state ?? ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
          />
          <input
            type="text"
            name="zip"
            placeholder="Zip Code"
            value={formData.zip ?? ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country ?? ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
          />
        </div>

        {/* Latitude & Longitude */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <input
            type="number"
            name="latitude"
            placeholder="Latitude"
            value={formData.latitude ?? ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
          />
          <input
            type="number"
            name="longitude"
            placeholder="Longitude"
            value={formData.longitude ?? ""}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
          />
        </div>

        {/* Location buttons */}
        <div className="flex gap-4 mt-2">
          <button
            type="button"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: pos.coords.latitude,
                      longitude: pos.coords.longitude,
                    }));
                    toast.success("Location fetched!");
                  },
                  () => toast.error("Failed to fetch location.")
                );
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Use My Location
          </button>

          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg"
          >
            Select from Map
          </button>
        </div>

        {/* Map Modal */}
        {showMap && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[90%] h-[80%] relative p-4">
              <button
                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => setShowMap(false)}
              >
                Close
              </button>
              <MapContainer
                center={[Number(formData.latitude), Number(formData.longitude)]}
                zoom={5}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker
                  latitude={Number(formData.latitude)}
                  longitude={Number(formData.longitude)}
                  onChange={(lat, lng) =>
                    setFormData((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                    }))
                  }
                />
              </MapContainer>
            </div>
          </div>
        )}

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email ?? ""}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none mt-4"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        {/* Active toggle */}
        <div className="flex items-center gap-3 mt-4">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="h-5 w-5 text-[#9AE144] border-gray-300 rounded"
          />
          <label className="text-gray-700">Active</label>
        </div>

        {/* Submit */}
        <div className="flex justify-end mt-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={updating}
            className="px-8 py-3 bg-[#9AE144] text-black font-medium rounded-lg hover:bg-[#9AE144]/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? "Updating..." : "Update Service Center"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditServiceCenter;
