import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchSongs } from "../features/songs/songsSlice";
import { login, logout } from "../features/auth/authSlice";
import "./Sidebar.css";

function Sidebar() {
  const [query, setQuery] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, username } = useAppSelector((state) => state.auth);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    dispatch(fetchSongs(trimmed));
    navigate("/"); // se cerchi mentre sei sulla pagina dettagli, torni alla home con i nuovi risultati
  };

  return (
    <aside className="sidebar">
      <form className="sidebar-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Cerca artista o canzone..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" aria-label="Cerca">
          🔍
        </button>
      </form>

      <div className="sidebar-auth">
        {isLoggedIn ? (
          <>
            <p className="sidebar-username">Ciao, {username}</p>
            <button
              className="sidebar-auth-button"
              onClick={() => dispatch(logout())}
            >
              Esci
            </button>
          </>
        ) : (
          <button
            className="sidebar-auth-button"
            onClick={() => dispatch(login("Utente Demo"))}
          >
            Accedi
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
