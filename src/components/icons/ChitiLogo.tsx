export function ChitiLogo({ size = 72 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SL Amigos do Chiti">
      <circle cx="32" cy="32" r="30" fill="#c0392b" stroke="#7d1f14" strokeWidth="1.5" />
      <path d="M20 14 q3 -4 6 0 t6 0 t6 0 q1 -1 2 -1 v6 h-20 z" fill="#ffffff" stroke="#a8a8a8" strokeWidth="0.6" />
      <path d="M20 20 h20 l-2 26 q-1 4 -8 4 t-8 -4 z" fill="#f5cf6b" stroke="#7a5010" strokeWidth="1.5" />
      <path d="M22 26 h16 M22 30 h16 M22 34 h16 M22 38 h16" stroke="#c99a2e" strokeWidth="0.6" />
      <ellipse cx="25" cy="42" rx="2.5" ry="4" fill="#a86a0b" opacity="0.6" />
      <path d="M22 30 c-4 0 -6 4 -3 8" fill="none" stroke="#3a2510" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 34 c-6 -2 -8 4 -2 8" fill="none" stroke="#3a2510" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="42" r="5" fill="#ffffff" stroke="#0b0b0b" strokeWidth="1" />
      <polygon points="18,38.5 20.5,41 19.5,44 16.5,44 15.5,41" fill="#0b0b0b" />
      <circle cx="46" cy="56" r="3" fill="#c0392b" stroke="#ffffff" strokeWidth="0.8" />
    </svg>
  );
}
