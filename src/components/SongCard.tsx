import { useAppDispatch, useAppSelector } from "../app/hooks";
import { toggleFavorite, setNowPlaying } from "../features/songs/songsSlice";
import type { Song } from "../types/song";
import { useNavigate } from "react-router-dom";
import "./SongCard.css";

interface SongCardProps {
  song: Song;
}

function SongCard({ song }: SongCardProps) {
  const isFavorite = useAppSelector((state) =>
    state.songs.favorites.includes(song.id),
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    // niente <Link>: un <button> dentro un <a> è annidamento non valido e causa
    // la navigazione anche quando si clicca il cuore, nonostante stopPropagation.
    // Navigazione gestita "a mano" con useNavigate al click sul div.
    <div
      className="song-card"
      onClick={() => navigate(`/song/${song.id}`)}
      role="link"
      tabIndex={0}
    >
      <img
        className="song-card-cover"
        src={song.album.cover_medium}
        alt={song.title}
      />
      <div className="song-card-info">
        <p className="song-card-title">{song.title}</p>
        <p className="song-card-artist">{song.artist.name}</p>
      </div>
      <div className="song-card-actions">
        <button
          className="song-card-play"
          onClick={(e) => {
            e.stopPropagation(); // stessa logica del cuore: non deve far scattare anche la navigazione
            dispatch(setNowPlaying(song));
          }}
          aria-label={`Riproduci ${song.title}`}
        >
          ▶
        </button>
        <button
          className={`song-card-heart ${isFavorite ? "is-favorite" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            dispatch(toggleFavorite(song.id));
          }}
          aria-label={
            isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"
          }
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>
    </div>
  );
}

export default SongCard;
