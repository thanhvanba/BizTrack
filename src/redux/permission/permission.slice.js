import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import permisstionService from "../../service/permissionService";

export const fetchPermissionByRole = createAsyncThunk(
  "permissions/fetchPermissionByRole",
  async (roleId) => {
    const permissions = await permisstionService.getPermissionsByRole(roleId);
    return permissions?.data;
  }
);
const initialState = {
  permissions: {},
};

export const permissionSlice = createSlice({
  name: "permission",
  initialState,
  reducers: {
    // increment: (state) => {
    //     state.value += 1
    // },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchPermissionByRole.fulfilled, (state, action) => {
      // Add user to the state array
      state.permissions = action.payload;
    });
  },
});

// Action creators are generated for each case reducer function
export const {} = permissionSlice.actions;

export default permissionSlice.reducer;
