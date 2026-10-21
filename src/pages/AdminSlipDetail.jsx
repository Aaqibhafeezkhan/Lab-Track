import { useEffect, useMemo, useState } from "preact/hooks";
import { watchSlip, releaseSlip, completeReturn, rejectSlip } from "../lib/slips";
import { watchItems } from "../lib/items";
import { useCurrentUser } from "../lib/currentUser";
import { QtyStepper } from "../components/QtyStepper";
import { StatusBadge } from "../components/StatusBadge";
import { formatDate } from "../lib/format";
import "../styles/Slips.css";

// Keep a typed or tapped quantity between 0 and max.
const clamp = (v, max) => Math.max(0, Math.min(max, Math.floor(Number(v)) || 0));

export function AdminSlipDetail({ params }) {
  const { user, profile } = useCurrentUser();
  const [slip, setSlip] = useState(undefined); // undefined = loading, null = not found
  const [items, setItems] = useState([]);
  const [releaseQty, setReleaseQty] = useState({}); // itemId -> how many to hand over
  const [returnQty, setReturnQty] = useState({});   // itemId -> how many came back
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => watchSlip(params.id, setSlip), [params.id]);
  useEffect(() => watchItems(setItems), []);
  // When the status changes (release -> returned...), unlock the buttons again.
  useEffect(() => { setBusy(false); setError(""); }, [slip?.status]);

  // itemId -> how many are on the shelf right now
  const stock = useMemo(
    () => Object.fromEntries(items.map((i) => [i.id, i.availableQty])),
    [items]
  );

  if (slip === undefined) return <p>Loading...</p>;
  if (slip === null) return <p>Slip not found. <a href="/admin">Back to slips</a></p>;

  const lines = slip.items ?? [];
  const adminName = profile?.name || user?.email || "Admin";

  // Defaults: release as much as was asked for and is in stock; expect everything back.
  const maxRelease = (l) => Math.min(l.qtyRequested, stock[l.itemId] ?? 0);
  const releaseValue = (l) => releaseQty[l.itemId] ?? maxRelease(l);
  const returnValue = (l) => returnQty[l.itemId] ?? l.qtyReleased;

  function handleRelease() {
    const released = lines.map((l) => ({ ...l, qtyReleased: clamp(releaseValue(l), maxRelease(l)) }));
    if (released.every((l) => l.qtyReleased === 0)) {
      setError("Nothing can be released. Reject the slip instead.");
      return;
    }
    setError("");
    setBusy(true);
    // Not awaited on purpose (offline-friendly); the live listener updates the page.
    releaseSlip(slip.id, released, adminName).catch((err) => {
      console.error(err);
      setError("Could not release. Please try again.");
      setBusy(false);
    });
  }

  function handleReturn() {
    const returned = lines.map((l) => ({ ...l, qtyReturned: clamp(returnValue(l), l.qtyReleased) }));
    const isShort = returned.some((l) => l.qtyReturned < l.qtyReleased);
    if (isShort && !notes.trim()) {
      setError("Some items are short. Add a note about what is missing or damaged.");
      return;
    }
    setError("");
    setBusy(true);
    completeReturn(slip.id, returned, notes.trim()).catch((err) => {
      console.error(err);
      setError("Could not save the return. Please try again.");
      setBusy(false);
    });
  }

  function handleReject() {
    if (!window.confirm("Reject this slip?")) return;
    setBusy(true);
    rejectSlip(slip.id, notes.trim()).catch((err) => {
      console.error(err);
      setError("Could not reject. Please try again.");
      setBusy(false);
    });
  }

  const status = slip.status;

  return (
    <div class="slip">
      <p><a href="/admin">← Back to slips</a></p>
      <h2>Group {slip.groupNumber} <StatusBadge status={status} /></h2>

      <p class="slip-meta">
        Code <strong>{slip.code}</strong> · Submitted {formatDate(slip.createdAt)}<br />
        Leader: {slip.leaderName} ({slip.leaderIdNumber})<br />
        Instructor: {slip.instructorName}
        {status !== "submitted" && slip.releasedBy && <><br />Released by {slip.releasedBy}</>}
      </p>
      {slip.members?.length > 0 && (
        <p class="slip-meta">Members: {slip.members.map((m) => m.name).join(", ")}</p>
      )}
      {slip.pendingSync && <p class="notice">Saved on this device. It will sync when there is signal.</p>}

      <h3>Items</h3>
      {lines.map((l) => (
        <div class="slip-line" key={l.itemId}>
          <div>
            <strong>{l.name}</strong>
            {status === "submitted" && (
              <small>Requested {l.qtyRequested} · {stock[l.itemId] ?? "?"} in stock</small>
            )}
            {status === "released" && <small>Released {l.qtyReleased}</small>}
            {status === "returned" && <small>Released {l.qtyReleased} · returned {l.qtyReturned}</small>}
            {status === "rejected" && <small>Requested {l.qtyRequested}</small>}
          </div>

          {status === "submitted" && (
            <QtyStepper
              value={releaseValue(l)}
              max={maxRelease(l)}
              onChange={(v) => setReleaseQty((q) => ({ ...q, [l.itemId]: clamp(v, maxRelease(l)) }))}
            />
          )}
          {status === "released" && (
            <QtyStepper
              value={returnValue(l)}
              max={l.qtyReleased}
              onChange={(v) => setReturnQty((q) => ({ ...q, [l.itemId]: clamp(v, l.qtyReleased) }))}
            />
          )}
        </div>
      ))}

      {(status === "submitted" || status === "released") && (
        <label>
          {status === "submitted" ? "Reason for rejecting (optional)" : "Return notes (required if anything is short)"}
          <textarea rows="2" value={notes} onInput={(e) => setNotes(e.currentTarget.value)} />
        </label>
      )}
      {(status === "returned" || status === "rejected") && slip.returnNotes && (
        <p><strong>Notes:</strong> {slip.returnNotes}</p>
      )}

      {error && <p class="error">{error}</p>}

      {status === "submitted" && (
        <div class="slip-actions">
          <button class="btn" disabled={busy} onClick={handleRelease}>Release items</button>
          <button class="btn btn-danger" disabled={busy} onClick={handleReject}>Reject</button>
        </div>
      )}
      {status === "released" && (
        <div class="slip-actions">
          <button class="btn" disabled={busy} onClick={handleReturn}>Complete return</button>
        </div>
      )}
    </div>
  );
}