export function GriloLogo({ size = 72 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Túnel do Grilo FC">
      <circle cx="32" cy="32" r="30" fill="#1f4e78" stroke="#0d2b46" strokeWidth="1.5" />
      <path d="M18 44 q0 -18 14 -18 t14 18 z" fill="#0d2b46" stroke="#0b1e33" strokeWidth="1" />
      <path d="M22 44 q0 -14 10 -14 t10 14 z" fill="#050d18" />
      <circle cx="32" cy="44" r="6" fill="#ffffff" stroke="#0b0b0b" strokeWidth="1" />
      <polygon points="32,40 35,42.5 33.5,46 30.5,46 29,42.5" fill="#0b0b0b" />
      <path d="M22 50 h20 M20 54 h24" stroke="#a8b8c8" strokeWidth="1.2" />
      <line x1="14" y1="42" x2="22" y2="42" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="12" y1="46" x2="20" y2="46" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}
