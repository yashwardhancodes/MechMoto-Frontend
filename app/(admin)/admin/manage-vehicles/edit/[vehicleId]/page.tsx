'use client';

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { z } from "zod";
import toast from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import {
  useGetVehicleQuery,
  useUpdateVehicleMutation,
} from "@/lib/redux/api/vehicleApi";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import { useGetAllEngineTypesQuery } from "@/lib/redux/api/engineTypeApi";
import { useGetModelLinesQuery } from "@/lib/redux/api/modelLineApi";
import { useGetAllModificationsQuery } from "@/lib/redux/api/modificationApi";
import { useLazyGetGenerationsByModelLineQuery } from "@/lib/redux/api/modelApi";
import { vehicleSchema } from "@/lib/schema/vehicleSchema";

interface FormData {
  carMakeId: number | null;
  modelLineId: number | null;
  generationId: number | null;     // This is the model (generation) ID
  modificationId: number | null;
  productionYear: string;
  engineTypeId: number | null;
}

const UpdateVehicle: React.FC = () => {
  const router = useRouter();
  const { vehicleId } = useParams() as { vehicleId: string };

  const {
    data: vehicleResponse,
    isLoading: vehicleLoading,
    error: vehicleError,
  } = useGetVehicleQuery(vehicleId);
  const [updateVehicle, { isLoading: updating }] = useUpdateVehicleMutation();

  const [formData, setFormData] = useState<FormData>({
    carMakeId: null,
    modelLineId: null,
    generationId: null,
    modificationId: null,
    productionYear: "",
    engineTypeId: null,
  });

  const [, setErrors] = useState<Record<string, string>>({});

  // Fetch reference data
  const { data: carMakesResponse, isLoading: carMakesLoading } = useGetAllCarMakesQuery({
    page: 1,
    limit: 999999,
  });

  const { data: engineTypesResponse } = useGetAllEngineTypesQuery({
    page: 1,
    limit: 999999,
  });

  const { data: modificationsResponse } = useGetAllModificationsQuery({
    page: 1,
    limit: 999999,
  });

  const { data: modelLinesResponse, isFetching: modelLinesLoading } = useGetModelLinesQuery(
    formData.carMakeId ? { car_make: formData.carMakeId } : {},
    { skip: !formData.carMakeId }
  );

  // Lazy load generations (models) by model line
  const [triggerGenerations, { data: generationsData, isFetching: generationsLoading }] =
    useLazyGetGenerationsByModelLineQuery();

  // Dropdown states
  const [makeOpen, setMakeOpen] = useState(false);
  const [modelLineOpen, setModelLineOpen] = useState(false);
  const [generationOpen, setGenerationOpen] = useState(false);
  const [modificationOpen, setModificationOpen] = useState(false);
  const [engineOpen, setEngineOpen] = useState(false);

  // Extracted options
  const carMakes = carMakesResponse?.data?.carMakes || [];
  const modelLines = modelLinesResponse?.data || [];
  const generations = generationsData || [];
  const allModifications = modificationsResponse?.data?.modifications || [];

  // Filter modifications that belong to the selected generation
  const modifications = formData.generationId
    ? allModifications.filter((mod: any) =>
        mod.models?.some((model: any) => model.id === formData.generationId)
      )
    : [];

  const engineTypes = engineTypesResponse?.data?.engineTypes || [];

  // Pre-fill form when vehicle loads
  useEffect(() => {
    if (vehicleResponse?.data) {
      const v = vehicleResponse.data;

      // Prefer direct model if exists (new vehicles)
      if (v.model) {
        setFormData({
          carMakeId: v.model.model_line.car_make.id,
          modelLineId: v.model.model_line.id,
          generationId: v.model.id,
          modificationId: v.modification.id,
          productionYear: v.production_year.toString(),
          engineTypeId: v.engine_type?.id || null,
        });
      } else if (v.modification?.models?.length > 0) {
        // Fallback for old vehicles
        const firstModel = v.modification.models[0];
        setFormData({
          carMakeId: firstModel.model_line.car_make.id,
          modelLineId: firstModel.model_line.id,
          generationId: firstModel.id,
          modificationId: v.modification.id,
          productionYear: v.production_year.toString(),
          engineTypeId: v.engine_type?.id || null,
        });
      }
    }
  }, [vehicleResponse]);

  // Load generations when model line changes
  useEffect(() => {
    if (formData.modelLineId) {
      triggerGenerations(formData.modelLineId);
    }
  }, [formData.modelLineId, triggerGenerations]);

  // Reset modification when generation changes
  useEffect(() => {
    setFormData((prev) => ({ ...prev, modificationId: null }));
  }, [formData.generationId]);

  const handleSelect = (field: keyof FormData, value: number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      // Cascade reset
      ...(field === "carMakeId" && {
        modelLineId: null,
        generationId: null,
        modificationId: null,
      }),
      ...(field === "modelLineId" && { generationId: null, modificationId: null }),
      ...(field === "generationId" && { modificationId: null }),
    }));
  };

  const handleYearChange = (value: string) => {
    const numValue = value.replace(/\D/g, "").slice(0, 4);
    setFormData((prev) => ({ ...prev, productionYear: numValue }));
  };

  const isFormValid = () =>
    formData.carMakeId !== null &&
    formData.modelLineId !== null &&
    formData.generationId !== null &&
    formData.modificationId !== null &&
    formData.productionYear.length === 4;

  const handleSubmit = async () => {
    try {
      setErrors({});

      // IMPORTANT: Now we send BOTH modelId and modificationId
      const payload = {
        modelId: formData.generationId!,           // ← Save the generation
        modificationId: formData.modificationId!,
        productionYear: Number(formData.productionYear),
        engineTypeId: formData.engineTypeId ?? undefined,
      };

      // Validate with schema (adjust schema if needed to include modelId)
      vehicleSchema.parse(payload);

      await updateVehicle({
		  id: vehicleId, ...payload,
		  data: undefined
	  }).unwrap();

      toast.success("Vehicle updated successfully!");
      router.push("/admin/manage-vehicles");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const formatted: Record<string, string> = {};
        err.errors.forEach((e) => {
          formatted[e.path[0] as string] = e.message;
        });
        setErrors(formatted);
        Object.values(formatted).forEach((msg) => toast.error(msg));
      } else {
        toast.error(err?.data?.message || "Failed to update vehicle");
      }
    }
  };

  if (vehicleLoading) return <div className="p-8 text-center">Loading vehicle...</div>;
  if (vehicleError)
    return <div className="p-8 text-red-500 text-center">Failed to load vehicle</div>;

  return (
    <div className="h-[calc(100vh-170px)] overflow-y-auto bg-white shadow-sm py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-8">Update Vehicle</h2>

        <div className="space-y-9">
          {/* Car Make & Model Line */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <button
                type="button"
                onClick={() => setMakeOpen(!makeOpen)}
                className="w-full px-4 py-3 border border-gray-400 rounded-lg flex justify-between items-center disabled:opacity-60"
                disabled={carMakesLoading}
              >
                <span className={formData.carMakeId ? "text-gray-900" : "text-gray-500"}>
                  {carMakesLoading
                    ? "Loading..."
                    : formData.carMakeId
                    ? carMakes.find((m) => m.id === formData.carMakeId)?.name
                    : "Select Car Make"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] transition-transform ${
                    makeOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {makeOpen && carMakes.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  {carMakes.map((make) => (
                    <button
                      key={make.id}
                      type="button"
                      onClick={() => {
                        handleSelect("carMakeId", make.id);
                        setMakeOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      {make.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setModelLineOpen(!modelLineOpen)}
                className="w-full px-4 py-3 border border-gray-400 rounded-lg flex justify-between items-center disabled:opacity-60"
                disabled={!formData.carMakeId || modelLinesLoading}
              >
                <span className={formData.modelLineId ? "text-gray-900" : "text-gray-500"}>
                  {modelLinesLoading
                    ? "Loading..."
                    : formData.modelLineId
                    ? modelLines.find((m) => m.id === formData.modelLineId)?.name
                    : "Select Model Line"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] transition-transform ${
                    modelLineOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {modelLineOpen && modelLines.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  {modelLines.map((line) => (
                    <button
                      key={line.id}
                      type="button"
                      onClick={() => {
                        handleSelect("modelLineId", line.id);
                        setModelLineOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      {line.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Generation & Modification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <button
                type="button"
                onClick={() => setGenerationOpen(!generationOpen)}
                className="w-full px-4 py-3 border border-gray-400 rounded-lg flex justify-between items-center disabled:opacity-60"
                disabled={!formData.modelLineId || generationsLoading}
              >
                <span className={formData.generationId ? "text-gray-900" : "text-gray-500"}>
                  {generationsLoading
                    ? "Loading generations..."
                    : formData.generationId
                    ? generations.find((g) => g.id === formData.generationId)?.name
                    : "Select Generation"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] transition-transform ${
                    generationOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {generationOpen && generations.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  {generations.map((gen) => (
                    <button
                      key={gen.id}
                      type="button"
                      onClick={() => {
                        handleSelect("generationId", gen.id);
                        setGenerationOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      {gen.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setModificationOpen(!modificationOpen)}
                className="w-full px-4 py-3 border border-gray-400 rounded-lg flex justify-between items-center disabled:opacity-60"
                disabled={modifications.length === 0}
              >
                <span className={formData.modificationId ? "text-gray-900" : "text-gray-500"}>
                  {formData.modificationId
                    ? modifications.find((m) => m.id === formData.modificationId)?.name
                    : "Select Variant"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] transition-transform ${
                    modificationOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {modificationOpen && modifications.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  {modifications.map((mod: any) => (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => {
                        handleSelect("modificationId", mod.id);
                        setModificationOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      {mod.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Year & Engine Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <input
                type="text"
                placeholder="Production Year (e.g. 2020)"
                value={formData.productionYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-400 rounded-lg"
                maxLength={4}
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setEngineOpen(!engineOpen)}
                className="w-full px-4 py-3 border border-gray-400 rounded-lg flex justify-between items-center"
              >
                <span className={formData.engineTypeId ? "text-gray-900" : "text-gray-500"}>
                  {formData.engineTypeId
                    ? engineTypes.find((e) => e.id === formData.engineTypeId)?.name
                    : "Select Engine Type (Optional)"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] transition-transform ${
                    engineOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {engineOpen && engineTypes.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      handleSelect("engineTypeId", null);
                      setEngineOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-500"
                  >
                    None
                  </button>
                  {engineTypes.map((engine) => (
                    <button
                      key={engine.id}
                      type="button"
                      onClick={() => {
                        handleSelect("engineTypeId", engine.id);
                        setEngineOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      {engine.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-6">
            <button
              onClick={handleSubmit}
              disabled={!isFormValid() || updating}
              className="px-10 py-3 bg-[#9AE144] hover:bg-[#8cd136] text-black font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {updating ? "Updating..." : "Update Vehicle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateVehicle;