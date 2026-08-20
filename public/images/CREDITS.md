# Immagini — segnaposto

Le fotografie in questa cartella sono **stock temporanei**, scaricati da
[Lorem Picsum](https://picsum.photos), che ridistribuisce fotografie
[Unsplash](https://unsplash.com) sotto **Unsplash License** (uso commerciale
libero, nessuna attribuzione obbligatoria).

Servono solo a valutare impaginazione e ritmo: **vanno sostituite con le
fotografie reali degli immobili** prima della messa online.

Sono state scelte solo inquadrature europee o neutre: scartate quelle
riconoscibilmente extra-europee, fuori contesto per un'agenzia di Pordenone.

## Come sostituirle

Ogni file va rimpiazzato mantenendo lo stesso percorso e un rapporto d'aspetto
simile. I percorsi sono dichiarati in `data/properties.ts`, `data/projects.ts`
e nei componenti di `components/home/`.

| Percorso | Uso | ID Picsum |
| --- | --- | --- |
| `home/hero.jpg` | Hero della home | 308 |
| `home/manifesto.jpg` | Dettaglio (porta) | 946 |
| `home/valutazione.jpg` | Interno | 625 |
| `home/territorio.jpg` | Territorio | 322 |
| `home/usaf.jpg` | Sezione USAF | 622 |
| `home/finale.jpg` | CTA finale | 290 |
| `home/split.jpg` | Materico (legno) | 307 |
| `properties/*` | Schede immobili | 946, 625, 307, 622, 444, 936, 290, 322, 308 |
| `projects/*` | Nuove realizzazioni | 936, 942, 622, 444, 625, 945, 946, 308, 290 |
| `about/*`, `usaf/*` | Pagine interne | 322, 625, 308, 307, 622 |

Le planimetrie in `plans/` sono disegni generati (`scripts/generate-plans.mjs`),
non fotografie: vanno sostituite con le planimetrie reali.
