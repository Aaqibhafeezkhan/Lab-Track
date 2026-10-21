import { useEffect, useMemo, useState } from "preact/hooks";
import { watchSlipsByStatus } from "../lib/slips";
import { SlipCard } from "../components/SlipCard";
import "../styles/Slips.css";

export function AdminOut() {
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return watchSlipsByStatus("released", (list) => {
      setSlips(list);
      setLoading(false);
    });
  }, []);

  // Oldest first, so the longest-overdue group is at the top.
  const sorted = useMemo(
    () => [...slips].sort((a, b) => (a.releasedAt?.seconds ?? Infinity) - (b.releasedAt?.seconds ?? Infinity)),
    [slips]
  );

  // Total still out, per item, across every slip.
  const totals = useMemo(() => {
    const map = {};
    for (const s of slips) {
      for (const l of s.items ?? []) {
        const out = (l.qtyReleased || 0) - (l.qtyReturned || 0);
        if (out > 0) map[l.name] = (map[l.name] || 0) + out;
      }
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [slips]);

  return (
    <div>
      <h2>Out now</h2>
      {loading && <p>Loading...</p>}
      {!loading && slips.length === 0 && <p>Nothing is out right now.</p>}

      {totals.length > 0 && (
        <div class="totals">
          <strong>Total out by item</strong>
          <ul>
            {totals.map(([name, qty]) => <li key={name}>{qty} × {name}</li>)}
          </ul>
        </div>
      )}

      <div class="slip-list">
        {sorted.map((s) => (
          <SlipCard key={s.id} slip={s} href={`/admin/slips/${s.id}`} />
        ))}
      </div>
    </div>
  );
}