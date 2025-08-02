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
  start_date: string; // ISO date string
  end_date: string;   // ISO date string
}

function formatDate(date: Date) {
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

// Returnerar array med 7 datum från startDate (måndag i veckan)
function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

// Returnerar måndagen för veckan baserat på valfritt datum
function getMonday(d: Date) {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // justera så söndag (0) blir måndag i veckan
  const monday = new Date(d);
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0,0,0,0);
  return monday;
}

// Kollar om två datumintervall överlappar
function isOverlapping(start1: Date, end1: Date, start2: Date, end2: Date) {
  return start1 <= end2 && end1 >= start2;
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

  // Beräkna aktiv vecka (måndag) baserat på serverns startdatum
  const getActiveMonday = (startDateStr: string) => {
    const startDate = new Date(startDateStr);
    const now = new Date();
    // Räkna skillnad i veckor mellan start och nu
    const diffWeeks = Math.floor((now.getTime() - startDate.getTime()) / (1000*60*60*24*7));
    const monday = getMonday(startDate);
    monday.setDate(monday.getDate() + diffWeeks * 7);
    return monday;
  };

  // Visa 5 veckor från aktuell aktiv vecka
  const weeksToShow = 5;
  const activeMonday = selectedServer ? getActiveMonday(selectedServer.start_date) : null;

  // Skapa array med startdatum (måndag) för varje vecka
  const weekStartDates = activeMonday ? 
    Array.from({ length: weeksToShow }, (_, i) => {
      const d = new Date(activeMonday);
      d.setDate(d.getDate() + i * 7);
      return d;
    }) : [];

  // För varje vecka och varje dag ska vi visa max 3 events, med överlappshantering
  // Skapar en struktur: {[weekIndex]: {[dateString]: Event[]}}

  // Sortera events efter startdatum för enklare hantering
  const sortedEvents = [...events].sort((a,b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  // Organisera events per datum
  const eventsByDate: Record<string, Event[]> = {};

  sortedEvents.forEach(ev => {
    const start = new Date(ev.start_date);
    const end = new Date(ev.end_date);
    for(let d = new Date(start); d <= end; d.setDate(d.getDate() +1)) {
      const key = d.toISOString().slice(0,10);
      if(!eventsByDate[key]) eventsByDate[key] = [];
      eventsByDate[key].push(ev);
    }
  });

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

      {selectedServer && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Eventkalender för {selectedServer.name}</h3>
          <div className="min-w-[900px]">
            {/* Veckor och dagar som tabell */}
            <div className="grid grid-cols-8 gap-1 border border-gray-300 rounded-lg overflow-hidden">
              {/* Första kolumnen: veckonummer */}
              <div className="bg-accent text-background p-2 font-bold sticky left-0 z-20 text-center border-r border-gray-300">
                Vecka
              </div>
              {/* Datum i toppen */}
              {weekStartDates.length > 0 && getWeekDates(weekStartDates[0]).map((date, idx) => (
                <div key={idx} className="bg-accent text-background p-2 font-bold text-center border-l border-gray-300 sticky top-0 z-10">
                  {formatDate(date)}
                </div>
              ))}

              {/* Rader för varje vecka */}
              {weekStartDates.map((weekStart, weekIdx) => {
                const weekNumber = Math.ceil(
                  (weekStart.getTime() - new Date(weekStart.getFullYear(),0,1).getTime()) / (1000*60*60*24*7)
                ) + 1;

                // Datum i veckan
                const days = getWeekDates(weekStart);

                return (
                  <div key={weekIdx} className="contents">
                    {/* Veckonummer i första kolumnen */}
                    <div className="bg-accent text-background p-2 font-bold text-center border-t border-r border-gray-300 sticky left-0 z-20">
                      {weekNumber}
                    </div>

                    {/* Dagsceller */}
                    {days.map(day => {
                      const key = day.toISOString().slice(0,10);
                      const dayEvents = eventsByDate[key] || [];
                      // Visa max 3 events
                      const maxEventsToShow = 3;
                      const extraCount = dayEvents.length - maxEventsToShow;

                      return (
                        <div key={key} className="border-t border-l border-gray-300 min-h-[80px] p-1 relative">
                          {dayEvents.slice(0, maxEventsToShow).map(ev => (
                            <div 
                              key={ev.id}
                              className="bg-accent text-background rounded px-1 py-0.5 mb-0.5 text-xs truncate cursor-pointer"
                              title={`${ev.name} (${ev.reward})\n${ev.start_date} - ${ev.end_date}`}
                            >
                              {ev.name}
                            </div>
                          ))}
                          {extraCount > 0 && (
                            <div className="text-gray-500 text-xs italic mt-1">
                              +{extraCount} till...
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
