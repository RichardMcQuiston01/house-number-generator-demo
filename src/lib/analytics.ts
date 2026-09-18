/**
 * Loads Google Analytics (gtag.js), reading the measurement ID from the
 * `VITE_GA_MEASUREMENT_ID` build-time env var. No-ops when that var is
 * unset (e.g. a clone with no GA property configured) or outside a
 * production build, so local dev traffic never pollutes real analytics.
 *
 * Portable to any Vite app: copy this file, set `VITE_GA_MEASUREMENT_ID`
 * in the target Vercel project's environment variables, and call
 * `initGoogleAnalytics()` once from the app's entry point.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

let initialized = false;

export function initGoogleAnalytics(): void {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId || !import.meta.env.PROD || initialized) {
    return;
  }
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  const dataLayer = (window.dataLayer ??= []);
  const gtag = (...args: unknown[]): void => {
    dataLayer.push(args);
  };
  gtag('js', new Date());
  gtag('config', measurementId);
}
