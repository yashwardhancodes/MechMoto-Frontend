import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RedirectState {
  path: string | null;
}

const initialState: RedirectState = {
  path: null,
};

const redirectSlice = createSlice({
  name: "redirect",
  initialState,
  reducers: {
    setRedirect: (state, action: PayloadAction<string>) => {
      state.path = action.payload;
    },
    clearRedirect: (state) => {
      state.path = null;
    },
  },
});

export const { setRedirect, clearRedirect } = redirectSlice.actions;
export default redirectSlice.reducer;
