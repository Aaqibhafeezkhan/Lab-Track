// Firestore timestamps have .toDate(). A just-written slip has no server time yet.
export function formatDate(ts) {
  if (!ts) return "just now";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}