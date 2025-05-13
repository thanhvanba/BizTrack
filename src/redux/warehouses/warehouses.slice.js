import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import warehouseService from '../../service/warehouseService'; // Giả sử bạn có một service cho warehouse

export const fetchWarehouses = createAsyncThunk(
  'warehouses/fetchWarehouses',
  async () => {
    const warehouses = await warehouseService.getAllWarehouses(); // Giả sử service này có hàm getAllWarehouses
    return warehouses;
  }
);

const initialState = {
  warehouses: [],
  loading: false,
  error: null,
};

export const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    // Bạn có thể thêm các reducers đồng bộ khác tại đây nếu cần
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Action creators (nếu có reducers đồng bộ)
export const {} = warehouseSlice.actions;

export default warehouseSlice.reducer;