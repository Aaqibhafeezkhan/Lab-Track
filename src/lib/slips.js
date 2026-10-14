import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, query, where,
  onSnapshot, writeBatch, increment, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

const slipsRef = collection(db, "slips");

// Short code with no look-alike characters (no 0/O, 1/I).
function makeCode(length = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

const byNewest = (a, b) => (b.createdAt?.seconds ?? Infinity) - (a.createdAt?.seconds ?? Infinity);

// Student: submit a new slip. `data` holds the form fields (groupNumber, leaderName, members, items, signatures...).
export function createSlip(data) {
  return addDoc(slipsRef, {
    ...data,
    code: makeCode(),
    status: "submitted",
    createdBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
  });
}

// Student: my slips, live. (Sorted in JS so we don't need a Firestore index.)
export function watchMySlips(uid, callback) {
  const q = query(slipsRef, where("createdBy", "==", uid));
  return onSnapshot(q, (snap) => {
    const slips = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(slips.sort(byNewest));
  });
}

export function watchSlip(id, callback) {
  return onSnapshot(doc(db, "slips", id), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

// Admin: slips with a given status ("submitted", "released", ...), live.
export function watchSlipsByStatus(status, callback) {
  const q = query(slipsRef, where("status", "==", status));
  return onSnapshot(q, (snap) => {
    const slips = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(slips.sort(byNewest));
  });
}

// Admin: find a slip from the backup code (or the scanned QR text).
export async function findSlipByCode(code) {
  const q = query(slipsRef, where("code", "==", code.trim().toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

// Admin: hand over items. `items` = the slip's items with qtyReleased filled in.
// A batch with increment() updates stock safely, even offline.
export function releaseSlip(slipId, items, releasedBy) {
  const batch = writeBatch(db);
  batch.update(doc(db, "slips", slipId), {
    status: "released",
    items,
    releasedBy,
    releasedAt: serverTimestamp(),
  });
  for (const it of items) {
    if (it.qtyReleased > 0) {
      batch.update(doc(db, "items", it.itemId), { availableQty: increment(-it.qtyReleased) });
    }
  }
  return batch.commit();
}

// Admin: receive items back. `items` has qtyReturned filled in (short returns are fine).
export function completeReturn(slipId, items, returnNotes = "") {
  const batch = writeBatch(db);
  batch.update(doc(db, "slips", slipId), {
    status: "returned",
    items,
    returnNotes,
    returnedAt: serverTimestamp(),
  });
  for (const it of items) {
    if (it.qtyReturned > 0) {
      batch.update(doc(db, "items", it.itemId), { availableQty: increment(it.qtyReturned) });
    }
  }
  return batch.commit();
}

export function rejectSlip(slipId, reason = "") {
  return updateDoc(doc(db, "slips", slipId), {
    status: "rejected",
    returnNotes: reason,
  });
}