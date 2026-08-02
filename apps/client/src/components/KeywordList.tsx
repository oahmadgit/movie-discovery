import type { Keyword } from '../api/client';

export function KeywordList({ keywords }: { keywords: Keyword[] }) {
  if (!keywords?.length) return <p className="empty-note">No keywords available.</p>;

  return (
    <div className="keyword-pills">
      {keywords.map((k) => (
        <span key={k.keyword_id} className="keyword-pill">
          {k.name}
        </span>
      ))}
    </div>
  );
}
