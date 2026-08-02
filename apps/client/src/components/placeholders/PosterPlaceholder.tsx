export function PosterPlaceholder() {
  return (
    <svg className="poster-placeholder" viewBox="0 0 300 445" role="img" aria-label="No poster available">
      <rect width="300" height="445" fill="#dcdce1" />
      <g fill="#a7a7b3">
        <path d="M150 150c-27.6 0-50 22.4-50 50s22.4 50 50 50 50-22.4 50-50-22.4-50-50-50zm0 84c-18.8 0-34-15.2-34-34s15.2-34 34-34 34 15.2 34 34-15.2 34-34 34z" />
        <path d="M120 200a30 30 0 1 0 60 0 30 30 0 0 0-60 0z" opacity=".5" />
        <path d="M70 320h160v14H70zM90 344h120v10H90zM105 362h90v8h-90z" opacity=".7" />
      </g>
    </svg>
  );
}
