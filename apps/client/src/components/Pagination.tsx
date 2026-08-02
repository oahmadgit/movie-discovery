import { useSearchParams } from 'react-router-dom';

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];
const PAGE_WINDOW = 10;

export function Pagination({ page, totalPages, limit }: { page: number; totalPages: number; limit: number }) {
  const [params, setParams] = useSearchParams();

  function goTo(nextPage: number) {
    const next = new URLSearchParams(params);
    next.set('page', String(nextPage));
    setParams(next);
  }

  function changePageSize(size: string) {
    const next = new URLSearchParams(params);
    next.set('limit', size);
    next.set('page', '1');
    setParams(next);
  }

  const windowStart = Math.floor((page - 1) / PAGE_WINDOW) * PAGE_WINDOW + 1;
  const windowEnd = Math.min(windowStart + PAGE_WINDOW - 1, totalPages || 1);
  const pageNumbers = [];
  for (let p = windowStart; p <= windowEnd; p++) pageNumbers.push(p);

  return (
    <div className="pagination">
      <div className="pagination-pages">
        <button className="pagination-btn" disabled={page <= 1} onClick={() => goTo(windowStart - PAGE_WINDOW)}>
          &laquo; Prev
        </button>

        {windowStart > 1 && <span className="pagination-ellipsis">…</span>}

        {pageNumbers.map((p) => (
          <button
            key={p}
            className={`pagination-btn${p === page ? ' active' : ''}`}
            onClick={() => goTo(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}

        {windowEnd < totalPages && <span className="pagination-ellipsis">…</span>}

        <button
          className="pagination-btn"
          disabled={page >= totalPages}
          onClick={() => goTo(windowStart + PAGE_WINDOW)}
        >
          Next &raquo;
        </button>
      </div>

      <label className="page-size-select">
        Per page
        <select value={limit} onChange={(e) => changePageSize(e.target.value)}>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
