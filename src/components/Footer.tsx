import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <p>
        &copy; {new Date().getFullYear()} Spotify Vetrina — progetto didattico,
        non affiliato a Spotify AB.
      </p>
    </footer>
  );
}

export default Footer;
