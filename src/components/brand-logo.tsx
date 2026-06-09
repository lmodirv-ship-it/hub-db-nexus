import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/hn-db-logo.jpeg.asset.json";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  subtitle?: string;
  className?: string;
  linkTo?: string;
}

export function BrandLogo({
  size = 40,
  showText = true,
  subtitle,
  className,
  linkTo = "/",
}: BrandLogoProps) {
  return (
    <Link to={linkTo} className={cn("flex items-center gap-3 group", className)} aria-label="HN-DB">
      <div
        className="relative rounded-xl overflow-hidden ring-1 ring-primary/30 shadow-[0_0_24px_-6px_var(--primary)] transition group-hover:shadow-[0_0_32px_-4px_var(--primary)]"
        style={{ width: size, height: size }}
      >
        <img src={logoAsset.url} alt="HN-DB" width={size} height={size} className="w-full h-full object-cover" />
      </div>
      {showText && (
        <div className="leading-tight">
          <div className="text-base font-bold tracking-tight">HN-DB</div>
          {subtitle && <div className="text-[11px] text-muted-foreground">{subtitle}</div>}
        </div>
      )}
    </Link>
  );
}
