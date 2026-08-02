export function PersonPlaceholder() {
  return (
    <svg className="person-placeholder" viewBox="0 0 100 100" role="img" aria-label="No photo available">
      <rect width="100" height="100" fill="#dcdce1" />
      <circle cx="50" cy="38" r="18" fill="#a7a7b3" />
      <path d="M18 92c0-19.9 14.3-36 32-36s32 16.1 32 36" fill="#a7a7b3" />
    </svg>
  );
}
