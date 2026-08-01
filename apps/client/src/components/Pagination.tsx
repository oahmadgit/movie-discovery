import { useSearchParams } from 'react-router-dom';

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const [params, setParams] = useSearchParams();

  function goTo(nextPage: number) {
    const next = new URLSearchParams(params);
    next.set('page', String(nextPage));
    setParams(next);
  }

  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => goTo(page - 1)}>
        Prev
      </button>
      <span>
        Page {page} of {totalPages || 1}
      </span>
      <button disabled={page >= totalPages} onClick={() => goTo(page + 1)}>
        Next
      </button>
    </div>
  );
}
