'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { contact, nav, socials } from '@/data/site';
import { useI18n } from '@/components/i18n/LanguageProvider';
import LanguageSwitch from './LanguageSwitch';
import styles from './Header.module.css';

export default function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [overHero, setOverHero] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  /* Pages declare a photographic hero via #hero-sentinel; while that sentinel
     is on screen the header stays transparent. Pages without one start solid. */
  useEffect(() => {
    const sentinel = document.getElementById('hero-sentinel');
    if (!sentinel) {
      setOverHero(false);
      return;
    }
    setOverHero(true);
    const io = new IntersectionObserver(
      ([entry]) => setOverHero(entry.isIntersecting),
      { rootMargin: '-40px 0px 0px 0px', threshold: 0 }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [pathname]);

  /* Auto-hide on downward scroll. rAF-throttled, passive listener. */
  useEffect(() => {
    lastY.current = window.scrollY;

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > window.innerHeight * 0.9);
        lastY.current = y;
      }
      ticking.current = false;
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Sticky sub-bars (the property filters) follow the header up and down. */
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sticky-top',
      hidden && !open ? '0px' : 'var(--header-h)'
    );
  }, [hidden, open]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => close(), [pathname, close]);

  /* Lock the page behind the full-screen menu, and let Esc dismiss it. */
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  const isCurrent = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <>
      <header
        className={[
          styles.header,
          overHero && !open ? styles.over : styles.solid,
          hidden && !open ? styles.hidden : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className={styles.inner}>
          <Link href="/" className={styles.wordmark} aria-label="Prata Immobiliare — home">
            {/* Two tones of the same artwork: the cream mark rides the
                photograph, the dark one takes over on the solid bar. */}
            <Image
              className={styles.markLight}
              src="/brand/wordmark-light.png"
              alt="Prata Immobiliare"
              width={1200}
              height={225}
              priority
            />
            <Image
              className={styles.markDark}
              src="/brand/wordmark-dark.png"
              alt=""
              aria-hidden="true"
              width={1200}
              height={225}
              priority
            />
          </Link>

          <nav className={styles.nav} aria-label={t.nav.primary}>
            <div className={styles.navCluster}>
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${
                    'emphasis' in item && item.emphasis ? styles.emphasis : ''
                  }`.trim()}
                  aria-current={isCurrent(item.href) ? 'page' : undefined}
                >
                  {t.nav[item.key]}
                </Link>
              ))}
            </div>
          </nav>

          <div className={styles.actions}>
            <LanguageSwitch />
            <button
              type="button"
              className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`${styles.menu} ${open ? styles.menuOpen : ''}`}
        aria-hidden={!open}
        inert={!open}
      >
        <nav aria-label={t.nav.mobile}>
          <ul className={styles.menuList}>
            {[{ href: '/', key: 'home' as const }, ...nav].map((item, i) => (
              <li key={item.href} className={styles.menuItem}>
                <Link
                  href={item.href}
                  className={styles.menuLink}
                  onClick={close}
                  aria-current={isCurrent(item.href) ? 'page' : undefined}
                >
                  <span>{t.nav[item.key]}</span>
                  <span className={styles.menuIndex} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.menuFoot}>
          <LanguageSwitch />
          <p className="label">{t.nav.contact}</p>
          <p className="meta">{contact.phone.label}</p>
          <p className="meta">{contact.email.label}</p>
          <p className="meta" style={{ marginTop: '1rem' }}>
            {socials.map((s, i) => (
              <span key={s.label}>
                {i > 0 ? ' · ' : null}
                <a href={s.href} rel="noopener noreferrer" target="_blank">
                  {s.label}
                </a>
              </span>
            ))}
          </p>
        </div>
      </div>
    </>
  );
}
