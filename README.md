# Prata Immobiliare — sito

Next.js 15 (App Router), React 19, TypeScript. Nessun database: il catalogo
immobili vive in un Google Sheet sincronizzato in `data/generated/properties.json`
— vedi [PROPERTY_MANAGEMENT.md](./PROPERTY_MANAGEMENT.md) per quel workflow,
incluse le foto degli immobili su Cloudflare R2.

```bash
npm install
npm run dev
```

## Foto per il sito

Questa sezione riguarda le immagini **editoriali/statiche** del sito (hero,
sezioni home, chi-siamo, progetti, servizi) — non le foto degli immobili, che
seguono il workflow R2 descritto in PROPERTY_MANAGEMENT.md.

Tutte le immagini passano da `next/image`, che genera automaticamente AVIF e
WebP alla dimensione richiesta. Questo non esonera dal caricare sorgenti
ragionevoli: un file di partenza già enorme resta più lento da elaborare e
pesa di più nel repository.

**Prima di caricare una foto:**

| Uso | Larghezza consigliata | Formato | Peso indicativo |
| --- | --- | --- | --- |
| Hero (home, chi-siamo, immobili) | 1920–2200px | JPEG o WebP | 300–500 KB |
| Foto editoriali grandi (about, sezioni home) | 1600–1800px | JPEG o WebP | 150–350 KB |
| Card (progetti, servizi) | 1000–1200px | JPEG o WebP | 80–200 KB |
| Planimetrie | alla risoluzione reale, non ridurre | PNG o WebP | qualità alta, non comprimere le linee |
| Loghi / wordmark | dimensione reale, mai upscalare | SVG se disponibile, altrimenti PNG trasparente | non applicabile — non ricomprimere |

**Naming**: minuscolo, trattini, nessuno spazio — `nome-descrittivo.jpg`, non
`IMG_2043.JPG` o `Foto Salone.png`. Le cartelle in `public/images/` sono già
organizzate per sezione (`home/`, `about/`, `projects/`, `services/`,
`plans/`); metti la nuova foto nella cartella giusta.

**Non serve convertire a mano** prima di caricare: `next/image` lo fa da solo
in produzione. Se però il file sorgente è molto più grande del necessario
(es. una foto da fotocamera/telefono a piena risoluzione), lancia
l'ottimizzatore prima di committare:

```bash
npm run images:optimize                    # elabora tutto public/, genera i .webp
npm run images:optimize -- --dry-run       # mostra solo il report, non scrive nulla
npm run images:optimize -- images/about/nuova-foto.jpg   # un file solo
```

Lo script (in `scripts/images/optimize-images.mjs`, usa `sharp`):

- genera un `.webp` accanto all'originale, mai al posto dell'originale;
- ridimensiona solo se il file è più largo del necessario per come viene
  mostrato (mai upscale);
- salta i loghi/wordmark in `public/brand/` e qualunque file con `logo`,
  `wordmark` o `monogram` nel nome — non li tocca mai;
- salta i file già elaborati (se il `.webp` è più recente del sorgente non
  rilancia la conversione, quindi non degrada mai un'immagine due volte);
- stampa un report peso-prima/peso-dopo per ogni file.

Dopo averlo lanciato, il file `.jpg`/`.png` originale resta sul disco: il
codice va aggiornato a mano per puntare al nuovo `.webp` una volta verificato
visivamente il risultato. Questo è deliberato — lo script non riscrive mai i
componenti da solo.
