import type { Keyword } from '../api/client';

export function KeywordList({ keywords }: { keywords: Keyword[] }) {
  if (!keywords?.length) return <p>No keywords available.</p>;

  return (
    <div className="keyword-tags">
      {keywords.map((k) => (
        <span key={k.keyword_id} className="keyword-tag">
          {k.name}
        </span>
      ))}
    </div>
  );
}
