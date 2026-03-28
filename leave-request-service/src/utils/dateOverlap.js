/**
 * Inclusive date ranges [start, end]. Two ranges overlap iff they share at least one calendar day.
 */
function rangesOverlap(startA, endA, startB, endB) {
  const a = new Date(startA).setHours(0, 0, 0, 0);
  const b = new Date(endA).setHours(0, 0, 0, 0);
  const c = new Date(startB).setHours(0, 0, 0, 0);
  const d = new Date(endB).setHours(0, 0, 0, 0);
  return a <= d && c <= b;
}

/** Inclusive calendar days from start through end (same day = 1). */
function inclusiveCalendarDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  if (end < start) return 0;
  const msPerDay = 86400000;
  return Math.round((end - start) / msPerDay) + 1;
}

module.exports = { rangesOverlap, inclusiveCalendarDays };
