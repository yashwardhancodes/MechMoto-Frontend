import { createAsyncThunk } from "@reduxjs/toolkit";
import { User, setCredentials, logout } from "../slices/authSlice";

export const rehydrateAuth = createAsyncThunk(
	"auth/rehydrate",
	async (_, { dispatch, rejectWithValue }) => {
		try {
			const authData = localStorage.getItem("auth");
			if (authData) {
				const parsed = JSON.parse(authData);
				if (parsed.user && parsed.token) {
					dispatch(setCredentials(parsed));
				} else {
					dispatch(logout());
				}
			} else {
				dispatch(logout());
			}
		} catch (error) {
			console.error("Failed to rehydrate auth state:", error);
			localStorage.removeItem("auth");
			return rejectWithValue(error);
		}
	},
);
