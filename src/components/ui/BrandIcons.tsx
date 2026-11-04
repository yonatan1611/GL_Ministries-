import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Minimal brand-mark SVGs lucide-react doesn't ship, shared by the
 *  footer's social row and the sermons page's multi-platform channel bar. */

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c2 .6 9.4.6 9.4.6s7.4 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12 2c2.72 0 3.06.01 4.12.06 1.07.05 1.8.22 2.43.47.65.26 1.2.6 1.73 1.13.53.53.87 1.08 1.13 1.73.25.63.42 1.36.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.07-.22 1.8-.47 2.43-.26.65-.6 1.2-1.13 1.73a4.6 4.6 0 0 1-1.73 1.13c-.63.25-1.36.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.07-.05-1.8-.22-2.43-.47a4.6 4.6 0 0 1-1.73-1.13 4.6 4.6 0 0 1-1.13-1.73c-.25-.63-.42-1.36-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.07.22-1.8.47-2.43.26-.65.6-1.2 1.13-1.73A4.6 4.6 0 0 1 5.39.59C6.02.34 6.75.17 7.82.12 8.88.07 9.22.06 11.94.06ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm5.4-8.63a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z" />
    </svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M16.6 5.82a4.28 4.28 0 0 1-2.63-3.03h-3.1v12.6a2.6 2.6 0 1 1-1.84-2.49V9.76a5.84 5.84 0 1 0 5.09 5.79V9.67a7.5 7.5 0 0 0 4.38 1.4V7.86a4.28 4.28 0 0 1-1.9-2.04Z" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M18.9 2.5h3.1l-6.8 7.77 7.98 11.23h-6.25l-4.9-6.76-5.6 6.76H3.33l7.28-8.3L3 2.5h6.4l4.43 6.2 5.07-6.2Zm-1.1 17.1h1.72L7.3 4.3H5.46l12.34 15.3Z" />
    </svg>
  );
}
