import { useState } from 'react';
import { posterUrl } from '../utils/posterUrl';
import { PosterPlaceholder } from './placeholders/PosterPlaceholder';

export function Poster({ posterPath, title }: { posterPath: string | null | undefined; title: string }) {
  const [failed, setFailed] = useState(false);
  const url = posterUrl(posterPath);

  if (!url || failed) return <PosterPlaceholder />;

  return <img src={url} alt={`${title} poster`} loading="lazy" onError={() => setFailed(true)} />;
}
