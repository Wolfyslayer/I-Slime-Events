import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function AdminPanel() {
  const [servers, setServers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [newServerDate, setNewServerDate] = useState("");
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({ week: "", name: "", reward: "" });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: serverData } = await supabase.from("servers").select("*");
    const { data: eventData } = await supabase.from("events").select("*");
    setServers(serverData || []);
    setEvents(eventData || []);
  }

  async function updateStartDate(id: string) {
    await supabase
      .from("servers")
      .update({ start_date: newServerDate })
      .eq("id", id);
    setEditingServerId(null);
    fetchData();
  }

  async function addEvent() {
    if (!newEvent.week || !newEvent.name) return;
    await supabase.from("events").insert([newEvent]);
    setNewEvent({ week: "", name: "", reward: "" });
    fetchData();
  }

  async function deleteEvent(id: string) {
    await supabase.from("events").delete().eq("id", id);
    fetchData();
  }

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Adminpanel</h2>

      {/* Server-redigering */}
      <h3 className="text-xl font-semibold mb-2">Serverstartdatum</h3>
      <table className="w-full border-collapse border border-white mb-8">
        <thead>
          <tr className="border-b border-white">
            <th className="p-2">Server</th>
            <th className="p-2">Startdatum</th>
            <th className="p-2">Redigera</th>
          </tr>
        </thead>
        <tbody>
          {servers.map((s) => (
            <tr key={s.id} className="border-b border-white">
              <td className="p-2">{s.name}</td>
              <td className="p-2">
                {editingServerId === s.id ? (
                  <input
                    type="date"
                    value={newServerDate}
                    onChange={(e) => setNewServerDate(e.target.value)}
                    className="bg-gray-800 p-1"
                  />
                ) : s.start_date ? (
                  new Date(s.start_date).toLocaleDateString()
                ) : (
                  "Ej satt"
                )}
              </td>
              <td className="p-2">
                {editingServerId === s.id ? (
                  <button onClick={() => updateStartDate(s.id)}>Spara</button>
                ) : (
                  <button
                    className="text-blue-400"
                    onClick={() => {
                      setEditingServerId(s.id);
                      setNewServerDate(s.start_date || "");
                    }}
                  >
                    Ändra
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Event-hantering */}
      <h3 className="text-xl font-semibold mb-2">Eventlista</h3>
      <ul className="mb-4">
        {events.map((e) => (
          <li key={e.id} className="flex justify-between items-center border-b py-1">
            <span>
              Vecka {e.week} – {e.name} ({e.reward})
            </span>
            <button
              onClick={() => deleteEvent(e.id)}
              className="text-red-500 hover:underline"
            >
              Ta bort
            </button>
          </li>
        ))}
      </ul>

      {/* Lägg till nytt event */}
      <form
        className="bg-gray-900 p-4 rounded"
        onSubmit={(e) => {
          e.preventDefault();
          addEvent();
        }}
      >
        <h4 className="text-lg font-semibold mb-2">Lägg till nytt event</h4>
        <input
          type="text"
          placeholder="Vecka"
          value={newEvent.week}
          onChange={(e) => setNewEvent({ ...newEvent, week: e.target.value })}
          className="block mb-2 p-2 bg-gray-800 w-full"
        />
        <input
          type="text"
          placeholder="Namn"
          value={newEvent.name}
          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
          className="block mb-2 p-2 bg-gray-800 w-full"
        />
        <input
          type="text"
          placeholder="Belöning"
          value={newEvent.reward}
          onChange={(e) => setNewEvent({ ...newEvent, reward: e.target.value })}
          className="block mb-2 p-2 bg-gray-800 w-full"
        />
        <button
          type="submit"
          className="bg-accent text-black px-4 py-2 rounded"
        >
          Lägg till
        </button>
      </form>
    </div>
  );
}
