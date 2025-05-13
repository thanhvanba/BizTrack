import { configureStore } from '@reduxjs/toolkit'
import userReducer  from './user/user.slice'
import warehouseReducer from './warehouses/warehouses.slice'

export const store = configureStore({
    reducer: {
        user: userReducer,
        warehouse: warehouseReducer
    },
})