import { useEffect, useState } from "react";
import supabase from '../lib/supabase';

interface Server {
  id: string;
  name: string;
  start_date: string;
}

interface Event {
  id: string;
  name: string;
  reward: string;
  start_date: string;
  end_date: string;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

function getMonday(d: Date) {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Justerar så måndag blir start
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() + diff);
  return monday;
}

function getWeekDates(weekStart: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export default function Calendar() {
  const [servers, setServers] = useState<Server[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: serversData } = await supabase.from("servers").select("*");
      const { data: eventsData } = await supabase.from("events").select("*");
      setServers(serversData || []);
      setEvents(eventsData || []);
    }
    fetchData();
  }, []);

  const activeMonday = selectedServer ? getMonday(new Date(selectedServer.start_date)) : null;
  const days = activeMonday ? getWeekDates(activeMonday) : [];

  // Filtrera events som överlappar med vald vecka
  const weekEvents = activeMonday ? events.filter(ev => {
    const evStart = new Date(ev.start_date);
    const evEnd = new Date(ev.end_date);
    const weekStart = activeMonday;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return evStart <= weekEnd && evEnd >= weekStart;
  }) : [];

  // Max 3 rader, placera events utan överlappning i samma rad
  const maxRows = 3;
  type EventRow = Event[];
  const eventRows: EventRow[] = [];

  function eventOverlaps(a: Event, b: Event) {
    const aStart = new Date(a.start_date).getTime();
    const aEnd = new Date(a.end_date).getTime();
    const bStart = new Date(b.start_date).getTime();
    const bEnd = new Date(b.end_date).getTime();
    return !(aEnd < bStart || aStart > bEnd);
  }

  weekEvents.forEach(ev => {
    let placed = false;
    for (let row of eventRows) {
      if (!row.some(rEv => eventOverlaps(rEv, ev))) {
        row.push(ev);
        placed = true;
        break;
      }
    }
    if (!placed && eventRows.length < maxRows) {
      eventRows.push([ev]);
    }
  });

  // Hjälpfunktion för dagindex i veckan
  function getDayIndex(dateStr: string) {
    const date = new Date(dateStr);
    return days.findIndex(d => d.toDateString() === date.toDateString());
  }

  // Beräkna veckonummer (från årsskiftet)
  function getWeekNumber(date: Date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
  }

  return (
    <div className="bg-card p-4 rounded-lg mt-6 max-w-full overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4">Välj server</h2>
      <select
        className="bg-background text-text p-3 rounded border border-accent mb-6 max-w-sm w-full"
        onChange={(e) => {
          const server = servers.find(s => s.id === e.target.value);
          setSelectedServer(server || null);
        }}
      >
        <option value="">-- Välj server --</option>
        {servers.map(server => (
          <option key={server.id} value={server.id}>{server.name}</option>
        ))}
      </select>

      {selectedServer && activeMonday && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Vecka {getWeekNumber(activeMonday)} från {formatDate(activeMonday)}</h3>
          <div className="min-w-[700px] border border-gray-300 rounded-lg relative">
            {/* Kalenderdagar */}
            <div className="grid grid-cols-8 border-b border-gray-300">
              <div className="p-2 font-bold bg-accent text-background sticky left-0 z-10 border-r border-gray-300">Vecka</div>
              {days.map((day, idx) => (
                <div
                  key={idx}
                  className="p-2 font-bold text-center border-l border-gray-300 sticky top-0 bg-accent text-background"
                >
                  {formatDate(day)}
                </div>
              ))}
            </div>

            {/* Veckonummer rad */}
            <div className="grid grid-cols-8 border-b border-gray-300">
              <div className="p-2 font-bold bg-accent text-background sticky left-0 z-10 border-r border-gray-300">
                {getWeekNumber(activeMonday)}
              </div>
              <div className="col-span-7" />
            </div>

            {/* Event-rader */}
            {eventRows.map((row, rowIndex) => (
              <div key={rowIndex} className="relative h-10 border-b border-gray-300 grid grid-cols-7">
                {days.map((day, dayIndex) => (
                  <div key={dayIndex} className="border-r border-gray-300" />
                ))}
                {/* Event block */}
                {row.map(ev => {
                  const startIdx = Math.max(0, getDayIndex(ev.start_date));
                  const endIdx = Math.min(6, getDayIndex(ev.end_date));
                  const span = endIdx - startIdx + 1;

                  return (
                    <div
                      key={ev.id}
                      className="absolute bg-accent text-background rounded px-2 py-1 text-xs cursor-pointer truncate"
                      title={`${ev.name} (${ev.reward})\n${ev.start_date} - ${ev.end_date}`}
                      style={{
                        left: `${(startIdx / 7) * 100}%`,
                        width: `${(span / 7) * 100}%`,
                        top: 0,
                        height: '100%',
                      }}
                    >
                      {ev.name}
                    </div>
                  );
                })}
              </div>
            ))}
            {eventRows.length === 0 && (
              <p className="p-4 text-center text-gray-500">Inga events denna vecka.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
