import { useState } from "react";
import Auth from "./components/Auth";
import Calendar from "./components/Calendar";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [adminMode, setAdminMode] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-background text-white p-6">
      <h1 className="text-3xl font-bold mb-4">I-Slime Events</h1>

      {/* Visa inloggningsknapp om adminläge är av och ej inloggad */}
      {!adminMode && !loggedIn && (
        <button
          onClick={() => setAdminMode(true)}
          className="bg-accent text-black px-4 py-2 rounded mb-4"
        >
          Admin Login
        </button>
      )}

      {/* Visa inloggningsformulär */}
      {adminMode && !loggedIn && (
        <Auth onLogin={() => setLoggedIn(true)} />
      )}

      {/* Visa kalendern alltid */}
      <Calendar />

      {/* Visa adminpanelen när inloggad */}
      {loggedIn && <AdminPanel />}
    </div>
  );
}

export default App;
