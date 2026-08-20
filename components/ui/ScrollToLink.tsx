'use client';

type Props = {
  targetId: string;
  children: React.ReactNode;
};

/**
 * Smooth in-page jump that still works as a real anchor: with JS disabled the
 * browser falls back to a plain fragment navigation.
 */
export default function ScrollToLink({ targetId, children }: Props) {
  return (
    <a
      href={`#${targetId}`}
      className="arrow-link"
      onClick={(e) => {
        const target = document.getElementById(targetId);
        if (!target) return;
        e.preventDefault();
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', `#${targetId}`);
      }}
    >
      <span>{children}</span>
      <span className="arrow" aria-hidden="true">
        →
      </span>
    </a>
  );
}
