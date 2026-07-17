import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Song } from "../../types/song";

interface SongsState {
  items: Song[];
  favorites: number[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  selected: Song | null;
  selectedStatus: "idle" | "loading" | "succeeded" | "failed";
  selectedError: string | null;
}

export const fetchSongs = createAsyncThunk(
  "songs/fetchSongs",
  async (query: string) => {
    const res = await fetch(
      `https://striveschool-api.herokuapp.com/api/deezer/search?q=${query}`,
    );
    const data = await res.json();
    return data.data as Song[];
  },
);

export const fetchSongById = createAsyncThunk(
  "songs/fetchSongById",
  async (id: number) => {
    const res = await fetch(
      `https://striveschool-api.herokuapp.com/api/deezer/track/${id}`,
    );
    const data = await res.json();
    return data as Song;
  },
);

const initialState: SongsState = {
  items: [],
  favorites: [],
  status: "idle",
  error: null,
  selected: null,
  selectedStatus: "idle",
  selectedError: null,
};

const songsSlice = createSlice({
  name: "songs",
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      if (state.favorites.includes(id)) {
        state.favorites = state.favorites.filter((favId) => favId !== id);
      } else {
        state.favorites.push(id);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSongs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSongs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchSongs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Errore sconosciuto";
      })
      .addCase(fetchSongById.pending, (state) => {
        state.selectedStatus = "loading";
        state.selectedError = null;
      })
      .addCase(fetchSongById.fulfilled, (state, action) => {
        state.selectedStatus = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchSongById.rejected, (state, action) => {
        state.selectedStatus = "failed";
        state.selectedError = action.error.message ?? "Errore sconosciuto";
      });
  },
});

export const { toggleFavorite } = songsSlice.actions;
export default songsSlice.reducer;
