const NPM_PACKAGE_URL =
  'https://www.npmjs.com/package/@richardmcquiston01/house-number-generator';
const GITHUB_REPO_URL =
  'https://github.com/RichardMcQuiston01/makertool-house-number-generator';

/** Site header with branding and links out to the package's npm and GitHub pages. */
export function Header(): JSX.Element {
  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <a
          href="#top"
          className="text-lg font-bold text-slate-900 dark:text-white"
        >
          House Number Generator
          <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-900 dark:text-brand-200">
            Demo
          </span>
        </a>
        <nav
          aria-label="External links"
          className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          <a
            href={NPM_PACKAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-brand-600 dark:hover:text-brand-400"
          >
            npm package
          </a>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-brand-600 dark:hover:text-brand-400"
          >
            GitHub repo
          </a>
        </nav>
      </div>
    </header>
  );
}
