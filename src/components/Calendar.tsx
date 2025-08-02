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
  day: number; // 1 = Monday, 7 = Sunday (assumed, you may need to add this in your data)
}

const DAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

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

  // Calculate active week for the selected server
  const getWeekNumber = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
    return (diff % 5) + 1; // 1–5 looping weeks
  };

  const activeWeek = selectedServer ? getWeekNumber(selectedServer.start_date) : null;
  const upcomingWeeks = Array.from({ length: 5 }, (_, i) => ((activeWeek || 1) + i - 1) % 5 + 1);

  return (
    <div className="bg-card p-4 rounded-lg mt-6 max-w-full overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4">Välj server</h2>
      <select
        className="bg-background text-text p-3 rounded border border-accent mb-6 max-w-sm w-full"
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
          <h3 className="text-xl font-semibold mb-4">Eventkalender för {selectedServer.name}</h3>

          {/* Days header */}
          <div className="grid grid-cols-7 text-center font-semibold border-b border-gray-400 mb-2 sticky top-0 bg-card z-10">
            {DAYS.map((day) => (
              <div key={day} className="p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Weeks rows */}
          <div className="overflow-x-auto">
            <div className="flex space-x-4 min-w-[700px]">
              {upcomingWeeks.map((week) => (
                <div key={week} className="flex flex-col border border-gray-300 rounded-lg p-2 min-w-[140px]">
                  <div className="font-bold text-center mb-2 bg-accent text-background rounded py-1">
                    Vecka {week}
                  </div>
                  {/* Days cells */}
                  {DAYS.map((_, dayIndex) => {
                    const dayNumber = dayIndex + 1; // 1-based day number
                    const eventsThisDay = events.filter(
                      (ev) => ev.week_number === week && ev.day === dayNumber
                    );
                    return (
                      <div key={dayNumber} className="border-b border-gray-200 min-h-[60px] p-1">
                        {eventsThisDay.length > 0 ? (
                          eventsThisDay.map((ev) => (
                            <div
                              key={ev.id}
                              className="bg-accent text-background rounded px-2 py-1 mb-1 text-sm cursor-pointer hover:brightness-90"
                              title={ev.reward}
                            >
                              {ev.name}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400 italic text-xs text-center">-</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
