import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <svg viewBox="0 0 24 24" width="32" height="32">
          <circle cx="12" cy="12" r="12" fill="#1DB954" />
          <path
            d="M6 8c4-1.3 9.5-1 13 1"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M6.5 11.7c3.5-1.2 8-1 11 .8"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M7.5 15.5c3-1 6-1 9 .5"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <span className="navbar-title">Spotify</span>
      </div>
    </nav>
  );
}

export default Navbar;
