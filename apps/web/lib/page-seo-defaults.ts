/** Default SEO copy for static public pages (CMS PageSeo overrides these). */

export const PAGE_SEO_KEYS = [
  'home',
  'products',
  'services',
  'company',
  'certificate-portfolio',
  'team',
  'gallery',
  'news',
  'careers',
  'contact',
  'request-quotation',
] as const;

export type PageSeoKey = (typeof PAGE_SEO_KEYS)[number];

export type PageSeoDefault = {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
};

export const PAGE_SEO_DEFAULTS: Record<PageSeoKey, PageSeoDefault> = {
  home: {
    path: '/',
    title: 'Premium Elevators, Granite & Building Materials in Ethiopia',
    description:
      'RIVET imports premium elevators, granite, doors, sanitary ware and building materials for projects in Ethiopia. Browse our catalog and request a quotation.',
    keywords: ['elevators Ethiopia', 'building materials', 'request quotation', 'Addis Ababa'],
  },
  products: {
    path: '/products',
    title: 'Products — Elevators, Granite, Doors & Materials',
    description:
      'Search and browse RIVET’s elevators, granite, doors, furniture and building materials in Ethiopia. Filter by category and request a quotation.',
    keywords: ['RIVET products', 'elevators Ethiopia', 'granite', 'doors', 'building materials'],
  },
  services: {
    path: '/services',
    title: 'Services — Import, Installation & Consultation',
    description:
      'RIVET services in Ethiopia: product import, elevator installation and maintenance, granite supply, and construction consultation.',
    keywords: ['elevator installation', 'import services', 'construction consultation'],
  },
  company: {
    path: '/company',
    title: 'About Rivet — River Company in Ethiopia',
    description:
      'History, vision, mission and values of River Company (RIVET) — premium construction and architectural products supplier in Ethiopia.',
    keywords: ['River Company', 'about RIVET', 'construction Ethiopia'],
  },
  'certificate-portfolio': {
    path: '/company/certificate-portfolio',
    title: 'Certificate & Portfolio',
    description:
      'View River Company (RIVET) certificates, partner credentials, and selected project portfolio across Ethiopia.',
    keywords: ['RIVET certificates', 'project portfolio', 'credentials'],
  },
  team: {
    path: '/company/team',
    title: 'Meet Our Team',
    description:
      'Meet the River Company (RIVET) team — leadership, engineering, and the people behind premium imports and installations in Ethiopia.',
    keywords: ['RIVET team', 'leadership', 'engineering'],
  },
  gallery: {
    path: '/company/gallery',
    title: 'Company Gallery',
    description:
      'Photos of River Company (RIVET) activities, projects, events, and day-to-day work across Ethiopia.',
    keywords: ['RIVET gallery', 'projects', 'events'],
  },
  news: {
    path: '/news',
    title: 'News & Insights',
    description:
      'Journal of RIVET projects, product launches and company updates across Ethiopia and East Africa.',
    keywords: ['RIVET news', 'product launches', 'company updates'],
  },
  careers: {
    path: '/careers',
    title: 'Careers',
    description:
      'Open vacancies at River Company (RIVET) in Ethiopia — engineering, installation, and commercial roles. View requirements and apply with your CV.',
    keywords: ['Rivet careers', 'River Company jobs', 'vacancies Ethiopia', 'Addis Ababa jobs'],
  },
  contact: {
    path: '/contact',
    title: 'Contact Rivet in Addis Ababa, Ethiopia',
    description:
      'Contact River Company (RIVET) in Addis Ababa — office, phone, email and social channels. Request a quotation for elevators, granite, doors and more.',
    keywords: ['contact RIVET', 'Addis Ababa', 'River Company phone'],
  },
  'request-quotation': {
    path: '/request-quotation',
    title: 'Request a Quotation',
    description:
      'Request a quotation for commercial and residential products from Rivet in Ethiopia — elevators, granite, doors, furniture and building materials.',
    keywords: ['request quotation', 'Rivet Ethiopia', 'product quotation Addis Ababa'],
  },
};
