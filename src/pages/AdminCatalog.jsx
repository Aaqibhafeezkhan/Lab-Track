import { useEffect, useState } from "preact/hooks";
import { watchItems, addItem, editItem, setItemActive } from "../lib/items";

// A quantity must be a whole number, 0 or higher.
const isValidQty = (v) => v !== "" && Number.isInteger(Number(v)) && Number(v) >= 0;

export function AdminCatalog() {
  const [items, setItems] = useState([]);        // the live list from Firestore
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");    // the "add item" form
  const [newQty, setNewQty] = useState("");

  const [editingId, setEditingId] = useState(null); // which row is in edit mode
  const [draft, setDraft] = useState({ name: "", totalQty: "" });

  // Listen to the catalog while this page is open. It updates by itself.
  useEffect(() => {
    return watchItems((list) => {
      setItems(list);
      setLoading(false);
    });
  }, []);

  function handleAdd(e) {
    e.preventDefault(); // stop the browser from reloading the page
    setError("");
    if (!newName.trim() || !isValidQty(newQty)) {
      setError("Enter a name and a whole-number quantity.");
      return;
    }
    // No `await` on purpose: offline, the promise only finishes once the server
    // confirms, but the list already shows the new item from the local copy.
    addItem({ name: newName.trim(), totalQty: Number(newQty) }).catch((err) => {
      console.error(err);
      setError("Could not add the item.");
    });
    setNewName("");
    setNewQty("");
  }

  function startEdit(item) {
    setEditingId(item.id);
    setDraft({ name: item.name, totalQty: String(item.totalQty) });
    setError("");
  }

  function saveEdit(item) {
    const total = Number(draft.totalQty);
    const out = item.totalQty - item.availableQty; // how many are borrowed right now
    if (!draft.name.trim() || !isValidQty(draft.totalQty)) {
      setError("Enter a name and a whole-number quantity.");
      return;
    }
    if (total < out) {
      setError(`${out} are currently borrowed, so the total can't be lower than that.`);
      return;
    }
    editItem(item, { name: draft.name.trim(), totalQty: total }).catch((err) => {
      console.error(err);
      setError("Could not save changes.");
    });
    setEditingId(null);
  }

  function toggleActive(item) {
    setItemActive(item.id, !item.active).catch((err) => {
      console.error(err);
      setError("Could not update the item.");
    });
  }

  return (
    <div class="catalog">
      <h2>Inventory</h2>

      <form class="catalog-add" onSubmit={handleAdd}>
        <input
          placeholder="Item name"
          value={newName}
          onInput={(e) => setNewName(e.currentTarget.value)}
        />
        <input
          type="number"
          min="0"
          inputMode="numeric"
          placeholder="Qty"
          value={newQty}
          onInput={(e) => setNewQty(e.currentTarget.value)}
        />
        <button class="btn" type="submit">Add</button>
      </form>

      {error && <p class="error">{error}</p>}
      {loading && <p>Loading...</p>}
      {!loading && items.length === 0 && <p>No items yet. Add your first one above.</p>}

      <ul class="catalog-list">
        {items.map((item) => (
          <li class={`catalog-item ${item.active ? "" : "inactive"}`} key={item.id}>
            {editingId === item.id ? (
              <>
                <input
                  value={draft.name}
                  onInput={(e) => setDraft({ ...draft, name: e.currentTarget.value })}
                />
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={draft.totalQty}
                  onInput={(e) => setDraft({ ...draft, totalQty: e.currentTarget.value })}
                />
                <button class="btn" onClick={() => saveEdit(item)}>Save</button>
                <button class="btn-link" onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <div>
                  <strong>{item.name}</strong>
                  <div>{item.availableQty} available / {item.totalQty} total</div>
                  {!item.active && <small>Inactive</small>}
                </div>
                <button class="btn-link" onClick={() => startEdit(item)}>Edit</button>
                <button class="btn-link" onClick={() => toggleActive(item)}>
                  {item.active ? "Deactivate" : "Activate"}
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}