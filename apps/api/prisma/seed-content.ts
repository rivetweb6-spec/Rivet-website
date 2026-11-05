/**
 * Real RIVET COMPANY content shared by both seeds:
 *   - prisma/seed.ts            development / demo data (adds sample products etc.)
 *   - prisma/seed-production.ts clean production start (this content only)
 * Only confirmed, non-fabricated information belongs here.
 */

export const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export type FaqItem = { question: string; answer: string };

const categoryFaqs: Record<string, FaqItem[]> = {
  elevators: [
    {
      question: 'Do you supply elevators for commercial buildings in Ethiopia?',
      answer:
        'Yes. RIVET COMPANY supplies passenger, commercial and freight elevators for offices, hotels, apartments and mixed-use buildings in Ethiopia, with support from specification through installation.',
    },
    {
      question: 'Can I request a quotation for a specific elevator model?',
      answer:
        'Yes. Use Request a Quotation on any product page, or contact our team with the building type, required capacity and number of floors for a tailored quotation.',
    },
  ],
  granite: [
    {
      question: 'Is your granite suitable for residential and commercial interiors?',
      answer:
        'Yes. We supply granite slabs for wall cladding, flooring and countertops in homes, offices, hotels and other commercial spaces in Ethiopia.',
    },
    {
      question: 'Can granite be cut to project specifications?',
      answer:
        'Yes. Granite can be cut to size from your architectural drawings. Share the dimensions and preferred finish (polished or honed) when you request a quotation.',
    },
  ],
  doors: [
    {
      question: 'What types of doors does RIVET COMPANY supply in Ethiopia?',
      answer:
        'We supply architectural and automatic door systems for building entrances, lobbies, offices and residential projects. Request a quotation and we will recommend the right specification.',
    },
  ],
  'office-furniture': [
    {
      question: 'Do you supply office furniture in Addis Ababa?',
      answer:
        'Yes. RIVET COMPANY supplies desks, workstations, seating and office systems for commercial fit-outs in Addis Ababa and other cities in Ethiopia.',
    },
  ],
  chairs: [
    {
      question: 'Are your office chairs suitable for executive and open-plan spaces?',
      answer:
        'Our seating range covers executive and lounge chairs as well as everyday workplace seating. Request a quotation with the quantity and preferred finishes.',
    },
  ],
};

export const categories = [
  {
    name: 'Elevators',
    slug: 'elevators',
    order: 1,
    image: u('photo-1486406146926-c627a92ad1ab'),
    description: 'Passenger, commercial and freight elevators supplied and installed for residential and commercial buildings in Ethiopia.',
    faqs: categoryFaqs.elevators,
  },
  {
    name: 'Passenger Lifts',
    slug: 'passenger-lifts',
    order: 2,
    image: u('photo-1621905251189-08b45d6a269e'),
    description: 'Passenger lifts for apartments, offices and hotels, selected for safe, quiet and energy-efficient operation.',
  },
  {
    name: 'Escalators',
    slug: 'escalators',
    order: 3,
    image: u('photo-1752066469007-fc183e1b6a0d'),
    description: 'Commercial escalators for shopping centres, transit stations and public buildings.',
  },
  {
    name: 'Granite',
    slug: 'granite',
    order: 4,
    image: u('photo-1615529182904-14819c35db37'),
    description: 'Granite slabs and natural stone for countertops, cladding and flooring, cut to project specification.',
    faqs: categoryFaqs.granite,
  },
  {
    name: 'Doors',
    slug: 'doors',
    order: 5,
    image: u('photo-1600585154340-be6161a56a0c'),
    description: 'Architectural and automatic door systems for building entrances, offices and residential projects.',
    faqs: categoryFaqs.doors,
  },
  {
    name: 'Chairs',
    slug: 'chairs',
    order: 6,
    image: u('photo-1567016432779-094069958ea5'),
    description: 'Executive, office and lounge seating for workplaces and reception areas.',
    faqs: categoryFaqs.chairs,
  },
  {
    name: 'Office Furniture',
    slug: 'office-furniture',
    order: 7,
    image: u('photo-1524758631624-e2822e304c36'),
    description: 'Desks, workstations and office systems for commercial fit-outs in Addis Ababa and across Ethiopia.',
    faqs: categoryFaqs['office-furniture'],
  },
  {
    name: 'Sanitary Goods',
    slug: 'sanitary-goods',
    order: 8,
    image: u('photo-1584622650111-993a426fbf0a'),
    description: 'Sanitary ware and bathroom fittings for residential, hotel and commercial projects.',
  },
  {
    name: 'Building Materials',
    slug: 'building-materials',
    order: 9,
    image: u('photo-1541888946425-d81bb19240f5'),
    description: 'Building materials including structural glass, stone and architectural finishes for construction projects.',
  },
];

/** Elevator sub-categories (children of "elevators"). */
export const elevatorGroups = [
  {
    name: 'Passenger Elevators',
    slug: 'passenger-elevators',
    description:
      'Quiet, comfortable passenger elevators for apartment buildings, offices and mixed-use developments.',
    image: u('photo-1758448511533-e1502259fff6'),
    order: 1,
    items: [
      {
        name: 'Standard Passenger Elevators',
        slug: 'standard-passenger-elevators',
        description:
          'Traction and machine-room-less passenger elevators for mid-rise residential and commercial buildings.',
        image: u('photo-1541888946425-d81bb19240f5'),
        order: 1,
      },
      {
        name: 'Premium Passenger Elevators',
        slug: 'premium-passenger-elevators',
        description:
          'Upgraded cabin finishes, quiet drives and destination-dispatch control for high-end residential and office buildings.',
        image: u('photo-1486406146926-c627a92ad1ab'),
        order: 2,
      },
      {
        name: 'Panoramic Elevators',
        slug: 'panoramic-elevators',
        description:
          'Glass-walled panoramic elevators for atriums, hotels and shopping centres, where the lift is part of the design.',
        image: u('photo-1758518731135-6d9af1849b25'),
        order: 3,
      },
    ],
  },
  {
    name: 'Commercial Elevators',
    slug: 'commercial-elevators',
    description:
      'High-capacity elevators for offices, hotels and shopping centres with heavy daily traffic.',
    image: u('photo-1758448721205-8465cebc26af'),
    order: 2,
    items: [
      {
        name: 'Office Building Elevators',
        slug: 'office-building-elevators',
        description:
          'Energy-efficient elevator systems sized for peak-hour traffic in office buildings.',
        image: u('photo-1497366754035-f200968a6e72'),
        order: 1,
      },
      {
        name: 'Hotel Elevators',
        slug: 'hotel-elevators',
        description:
          'Quiet elevators with customisable cabin interiors for hotels and serviced apartments.',
        image: u('photo-1759038086454-5644437ccf4c'),
        order: 2,
      },
      {
        name: 'Shopping Mall Elevators',
        slug: 'shopping-mall-elevators',
        description:
          'High-capacity passenger elevators for constant visitor traffic in shopping centres and mixed-use buildings.',
        // Previous Unsplash photo was removed (404); falls back to the Elevators image.
        image: null,
        order: 3,
      },
    ],
  },
  {
    name: 'Service & Freight Elevators',
    slug: 'service-freight-elevators',
    description:
      'Durable service and goods lifts for hotels, hospitals, warehouses and industrial sites.',
    image: u('photo-1547630824-eed1be6a27b0'),
    order: 3,
    items: [
      {
        name: 'Service Elevators',
        slug: 'service-elevators',
        description:
          'Back-of-house elevators for staff, housekeeping and light goods in hotels, hospitals and offices.',
        image: u('photo-1719463814218-52e17f720e8a'),
        order: 1,
      },
      {
        name: 'Freight Elevators',
        slug: 'freight-elevators',
        description:
          'Freight elevators with reinforced cabins and wide doors for palletised goods and equipment.',
        image: u('photo-1586528116311-ad8dd3c8310d'),
        order: 2,
      },
      {
        name: 'Heavy-Duty Elevators',
        slug: 'heavy-duty-elevators',
        description:
          'Heavy-duty lifts for high payloads in warehouses, factories and industrial facilities.',
        image: u('photo-1758024264451-5cbfa9bee420'),
        order: 3,
      },
    ],
  },
];

export const services = [
  {
    title: 'Product Import',
    slug: 'product-import',
    icon: 'Ship',
    narrative:
      'We source building products from international manufacturers and manage the full import process — supplier coordination, shipping, customs clearance and delivery to your site in Ethiopia.',
    order: 1,
    faqs: [
      {
        question: 'Which products can RIVET COMPANY import to Ethiopia?',
        answer:
          'We import elevators, escalators, granite, doors, sanitary goods, office furniture and building materials, and handle shipping, customs clearance and delivery.',
      },
      {
        question: 'How do I start an import quotation?',
        answer:
          'Send your product requirements, quantities and site location through Request a Quotation. Our team will reply with sourcing options, pricing and lead times.',
      },
    ],
  },
  {
    title: 'Elevator Installation',
    slug: 'elevator-installation',
    icon: 'Wrench',
    narrative:
      'Installation of passenger, commercial and freight elevators in line with manufacturer and safety standards — from shaft preparation through testing, commissioning and handover.',
    order: 2,
    faqs: [
      {
        question: 'Do you install elevators for new builds and renovations?',
        answer:
          'Yes. Our installation team works on new buildings and on modernisation of existing ones, following manufacturer instructions and safety standards.',
      },
    ],
  },
  {
    title: 'Elevator Maintenance',
    slug: 'elevator-maintenance',
    icon: 'ShieldCheck',
    narrative:
      'Scheduled preventive maintenance and repairs for elevators and escalators, keeping your equipment safe, compliant and in reliable daily service.',
    order: 3,
    faqs: [
      {
        question: 'Can RIVET COMPANY maintain elevators installed by other suppliers?',
        answer:
          'In many cases, yes. Send us the equipment make, model and age so we can confirm compatibility and propose a maintenance plan.',
      },
    ],
  },
  {
    title: 'Granite Supply',
    slug: 'granite-supply',
    icon: 'Layers',
    narrative:
      'Granite slabs supplied and cut to your architectural drawings, with polished or honed finishes for cladding, flooring and countertops.',
    order: 4,
    faqs: [
      {
        question: 'Do you supply granite for projects in Addis Ababa?',
        answer:
          'Yes. We supply granite and natural stone for residential and commercial projects in Addis Ababa and other regions of Ethiopia.',
      },
    ],
  },
  {
    title: 'Building Material Supply',
    slug: 'building-material-supply',
    icon: 'Package',
    narrative:
      'Supply of building materials at project scale — structural glass, natural stone, fittings and architectural finishes — coordinated with your construction schedule.',
    order: 5,
  },
  {
    title: 'Construction Consultation',
    slug: 'construction-consultation',
    icon: 'Compass',
    narrative:
      'Technical guidance from early design through commissioning, helping architects, contractors and developers choose the right products for every part of the building.',
    order: 6,
  },
];

/** Company page text (timeline, achievements and certifications are added in the admin once confirmed). */
export const COMPANY_INFO = {
  history:
    'RIVET COMPANY is an Addis Ababa–based supplier of elevators, escalators and building materials, supporting projects from product selection to installation and maintenance.',
  vision: 'To be the most dependable partner in Ethiopia for elevators, escalators and quality building products.',
  mission: 'To supply and install reliable, internationally sourced products with clear specifications, honest quotations and responsive after-sales support.',
  coreValues: ['Precision', 'Integrity', 'Craftsmanship', 'Reliability'],
  // Timeline, achievements and certifications are added from Admin → Company
  // once confirmed — never seeded with sample figures.
  timeline: [],
  achievements: [],
  certifications: [],
};

/** Homepage hero and intro text (management names/photos are entered in the admin). */
export const HOME_CONTENT = {
  eyebrow: 'RIVET COMPANY · Addis Ababa, Ethiopia',
  headline: 'Elevators & building materials',
  headlineAccent: 'for projects in Ethiopia.',
  subheadline:
    'Passenger lifts, escalators, granite, doors, furniture, sanitary goods and construction materials — supplied, installed and supported by one accountable team.',
  heroImage: '/images/rivet-elevator-hero.webp',
  introEyebrow: 'About RIVET COMPANY',
  introTitle: 'One supplier for the products that complete a building.',
  introBody:
    'RIVET COMPANY is an Ethiopian supplier of elevators, escalators and building products. We source passenger lifts, granite, doors, office furniture, sanitary goods and construction materials from international manufacturers for residential, commercial and public projects.',
  introBodySecondary:
    'Our team supports clients from specification to handover: matching products to your drawings, preparing clear quotations, and coordinating delivery, installation and after-sales service.',
  introImage: u('photo-1503387762-592deb58ef4e', 1400),
};

/** RIVET COMPANY office, Addis Ababa (confirmed coordinates). */
export const OFFICE_ADDRESS = 'Addis Ababa, Ethiopia';
export const OFFICE_COORDS = { lat: 8.9939223, lng: 38.7943463 };
