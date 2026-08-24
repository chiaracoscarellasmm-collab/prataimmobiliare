'use client';

import { useState } from 'react';

/** Copia il link della pagina — nessuna Web Share API: comportamento identico su ogni browser/dispositivo. */
export default function ShareButton({
  url,
  label,
  copiedLabel,
  className,
}: {
  url: string;
  label: string;
  copiedLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard non disponibile (permessi negati, contesto non sicuro): nessuna azione di fallback necessaria.
    }
  };

  return (
    <button type="button" className={className} onClick={handleClick}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v12" />
        <path d="M7 8l5-5 5 5" />
        <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
      </svg>
      {copied ? copiedLabel : label}
    </button>
  );
}
