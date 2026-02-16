export interface CalendarEvent {
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  location?: string;
}

export function createGoogleCalendarUrl(event: CalendarEvent): string {
  const startDate = new Date(event.startTime)
    .toISOString()
    .replace(/-|:|\.\d+/g, "");
  const endDate = new Date(event.endTime)
    .toISOString()
    .replace(/-|:|\.\d+/g, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.summary,
    dates: `${startDate}/${endDate}`,
    details: event.description,
    location: event.location || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function createOutlookCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.summary,
    body: event.description,
    startdt: event.startTime,
    enddt: event.endTime,
    location: event.location || "",
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function createICalData(event: CalendarEvent): string {
  const startDate = new Date(event.startTime)
    .toISOString()
    .replace(/-|:|\.\d+/g, "");
  const endDate = new Date(event.endTime)
    .toISOString()
    .replace(/-|:|\.\d+/g, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${event.summary}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
