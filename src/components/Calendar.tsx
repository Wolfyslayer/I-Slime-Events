import { useEffect, useState } from "react";
import supabase from '../lib/supabase';

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
    <div className="bg-card p-6 rounded-lg mt-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Välj server</h2>
      <select
        className="bg-background text-text p-3 rounded border border-accent mb-6 w-full max-w-sm"
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
          <h3 className="text-xl font-semibold mb-4">Eventveckor för {selectedServer.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {upcomingWeeks.map((week) => (
              <div
                key={week}
                className="bg-background rounded-lg shadow-md border border-accent p-5 flex flex-col"
              >
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-background font-bold text-lg mr-3">
                    {week}
                  </div>
                  <h4 className="text-lg font-semibold">Vecka {week}</h4>
                </div>
                <ul className="space-y-2 flex-grow overflow-auto max-h-48">
                  {events
                    .filter((ev) => ev.week_number === week)
                    .map((ev) => (
                      <li
                        key={ev.id}
                        className="text-text flex justify-between items-center border-b border-gray-300 pb-1"
                      >
                        <span>{ev.name}</span>
                        <span className="text-sm text-gray-500 italic">{ev.reward}</span>
                      </li>
                    ))}
                  {events.filter((ev) => ev.week_number === week).length === 0 && (
                    <li className="text-gray-400 italic">Inga event denna vecka</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
