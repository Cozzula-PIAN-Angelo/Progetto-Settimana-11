import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchSongs } from "../features/songs/songsSlice";
import SongCard from "../components/SongCard";

function HomePage() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.songs);

  useEffect(() => {
    dispatch(fetchSongs("queen"));
  }, [dispatch]);

  if (status === "loading") {
    return <p>Caricamento...</p>;
  }

  if (status === "failed") {
    return <p>Errore: {error}</p>;
  }

  return (
    <div className="song-grid">
      {items.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
}

export default HomePage;
