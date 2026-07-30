/**
 * Local, typed content that mirrors the shape of future API responses.
 * When the Express API is live, replace these arrays with fetch() calls —
 * the component contracts (types) stay identical, so no UI changes are needed.
 */
import { assets } from '@/lib/assets';

export type Category = {
  slug: string;
  name: string;
  image: string;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  description: string;
  image: string;
  featured?: boolean;
};

export type Service = {
  slug: string;
  title: string;
  statement: string;
  icon: string;
};

export type Advantage = {
  title: string;
  icon: string;
};

export type Stat = {
  label: string;
  value: number;
  suffix?: string;
};

export type NewsItem = {
  slug: string;
  title: string;
  caption: string;
  date: string;
  image: string;
  category: string;
};

export const categories: Category[] = [
  { slug: 'elevators', name: 'Elevators', image: assets.categories.elevators },
  { slug: 'passenger-lifts', name: 'Passenger Lifts', image: assets.categories.lifts },
  { slug: 'escalators', name: 'Escalators', image: assets.categories.escalators },
  { slug: 'granite', name: 'Granite', image: assets.categories.granite },
  { slug: 'doors', name: 'Doors', image: assets.categories.doors },
  { slug: 'chairs', name: 'Chairs', image: assets.categories.chairs },
  { slug: 'office-furniture', name: 'Office Furniture', image: assets.categories.furniture },
  { slug: 'sanitary-goods', name: 'Sanitary Goods', image: assets.categories.sanitary },
  { slug: 'building-materials', name: 'Building Materials', image: assets.categories.materials },
];

export const featuredProducts: Product[] = [
  {
    slug: 'meridian-passenger-elevator',
    name: 'Meridian Passenger Elevator',
    category: 'Elevators',
    description: 'Machine-room-less traction system with brushed-steel cabin finishing.',
    image: assets.products.p1,
    featured: true,
  },
  {
    slug: 'obsidian-granite-slab',
    name: 'Obsidian Granite Slab',
    category: 'Granite',
    description: 'Full-bleed veined granite, precision-cut for architectural surfaces.',
    image: assets.products.p2,
    featured: true,
  },
  {
    slug: 'atrium-glass-door',
    name: 'Atrium Glass Door System',
    category: 'Doors',
    description: 'Frameless tempered glass entry with concealed automatic drive.',
    image: assets.products.p3,
  },
  {
    slug: 'executive-lounge-chair',
    name: 'Executive Lounge Chair',
    category: 'Chairs',
    description: 'Ergonomic seating in full-grain leather and cast aluminium.',
    image: assets.products.p4,
  },
  {
    slug: 'lumina-sanitary-suite',
    name: 'Lumina Sanitary Suite',
    category: 'Sanitary Goods',
    description: 'Rimless ceramic ware with matte-gold precision fittings.',
    image: assets.products.p5,
  },
];

export const services: Service[] = [
  { slug: 'product-import', title: 'Product Import', statement: 'Sourcing certified premium products from world-class manufacturers.', icon: 'Ship' },
  { slug: 'elevator-installation', title: 'Elevator Installation', statement: 'Precision installation engineered to international safety standards.', icon: 'Wrench' },
  { slug: 'elevator-maintenance', title: 'Elevator Maintenance', statement: 'Preventive maintenance programs that keep systems flawless.', icon: 'ShieldCheck' },
  { slug: 'granite-supply', title: 'Granite Supply', statement: 'Full-slab granite supply cut to architectural specification.', icon: 'Layers' },
  { slug: 'building-material-supply', title: 'Building Material Supply', statement: 'Reliable supply of fine building materials at project scale.', icon: 'Package' },
  { slug: 'construction-consultation', title: 'Construction Consultation', statement: 'Engineering guidance from concept through commissioning.', icon: 'Compass' },
];

export const advantages: Advantage[] = [
  { title: 'Premium Imported Products', icon: 'Globe' },
  { title: 'Professional Team', icon: 'Users' },
  { title: 'High Quality', icon: 'Gem' },
  { title: 'Reliable Service', icon: 'Clock' },
  { title: 'Engineering Expertise', icon: 'Ruler' },
  { title: 'Excellent Customer Support', icon: 'Headset' },
];

export const stats: Stat[] = [
  { label: 'Years of Experience', value: 18, suffix: '+' },
  { label: 'Projects Completed', value: 640, suffix: '+' },
  { label: 'Products Imported', value: 1200, suffix: '+' },
  { label: 'Happy Clients', value: 380, suffix: '+' },
];

export const latestNews: NewsItem[] = [
  {
    slug: 'rivet-flagship-showroom-opening',
    title: 'RIVET Opens Its Flagship Architectural Showroom',
    caption: 'A marble-floored gallery bringing imported engineering to the city center.',
    date: '2026-06-18',
    image: assets.news.n1,
    category: 'Company',
  },
  {
    slug: 'new-generation-traction-elevators',
    title: 'Introducing Next-Generation Traction Elevators',
    caption: 'Energy-efficient drive systems now available across our portfolio.',
    date: '2026-05-02',
    image: assets.news.n2,
    category: 'Products',
  },
  {
    slug: 'granite-partnership-expansion',
    title: 'Expanding Our Premium Granite Partnerships',
    caption: 'New quarry partnerships widen our selection of fine natural stone.',
    date: '2026-04-11',
    image: assets.news.n3,
    category: 'Supply',
  },
];

export const productInterests = [
  'Elevators',
  'Passenger Lifts',
  'Escalators',
  'Granite',
  'Doors',
  'Chairs',
  'Office Furniture',
  'Sanitary Goods',
  'Building Materials',
  'Other',
];
