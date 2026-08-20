import Link from 'next/link';
import type { ComponentProps } from 'react';

type Props = {
  href: string;
  children: React.ReactNode;
  /** Oversized serif variant, for closing calls to action. */
  size?: 'sm' | 'lg';
  className?: string;
} & Omit<ComponentProps<typeof Link>, 'href' | 'className' | 'children'>;

export default function ArrowLink({ href, children, size = 'sm', className = '', ...rest }: Props) {
  return (
    <Link
      href={href}
      className={`arrow-link ${size === 'lg' ? 'arrow-link-lg' : ''} ${className}`.trim()}
      {...rest}
    >
      <span>{children}</span>
      <span className="arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
