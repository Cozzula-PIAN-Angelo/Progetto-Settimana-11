import { configureStore } from "@reduxjs/toolkit";
import songsReducer from '../features/songs/songsSlice'

export const store = configureStore({
    reducer: {
        songs: songsReducer,
    },
})

export type RootState = ReturnType<typerof Store.getStates>
export type AppDispatch = typeof store.dispatch
