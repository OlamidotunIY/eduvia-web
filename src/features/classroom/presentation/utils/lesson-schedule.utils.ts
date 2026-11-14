export function formatLessonScheduleDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatLessonScheduleTimeRange(
  iso: string,
  durationMins: number,
): string {
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return "";
  const end = new Date(start.getTime() + durationMins * 60 * 1000);
  const fmt = (d: Date) =>
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${fmt(start)} – ${fmt(end)}`;
}
