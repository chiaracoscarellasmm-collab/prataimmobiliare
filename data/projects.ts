/**
 * ⚠️  DATI DIMOSTRATIVI — PLACEHOLDER
 *
 * Nomi progetto, località, numero di unità, tempistiche e stato dei lavori
 * sono segnaposto evidenti e vanno sostituiti con le informazioni reali
 * fornite dall'agenzia o dall'operatore.
 */

export type ProjectStatus =
  | 'In progetto'
  | 'In costruzione'
  | 'In consegna'
  | 'Ultimato';

export interface ProjectImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProjectUnit {
  label: string;
  surface: string;
  rooms: string;
  availability: 'Disponibile' | 'Opzionato' | 'Venduto';
}

export interface Project {
  id: string;
  slug: string;
  projectName: string;
  location: string;
  status: ProjectStatus;
  /** Anno o periodo di consegna previsto. */
  delivery: string;
  numberOfUnits: number;
  intro: string;
  description: string[];
  heroImage: ProjectImage;
  gallery: ProjectImage[];
  floorPlans: ProjectImage[];
  features: string[];
  availability: ProjectUnit[];
}

export const projects: Project[] = [
  {
    id: 'pr-001',
    slug: 'residenze-progetto-a',
    projectName: 'Borgo rose',
    location: 'Brugnera',
    status: 'In costruzione',
    delivery: '2027',
    numberOfUnits: 8,
    intro:
      '[PLACEHOLDER] Un intervento residenziale di otto unità, pensato attorno a una corte comune e a un rapporto diretto tra interno ed esterno.',
    description: [
      '[DESCRIZIONE PLACEHOLDER] Il progetto nasce dal recupero di un lotto interno al tessuto edificato esistente. La distribuzione dei volumi privilegia l’orientamento e la privacy di ogni unità.',
      '[DESCRIZIONE PLACEHOLDER] Le finiture, i materiali e i capitolati verranno pubblicati non appena definiti insieme alla proprietà.',
    ],
    heroImage: {
      src: '/images/projects/residenze-a-hero.jpg',
      alt: 'Render del progetto residenziale — immagine placeholder',
      width: 2400,
      height: 1450,
    },
    gallery: [
      { src: '/images/projects/residenze-a-01.jpg', alt: 'Dettaglio di facciata — immagine placeholder', width: 1600, height: 1100 },
      { src: '/images/projects/residenze-a-02.jpg', alt: 'Interno tipo — immagine placeholder', width: 1200, height: 1500 },
    ],
    floorPlans: [
      { src: '/images/plans/plan-a.jpg', alt: 'Planimetria tipo — placeholder', width: 1600, height: 1100 },
    ],
    features: ['Classe energetica [CLASSE]', 'Corte comune', 'Garage privati', 'Impianti [DA DEFINIRE]'],
    availability: [
      { label: 'Unità A1', surface: '[MQ] m²', rooms: '[N] camere', availability: 'Disponibile' },
      { label: 'Unità A2', surface: '[MQ] m²', rooms: '[N] camere', availability: 'Opzionato' },
      { label: 'Unità B1', surface: '[MQ] m²', rooms: '[N] camere', availability: 'Disponibile' },
    ],
  },
  {
    id: 'pr-002',
    slug: 'residenze-progetto-b',
    projectName: 'Residenze [NOME PROGETTO B]',
    location: '[LOCALITÀ]',
    status: 'In progetto',
    delivery: '[ANNO]',
    numberOfUnits: 12,
    intro:
      '[PLACEHOLDER] Dodici unità abitative distribuite su due corpi di fabbrica, con spazi verdi di pertinenza e autorimesse interrate.',
    description: [
      '[DESCRIZIONE PLACEHOLDER] Un intervento seguito fin dalle prime fasi progettuali, in collaborazione con la proprietà e la direzione lavori.',
    ],
    heroImage: {
      src: '/images/projects/residenze-b-hero.jpg',
      alt: 'Render del secondo progetto residenziale — immagine placeholder',
      width: 2400,
      height: 1450,
    },
    gallery: [
      { src: '/images/projects/residenze-b-01.jpg', alt: 'Vista d’insieme — immagine placeholder', width: 1600, height: 1100 },
      { src: '/images/projects/residenze-b-02.jpg', alt: 'Dettaglio materico — immagine placeholder', width: 1200, height: 1500 },
    ],
    floorPlans: [
      { src: '/images/plans/plan-b.jpg', alt: 'Planimetria generale — placeholder', width: 1600, height: 1100 },
    ],
    features: ['Autorimesse interrate', 'Aree verdi di pertinenza', 'Capitolato [DA DEFINIRE]'],
    availability: [
      { label: 'Corpo A', surface: '[MQ] m²', rooms: '[N] unità', availability: 'Disponibile' },
      { label: 'Corpo B', surface: '[MQ] m²', rooms: '[N] unità', availability: 'Disponibile' },
    ],
  },
  {
    id: 'pr-003',
    slug: 'residenze-progetto-c',
    projectName: 'Residenze [NOME PROGETTO C]',
    location: '[LOCALITÀ]',
    status: 'In consegna',
    delivery: '[ANNO]',
    numberOfUnits: 6,
    intro:
      '[PLACEHOLDER] Sei appartamenti di nuova costruzione, con ampie logge e affacci sul verde interno.',
    description: [
      '[DESCRIZIONE PLACEHOLDER] Le unità sono in fase di completamento. Le visite in cantiere si svolgono su appuntamento.',
    ],
    heroImage: {
      src: '/images/projects/residenze-c-hero.jpg',
      alt: 'Interno di una delle unità — immagine placeholder',
      width: 2400,
      height: 1450,
    },
    gallery: [
      { src: '/images/projects/residenze-c-01.jpg', alt: 'Affaccio sul verde interno — immagine placeholder', width: 1600, height: 1100 },
      { src: '/images/projects/residenze-c-02.jpg', alt: 'Fronte principale — immagine placeholder', width: 1200, height: 1500 },
    ],
    floorPlans: [],
    features: ['Logge abitabili', 'Cantine di pertinenza', 'Consegna [ANNO]'],
    availability: [
      { label: 'Unità 1', surface: '[MQ] m²', rooms: '[N] camere', availability: 'Disponibile' },
      { label: 'Unità 2', surface: '[MQ] m²', rooms: '[N] camere', availability: 'Venduto' },
    ],
  },
];

export const getProjectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);
