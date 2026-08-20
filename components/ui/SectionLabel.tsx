type Props = {
  children: React.ReactNode;
  as?: 'p' | 'span' | 'h2';
  className?: string;
  id?: string;
};

/** The small uppercase register mark that opens most sections. */
export default function SectionLabel({ children, as: Tag = 'p', className = '', id }: Props) {
  return (
    <Tag id={id} className={`label ${className}`.trim()} data-reveal="">
      {children}
    </Tag>
  );
}
