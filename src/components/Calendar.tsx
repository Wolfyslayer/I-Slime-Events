import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

interface Server {
  id: string;
  name: string;
  start_date: string; // ISO-format
}

interface Event {
  id: string;
  name: string;
  reward: string;
  start_date: string; // ISO-format
  end_date: string;   // ISO-format
}

export default function Calendar() {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: serversData } = await supabase.from("servers").select("*");
      const { data: eventsData } = await supabase.from("events").select("*");
      setServers(serversData || []);
      setEvents(eventsData || []);
    };
    fetchData();
  }, []);

  const getCurrentWeekStart = (serverStartDate: string): Date => {
    const now = new Date();
    const start = new Date(serverStartDate);
    const diffWeeks = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const currentWeekStart = new Date(start);
    currentWeekStart.setDate(start.getDate() + diffWeeks * 7);
    return currentWeekStart;
  };

  const getWeekDates = (startDate: Date): Date[] => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const formatDate = (date: Date): string =>
    date.toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" });

  const isDateInRange = (date: Date, start: string, end: string): boolean => {
    const d = date.toISOString().split("T")[0];
    return d >= start && d <= end;
  };

  const currentWeekStart = selectedServer ? getCurrentWeekStart(selectedServer.start_date) : null;
  const weekDates = currentWeekStart ? getWeekDates(currentWeekStart) : [];

  const eventsThisWeek = selectedServer
    ? events.filter((ev) =>
        weekDates.some((d) => isDateInRange(d, ev.start_date, ev.end_date))
      )
    : [];

  return (
    <div className="bg-card p-4 rounded-lg mt-6">
      <h2 className="text-xl mb-4">Välj server</h2>
      <select
        className="bg-background text-text p-2 rounded border border-accent mb-6"
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

      {selectedServer && currentWeekStart && (
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Vecka från {currentWeekStart.toLocaleDateString("sv-SE")}
          </h3>
          <div className="grid grid-cols-7 gap-2 text-sm">
            {weekDates.map((day, idx) => (
              <div
                key={idx}
                className="bg-background border border-accent p-2 rounded min-h-[100px]"
              >
                <div className="font-semibold">{formatDate(day)}</div>
                {eventsThisWeek
                  .filter((ev) => isDateInRange(day, ev.start_date, ev.end_date))
                  .map((ev) => (
                    <div key={ev.id} className="mt-1 text-xs bg-accent text-white px-1 rounded">
                      {ev.name}{" "}
                      <span className="text-gray-200">({ev.reward})</span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
