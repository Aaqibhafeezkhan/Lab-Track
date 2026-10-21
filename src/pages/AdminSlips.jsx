import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { watchSlipsByStatus, findSlipByCode } from "../lib/slips";
import { SlipCard } from "../components/SlipCard";
import "../styles/Slips.css";

export function AdminSlips() {
  const { route } = useLocation();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [looking, setLooking] = useState(false);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live queue of slips waiting to be released.
  useEffect(() => {
    return watchSlipsByStatus("submitted", (list) => {
      setPending(list);
      setLoading(false);
    });
  }, []);

  // A QR scanner types the code and presses Enter, which submits this form.
  async function handleLookup(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setError("");
    setLooking(true);
    try {
      const slip = await findSlipByCode(code);
      if (slip) route(`/admin/slips/${slip.id}`);
      else setError(`No slip found with code "${code.trim().toUpperCase()}".`);
    } catch (err) {
      console.error(err);
      setError("Could not search right now. Check the connection and try again.");
    } finally {
      setLooking(false);
    }
  }

  return (
    <div>
      <h2>Slips</h2>

      <form class="lookup" onSubmit={handleLookup}>
        <input
          autoFocus
          placeholder="Scan or type slip code"
          value={code}
          onInput={(e) => setCode(e.currentTarget.value)}
        />
        <button class="btn" type="submit" disabled={looking}>Find</button>
      </form>
      {error && <p class="error">{error}</p>}

      <h3>Waiting for release ({pending.length})</h3>
      {loading && <p>Loading...</p>}
      {!loading && pending.length === 0 && <p>No pending slips.</p>}
      <div class="slip-list">
        {pending.map((s) => (
          <SlipCard key={s.id} slip={s} href={`/admin/slips/${s.id}`} />
        ))}
      </div>
    </div>
  );
}