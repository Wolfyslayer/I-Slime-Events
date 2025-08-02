import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminPanel() {
  const [servers, setServers] = useState([]);
  const [events, setEvents] = useState([]);
  const [newServer, setNewServer] = useState({ name: "", start_date: "" });
  const [newEvent, setNewEvent] = useState({ week_number: 1, name: "", reward: "" });

  const fetchData = async () => {
    const { data: s } = await supabase.from("servers").select("*");
    const { data: e } = await supabase.from("events").select("*");
    setServers(s || []);
    setEvents(e || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addServer = async () => {
    await supabase.from("servers").insert([newServer]);
    setNewServer({ name: "", start_date: "" });
    fetchData();
  };

  const addEvent = async () => {
    await supabase.from("events").insert([newEvent]);
    setNewEvent({ week_number: 1, name: "", reward: "" });
    fetchData();
  };

  return (
    <div className="bg-card p-4 rounded mt-6">
      <h2 className="text-xl font-bold mb-4">Adminpanel</h2>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Lägg till server</h3>
        <input
          className="p-2 mr-2 rounded bg-background border border-accent"
          placeholder="Namn"
          value={newServer.name}
          onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
        />
        <input
          className="p-2 mr-2 rounded bg-background border border-accent"
          type="datetime-local"
          value={newServer.start_date}
          onChange={(e) => setNewServer({ ...newServer, start_date: e.target.value })}
        />
        <button onClick={addServer} className="bg-accent text-black py-2 px-4 rounded">Spara</button>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Lägg till event</h3>
        <input
          type="number"
          className="p-2 mr-2 rounded bg-background border border-accent w-20"
          value={newEvent.week_number}
          onChange={(e) => setNewEvent({ ...newEvent, week_number: Number(e.target.value) })}
        />
        <input
          className="p-2 mr-2 rounded bg-background border border-accent"
          placeholder="Eventnamn"
          value={newEvent.name}
          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
        />
        <input
          className="p-2 mr-2 rounded bg-background border border-accent"
          placeholder="Belöning"
          value={newEvent.reward}
          onChange={(e) => setNewEvent({ ...newEvent, reward: e.target.value })}
        />
        <button onClick={addEvent} className="bg-accent text-black py-2 px-4 rounded">Spara</button>
      </div>
    </div>
  );
}