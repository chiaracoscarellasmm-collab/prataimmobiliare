import Image from 'next/image';

import ArrowLink from '@/components/ui/ArrowLink';
import Reveal from '@/components/ui/Reveal';
import SectionLabel from '@/components/ui/SectionLabel';
import styles from './AboutSection.module.css';

/**
 * PLACEHOLDER — le località vanno confermate dall'agenzia prima della messa
 * online. La struttura è pronta per un elenco più lungo.
 */
const places = ['[COMUNE]', '[COMUNE]', '[COMUNE]', '[COMUNE]', '[COMUNE]', '[COMUNE]'];

export default function AboutSection() {
  return (
    <section className={styles.section} aria-labelledby="about-title">
      <div className="container">
        <Reveal media className={styles.figure}>
          {/* Sostituire con fotografia definitiva: /images/home/territorio.jpg */}
          <Image
            src="/images/home/territorio.jpg"
            alt="Paesaggio del territorio in cui operiamo — immagine placeholder"
            width={2400}
            height={1350}
            sizes="100vw"
          />
        </Reveal>

        <div className={styles.grid}>
          <div>
            <SectionLabel>L’Agenzia</SectionLabel>
            <Reveal delay={80}>
              <h2 id="about-title" className={styles.title} style={{ marginTop: '1.25rem' }}>
                Una casa è personale.
                <br />
                Il nostro lavoro lo è altrettanto.
              </h2>
            </Reveal>
          </div>

          <div className={styles.aside}>
            <Reveal delay={160}>
              <p className={`lead pretty ${styles.body}`}>
                Crediamo in un modo di fare immobiliare basato sulla relazione, sulla
                conoscenza del territorio e sulla cura con cui ogni proprietà viene presentata.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <ArrowLink href="/chi-siamo">Conosci Prata Immobiliare</ArrowLink>
            </Reveal>
          </div>
        </div>

        <div className={styles.secondary}>
          <Reveal>
            <h3 className={styles.secondaryTitle}>
              Conosciamo questi luoghi
              <br />
              perché li viviamo.
            </h3>
          </Reveal>
          <Reveal delay={100}>
            <div>
              <p className="label" style={{ marginBottom: '1rem' }}>
                Dove operiamo
              </p>
              <ul className={styles.places}>
                {places.map((place, i) => (
                  <li key={`${place}-${i}`}>{place}</li>
                ))}
              </ul>
              <p className="meta" style={{ marginTop: '1.25rem' }}>
                [PLACEHOLDER] Elenco dei comuni da confermare.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
