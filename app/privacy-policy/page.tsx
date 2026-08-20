import type { Metadata } from 'next';

import PageHero from '@/components/ui/PageHero';
import { getI18n } from '@/lib/i18n';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Informativa sul trattamento dei dati personali di Prata Immobiliare.',
  alternates: { canonical: '/privacy-policy' },
  robots: { index: true, follow: true },
};

export default async function PrivacyPolicyPage() {
  const { t } = await getI18n();

  return (
    <div className={styles.page}>
      <PageHero
        label="Legal"
        title="Privacy Policy"
        intro="Informativa ai sensi del Regolamento (UE) 2016/679 (GDPR)."
      />

      <div className="container section-sm">
        <p className={styles.notice}>{t.legal.notice}</p>
        <p className={styles.notice}>
          <strong>[BOZZA — DA COMPLETARE]</strong> Questo testo è una struttura di partenza e non
          costituisce un’informativa privacy valida. Deve essere completato con i dati reali del
          titolare del trattamento e verificato da un consulente legale prima della pubblicazione.
        </p>

        <div className={styles.prose}>
          <h2>Titolare del trattamento</h2>
          <p>
            [RAGIONE SOCIALE] — [INDIRIZZO], [CAP] [COMUNE] ([PROVINCIA]) — P.IVA [PARTITA IVA].
            Email: [EMAIL]. Telefono: [TELEFONO].
          </p>

          <h2>Dati raccolti</h2>
          <p>
            Attraverso questo sito raccogliamo esclusivamente i dati che ci fornisci
            volontariamente compilando il questionario di valutazione o contattandoci:
          </p>
          <ul>
            <li>dati identificativi e di contatto (nome, telefono, email);</li>
            <li>informazioni sull’immobile (tipologia, località, superficie, stato);</li>
            <li>eventuali fotografie che scegli di allegare;</li>
            <li>eventuali note libere che decidi di inserire.</li>
          </ul>

          <h2>Finalità e base giuridica</h2>
          <p>
            I dati sono trattati per rispondere alla tua richiesta, formulare una prima
            valutazione dell’immobile e gestire il rapporto che ne deriva. La base giuridica è
            l’esecuzione di misure precontrattuali adottate su tua richiesta e, ove applicabile,
            il consenso da te espresso.
          </p>

          <h2>Conservazione</h2>
          <p>[PERIODO DI CONSERVAZIONE DA DEFINIRE].</p>

          <h2>Comunicazione dei dati</h2>
          <p>
            [ELENCO DEI DESTINATARI DA DEFINIRE — es. fornitori di servizi di hosting, posta
            elettronica, CRM.] I dati non sono diffusi né ceduti a terzi per finalità di
            marketing.
          </p>

          <h2>I tuoi diritti</h2>
          <p>
            Puoi in ogni momento chiedere l’accesso, la rettifica, la cancellazione o la
            limitazione del trattamento dei tuoi dati, opporti al trattamento e richiedere la
            portabilità, scrivendo a [EMAIL]. Hai inoltre il diritto di proporre reclamo al
            Garante per la protezione dei dati personali.
          </p>

          <h2>Aggiornamenti</h2>
          <p>Ultimo aggiornamento: [DATA].</p>
        </div>
      </div>
    </div>
  );
}
