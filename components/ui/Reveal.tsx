import type { ElementType } from 'react';

type Props = {
  children: React.ReactNode;
  /** Stagger, in milliseconds. */
  delay?: number;
  as?: ElementType;
  className?: string;
  /** Clip-path curtain instead of a translate — for images. */
  media?: boolean;
  style?: React.CSSProperties;
};

/**
 * Declares intent only. The actual observation happens once, globally, in
 * RevealEngine — so this stays a server component and ships no JS.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
  media = false,
  style,
}: Props) {
  const attrs = media ? { 'data-reveal-media': '' } : { 'data-reveal': '' };
  return (
    <Tag
      {...attrs}
      className={className}
      style={delay ? ({ '--reveal-delay': `${delay}ms`, ...style } as React.CSSProperties) : style}
    >
      {children}
    </Tag>
  );
}
