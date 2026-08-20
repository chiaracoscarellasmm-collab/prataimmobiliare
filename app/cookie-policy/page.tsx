import type { Metadata } from 'next';

import PageHero from '@/components/ui/PageHero';
import { getI18n } from '@/lib/i18n';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Informativa sull’uso dei cookie e delle tecnologie simili su questo sito.',
  alternates: { canonical: '/cookie-policy' },
  robots: { index: true, follow: true },
};

export default async function CookiePolicyPage() {
  const { t } = await getI18n();

  return (
    <div className={styles.page}>
      <PageHero
        label="Legal"
        title="Cookie Policy"
        intro="Come questo sito utilizza i cookie e le tecnologie simili."
      />

      <div className="container section-sm">
        <p className={styles.notice}>{t.legal.notice}</p>
        <p className={styles.notice}>
          <strong>[BOZZA — DA COMPLETARE]</strong> Da aggiornare in base agli strumenti che
          verranno effettivamente attivati (analytics, mappe, video, pixel pubblicitari). Se
          verranno introdotti cookie non tecnici sarà necessario aggiungere un banner di consenso
          conforme.
        </p>

        <div className={styles.prose}>
          <h2>Cosa sono i cookie</h2>
          <p>
            I cookie sono piccoli file di testo che i siti salvano sul dispositivo di chi li
            visita, per farli funzionare correttamente o per raccogliere informazioni sull’uso.
          </p>

          <h2>Cookie utilizzati da questo sito</h2>
          <p>
            Allo stato attuale il sito non installa cookie di profilazione né strumenti di
            analisi di terze parti. Vengono utilizzati unicamente i cookie tecnici necessari al
            funzionamento delle pagine.
          </p>

          <h2>Cookie di terze parti</h2>
          <p>
            [DA DEFINIRE] Se in futuro verranno integrati servizi esterni (statistiche, mappe,
            contenuti incorporati), l’elenco e le relative finalità saranno riportati qui, con la
            possibilità di gestire il consenso.
          </p>

          <h2>Come gestire i cookie</h2>
          <p>
            Puoi modificare in ogni momento le impostazioni relative ai cookie dal tuo browser,
            bloccandoli o cancellando quelli già memorizzati. Disattivare i cookie tecnici può
            compromettere il corretto funzionamento del sito.
          </p>

          <h2>Aggiornamenti</h2>
          <p>Ultimo aggiornamento: [DATA].</p>
        </div>
      </div>
    </div>
  );
}
