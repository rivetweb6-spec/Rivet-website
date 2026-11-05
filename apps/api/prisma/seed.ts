import { PrismaClient, ContentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { resolveSeedAdmin } from '../src/bootstrap/seed-admin.js';

const prisma = new PrismaClient();

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

type FaqItem = { question: string; answer: string };

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

const categories = [
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

type SeedProduct = {
  name: string;
  slug: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  brand: string;
  countryOfOrigin: string;
  specs: { label: string; value: string }[];
  features: string[];
  featured: boolean;
  images: string[];
};

const products: SeedProduct[] = [
  {
    name: 'Meridian Passenger Elevator',
    slug: 'meridian-passenger-elevator',
    categorySlug: 'elevators',
    shortDescription: 'Machine-room-less passenger elevator with gearless traction and a brushed-steel cabin.',
    description:
      'The Meridian is a machine-room-less (MRL) passenger elevator for residential and commercial buildings. Its energy-efficient gearless traction drive needs no separate machine room, and the brushed-steel cabin suits offices, hotels and apartment buildings alike.',
    brand: 'RIVET Vertical',
    countryOfOrigin: 'Germany',
    specs: [
      { label: 'Capacity', value: '1000 kg / 13 persons' },
      { label: 'Speed', value: '1.75 m/s' },
      { label: 'Drive', value: 'Gearless MRL' },
    ],
    features: ['Regenerative drive', 'Destination dispatch', 'Emergency battery lowering'],
    featured: true,
    images: [u('photo-1621905252507-b35492cc74b4'), u('photo-1486406146926-c627a92ad1ab')],
  },
  {
    name: 'Obsidian Granite Slab',
    slug: 'obsidian-granite-slab',
    categorySlug: 'granite',
    shortDescription: 'Polished or honed granite slabs, cut to size for countertops, cladding and flooring.',
    description:
      'Full-slab granite with deep, dark veining, available polished or honed in 20 mm and 30 mm thicknesses. Slabs are sealed and can be cut to size from your drawings for countertops, wall cladding and flooring.',
    brand: 'RIVET Stone',
    countryOfOrigin: 'Italy',
    specs: [
      { label: 'Thickness', value: '20 mm / 30 mm' },
      { label: 'Finish', value: 'Polished / Honed' },
    ],
    features: ['Sealed surface', 'Custom cut-to-size'],
    featured: true,
    images: [u('photo-1615529182904-14819c35db37')],
  },
  {
    name: 'Atrium Glass Door System',
    slug: 'atrium-glass-door',
    categorySlug: 'doors',
    shortDescription: 'Frameless tempered-glass entrance with a concealed automatic drive.',
    description:
      'Atrium is a frameless 12 mm tempered-glass door system with a concealed automatic drive, designed for lobbies, offices and retail entrances that need a clean, open look. It closes softly and is ready for access control.',
    brand: 'RIVET Entry',
    countryOfOrigin: 'Italy',
    specs: [
      { label: 'Glass', value: '12 mm tempered' },
      { label: 'Drive', value: 'Concealed automatic' },
    ],
    features: ['Soft-close', 'Access control ready'],
    featured: true,
    images: [u('photo-1600585154340-be6161a56a0c')],
  },
  {
    name: 'Executive Lounge Chair',
    slug: 'executive-lounge-chair',
    categorySlug: 'chairs',
    shortDescription: 'Executive lounge chair in full-grain leather on a cast-aluminium frame.',
    description:
      'Lounge seating upholstered in full-grain leather over a cast-aluminium frame, with ergonomic lumbar support and a swivel base — suited to executive offices, reception areas and private lounges.',
    brand: 'RIVET Atelier',
    countryOfOrigin: 'Italy',
    specs: [
      { label: 'Upholstery', value: 'Full-grain leather' },
      { label: 'Frame', value: 'Cast aluminium' },
    ],
    features: ['Ergonomic lumbar', 'Swivel base'],
    featured: false,
    images: [u('photo-1567016432779-094069958ea5')],
  },
  {
    name: 'Lumina Sanitary Suite',
    slug: 'lumina-sanitary-suite',
    categorySlug: 'sanitary-goods',
    shortDescription: 'Rimless vitreous-china sanitary suite with matte-gold fittings.',
    description:
      'A complete rimless sanitary suite in vitreous china, paired with matte-gold fittings and a soft-close seat. The rimless bowl is easier to keep clean, making it a practical choice for homes, hotels and residential developments.',
    brand: 'RIVET Bath',
    countryOfOrigin: 'Germany',
    specs: [
      { label: 'Material', value: 'Vitreous china' },
      { label: 'Finish', value: 'Matte gold fittings' },
    ],
    features: ['Rimless bowl', 'Soft-close seat'],
    featured: true,
    images: [u('photo-1584622650111-993a426fbf0a')],
  },
  {
    name: 'Horizon Escalator',
    slug: 'horizon-escalator',
    categorySlug: 'escalators',
    shortDescription: 'Commercial escalator with an energy-saving VVVF drive.',
    description:
      'Horizon escalators move people reliably through shopping centres, transit stations and public buildings. A VVVF drive saves energy, integrated LED lighting improves visibility, and the escalator is available at 30° or 35° inclination.',
    brand: 'RIVET Vertical',
    countryOfOrigin: 'Germany',
    specs: [
      { label: 'Inclination', value: '30° / 35°' },
      { label: 'Speed', value: '0.5 m/s' },
    ],
    features: ['VVVF drive', 'LED lighting'],
    featured: false,
    images: [u('photo-1753046047947-46640d539bea')],
  },
  {
    name: 'Nova Office Desk System',
    slug: 'nova-office-desk',
    categorySlug: 'office-furniture',
    shortDescription: 'Modular office desk system in oak veneer and powder-coated steel.',
    description:
      'A modular desk system with oak-veneer worktops on a powder-coated steel frame. It scales from private offices to open-plan workspaces, with built-in cable management and height-adjustable options.',
    brand: 'RIVET Atelier',
    countryOfOrigin: 'Sweden',
    specs: [
      { label: 'Top', value: 'Oak veneer' },
      { label: 'Base', value: 'Powder-coated steel' },
    ],
    features: ['Cable management', 'Height-adjustable options'],
    featured: false,
    images: [u('photo-1524758631624-e2822e304c36')],
  },
  {
    name: 'Atlas Structural Glass',
    slug: 'atlas-structural-glass',
    categorySlug: 'building-materials',
    shortDescription: 'Laminated structural glass for façades, canopies and balustrades.',
    description:
      'Atlas laminated structural glass panels, 12–21 mm thick, for façade glazing, canopies and balustrades. Available in clear, low-iron or tinted glass, CE marked and cut to custom sizes.',
    brand: 'RIVET Materials',
    countryOfOrigin: 'Belgium',
    specs: [
      { label: 'Thickness', value: '12–21 mm laminated' },
      { label: 'Options', value: 'Clear / Low-iron / Tinted' },
    ],
    features: ['CE marked', 'Custom sizes'],
    featured: false,
    images: [u('photo-1541888946425-d81bb19240f5')],
  },
];

async function main() {
  // Production seeds need explicit, strong admin credentials — see seed-admin.ts.
  const admin = resolveSeedAdmin(process.env, process.env.NODE_ENV === 'production');
  if (!admin.ok) {
    throw new Error(
      `${admin.problem} Set SEED_ADMIN_EMAIL and a strong SEED_ADMIN_PASSWORD before seeding production.`,
    );
  }
  const { email, password } = admin;
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: 'RIVET Admin', email, passwordHash, role: 'ADMIN' },
  });

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        order: c.order,
        image: c.image,
        images: [c.image],
        description: c.description,
        faqs: c.faqs ?? undefined,
      },
      create: { ...c, images: [c.image] },
    });
  }

  const elevatorGroups = [
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

  const elevatorsCat = await prisma.category.findUnique({ where: { slug: 'elevators' } });
  if (elevatorsCat) {
    for (const group of elevatorGroups) {
      const parent = await prisma.category.upsert({
        where: { slug: group.slug },
        update: {
          name: group.name,
          parentId: elevatorsCat.id,
          order: group.order,
        },
        create: {
          name: group.name,
          slug: group.slug,
          parentId: elevatorsCat.id,
          order: group.order,
          description: group.description,
          image: group.image,
          images: [group.image],
        },
      });

      for (const item of group.items) {
        await prisma.category.upsert({
          where: { slug: item.slug },
          update: {
            name: item.name,
            parentId: parent.id,
            description: item.description,
            image: item.image,
            images: item.image ? [item.image] : [],
            order: item.order,
          },
          create: {
            name: item.name,
            slug: item.slug,
            parentId: parent.id,
            description: item.description,
            image: item.image,
            images: item.image ? [item.image] : [],
            order: item.order,
          },
        });
      }
    }
  }

  const catMap = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.slug, c.id]),
  );

  for (const p of products) {
    const categoryId = catMap[p.categorySlug];
    if (!categoryId) continue;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        brand: p.brand,
        countryOfOrigin: p.countryOfOrigin,
        specs: p.specs,
        features: p.features,
        featured: p.featured,
        status: ContentStatus.PUBLISHED,
      },
      create: {
        name: p.name,
        slug: p.slug,
        categoryId,
        shortDescription: p.shortDescription,
        description: p.description,
        brand: p.brand,
        countryOfOrigin: p.countryOfOrigin,
        specs: p.specs,
        features: p.features,
        featured: p.featured,
        status: ContentStatus.PUBLISHED,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: p.images.map((url, i) => ({
        productId: product.id,
        url,
        alt: p.name,
        order: i,
      })),
    });
  }

  const services = [
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
  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        title: s.title,
        narrative: s.narrative,
        icon: s.icon,
        order: s.order,
        faqs: s.faqs ?? undefined,
      },
      create: s,
    });
  }

  // News articles are published from Admin → News (no sample articles are seeded).

  await prisma.companyInfo.upsert({
    where: { id: 'company' },
    update: {},
    create: {
      id: 'company',
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
    },
  });

  const team = [
    {
      id: 'team-general-manager',
      fullName: 'General Manager',
      position: 'General Manager',
      section: 'LEADERSHIP' as const,
      order: 1,
      bio: 'Leads RIVET COMPANY’s operations, client relationships and strategy, making sure every supply and installation meets the standard our clients expect.',
      photo: u('photo-1560250097-0b93528c311a', 900),
    },
    {
      id: 'team-engineering-manager',
      fullName: 'Engineering Manager',
      position: 'Engineering Manager',
      section: 'ENGINEERING' as const,
      order: 1,
      bio: 'Responsible for technical specification, installation quality and engineering support across elevators, stone and building systems — from site survey to commissioning.',
      photo: u('photo-1507003211169-0a1dd7228f2d', 900),
    },
  ];

  for (const member of team) {
    await prisma.teamMember.upsert({
      where: { id: member.id },
      update: {},
      create: {
        ...member,
        status: ContentStatus.PUBLISHED,
      },
    });
  }

  await prisma.contactInfo.upsert({
    where: { id: 'contact' },
    update: {},
    create: {
      id: 'contact',
      address: 'Addis Ababa, Ethiopia',
      phone: '+251 00 000 0000',
      email: 'info@rivet.com',
      whatsapp: '+251000000000',
      facebook: 'https://facebook.com',
      linkedin: 'https://linkedin.com',
      telegram: 'https://t.me/rivet',
      mapLat: 9.0108,
      mapLng: 38.7613,
    },
  });

  await prisma.homePageContent.upsert({
    where: { id: 'home' },
    update: {},
    create: {
      id: 'home',
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
      gmName: 'General Manager',
      gmPosition: 'General Manager',
      gmPhoto: u('photo-1560250097-0b93528c311a', 900),
      gmMessage:
        'Every project we accept is a commitment to the specification, to the schedule and to the people who will use the building. Our role is to supply products that perform exactly as promised.',
      engName: 'Engineering Manager',
      engPosition: 'Engineering Manager',
      engPhoto: u('photo-1507003211169-0a1dd7228f2d', 900),
      engMessage:
        'A good installation starts with careful specification. We check every requirement before we order, so that what arrives on site fits the building, the budget and the timeline.',
    },
  });

  await prisma.homePageContent.updateMany({
    where: { id: 'home', gmName: null },
    data: {
      gmName: 'General Manager',
      gmPosition: 'General Manager',
      gmPhoto: u('photo-1560250097-0b93528c311a', 900),
      gmMessage:
        'Every project we accept is a commitment to the specification, to the schedule and to the people who will use the building. Our role is to supply products that perform exactly as promised.',
      engName: 'Engineering Manager',
      engPosition: 'Engineering Manager',
      engPhoto: u('photo-1507003211169-0a1dd7228f2d', 900),
      engMessage:
        'A good installation starts with careful specification. We check every requirement before we order, so that what arrives on site fits the building, the budget and the timeline.',
    },
  });

  const deadline = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };

  const vacancies = [
    {
      title: 'Elevator Installation Technician',
      slug: 'elevator-installation-technician',
      department: 'Engineering',
      location: 'Addis Ababa',
      employmentType: 'Full-time',
      deadline: deadline(45),
      status: 'OPEN' as const,
      description:
        '<p>RIVET COMPANY is hiring an Elevator Installation Technician to work on passenger and commercial lift installations across Ethiopia. You will read specifications, coordinate site work, and help deliver installations that match the drawings — not approximations.</p><p>The role sits between our engineering team and the project site. Precision, safety, and clear communication matter more than volume.</p>',
      requirements:
        '<ul><li>Hands-on experience with elevator or vertical-transport installation</li><li>Ability to read installation drawings and method statements</li><li>Willingness to travel to project sites in Ethiopia</li><li>Strong safety discipline on live construction sites</li></ul>',
    },
    {
      title: 'Sales Engineer — Elevators & Materials',
      slug: 'sales-engineer-elevators-materials',
      department: 'Commercial',
      location: 'Addis Ababa',
      employmentType: 'Full-time',
      deadline: deadline(30),
      status: 'OPEN' as const,
      description:
        '<p>A Sales Engineer at RIVET COMPANY translates project requirements into the right imported specification — elevators, granite, doors, and building materials — then prepares quotations the site team can actually execute.</p><p>You will work with architects, contractors, and developers, and you will be expected to know the catalog well enough to recommend rather than simply list.</p>',
      requirements:
        '<ul><li>Background in construction products, MEP, or technical sales</li><li>Comfort discussing specifications, lead times, and project constraints</li><li>Clear written English for quotations and follow-up</li><li>Based in Addis Ababa, with client visits as needed</li></ul>',
    },
  ];

  for (const v of vacancies) {
    await prisma.vacancy.upsert({
      where: { slug: v.slug },
      update: {},
      create: v,
    });
  }

  console.log('Seed complete. Admin:', email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
