import axios from "axios";

export const uploadImageToBackend = async (file: File, token: string): Promise<string> => {
	try {
		const formData = new FormData();
		formData.append("file", file);

		const response = await axios.post(
			`${process.env.NEXT_PUBLIC_BASE_URL}images/upload`,
			formData,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data",
				},
			},
		);

		if (response.data && response.data.data.url) {
			return response.data.data.url;
		} else {
			throw new Error("Failed to upload image");
		}
	} catch (error: unknown) {
		// Narrow down error type
		let message = "Failed to upload image to backend";
		if (error instanceof Error) {
			message = error.message;
		}
		console.error("Image upload error:", message);
		throw new Error(message);
	}
};
