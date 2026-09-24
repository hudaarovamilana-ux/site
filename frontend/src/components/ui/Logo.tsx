import Image from "next/image";

const LOGO_SRC = "/images/logo-woman-moon.png";

interface SoftPinkLogoProps {
  className?: string;
  /** sm — шапка сайта, md — профиль, lg — оценка ИИ */
  size?: "sm" | "md" | "lg";
  priority?: boolean;
}

const sizes = {
  sm: { width: 36, height: 48, wrap: "w-9 h-12" },
  md: { width: 120, height: 160, wrap: "w-[120px] h-[160px]" },
  lg: { width: 180, height: 240, wrap: "w-[180px] h-[240px]" },
};

export function SoftPinkLogo({
  className = "",
  size = "sm",
  priority = false,
}: SoftPinkLogoProps) {
  const { width, height, wrap } = sizes[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 bg-transparent ${wrap} ${className}`}
      aria-hidden
    >
      <Image
        src={LOGO_SRC}
        alt=""
        width={width}
        height={height}
        priority={priority}
        className="w-full h-full object-contain blur-[0.8px]"
        style={{
          filter:
            "sepia(0.5) saturate(0.5) hue-rotate(305deg) brightness(1.15) contrast(0.85)",
        }}
      />
    </div>
  );
}

/** Логотип для шапки и футера */
export function Logo({ className = "" }: { className?: string }) {
  return <SoftPinkLogo size="sm" className={className} />;
}
