import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchSongById, toggleFavorite } from "../features/songs/songsSlice";
import "./DetailsPage.css";

function DetailsPage() {
  const { id } = useParams<{ id: string }>();

  const dispatch = useAppDispatch();
  const { selected, selectedStatus, selectedError, favorites } = useAppSelector(
    (state) => state.songs,
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchSongById(Number(id)));
    }
  }, [id, dispatch]);

  if (selectedStatus === "loading") {
    return <p className="state-message">Caricamento...</p>;
  }

  if (selectedStatus === "failed" || !selected) {
    return <p className="state-message">Errore: {selectedError}</p>;
  }

  const isFavorite = favorites.includes(selected.id);

  const minutes = Math.floor(selected.duration / 60);
  const seconds = String(selected.duration % 60).padStart(2, "0");

  return (
    <div className="details-page">
      <Link className="details-back" to="/">
        &larr; Torna alla home
      </Link>
      <div className="details-content">
        <img
          className="details-cover"
          src={selected.album.cover_big}
          alt={selected.title}
        />
        <div className="details-info">
          <h1 className="details-title">{selected.title}</h1>
          <p className="details-artist">{selected.artist.name}</p>
          <p className="details-meta">Album: {selected.album.title}</p>
          <p className="details-meta">
            Durata: {minutes}:{seconds}
          </p>
          {selected.release_date && (
            <p className="details-meta">
              Data di uscita: {selected.release_date}
            </p>
          )}
          <button
            className={`details-favorite ${isFavorite ? "is-favorite" : ""}`}
            onClick={() => dispatch(toggleFavorite(selected.id))}
          >
            {isFavorite ? "♥ Rimuovi dai preferiti" : "♡ Aggiungi ai preferiti"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailsPage;
