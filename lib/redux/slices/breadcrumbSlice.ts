// features/breadcrumbs/breadcrumbsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const breadcrumbsSlice = createSlice({
  name: 'breadcrumbs',
  initialState,
  reducers: {
    setBreadcrumbs: (state, action) => {
        console.log("🚀 Setting breadcrumbs to:", action.payload);
      state.items = action.payload;
      console.log("🚀 Breadcrumbs set to:", state.items);
    },
    resetBreadcrumbs: (state) => {
      state.items = [];
    },
  },
});

export const { setBreadcrumbs, resetBreadcrumbs } = breadcrumbsSlice.actions;
export default breadcrumbsSlice.reducer;