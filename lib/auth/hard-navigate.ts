/**
 * Full page navigation into (dashboard) routes. Soft Next.js Link / router
 * transitions from marketing or verify-email can render a blank page until
 * reload due to an RSC layout boundary issue.
 */
export function hardNavigate(path: string): void {
  window.location.assign(path);
}
