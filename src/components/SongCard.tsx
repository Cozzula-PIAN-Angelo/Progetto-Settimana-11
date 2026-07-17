import { useAppDispatch, useAppSelector } from "../app/hooks";
import { toggleFavorite } from "../features/songs/songsSlice";
import type { Song } from "../types/song";

interface SongCardProps {
  song: Song;
}

function SongCard({ song }: SongCardProps) {
  const isFavorite = useAppSelector((state) =>
    state.songs.favorites.includes(song.id),
  );
  const dispatch = useAppDispatch();

  return (
    <div className="song-card">
      <img src={song.album.cover_medium} alt={song.title} />
      <p>{song.title}</p>
      <p>{song.artist.name}</p>
      <button onClick={() => dispatch(toggleFavorite(song.id))}>
        {isFavorite ? "♥" : "♡"}
      </button>
    </div>
  );
}

export default SongCard;
