import {useCallback, useEffect, useState} from 'react';

const STORAGE_KEY = 'donate-card-dismissed';
const DONATE_URL = 'https://donate.stripe.com/00w5kD3Gj1Xo9v7gVOcs800';

/**
 * Floating "Buy Me a Coffee" card, fixed to the bottom-right corner.
 *
 * Deliberately a fixed dark panel regardless of the page's light/dark mode:
 * it floats over whatever background the page has, which has nothing to do
 * with the visitor's OS theme preference.
 */
export function DonateCard(): JSX.Element | null {
  // Start hidden and reveal after mount: reading localStorage during render
  // risks a hydration mismatch, and flashing the card then hiding it is
  // worse than showing it a frame late.
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    try {
      setIsVisible(window.localStorage.getItem(STORAGE_KEY) !== '1');
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = useCallback((): void => {
    setIsVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* Non-fatal: the card just won't stay dismissed across reloads. */
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      aria-labelledby="donate-card-title"
      className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-700 bg-slate-900 p-6 pt-5 text-left shadow-2xl shadow-black/40"
    >
      <button
        type="button"
        aria-label="Dismiss support message"
        onClick={handleDismiss}
        className="absolute right-2.5 top-2 rounded px-1.5 py-0.5 text-lg leading-none text-slate-400 opacity-60 transition hover:bg-white/10 hover:opacity-100"
      >
        &times;
      </button>

      <h2
        id="donate-card-title"
        className="mb-2.5 text-sm font-bold tracking-wide text-slate-100"
      >
        <span aria-hidden="true" className="mr-1.5 text-red-500">
          &#9829;
        </span>
        Support this project
      </h2>

      <p className="mb-[1.15rem] text-sm leading-relaxed text-slate-400">
        If this app, code, or repository has helped you or someone you know,
        please consider donating. I appreciate any help to offset the costs
        of development and/or AI Credits.
      </p>

      <div className="mx-auto mb-[1.1rem] hidden w-fit rounded-[10px] bg-white p-3.5 [@media(min-width:30rem)_and_(min-height:34rem)]:flex">
        <img
          src="/donate.svg"
          alt="QR code linking to the Stripe donation page"
          width={176}
          height={176}
          className="block h-44 w-44"
        />
      </div>

      <a
        href={DONATE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Donate via Stripe, opens in a new tab"
        className="block text-center text-[0.95rem] font-semibold text-indigo-400 transition hover:text-indigo-300 hover:underline"
      >
        Donate via Stripe <span aria-hidden="true">&rarr;</span>
      </a>
    </aside>
  );
}
