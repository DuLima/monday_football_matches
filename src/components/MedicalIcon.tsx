export function MedicalIcon({ size = 14, title = 'Lesionado' }: { size?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role="img" aria-label={title}>
      <title>{title}</title>
      <circle cx="12" cy="12" r="10.5" fill="#fecaca" stroke="#e11d48" strokeWidth="1.5" />
      <path d="M12 7v10M7 12h10" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
