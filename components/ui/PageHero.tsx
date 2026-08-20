import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import styles from './PageHero.module.css';

type Props = {
  label: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  actions?: React.ReactNode;
  id?: string;
};

/** The quiet opening used by every page that is not the homepage. */
export default function PageHero({ label, title, intro, actions, id = 'page-title' }: Props) {
  return (
    <section className={styles.hero} aria-labelledby={id}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <SectionLabel>{label}</SectionLabel>
            <Reveal delay={80}>
              <h1 id={id} className={styles.title} style={{ marginTop: '1.25rem' }}>
                {title}
              </h1>
            </Reveal>
          </div>

          {(intro || actions) && (
            <div className={styles.aside}>
              {intro && (
                <Reveal delay={160}>
                  <p className={`lead pretty ${styles.intro}`}>{intro}</p>
                </Reveal>
              )}
              {actions && (
                <Reveal delay={240}>
                  <div className={styles.actions} style={{ marginTop: '1.5rem' }}>
                    {actions}
                  </div>
                </Reveal>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
