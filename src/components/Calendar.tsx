import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Server {
  id: string;
  name: string;
  start_date: string;
}

interface Event {
  id: string;
  week_number: number;
  name: string;
  reward: string;
}

export default function Calendar() {
  const [servers, setServers] = useState<Server[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: serversData } = await supabase.from("servers").select("*");
      const { data: eventsData } = await supabase.from("events").select("*");
      setServers(serversData || []);
      setEvents(eventsData || []);
    };
    fetchData();
  }, []);

  const getWeekNumber = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
    return (diff % 5) + 1; // loop through 1–5
  };

  const activeWeek = selectedServer ? getWeekNumber(selectedServer.start_date) : null;
  const upcomingWeeks = Array.from({ length: 5 }, (_, i) => ((activeWeek || 1) + i - 1) % 5 + 1);

  return (
    <div className="bg-card p-4 rounded-lg mt-6">
      <h2 className="text-xl mb-2">Välj server</h2>
      <select
        className="bg-background text-text p-2 rounded border border-accent mb-4"
        onChange={(e) => {
          const server = servers.find((s) => s.id === e.target.value);
          setSelectedServer(server || null);
        }}
      >
        <option value="">-- Välj server --</option>
        {servers.map((server) => (
          <option key={server.id} value={server.id}>
            {server.name}
          </option>
        ))}
      </select>

      {selectedServer && (
        <div>
          <h3 className="text-lg mb-2">Eventveckor för {selectedServer.name}</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {upcomingWeeks.map((week) => (
              <li key={week} className="p-4 bg-background rounded shadow border border-accent">
                <h4 className="font-bold">Vecka {week}</h4>
                <ul className="text-sm mt-1">
                  {events
                    .filter((ev) => ev.week_number === week)
                    .map((ev) => (
                      <li key={ev.id}>
                        {ev.name} <span className="text-gray-400">({ev.reward})</span>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}