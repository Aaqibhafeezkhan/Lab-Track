import { StatusBadge } from "./StatusBadge";
import { formatDate } from "../lib/format";
import "../styles/Slips.css";

export function SlipCard({ slip, href }) {
  const released = slip.status === "released";

  // "5 × Beaker, 2 × Pipette". For slips that are out, show what was actually released.
  const summary = (slip.items ?? [])
    .map((i) => ({ name: i.name, qty: released ? i.qtyReleased : i.qtyRequested }))
    .filter((i) => i.qty > 0)
    .map((i) => `${i.qty} × ${i.name}`)
    .join(", ");

  return (
    <a class="slip-card" href={href}>
      <div class="slip-card-top">
        <strong>Group {slip.groupNumber} · {slip.leaderName}</strong>
        <StatusBadge status={slip.status} />
      </div>
      <div class="slip-card-items">{summary || "No items"}</div>
      <small>
        Code {slip.code} · {released ? "Released" : "Submitted"}{" "}
        {formatDate(released ? slip.releasedAt : slip.createdAt)}
      </small>
    </a>
  );
}