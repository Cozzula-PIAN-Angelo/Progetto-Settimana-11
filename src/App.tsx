import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import DetailsPage from "./pages/DetailsPage";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/song/:id" element={<DetailsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
