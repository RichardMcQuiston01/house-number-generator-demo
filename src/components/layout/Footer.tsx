const NPM_PACKAGE_URL =
  'https://www.npmjs.com/package/@richardmcquiston01/house-number-generator';
const GITHUB_REPO_URL =
  'https://github.com/RichardMcQuiston01/makertool-house-number-generator';
const DONATE_URL = 'https://donate.stripe.com/00w5kD3Gj1Xo9v7gVOcs800';

/** Page footer: license, links to the package, and a Buy Me a Coffee donation block. */
export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:flex-row sm:justify-between">
        <div className="max-w-md">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Buy Me a Coffee
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            If this app or the underlying package has helped you, please
            consider donating to help offset development and AI costs.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <a
              href={DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
            >
              <img
                src="/donate.svg"
                alt="Donate via Stripe QR code"
                width={96}
                height={96}
                className="h-24 w-24"
              />
            </a>
            <a
              href={DONATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              Donate via Stripe
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-400 sm:items-end sm:text-right">
          <nav
            aria-label="Project links"
            className="flex gap-4 sm:flex-col sm:gap-1.5"
          >
            <a
              href={NPM_PACKAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors hover:text-brand-600 dark:hover:text-brand-400"
            >
              npm package
            </a>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors hover:text-brand-600 dark:hover:text-brand-400"
            >
              GitHub repo
            </a>
          </nav>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Apache 2.0 — © 2026 Richard McQuiston. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
