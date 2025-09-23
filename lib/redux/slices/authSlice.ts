import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { rehydrateAuth } from "../thunks/authThunks";

export interface Role {
	id: number;
	name: string;
	description: string;
	is_system: boolean;
	created_at: string;
	updated_at: string;
}

export interface User {
	id: string;
	email: string;
	password: string;
	roleId: number;
	role: Role;
	fullName?: string;
	phone?: string;
	razorpaySubscriptionId?: string | null; // ✅ added here
}

export interface AuthState {
	user: User | null;
	token: string | null;
	loading: boolean;
}

const initialState: AuthState = {
	user: null,
	token: null,
	loading: true,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setCredentials: (
			state,
			action: PayloadAction<{ user: User; token: string }>
		) => {
			state.user = action.payload.user;
			state.token = action.payload.token;
			localStorage.setItem("auth", JSON.stringify(action.payload));
		},
		logout: (state) => {
			state.user = null;
			state.token = null;
			localStorage.removeItem("auth");
		},

		// ✅ new reducer for updating subscriptionId
		setSubscriptionId: (state, action: PayloadAction<string | null>) => {
			if (state.user) {
				state.user.razorpaySubscriptionId = action.payload;
				// update localStorage copy too
				const authData = {
					user: state.user,
					token: state.token,
				};
				localStorage.setItem("auth", JSON.stringify(authData));
			}
		},

		clearSubscriptionId: (state) => {
			if (state.user) {
				state.user.razorpaySubscriptionId = null;
			}
			localStorage.setItem("auth", JSON.stringify(state));
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(rehydrateAuth.pending, (state) => {
				state.loading = true;
			})
			.addCase(rehydrateAuth.fulfilled, (state) => {
				state.loading = false;
			})
			.addCase(rehydrateAuth.rejected, (state) => {
				state.loading = false;
			});
	},
});

export const { setCredentials, logout, setSubscriptionId ,clearSubscriptionId } = authSlice.actions;
export default authSlice.reducer;
