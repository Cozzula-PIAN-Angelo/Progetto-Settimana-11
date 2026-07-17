import { useAppSelector } from "../app/hooks";
import "./Footer.css";

function Footer() {
  // legge la canzone impostata dal bottone "play" delle card (stato condiviso via Redux)
  const nowPlaying = useAppSelector((state) => state.songs.nowPlaying);

  // niente footer/copyright: la barra esiste solo finché non è stata cliccata una play
  if (!nowPlaying) {
    return null;
  }

  return (
    <div className="footer-player">
      <img
        className="footer-player-cover"
        src={nowPlaying.album.cover_medium}
        alt={nowPlaying.title}
      />
      <div className="footer-player-info">
        <p className="footer-player-title">{nowPlaying.title}</p>
        <p className="footer-player-artist">{nowPlaying.artist.name}</p>
      </div>
      {/* player finto: solo grafica, non riproduce audio */}
      <span className="footer-player-fake-controls">▶</span>
    </div>
  );
}

export default Footer;
