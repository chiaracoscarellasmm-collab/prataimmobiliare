import type { Metadata } from 'next';

import PageHero from '@/components/ui/PageHero';
import styles from '../legal.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Informativa sul trattamento dei dati personali di Prata Immobiliare.',
  alternates: { canonical: '/privacy-policy' },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <PageHero
        label="Legal"
        title="Privacy Policy"
        intro="Informativa ai sensi del Regolamento (UE) 2016/679 (GDPR)."
      />

      <div className="container section-sm">
        <div className={styles.prose}>
          <p>
            Questa informativa descrive come trattiamo i dati personali nell’ambito della
            navigazione e dell’utilizzo del sito web di Prata Immobiliare.
          </p>
          <p>
            Riguarda esclusivamente i trattamenti connessi al sito web. Eventuali dati raccolti
            successivamente nell’ambito dell’attività dell’agenzia immobiliare, della stipula di
            contratti, di incarichi, locazioni o compravendite sono gestiti separatamente secondo
            le relative informative.
          </p>

          <h2>1. Titolare del trattamento</h2>
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
              <dt>Partita IVA</dt>
              <dd>01619230939</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>Codice Fiscale</dt>
              <dd>01619230939</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>VAT Europeo</dt>
              <dd>IT01619230939</dd>
            </div>
            <div className={styles.infoRow}>
              <dt>REA</dt>
              <dd>90998</dd>
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
            Non è stato nominato un Responsabile della Protezione dei Dati (DPO), non ricorrendo
            i presupposti previsti dall’art. 37 del GDPR.
          </p>

          <h2>2. Quali dati trattiamo e perché</h2>
          <p>
            Il sito non utilizza sistemi di profilazione, strumenti di analisi statistica, pixel
            pubblicitari o sistemi di tracciamento di terze parti.
          </p>
          <p>
            I dati personali vengono trattati soltanto quando necessari al funzionamento tecnico
            del sito oppure quando sei tu a decidere volontariamente di contattarci.
          </p>

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Dati</th>
                  <th>Finalità</th>
                  <th>Base giuridica</th>
                  <th>Conservazione</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Indirizzo IP, data e ora della richiesta, tipo di browser e altri log tecnici
                  </td>
                  <td>
                    Erogazione del sito, sicurezza dell’infrastruttura e diagnosi di eventuali
                    malfunzionamenti
                  </td>
                  <td>
                    Legittimo interesse alla sicurezza e al corretto funzionamento del sito (art.
                    6.1.f GDPR)
                  </td>
                  <td>
                    Per il periodo strettamente necessario alle finalità tecniche e di sicurezza,
                    secondo le politiche dei fornitori infrastrutturali
                  </td>
                </tr>
                <tr>
                  <td>
                    Nome, cognome, numero di telefono e contenuto dei messaggi inviati tramite
                    WhatsApp, telefono o email
                  </td>
                  <td>
                    Rispondere a richieste di informazioni, disponibilità immobili, valutazioni o
                    altri servizi dell’agenzia
                  </td>
                  <td>
                    Esecuzione di misure precontrattuali su richiesta dell’interessato (art.
                    6.1.b GDPR)
                  </td>
                  <td>
                    Per il tempo necessario a gestire la richiesta e gli eventuali rapporti
                    successivi
                  </td>
                </tr>
                <tr>
                  <td>
                    Informazioni sull’immobile inserite nel questionario “Valuta il tuo
                    immobile”
                  </td>
                  <td>
                    Predisporre la richiesta che l’utente può decidere di inviare a Prata
                    Immobiliare tramite WhatsApp
                  </td>
                  <td>
                    Il sito non trasmette autonomamente questi dati; il successivo trattamento
                    avviene quando l’utente decide di inviare il messaggio
                  </td>
                  <td>Nessuna conservazione nel sito</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>3. Questionario “Valuta il tuo immobile”</h2>
          <p>
            Il sito mette a disposizione un questionario per facilitare la richiesta di una
            valutazione immobiliare.
          </p>
          <p>Il questionario può chiedere informazioni quali:</p>
          <ul>
            <li>indirizzo dell’immobile;</li>
            <li>tipologia;</li>
            <li>piano e contesto;</li>
            <li>superficie;</li>
            <li>anno di costruzione;</li>
            <li>numero dei locali;</li>
            <li>pertinenze e giardino;</li>
            <li>stato conservativo;</li>
            <li>classe energetica;</li>
            <li>tipologia di riscaldamento;</li>
            <li>situazione dell’immobile;</li>
            <li>eventuali spese condominiali;</li>
            <li>obiettivo della richiesta, ad esempio vendita o affitto;</li>
            <li>nome, cognome e numero di telefono.</li>
          </ul>
          <p>
            Questi dati non vengono salvati in un database del sito e non vengono automaticamente
            inviati a Prata Immobiliare.
          </p>
          <p>
            Le risposte vengono elaborate localmente nel browser esclusivamente per predisporre un
            messaggio WhatsApp riepilogativo.
          </p>
          <p>
            Al termine del questionario sei tu a scegliere se aprire WhatsApp e inviare
            effettivamente il messaggio.
          </p>
          <p>
            Se abbandoni il questionario senza inviare il messaggio, Prata Immobiliare non riceve
            le informazioni inserite.
          </p>

          <h2>4. WhatsApp</h2>
          <p>
            Nel sito sono presenti collegamenti a WhatsApp che permettono di avviare direttamente
            una conversazione con Prata Immobiliare o con un referente dell’agenzia.
          </p>
          <p>
            Il link può contenere un testo precompilato per facilitare la richiesta, ma il
            messaggio viene inviato soltanto dopo una tua azione volontaria all’interno di
            WhatsApp.
          </p>
          <p>
            WhatsApp è un servizio fornito da WhatsApp Ireland Limited / Meta e tratta i dati
            secondo la propria informativa privacy.
          </p>
          <p>
            Una volta inviato il messaggio, Prata Immobiliare tratta il numero di telefono, il
            contenuto della comunicazione e gli eventuali dati forniti esclusivamente per
            rispondere alla richiesta e gestire il rapporto con l’interessato.
          </p>

          <h2>5. Collegamenti esterni</h2>
          <p>Nel sito sono presenti semplici collegamenti verso servizi esterni, tra cui:</p>
          <ul>
            <li>WhatsApp;</li>
            <li>Google;</li>
            <li>Instagram;</li>
            <li>Facebook.</li>
          </ul>
          <p>
            Non incorporiamo all’interno delle pagine widget social, feed, mappe interattive o
            altri componenti di tali piattaforme che effettuino automaticamente attività di
            tracciamento.
          </p>
          <p>
            Nessun dato viene quindi trasmesso a questi servizi per il solo fatto di visitare il
            nostro sito.
          </p>
          <p>
            Il collegamento con il servizio esterno avviene quando scegli volontariamente di
            cliccare sul relativo link.
          </p>
          <p>
            Da quel momento il trattamento dei dati è regolato dall’informativa privacy del
            servizio esterno utilizzato.
          </p>

          <h2>6. Infrastruttura tecnica</h2>
          <p>Il sito utilizza fornitori tecnici necessari alla propria pubblicazione e distribuzione.</p>
          <p>In particolare possono essere utilizzati:</p>
          <h3>Vercel</h3>
          <p>per hosting, distribuzione e funzionamento tecnico del sito.</p>
          <h3>Cloudflare R2</h3>
          <p>per l’archiviazione e la distribuzione di immagini e altri contenuti multimediali.</p>
          <p>
            Durante la normale erogazione dei servizi, tali fornitori possono ricevere dati
            tecnici necessari alla comunicazione via Internet, come l’indirizzo IP e informazioni
            relative alla richiesta.
          </p>
          <p>
            Tali informazioni non vengono utilizzate da Prata Immobiliare per finalità
            pubblicitarie o di profilazione.
          </p>

          <h2>7. A chi comunichiamo i dati</h2>
          <p>
            Prata Immobiliare non vende, cede o diffonde dati personali per finalità
            pubblicitarie o commerciali.
          </p>
          <p>I dati possono essere accessibili esclusivamente:</p>
          <ul>
            <li>al personale autorizzato di Prata Immobiliare;</li>
            <li>ai fornitori tecnici necessari al funzionamento e alla sicurezza del sito;</li>
            <li>
              ai professionisti e consulenti dell’agenzia quando necessario alla gestione della
              richiesta o del successivo rapporto;
            </li>
            <li>alle autorità pubbliche quando previsto dalla legge.</li>
          </ul>

          <h2>8. Trasferimenti fuori dall’Unione Europea</h2>
          <p>
            Alcuni fornitori tecnologici possono avere società o infrastrutture situate al di
            fuori dello Spazio Economico Europeo.
          </p>
          <p>
            Quando applicabile, eventuali trasferimenti internazionali di dati avvengono nel
            rispetto degli artt. 44 e seguenti del GDPR, sulla base di strumenti quali decisioni
            di adeguatezza, EU-U.S. Data Privacy Framework o Clausole Contrattuali Standard
            approvate dalla Commissione Europea.
          </p>

          <h2>9. Natura del conferimento</h2>
          <p>La semplice navigazione del sito non richiede il conferimento volontario di dati personali.</p>
          <p>L’invio di informazioni tramite WhatsApp, telefono o email è facoltativo.</p>
          <p>
            Tuttavia, senza i dati necessari alla richiesta, Prata Immobiliare potrebbe non
            essere in grado di fornire le informazioni o il servizio richiesto.
          </p>

          <h2>10. I tuoi diritti</h2>
          <p>
            In qualsiasi momento puoi esercitare, quando applicabili, i diritti previsti dagli
            artt. 15-22 del GDPR:
          </p>
          <ul>
            <li>
              <strong>Accesso</strong>: sapere quali dati personali trattiamo e ottenerne copia;
            </li>
            <li>
              <strong>Rettifica</strong>: correggere dati inesatti o incompleti;
            </li>
            <li>
              <strong>Cancellazione</strong>: richiedere la cancellazione dei dati nei casi
              previsti dalla legge;
            </li>
            <li>
              <strong>Limitazione</strong>: richiedere la limitazione del trattamento;
            </li>
            <li>
              <strong>Portabilità</strong>: ricevere i dati in formato strutturato e leggibile da
              dispositivo automatico, quando applicabile;
            </li>
            <li>
              <strong>Opposizione</strong>: opporti ai trattamenti fondati sul legittimo
              interesse.
            </li>
          </ul>
          <p>Per esercitare i tuoi diritti puoi scrivere a:</p>
          <p>info@prataimmobiliare.it</p>
          <p>oppure:</p>
          <p>prataimmobiliare@legalmail.it</p>
          <p>
            Se ritieni che il trattamento dei tuoi dati violi la normativa, puoi proporre reclamo
            al Garante per la protezione dei dati personali oppure ricorrere all’autorità
            giudiziaria.
          </p>

          <h2>11. Assenza di profilazione e marketing automatico</h2>
          <p>
            Non effettuiamo attività di profilazione né processi decisionali automatizzati che
            producano effetti giuridici o analogamente significativi sull’utente.
          </p>
          <p>
            Non utilizziamo i dati raccolti attraverso le richieste di contatto per attività
            automatiche di advertising o remarketing.
          </p>
          <p>Il sito non utilizza:</p>
          <ul>
            <li>Google Analytics;</li>
            <li>Meta Pixel;</li>
            <li>cookie pubblicitari;</li>
            <li>strumenti di retargeting;</li>
            <li>strumenti di social media tracking;</li>
            <li>sistemi di profilazione.</li>
          </ul>

          <h2>12. Ambito dell’informativa</h2>
          <p>
            Questa informativa riguarda esclusivamente il sito web e i trattamenti direttamente
            connessi al suo utilizzo.
          </p>
          <p>
            Eventuali dati raccolti successivamente nell’ambito dell’attività professionale
            dell’agenzia immobiliare, ad esempio per:
          </p>
          <ul>
            <li>incarichi di vendita;</li>
            <li>locazioni;</li>
            <li>compravendite;</li>
            <li>contratti;</li>
            <li>identificazione delle parti;</li>
            <li>adempimenti fiscali, amministrativi o antiriciclaggio;</li>
          </ul>
          <p>
            sono regolati dalle specifiche informative fornite agli interessati nell’ambito del
            rapporto con l’agenzia.
          </p>

          <h2>13. Sicurezza e modifiche</h2>
          <p>
            Adottiamo misure tecniche e organizzative adeguate a proteggere i dati da accessi non
            autorizzati, perdita, alterazione o divulgazione.
          </p>
          <p>Il sito utilizza connessioni protette tramite HTTPS.</p>
          <p>
            Ci riserviamo di aggiornare questa informativa in seguito a modifiche normative,
            tecniche o dei servizi utilizzati.
          </p>
          <p>La versione vigente è sempre pubblicata su questa pagina.</p>

          <p className={styles.updated}>Ultimo aggiornamento: agosto 2026</p>
        </div>
      </div>
    </div>
  );
}
