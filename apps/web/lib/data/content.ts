/**
 * Local fallback content. The live site reads categories, products and
 * services from the API; these arrays are only shown when the API is
 * unreachable (local development), so they mirror the seed data.
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
  description: string;
  icon: string;
};

export type Highlight = {
  title: string;
  detail: string;
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
    description: 'Machine-room-less passenger elevator with gearless traction and a brushed-steel cabin.',
    image: assets.products.p1,
    featured: true,
  },
  {
    slug: 'obsidian-granite-slab',
    name: 'Obsidian Granite Slab',
    category: 'Granite',
    description: 'Polished or honed granite slabs, cut to size for countertops, cladding and flooring.',
    image: assets.products.p2,
    featured: true,
  },
  {
    slug: 'atrium-glass-door',
    name: 'Atrium Glass Door System',
    category: 'Doors',
    description: 'Frameless tempered-glass entrance with a concealed automatic drive.',
    image: assets.products.p3,
  },
  {
    slug: 'executive-lounge-chair',
    name: 'Executive Lounge Chair',
    category: 'Chairs',
    description: 'Executive lounge chair in full-grain leather on a cast-aluminium frame.',
    image: assets.products.p4,
  },
  {
    slug: 'lumina-sanitary-suite',
    name: 'Lumina Sanitary Suite',
    category: 'Sanitary Goods',
    description: 'Rimless vitreous-china sanitary suite with matte-gold fittings.',
    image: assets.products.p5,
  },
];

export const services: Service[] = [
  {
    slug: 'product-import',
    title: 'Product Import',
    statement:
      'Sourcing from international manufacturers, with shipping, customs clearance and site delivery managed for you.',
    icon: 'Ship',
  },
  {
    slug: 'elevator-installation',
    title: 'Elevator Installation',
    statement:
      'Passenger, commercial and freight elevators installed to manufacturer and safety standards, through to commissioning.',
    icon: 'Wrench',
  },
  {
    slug: 'elevator-maintenance',
    title: 'Elevator Maintenance',
    statement:
      'Scheduled preventive maintenance and repairs that keep elevators and escalators safe and in daily service.',
    icon: 'ShieldCheck',
  },
  {
    slug: 'granite-supply',
    title: 'Granite Supply',
    statement: 'Granite slabs cut to your drawings, polished or honed for cladding, flooring and countertops.',
    icon: 'Layers',
  },
  {
    slug: 'building-material-supply',
    title: 'Building Material Supply',
    statement:
      'Structural glass, stone, fittings and finishes supplied at project scale and timed to your construction schedule.',
    icon: 'Package',
  },
  {
    slug: 'construction-consultation',
    title: 'Construction Consultation',
    statement:
      'Technical guidance from design to commissioning, so every part of the building gets the right product.',
    icon: 'Compass',
  },
];

export const advantages: Advantage[] = [
  {
    title: 'Internationally sourced products',
    description: 'Elevators and building products from established international manufacturers.',
    icon: 'Globe',
  },
  {
    title: 'Supply and installation together',
    description: 'One team responsible from the purchase order to the handover.',
    icon: 'Wrench',
  },
  {
    title: 'Specification support',
    description: 'Products matched to your drawings, capacity and budget before you order.',
    icon: 'Ruler',
  },
  {
    title: 'Clear quotations',
    description: 'Itemised quotations covering supply, delivery and installation.',
    icon: 'FileText',
  },
  {
    title: 'After-sales maintenance',
    description: 'Preventive maintenance and repair to keep equipment in service.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Responsive local team',
    description: 'Based in Addis Ababa and available for site visits and follow-up.',
    icon: 'Headset',
  },
];

/** Capability band under the homepage hero (no unverified figures). */
export const highlights: Highlight[] = [
  { title: 'Elevators & escalators', detail: 'Supply, installation and maintenance' },
  { title: 'Granite & natural stone', detail: 'Cut to your project specification' },
  { title: 'Doors, furniture & sanitary goods', detail: 'For commercial and residential projects' },
  { title: 'Project quotations', detail: 'Prepared to your drawings and quantities' },
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
