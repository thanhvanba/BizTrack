import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/user.slice";
import warehouseReducer from "./warehouses/warehouses.slice";
import permissionReducer from "./permission/permission.slice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    warehouse: warehouseReducer,
    permission: permissionReducer,
  },
});
