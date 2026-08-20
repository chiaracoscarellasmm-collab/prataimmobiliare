# Gestione immobili

Il catalogo del sito vive in tre posti, in quest'ordine:

```
Google Sheet (foglio "Immobili")  →  npm run sync:properties  →  data/generated/properties.json  →  sito
```

Il sito **non legge mai** il foglio Google o Cloudflare R2 direttamente: legge
solo `data/generated/properties.json`, che viene rigenerato dal comando di
sync. Finché non lanci il sync, il sito continua a mostrare l'ultima versione
valida — un errore nel foglio non mette mai online dati rotti.

## Setup una tantum

1. Copia `.env.example` in `.env.local` e compila le variabili R2 e Google
   Sheet (vedi commenti nel file). `.env.local` non va mai committato.
2. Il foglio Google deve avere una tab chiamata esattamente **Immobili**, con
   le colonne del template v3 (vedi intestazioni in `data/immobili.csv`, che
   funge anche da dataset di fallback/esempio).
3. Le fotografie vivono su Cloudflare R2, sotto:
   ```
   immobili/<slug-dell-immobile>/01.webp
   immobili/<slug-dell-immobile>/02.webp
   ...
   ```
   La prima foto in ordine (`01`) diventa la copertina. Niente URL foto nel
   foglio: bastano nome della cartella (= slug) e i file dentro.

## Uso quotidiano

### Aggiungere un immobile
1. Aggiungi una riga al foglio Immobili.
2. Compila **ID** (univoco, mai riutilizzato) e **Slug** (minuscolo,
   solo lettere/numeri/trattini — es. `villa-prata-giardino`).
3. Compila i dati. Qualsiasi campo opzionale può restare `0` o vuoto: il sito
   semplicemente non lo mostra, non stampa mai "0 camere" o trattini.
4. Carica le foto su R2 in `immobili/<slug>/`.
5. Imposta **Visibile = SI**.
6. Lancia il sync (vedi sotto).

### Nascondere un immobile
Imposta **Visibile = NO** e lancia il sync. La pagina, la card e la sitemap
spariscono; le foto su R2 restano intatte.

### Segnare come venduto o affittato
Imposta **Stato = Venduto** (o `Affittato`). Se vuoi tenerlo visibile con il
badge "Venduto"/"Affittato" (spesso utile per mostrare il lavoro fatto),
lascia **Visibile = SI**. Se vuoi toglierlo del tutto, metti anche
**Visibile = NO**.

### Ripristinare un immobile
Rimetti **Stato = Disponibile** e **Visibile = SI**, poi lancia il sync.
Slug, dati e foto su R2 restano gli stessi: non si crea un nuovo immobile.

## Comandi

```bash
# Sincronizza per davvero: legge il foglio, valida, scarica le foto da R2,
# scrive data/generated/properties.json (solo se tutto è valido).
npm run sync:properties

# Come sopra ma non scrive nulla: solo lettura, validazione e controllo
# R2 — utile prima di pubblicare per vedere il report.
npm run sync:properties -- --dry-run
```

Il report a schermo dice quante righe sono state lette, quante visibili,
quante foto trovate su R2, e elenca eventuali `WARNINGS` (non bloccanti) o
`ERRORS` (bloccanti — in quel caso il dataset pubblicato non viene toccato).

Errori tipici da correggere nel foglio:
- ID o Slug duplicati tra due righe.
- Slug con maiuscole, spazi o caratteri non ammessi.
- Un immobile Visibile=SI senza Titolo/Comune/Tipologia/Contratto/Stato.
- Un immobile in Vendita senza Prezzo e senza Prezzo su richiesta (o in
  Affitto senza Canone mensile e senza Prezzo su richiesta).
- Un immobile Visibile=SI senza nessuna foto in `immobili/<slug>/` su R2.

## Anteprima locale senza R2

Se vuoi vedere il sito con dati realistici prima di avere il bucket R2
pronto, `node scripts/dev-seed-fixture.mjs` genera lo stesso
`data/generated/properties.json` usando il CSV di fallback ma con fotografie
segnaposto. **Non è mai lo stesso comando del sync reale** — il prossimo
`npm run sync:properties` (con R2 configurato) lo sovrascrive con i dati
veri.

## Cosa NON fa più il sistema

Rispetto a versioni precedenti del foglio: niente Locali, Stato immobile,
Orientamento, accesso mobilità ridotta, riscaldamento a pavimento,
videocitofono, termostati, predisposizione allarme, box compreso nel prezzo,
planimetrie. Se questi campi esistono ancora nel foglio, vengono ignorati.
