export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="pagination">
      <span>
        Page <span className="font-mono" style={{ color: "var(--ink)" }}>{meta.page}</span> of{" "}
        <span className="font-mono" style={{ color: "var(--ink)" }}>{meta.totalPages}</span> · {meta.total} total
      </span>
      <div className="row gap-2">
        <button
          className="btn btn-outline btn-sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </button>
        <button
          className="btn btn-outline btn-sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
