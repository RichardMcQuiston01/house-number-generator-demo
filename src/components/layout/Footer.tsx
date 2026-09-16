const NPM_PACKAGE_URL =
  'https://www.npmjs.com/package/@richardmcquiston01/house-number-generator';
const GITHUB_REPO_URL =
  'https://github.com/RichardMcQuiston01/makertool-house-number-generator';

/** Page footer: license and links to the package. The donation ask lives in the floating DonateCard instead. */
export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-10 text-sm text-slate-600 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-500">
          Apache 2.0 — © 2026 Richard McQuiston. All rights reserved.
        </p>
        <nav aria-label="Project links" className="flex gap-4">
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
      </div>
    </footer>
  );
}
