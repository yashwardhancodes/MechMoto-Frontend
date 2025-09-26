// Define a type for API error responses
export interface ApiError {
  message: string | undefined;
  data?: {
    message?: string;
  };
}

// Type guard for ApiError
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof (error as { data?: unknown }).data === "object"
  );
}
