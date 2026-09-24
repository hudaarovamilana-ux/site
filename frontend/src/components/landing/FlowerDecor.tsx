export function FlowerDecor({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      className={`opacity-40 ${className}`}
      aria-hidden
    >
      <ellipse cx="60" cy="80" rx="28" ry="35" fill="#f5e6e8" />
      <ellipse cx="45" cy="65" rx="18" ry="22" fill="#f9ecef" transform="rotate(-20 45 65)" />
      <ellipse cx="75" cy="68" rx="16" ry="20" fill="#f0ebe4" transform="rotate(15 75 68)" />
      <ellipse cx="55" cy="95" rx="14" ry="18" fill="#e8c4cb" opacity="0.5" transform="rotate(-10 55 95)" />
      <ellipse cx="68" cy="92" rx="12" ry="16" fill="#f5e6e8" opacity="0.7" transform="rotate(8 68 92)" />
      <path
        d="M60 115 Q58 130 56 150"
        stroke="#d4a5ae"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M52 125 Q48 135 44 145"
        stroke="#e8c4cb"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}
