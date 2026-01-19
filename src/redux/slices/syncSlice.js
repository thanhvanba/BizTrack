import { createSlice } from "@reduxjs/toolkit";

export const syncSlice = createSlice({
  name: "sync",
  initialState: {
    isOnline: navigator.onLine,
    pendingRequests: [],
  },
  reducers: {
    setOnline: (state, action) => {
      state.isOnline = action.payload;
    },
    addPendingRequest: (state, action) => {
      state.pendingRequests.push(action.payload);
    },
  },
});
