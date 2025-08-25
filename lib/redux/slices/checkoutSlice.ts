import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CheckoutState {
	selectedAddressId: number | null;
	selectedPaymentMethod: string | null;
}

const initialState: CheckoutState = {
	selectedAddressId: null,
	selectedPaymentMethod: null,
};

const checkoutSlice = createSlice({
	name: "checkout",
	initialState,
	reducers: {
		setSelectedAddress: (state, action: PayloadAction<number | null>) => {
			state.selectedAddressId = action.payload;
		},
		setSelectedPaymentMethod: (state, action: PayloadAction<string | null>) => {
			state.selectedPaymentMethod = action.payload;
		},
		resetCheckout: (state) => {
			state.selectedAddressId = null;
			state.selectedPaymentMethod = null;
		},
	},
});

export const { setSelectedAddress, setSelectedPaymentMethod, resetCheckout } =
	checkoutSlice.actions;
export default checkoutSlice.reducer;
