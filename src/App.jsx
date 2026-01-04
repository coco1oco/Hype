import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import TicketPurchase from "./pages/TicketPurchase";
import SellerCheckout from "./pages/SellerCheckout";
import DigitalPass from "./pages/DigitalPass";
import MyTickets from "./pages/MyTickets";
import CheckInScanner from "./pages/CheckInScanner";
import Favorites from "./pages/Favorites";
import { ToastProvider } from "./components/ToastProvider";
import { recordInteraction } from "./services/personalizationService";
import { events } from "./data/events";
import "./App.css";

function App() {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (eventId) => {
    const event = events.find((e) => e.id === eventId);
    const isFavoriting = !favorites.includes(eventId);

    // Record personalization interaction
    if (event) {
      recordInteraction(eventId, event, isFavoriting ? "favorite" : "view");
    }

    setFavorites((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  return (
    <ToastProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route
                path="/"
                element={
                  <Home favorites={favorites} toggleFavorite={toggleFavorite} />
                }
              />
              <Route
                path="/favorites"
                element={
                  <Favorites
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                  />
                }
              />
              <Route
                path="/event/:id"
                element={
                  <EventDetail
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                  />
                }
              />
              <Route path="/purchase/:eventId" element={<TicketPurchase />} />
              <Route
                path="/purchase/:eventId/seller/:sellerId"
                element={<SellerCheckout />}
              />
              <Route path="/ticket/:ticketId" element={<DigitalPass />} />
              <Route path="/my-tickets" element={<MyTickets />} />
              <Route path="/scanner" element={<CheckInScanner />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
