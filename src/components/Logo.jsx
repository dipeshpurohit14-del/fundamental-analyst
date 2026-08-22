export default function Logo({ size = 22 }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 32 32" className="shrink-0">
        <rect width="32" height="32" rx="6" fill="#141B24" />
        <line x1="10" y1="6" x2="10" y2="12" stroke="#31C48D" strokeWidth="1.6" />
        <rect x="7.5" y="12" width="5" height="10" rx="1" fill="#31C48D" />
        <line x1="10" y1="22" x2="10" y2="26" stroke="#31C48D" strokeWidth="1.6" />
        <line x1="22" y1="4" x2="22" y2="10" stroke="#E8952A" strokeWidth="1.6" />
        <rect x="19.5" y="10" width="5" height="14" rx="1" fill="#E8952A" />
        <line x1="22" y1="24" x2="22" y2="28" stroke="#E8952A" strokeWidth="1.6" />
      </svg>
      <span className="font-display font-semibold text-lg tracking-tight text-paper">
        Fundamental<span className="text-amber-500"> Analyst</span>
      </span>
    </div>
  );
}
