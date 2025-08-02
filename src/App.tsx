import { useState } from "react";
import Auth from "./components/Auth";
import Calendar from "./components/Calendar";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [adminMode, setAdminMode] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text p-4">
      <h1 className="text-3xl font-bold mb-4">Game Events Viewer</h1>

      {!adminMode && !loggedIn && (
        <button
          onClick={() => setAdminMode(true)}
          className="bg-accent text-black px-4 py-2 rounded"
        >
          Admin Login
        </button>
      )}

      {adminMode && !loggedIn && <Auth onLogin={() => setLoggedIn(true)} />}

      <Calendar />
      {loggedIn && <AdminPanel />}
    </div>
  );
}

export default App;