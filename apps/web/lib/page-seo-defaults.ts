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
    title: 'RIVET COMPANY | Elevators & Building Materials in Ethiopia',
    description:
      'RIVET COMPANY supplies elevators, passenger lifts, escalators, granite, doors, furniture, sanitary goods and building materials in Ethiopia. Get a quotation.',
    keywords: [
      'elevators in Ethiopia',
      'passenger lifts Ethiopia',
      'elevator solutions',
      'building materials suppliers Ethiopia',
      'escalators Ethiopia',
      'Addis Ababa',
    ],
  },
  products: {
    path: '/products',
    title: 'Elevators & Building Materials Catalog',
    description:
      'Browse elevators, passenger lifts, escalators, granite, doors, office furniture, sanitary goods and building materials from RIVET COMPANY in Ethiopia.',
    keywords: [
      'elevators in Ethiopia',
      'passenger lifts',
      'granite Ethiopia',
      'doors Ethiopia',
      'building materials suppliers',
    ],
  },
  services: {
    path: '/services',
    title: 'Elevator Installation, Maintenance & Supply',
    description:
      'Product import, elevator installation and maintenance, granite and building material supply, and construction consultation from RIVET COMPANY in Ethiopia.',
    keywords: [
      'elevator installation Ethiopia',
      'elevator maintenance Ethiopia',
      'elevator solutions',
      'construction consultation',
    ],
  },
  company: {
    path: '/company',
    title: 'About RIVET COMPANY — Building Products Supplier in Ethiopia',
    description:
      'RIVET COMPANY is an Addis Ababa–based supplier of elevators, escalators and building materials. Learn about our vision, mission and values.',
    keywords: ['RIVET COMPANY', 'about RIVET COMPANY', 'building materials suppliers Ethiopia'],
  },
  'certificate-portfolio': {
    path: '/company/certificate-portfolio',
    title: 'Certificates & Project Portfolio',
    description:
      'Certificates and selected project work from RIVET COMPANY, supplier of elevators, escalators and building materials in Ethiopia.',
    keywords: ['RIVET COMPANY certificates', 'project portfolio Ethiopia'],
  },
  team: {
    path: '/company/team',
    title: 'Meet Our Team',
    description:
      'Meet the RIVET COMPANY team — the leadership and engineering staff behind our elevator, escalator and building material projects in Ethiopia.',
    keywords: ['RIVET COMPANY team', 'leadership', 'elevator engineers Ethiopia'],
  },
  gallery: {
    path: '/company/gallery',
    title: 'Company Gallery',
    description:
      'Photos of RIVET COMPANY projects, product installations and team activities in Ethiopia.',
    keywords: ['RIVET COMPANY gallery', 'elevator installation projects', 'Ethiopia'],
  },
  news: {
    path: '/news',
    title: 'News & Updates',
    description:
      'Company announcements, product updates and project news from RIVET COMPANY, supplier of elevators and building materials in Ethiopia.',
    keywords: ['RIVET COMPANY news', 'elevators Ethiopia news', 'company updates'],
  },
  careers: {
    path: '/careers',
    title: 'Careers in Addis Ababa',
    description:
      'Current vacancies at RIVET COMPANY in Ethiopia — engineering, installation and commercial roles. Review the requirements and apply online with your CV.',
    keywords: ['RIVET COMPANY careers', 'elevator technician jobs Ethiopia', 'Addis Ababa jobs'],
  },
  contact: {
    path: '/contact',
    title: 'Contact RIVET COMPANY in Addis Ababa',
    description:
      'Contact RIVET COMPANY in Addis Ababa, Ethiopia, about elevators, escalators, granite, doors and building materials. Call, email or send us a message.',
    keywords: ['contact RIVET COMPANY', 'Addis Ababa', 'elevator supplier contact Ethiopia'],
  },
  'request-quotation': {
    path: '/request-quotation',
    title: 'Request a Quotation',
    description:
      'Request a quotation from RIVET COMPANY for elevators, passenger lifts, escalators, granite, doors, furniture or building materials in Ethiopia.',
    keywords: ['request quotation', 'elevator price Ethiopia', 'building materials quotation Addis Ababa'],
  },
};
