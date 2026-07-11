const LABELS = {
  PLACED: "Placed",
  PREPARING: "Preparing",
  COMPLETED: "Completed",
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{LABELS[status] || status}</span>;
}
