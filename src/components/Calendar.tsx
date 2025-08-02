import { useEffect, useState } from "react";
import { format, addDays } from "date-fns";
import { sv } from "date-fns/locale";
import supabase from "../lib/supabase"; // Update path if needed

interface Server {
  id: string;
  name: string;
  start_date: string;
}

interface Event {
  id: string;
  name: string;
  week_number: number;
  day_offset: number;
  duration_days: number;
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

  const getCurrentWeek = (startDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
    return diff + 1;
  };

  const getEventDates = (startDate: string, week: number, dayOffset: number, duration: number) => {
    const base = new Date(startDate);
    const eventStart = addDays(base, (week - 1) * 7 + dayOffset);
    const eventEnd = addDays(eventStart, duration - 1);
    return {
      start: eventStart,
      end: eventEnd,
    };
  };

  const filteredEvents = selectedServer ? events.filter(ev => ev.week_number === getCurrentWeek(selectedServer.start_date)) : [];

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
          <h3 className="text-lg mb-4">Event för vecka {getCurrentWeek(selectedServer.start_date)}</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => {
              const { start, end } = getEventDates(selectedServer.start_date, event.week_number, event.day_offset, event.duration_days);
              return (
                <li key={event.id} className="p-4 bg-background rounded shadow border border-accent">
                  <h4 className="font-bold text-base mb-1">{event.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(start, "EEEE d MMMM", { locale: sv })} → {format(end, "EEEE d MMMM", { locale: sv })}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
