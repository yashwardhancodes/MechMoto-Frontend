'use client';

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useCreateVehicleMutation } from "@/lib/redux/api/vehicleApi";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import { useGetAllEngineTypesQuery } from "@/lib/redux/api/engineTypeApi";
import { vehicleSchema } from "@/lib/schema/vehicleSchema";
import { useRouter } from "next/navigation";
import { useGetAllModificationsQuery } from "@/lib/redux/api/modificationApi";
import { useGetModelLinesQuery } from "@/lib/redux/api/modelLineApi";

interface FormData {
	carMakeId: number | null;
	modelLineId: number | null;
	productionYear: string;
	modificationId: number | null;
	engineTypeId: number | null;
}

const AddVehicle: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
		carMakeId: null,
    modelLineId: null,
		productionYear: "",
		modificationId: null,
		engineTypeId: null,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [addVehicle, { isLoading }] = useCreateVehicleMutation();
  const { data: carMakesResponse, isLoading: carMakesLoading, error: carMakesError } = useGetAllCarMakesQuery({page: 1, limit: 9999999});
  const {
		data: modificationsResponse,
		isLoading: modificationsLoading,
		error: modificationsError,
  } = useGetAllModificationsQuery({page: 1, limit: 999999});
  const { data: modelLineData } = useGetModelLinesQuery(
      formData.carMakeId ? { car_make: formData.carMakeId } : {},
      { skip: !formData.carMakeId },
    );
  const { data: engineTypesResponse, isLoading: engineTypesLoading, error: engineTypesError } = useGetAllEngineTypesQuery({page: 1, limit: 999999});

  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [modelLineDropdown, setModelLineDropdown] = useState(false);
  const [modificationDropdown, setModificationDropdown] = useState(false);
  const [engineDropdownOpen, setEngineDropdownOpen] = useState(false);

  // ✅ Wrap in useMemo to fix dependency warnings
  const carMakes = carMakesResponse?.data?.carMakes;
  const modelLines = modelLineData?.data;
  const modifications = formData.modelLineId ? modificationsResponse?.data?.modifications?.filter(modi => modi.model_lineId === formData.modelLineId) : null;
  console.log("modifications response", modificationsResponse);
  console.log("model line", modelLineData);
  const engineTypes = engineTypesResponse?.data?.engineTypes;

  useEffect(() => {
    console.log("carMakesResponse:", carMakesResponse);
    console.log("engineTypesResponse:", engineTypesResponse);
    console.log("carMakes:", carMakes);
    console.log("engineTypes:", engineTypes);
    console.log("formData:", formData);
  }, [carMakesResponse, engineTypesResponse, carMakes, engineTypes, formData]);

  useEffect(() => {
    if (carMakesError) {
      toast.error("Failed to load car makes. Please try again.");
    }
    if (engineTypesError) {
      toast.error("Failed to load engine types. Please try again.");
    }
    if (modificationsError) {
      toast.error("Failed to load modifications. Please try again.");
    }
  }, [carMakesError, engineTypesError, modificationsError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (field: keyof FormData, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const isFormValid = () => {
    return (
      formData.carMakeId !== null &&
      formData.modificationId !== null &&
      // formData.modelLine.trim() !== "" &&
      !isNaN(Number(formData.productionYear)) &&
      Number(formData.productionYear) > 0
    );
  };

  const handleSubmit = async () => {
    try {
      setErrors({});

      const payload = {
			carMakeId: formData.carMakeId,
			// modelLine: formData.modelLine ?? "",
			productionYear: Number(formData.productionYear) || 0,
			modificationId: formData.modificationId,
			engineTypeId: formData.engineTypeId,
		};

      console.log("Submitting payload:", payload);

      const parsedData = vehicleSchema.parse(payload);
      console.log("✅ Valid Data:", parsedData);

      const result = await addVehicle(parsedData).unwrap();
      console.log("✅ API Response:", result);

      if (result?.success) {
        toast.success("Vehicle added successfully!");
        router.push("/admin/manage-vehicles?refresh=true");
      } else {
        toast.error("Vehicle addition failed. Please try again.");
      }
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        const formattedErrors: { [key: string]: string } = {};
        err.errors.forEach((e) => {
          const key = e.path[0] as string;
          formattedErrors[key] = e.message;
        });
        setErrors(formattedErrors);
        Object.values(formattedErrors).forEach((error) => toast.error(error));
      } else {
        console.error("❌ Error:", err);
        toast.error((err as { data?: { message?: string } })?.data?.message || "Something went wrong!");
      }
    }
  };

  return (
		<div className="h-[calc(100vh-170px)] overflow-y-auto bg-white shadow-sm py-16 px-4">
			<div className="max-w-5xl mx-auto">
				<div className="space-y-9">
					{/* Brand & Model */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Car Make Dropdown */}
						<div className="relative">
							<button
								type="button"
								onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
								disabled={carMakesLoading || !!carMakesError}
							>
								<span
									className={
										formData.carMakeId && carMakes?.length > 0
											? "text-gray-700"
											: "text-gray-400"
									}
								>
									{carMakesLoading
										? "Loading..."
										: carMakesError
										? "Error loading makes"
										: formData.carMakeId
										? carMakes.find((b) => b.id === formData.carMakeId)?.name ||
										  "Select Car Make"
										: "Select Car Make"}
								</span>
								<ChevronDown
									className={`w-5 h-5 text-[#9AE144] ${
										brandDropdownOpen ? "rotate-180" : ""
									}`}
								/>
							</button>
							{brandDropdownOpen &&
								!carMakesLoading &&
								!carMakesError &&
								carMakes?.length > 0 && (
									<div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
										{carMakes.map((brand) => (
											<button
												key={brand.id}
												type="button"
												onClick={() => {
													handleSelectChange("carMakeId", brand.id);
													setBrandDropdownOpen(false);
												}}
												className="w-full px-4 py-2 text-left hover:bg-gray-50"
											>
												{brand.name}
											</button>
										))}
									</div>
								)}
							{errors.carMakeId && (
								<p className="text-red-500 text-sm mt-1">{errors.carMakeId}</p>
							)}
						</div>
						<div className="relative">
							<button
								type="button"
								onClick={() => setModelLineDropdown(!modelLineDropdown)}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
								disabled={!modelLines}
							>
								<span
									className={
										formData.modelLineId && modelLines?.length > 0
											? "text-gray-700"
											: "text-gray-400"
									}
								>
									{formData.modelLineId
										? modelLines.find((b) => b.id === formData.modelLineId)
												?.name || "Select Car Make"
										: "Select Model Line"}
								</span>
								<ChevronDown
									className={`w-5 h-5 text-[#9AE144] ${
										brandDropdownOpen ? "rotate-180" : ""
									}`}
								/>
							</button>
							{modelLineDropdown && modelLines?.length > 0 && (
								<div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
									{modelLines.map((brand) => (
										<button
											key={brand.id}
											type="button"
											onClick={() => {
												handleSelectChange("modelLineId", brand.id);
												setModelLineDropdown(false);
											}}
											className="w-full px-4 py-2 text-left hover:bg-gray-50"
										>
											{brand.name}
										</button>
									))}
								</div>
							)}
							{/* {errors.carMakeId && <p className="text-red-500 text-sm mt-1">{errors.carMakeId}</p>} */}
						</div>
						<div className="relative">
							<button
								type="button"
								onClick={() => setModificationDropdown(!brandDropdownOpen)}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
								disabled={modificationsLoading || !!modificationsError}
							>
								<span
									className={
										formData.modificationId && modifications?.length > 0
											? "text-gray-700"
											: "text-gray-400"
									}
								>
									{modificationsLoading
										? "Loading..."
										: modificationsError
										? "Error loading makes"
										: formData.modificationId
										? modifications.find((b) => b.id === formData.modificationId)?.name ||
										  "Select Modification"
										: "Select Modification"}
								</span>
								<ChevronDown
									className={`w-5 h-5 text-[#9AE144] ${
										modificationDropdown ? "rotate-180" : ""
									}`}
								/>
							</button>
							{modificationDropdown &&
								!modificationsLoading &&
								!modificationsError &&
								modifications?.length > 0 && (
									<div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
										{modifications?.map((brand) => (
											<button
												key={brand.id}
												type="button"
												onClick={() => {
													handleSelectChange("modificationId", brand.id);
													setModificationDropdown(false);
												}}
												className="w-full px-4 py-2 text-left hover:bg-gray-50"
											>
												{brand.name}
											</button>
										))}
									</div>
								)}
							{errors.modificationId && (
								<p className="text-red-500 text-sm mt-1">{errors.modificationId}</p>
							)}
						</div>
						{/* Model Input */}
						{/* <div>
              <input
                type="text"
                name="modelLine"
                placeholder="Model Line"
                value={formData.modelLine ?? ""}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg"
              />
              {errors.modelLine && <p className="text-red-500 text-sm mt-1">{errors.modelLine}</p>}
            </div> */}
					</div>

					{/* Year & Engine */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Year */}
						<div>
							<input
								type="text"
								name="productionYear"
								placeholder="Year"
								value={formData.productionYear ?? ""}
								onChange={handleInputChange}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg"
							/>
							{errors.productionYear && (
								<p className="text-red-500 text-sm mt-1">{errors.productionYear}</p>
							)}
						</div>

						{/* Engine Type Dropdown */}
						<div className="relative">
							<button
								type="button"
								onClick={() => setEngineDropdownOpen(!engineDropdownOpen)}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
								disabled={engineTypesLoading || !!engineTypesError}
							>
								<span
									className={
										formData.engineTypeId && engineTypes?.length > 0
											? "text-gray-700"
											: "text-gray-400"
									}
								>
									{engineTypesLoading
										? "Loading..."
										: engineTypesError
										? "Error loading engines"
										: formData.engineTypeId
										? engineTypes.find((e) => e.id === formData.engineTypeId)
												?.name || "Select Engine Type"
										: "Select Engine Type"}
								</span>
								<ChevronDown
									className={`w-5 h-5 text-[#9AE144] ${
										engineDropdownOpen ? "rotate-180" : ""
									}`}
								/>
							</button>
							{engineDropdownOpen &&
								!engineTypesLoading &&
								!engineTypesError &&
								engineTypes?.length > 0 && (
									<div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
										{engineTypes.map((engine) => (
											<button
												key={engine.id}
												type="button"
												onClick={() => {
													handleSelectChange("engineTypeId", engine.id);
													setEngineDropdownOpen(false);
												}}
												className="w-full px-4 py-2 text-left hover:bg-gray-50"
											>
												{engine.name}
											</button>
										))}
									</div>
								)}
							{errors.engineTypeId && (
								<p className="text-red-500 text-sm mt-1">{errors.engineTypeId}</p>
							)}
						</div>
					</div>

					{/* Modification */}
					{/* <div>
						<input
							type="text"
							name="modification"
							placeholder="Modification"
							value={formData.modificationId ?? ""}
							onChange={handleInputChange}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg"
						/>
						{errors.modification && (
							<p className="text-red-500 text-sm mt-1">{errors.modification}</p>
						)}
					</div> */}

					{/* Submit Button */}
					<div className="flex justify-end pt-3">
						<button
							type="button"
							onClick={handleSubmit}
							disabled={
								isLoading ||
								carMakesLoading ||
								engineTypesLoading ||
								!!carMakesError ||
								!!engineTypesError ||
								!isFormValid()
							}
							className="px-8 py-3 bg-[#9AE144] text-black font-medium rounded-lg disabled:opacity-50"
						>
							{isLoading ? "Adding..." : "Add Vehicle"}
						</button>
					</div>
				</div>
			</div>
		</div>
  );
};

export default AddVehicle;
