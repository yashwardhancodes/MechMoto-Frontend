'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useUpdateVehicleMutation, useGetVehicleQuery } from '@/lib/redux/api/vehicleApi';
import { useGetAllCarMakesQuery } from '@/lib/redux/api/caeMakeApi';
import { useGetAllEngineTypesQuery } from '@/lib/redux/api/engineTypeApi';
import { vehicleSchema } from '@/lib/schema/vehicleSchema';
import { useRouter, useParams } from 'next/navigation';

// Define interfaces
interface CarMake {
  id: number;
  name: string;
  data?: any
}

interface EngineType {
  id: number;
  name: string;
}

interface FormData {
  carMakeId: number | null;
  modelLine: string;
  productionYear: string;
  modification: string;
  engineTypeId: number | null;
}

const UpdateVehicle: React.FC = () => {
  const router = useRouter();
  const { vehicleId } = useParams();
  const vehicleIdStr = Array.isArray(vehicleId) ? vehicleId[0] : vehicleId;
  const vehicleIdParsed = vehicleIdStr && !isNaN(parseInt(vehicleIdStr, 10)) ? parseInt(vehicleIdStr, 10) : null;

  const [formData, setFormData] = useState<FormData>({
    carMakeId: null,
    modelLine: '',
    productionYear: '',
    modification: '',
    engineTypeId: null,
  });

  const [errors, setErrors] = useState<{ [key in keyof FormData]?: string }>({});
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [engineDropdownOpen, setEngineDropdownOpen] = useState(false);

  const { data: vehicleResponse, isLoading: vehicleLoading, error: vehicleError } = useGetVehicleQuery(vehicleIdStr, {
    skip: !vehicleIdStr || vehicleIdStr === 'undefined',
  });
  const { data: carMakesResponse, isLoading: carMakesLoading, error: carMakesError } = useGetAllCarMakesQuery();
  const { data: engineTypesResponse, isLoading: engineTypesLoading, error: engineTypesError } = useGetAllEngineTypesQuery({});
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();

  // Memoized carMakes and engineTypes to fix useEffect warnings
  const carMakes: CarMake[] = useMemo(() => {
    return Array.isArray(carMakesResponse?.data) ? carMakesResponse.data : [];
  }, [carMakesResponse]);

  const engineTypes: EngineType[] = useMemo(() => {
    return Array.isArray(engineTypesResponse?.data) ? engineTypesResponse.data : [];
  }, [engineTypesResponse]);

  // Populate form with vehicle data
  useEffect(() => {
    if (vehicleResponse?.data) {
      const vehicle = vehicleResponse.data;
      setFormData({
        carMakeId: vehicle.carMakeId ?? vehicle.car_make?.id ?? null,
        modelLine: vehicle.modelLine ?? vehicle.model_line ?? '',
        productionYear: vehicle.productionYear?.toString() ?? vehicle.production_year?.toString() ?? '',
        modification: vehicle.modification ?? '',
        engineTypeId: vehicle.engineTypeId ?? vehicle.engine_type?.id ?? null,
      });
    }
  }, [vehicleResponse]);

  // API error handling
  useEffect(() => {
    if (vehicleError) toast.error('Failed to load vehicle data.');
    if (carMakesError) toast.error('Failed to load car makes.');
    if (engineTypesError) toast.error('Failed to load engine types.');
    if (!vehicleIdStr || vehicleIdStr === 'undefined' || !vehicleIdParsed) {
      toast.error('Invalid vehicle ID. Please check the URL or try again.');
      router.push('/admin/manage-vehicles');
    }
  }, [vehicleError, carMakesError, engineTypesError, vehicleIdStr, vehicleIdParsed, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name as keyof FormData]: '' }));
    }
  };

  const handleSelectChange = (field: keyof FormData, value: number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const isFormValid = () => {
    return (
      vehicleIdParsed !== null &&
      formData.carMakeId !== null &&
      formData.modelLine.trim() !== '' &&
      !isNaN(Number(formData.productionYear)) &&
      Number(formData.productionYear) > 0
    );
  };

  const handleSubmit = async () => {
    if (!vehicleIdParsed) {
      toast.error('Cannot update vehicle: Invalid vehicle ID.');
      return;
    }

    try {
      setErrors({});
      const payload = {
        vehicleId: vehicleIdParsed,
        carMakeId: formData.carMakeId,
        modelLine: formData.modelLine,
        productionYear: Number(formData.productionYear) || 0,
        modification: formData.modification,
        engineTypeId: formData.engineTypeId,
      };

      const parsedData = vehicleSchema.parse(payload);
      const result = await updateVehicle({ ...parsedData, id: vehicleIdParsed }).unwrap();
      if (result?.success) {
        toast.success('Vehicle updated successfully!');
        router.push('/admin/manage-vehicles?refresh=true');
      } else {
        toast.error('Vehicle update failed.');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formattedErrors: { [key in keyof FormData]?: string } = {};
        err.errors.forEach((e) => {
          formattedErrors[e.path[0] as keyof FormData] = e.message;
        });
        setErrors(formattedErrors);
        Object.values(formattedErrors).forEach((error) => toast.error(error));
      } else {
        console.error('Error:', err);
        if (typeof err === "object" && err !== null && "data" in err && typeof (err as { data?: { message?: string } }).data?.message === "string") {
          toast.error((err as { data?: { message?: string } }).data!.message!);
        } else {
          toast.error("Failed to update vehicle. Please try again.");
        }
      }
    }
  };

  return (
    <div className="h-[calc(100vh-170px)] overflow-y-auto bg-white shadow-sm py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-9">
          <h1 className="text-2xl font-bold">Update Vehicle</h1>
          {vehicleLoading && <p>Loading vehicle data...</p>}
          {!vehicleIdStr || vehicleIdStr === 'undefined' || !vehicleIdParsed ? (
            <p className="text-red-500">Invalid vehicle ID. Please select a valid vehicle.</p>
          ) : (
            <>
              {/* Brand & Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                    className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
                    disabled={carMakesLoading || !!carMakesError || vehicleLoading}
                  >
                    <span className={formData.carMakeId ? 'text-gray-700' : 'text-gray-400'}>
                      {carMakesLoading
                        ? 'Loading...'
                        : carMakesError
                          ? 'Error loading makes'
                          : formData.carMakeId
                            ? carMakes.find((b) => b.id === formData.carMakeId)?.name ?? 'Select Car Make'
                            : 'Select Car Make'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-[#9AE144] ${brandDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {brandDropdownOpen && carMakes.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {carMakes.map((brand) => (
                        <button
                          key={brand.id}
                          type="button"
                          onClick={() => {
                            handleSelectChange('carMakeId', brand.id);
                            setBrandDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50"
                        >
                          {brand.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.carMakeId && <p className="text-red-500 text-sm mt-1">{errors.carMakeId}</p>}
                </div>

                <div>
                  <input
                    type="text"
                    name="modelLine"
                    placeholder="Model Line"
                    value={formData.modelLine}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#808080] rounded-lg"
                    disabled={vehicleLoading}
                  />
                  {errors.modelLine && <p className="text-red-500 text-sm mt-1">{errors.modelLine}</p>}
                </div>
              </div>

              {/* Year & Engine */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <input
                    type="text"
                    name="productionYear"
                    placeholder="Year"
                    value={formData.productionYear}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#808080] rounded-lg"
                    disabled={vehicleLoading}
                  />
                  {errors.productionYear && <p className="text-red-500 text-sm mt-1">{errors.productionYear}</p>}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setEngineDropdownOpen(!engineDropdownOpen)}
                    className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
                    disabled={engineTypesLoading || !!engineTypesError || vehicleLoading}
                  >
                    <span className={formData.engineTypeId ? 'text-gray-700' : 'text-gray-400'}>
                      {engineTypesLoading
                        ? 'Loading...'
                        : engineTypesError
                          ? 'Error loading engines'
                          : formData.engineTypeId
                            ? engineTypes.find((e) => e.id === formData.engineTypeId)?.name ?? 'Select Engine Type'
                            : 'Select Engine Type'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-[#9AE144] ${engineDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {engineDropdownOpen && engineTypes.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {engineTypes.map((engine) => (
                        <button
                          key={engine.id}
                          type="button"
                          onClick={() => {
                            handleSelectChange('engineTypeId', engine.id);
                            setEngineDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50"
                        >
                          {engine.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.engineTypeId && <p className="text-red-500 text-sm mt-1">{errors.engineTypeId}</p>}
                </div>
              </div>

              {/* Modification */}
              <div>
                <input
                  type="text"
                  name="modification"
                  placeholder="Modification"
                  value={formData.modification}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[#808080] rounded-lg"
                  disabled={vehicleLoading}
                />
                {errors.modification && <p className="text-red-500 text-sm mt-1">{errors.modification}</p>}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    isUpdating ||
                    carMakesLoading ||
                    engineTypesLoading ||
                    vehicleLoading ||
                    !!carMakesError ||
                    !!engineTypesError ||
                    !!vehicleError ||
                    !isFormValid()
                  }
                  className="px-8 py-3 bg-[#9AE144] text-black font-medium rounded-lg disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Update Vehicle'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateVehicle;
