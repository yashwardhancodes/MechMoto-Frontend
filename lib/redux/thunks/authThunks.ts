// In authThunks.ts (or wherever rehydrateAuth lives)
import { createAsyncThunk } from "@reduxjs/toolkit";
import { setCredentials, User } from "../slices/authSlice";
import { AuthState } from "../slices/authSlice"; // Adjust path

export const rehydrateAuth = createAsyncThunk<
	{ user: User; token: string } | null,
	void,
	{ state: { auth: AuthState } }
>("auth/rehydrateAuth", (_, { dispatch }) => {
	const storageKey = "auth";

	// ✅ Check localStorage first (persistent)
	let authData = localStorage.getItem(storageKey);
	if (!authData) {
		// Fallback to sessionStorage (current session)
		authData = sessionStorage.getItem(storageKey);
	}

	if (authData) {
		try {
			const parsed = JSON.parse(authData);
			if (parsed.user && parsed.token) {
				dispatch(setCredentials(parsed));
				return parsed;
			}
		} catch (err) {
			console.error("Failed to rehydrate auth:", err);
			// Clear invalid data
			localStorage.removeItem(storageKey);
			sessionStorage.removeItem(storageKey);
		}
	}

	return null;
});
