import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminPanel() {
  const [servers, setServers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [newServerDate, setNewServerDate] = useState("");
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({ week: "", name: "", rewards: "" });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: serverData } = await supabase.from("servers").select("*").order("name");
    const { data: eventData } = await supabase.from("events").select("*").order("week");
    setServers(serverData || []);
    setEvents(eventData || []);
  }

  async function updateStartDate(id: string) {
    await supabase
      .from("servers")
      .update({ start_date: new Date(newServerDate) })
      .eq("id", id);
    setEditingServerId(null);
    fetchData();
  }

  async function addEvent() {
    if (!newEvent.week || !newEvent.name) return alert("Fyll i alla fält!");
    await supabase.from("events").insert([newEvent]);
    setNewEvent({ week: "", name: "", rewards: "" });
    fetchData();
  }

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">🛠️ Adminpanel</h2>

      {/* Server-redigering */}
      <h3 className="text-xl font-semibold mt-6">Servrar</h3>
      <table className="w-full border-collapse text-left mb-8">
        <thead>
          <tr className="border-b border-gray-600">
            <th>Server</th>
            <th>Startdatum</th>
            <th>Redigera</th>
          </tr>
        </thead>
        <tbody>
          {servers.map((s) => (
            <tr key={s.id} className="border-b border-gray-800">
              <td>{s.name}</td>
              <td>
                {editingServerId === s.id ? (
                  <input
                    type="date"
                    value={newServerDate}
                    onChange={(e) => setNewServerDate(e.target.value)}
                    className="bg-gray-800 px-2 py-1"
                  />
                ) : s.start_date ? (
                  new Date(s.start_date).toLocaleDateString()
                ) : (
                  "Ej satt"
                )}
              </td>
              <td>
                {editingServerId === s.id ? (
                  <button onClick={() => updateStartDate(s.id)} className="text-green-400">
                    Spara
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingServerId(s.id);
                      setNewServerDate(s.start_date?.split("T")[0] || "");
                    }}
                    className="text-blue-400"
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
      <h3 className="text-xl font-semibold mb-2">Lägg till Event</h3>
      <div className="mb-6 flex flex-col gap-2">
        <input
          placeholder="Vecka (t.ex. 1)"
          value={newEvent.week}
          onChange={(e) => setNewEvent({ ...newEvent, week: e.target.value })}
          className="bg-gray-800 px-2 py-1"
        />
        <input
          placeholder="Eventnamn"
          value={newEvent.name}
          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
          className="bg-gray-800 px-2 py-1"
        />
        <input
          placeholder="Belöning/typ"
          value={newEvent.rewards}
          onChange={(e) => setNewEvent({ ...newEvent, rewards: e.target.value })}
          className="bg-gray-800 px-2 py-1"
        />
        <button onClick={addEvent} className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded">
          Spara Event
        </button>
      </div>

      <h3 className="text-xl font-semibold mt-6 mb-2">Alla Events</h3>
      <ul className="list-disc pl-6">
        {events.map((e) => (
          <li key={`${e.week}-${e.name}`}>
            Vecka {e.week}: {e.name} – {e.rewards}
          </li>
        ))}
      </ul>
    </div>
  );
}
