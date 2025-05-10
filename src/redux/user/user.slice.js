import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import authService from '../../service/authService';

export const fetchProfile = createAsyncThunk(
    'users/fetchProfile',
    async () => {
        const userInfo = await authService.getUserInfo();
        return userInfo
    },
)
const initialState = {
    userInfo: {},
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // increment: (state) => {
        //     state.value += 1
        // },
    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder
            .addCase(fetchProfile.fulfilled, (state, action) => {
                // Add user to the state array
                state.userInfo = action.payload
            })
    }
})

// Action creators are generated for each case reducer function
export const { } = userSlice.actions

export default userSlice.reducer