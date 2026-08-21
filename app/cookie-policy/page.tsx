import type { Metadata } from 'next';

import PageHero from '@/components/ui/PageHero';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Informativa sull’uso dei cookie e delle tecnologie simili su questo sito.',
  alternates: { canonical: '/cookie-policy' },
  robots: { index: true, follow: true },
};

export default function CookiePolicyPage() {
  return (
    <div className={styles.page}>
      <PageHero
        label="Legal"
        title="Cookie Policy"
        intro="Come questo sito utilizza i cookie e le tecnologie simili."
      />

      <div className="container section-sm">
        <div className={styles.prose}>
          <p>
            Questo sito utilizza esclusivamente cookie tecnici necessari al funzionamento del
            servizio e non utilizza strumenti di tracciamento, profilazione o pubblicità.
          </p>
          <p>
            Per questo motivo non viene mostrato alcun banner per l’acquisizione del consenso: i
            cookie tecnici strettamente necessari non richiedono il consenso preventivo
            dell’utente, ma devono essere adeguatamente descritti nell’informativa.
          </p>

          <h2>1. Cosa sono i cookie</h2>
          <p>
            I cookie sono piccoli file di testo che un sito può salvare sul dispositivo
            dell’utente durante la navigazione.
          </p>
          <p>Possono essere utilizzati, ad esempio, per:</p>
          <ul>
            <li>consentire il corretto funzionamento del sito;</li>
            <li>ricordare una preferenza scelta dall’utente;</li>
            <li>effettuare analisi statistiche;</li>
            <li>tracciare il comportamento dell’utente per finalità pubblicitarie.</li>
          </ul>
          <p>Prata Immobiliare utilizza esclusivamente cookie appartenenti alla prima categoria.</p>

          <h2>2. Cookie utilizzati dal sito</h2>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Finalità</th>
                  <th>Durata</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>NEXT_LOCALE</td>
                  <td>Tecnico, di prima parte</td>
                  <td>
                    Memorizza la lingua scelta dall’utente, italiano o inglese, per riproporla
                    nelle visite successive
                  </td>
                  <td>12 mesi</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Il cookie è utilizzato esclusivamente per ricordare una preferenza espressamente
            scelta dall’utente.
          </p>
          <p>Non utilizziamo:</p>
          <ul>
            <li>cookie analitici;</li>
            <li>cookie di profilazione;</li>
            <li>cookie pubblicitari;</li>
            <li>Google Analytics;</li>
            <li>Google Tag Manager per attività di tracciamento;</li>
            <li>Meta Pixel;</li>
            <li>strumenti di remarketing;</li>
            <li>social media tracking;</li>
            <li>fingerprinting;</li>
            <li>altri strumenti di monitoraggio del comportamento degli utenti.</li>
          </ul>

          <h2>3. Perché non viene mostrato un cookie banner</h2>
          <p>
            Ai sensi dell’art. 122 del Codice Privacy e delle Linee guida del Garante per la
            protezione dei dati personali sui cookie e gli altri strumenti di tracciamento, i
            cookie strettamente tecnici possono essere utilizzati senza acquisire preventivamente
            il consenso dell’utente.
          </p>
          <p>È sufficiente fornire un’adeguata informativa sul loro utilizzo.</p>
          <p>
            Poiché questo sito non utilizza cookie di profilazione, analytics non tecnici o altri
            strumenti di tracciamento per cui sarebbe richiesto il consenso, non è necessario
            mostrare i pulsanti “Accetta”, “Rifiuta” o “Personalizza”.
          </p>

          <h2>4. Risorse e servizi esterni</h2>
          <p>
            Alcune risorse tecniche del sito possono essere distribuite tramite fornitori esterni
            che, per poter rispondere alla richiesta del browser, ricevono necessariamente
            informazioni tecniche quali l’indirizzo IP.
          </p>
          <p>In particolare:</p>
          <h3>Cloudflare R2</h3>
          <p>viene utilizzato per l’archiviazione e la distribuzione di immagini e altri contenuti multimediali.</p>
          <h3>Vercel</h3>
          <p>viene utilizzato per l’hosting e la distribuzione delle pagine del sito.</p>
          <p>
            Questi servizi non vengono utilizzati da Prata Immobiliare per profilare gli utenti o
            per attività pubblicitarie.
          </p>

          <h2>5. Link verso servizi esterni</h2>
          <p>Il sito contiene semplici collegamenti verso:</p>
          <ul>
            <li>WhatsApp;</li>
            <li>Google;</li>
            <li>Instagram;</li>
            <li>Facebook.</li>
          </ul>
          <p>Questi servizi non sono incorporati nelle pagine tramite strumenti di tracciamento.</p>
          <p>
            La semplice visualizzazione del sito di Prata Immobiliare non comporta quindi
            l’installazione dei cookie di tali piattaforme tramite questi link.
          </p>
          <p>
            Quando scegli di cliccare su uno dei collegamenti vieni trasferito al relativo
            servizio esterno; da quel momento valgono le condizioni e le cookie/privacy policy del
            fornitore interessato.
          </p>

          <h2>6. Come gestire i cookie</h2>
          <p>Puoi eliminare o bloccare i cookie in qualsiasi momento attraverso le impostazioni del tuo browser.</p>
          <p>
            Disabilitando il cookie tecnico relativo alla lingua, il sito continuerà a essere
            utilizzabile, ma potrebbe non ricordare la lingua scelta nelle visite successive.
          </p>
          <p>Puoi trovare maggiori informazioni nelle guide dei principali browser:</p>
          <ul>
            <li>Google Chrome — gestione e cancellazione dei cookie</li>
            <li>Mozilla Firefox — protezione antitracciamento e gestione dei cookie</li>
            <li>Safari — gestione dei cookie e dei dati dei siti web</li>
            <li>Microsoft Edge — eliminazione e gestione dei cookie</li>
          </ul>

          <h2>7. Titolare e contatti</h2>
          <dl className={styles.infoList}>
            <div className={styles.infoRow}>
              <dt>Titolare</dt>
              <dd>PRATA IMMOBILIARE DI MICHELA BIANCHIN &amp; C. S.N.C.</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Sede</dt>
              <dd>
                Via Cesare Battisti 30/B, 33080 Prata di Pordenone (PN), Italia
              </dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Partita IVA e Codice Fiscale</dt>
              <dd>01619230939</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Email</dt>
              <dd>info@prataimmobiliare.it</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>PEC</dt>
              <dd>prataimmobiliare@legalmail.it</dd>
            </div>
          </dl>
          <p>
            Per maggiori informazioni sul trattamento dei dati personali consulta la{' '}
            <a href="/privacy-policy">Privacy Policy</a> del sito.
          </p>

          <p className={styles.updated}>Ultimo aggiornamento: agosto 2026</p>
        </div>
      </div>
    </div>
  );
}
