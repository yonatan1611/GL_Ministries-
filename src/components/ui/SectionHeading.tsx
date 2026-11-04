import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  /** Light (default) renders charcoal text for white/ivory sections;
   *  dark renders white/blue text for charcoal stage sections. */
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Centered classical-serif section headline with the Gospel Light
 * ornamental royal-blue divider (a thin blue rule on each side of a
 * small diamond), reused by every homepage section instead of each one
 * re-implementing the same markup.
 */
export function SectionHeading({ title, subtitle, tone = "light", className }: SectionHeadingProps) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <h2
        className={cn(
          "font-display text-3xl font-bold tracking-wide sm:text-4xl",
          tone === "dark" ? "text-white" : "text-navy-900"
        )}
      >
        {title}
      </h2>
      <div className="section-divider" aria-hidden="true">
        <span className="section-divider-diamond">◆</span>
      </div>
      {subtitle && (
        <p className={cn("text-sm sm:text-base", tone === "dark" ? "text-navy-100" : "text-slate-600")}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
