import "../styles/Slips.css";

const labels = {
  submitted: "Pending",
  released: "Out",
  returned: "Returned",
  rejected: "Rejected",
};

export function StatusBadge({ status }) {
  return <span class={`slip-badge slip-badge-${status}`}>{labels[status] ?? status}</span>;
}