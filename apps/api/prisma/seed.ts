import { PrismaClient, ContentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const prisma = new PrismaClient();

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

type FaqItem = { question: string; answer: string };

const categoryFaqs: Record<string, FaqItem[]> = {
  elevators: [
    {
      question: 'Do you supply elevators for commercial buildings in Ethiopia?',
      answer:
        'Yes. RIVET imports and supplies passenger and commercial elevators for projects across Ethiopia, with guidance from specification through quotation.',
    },
    {
      question: 'Can I request a quotation for a specific elevator model?',
      answer:
        'Absolutely. Use Request a Quotation on any product page or contact our team with building type, capacity, and floor count for a tailored quote.',
    },
  ],
  granite: [
    {
      question: 'Is your granite suitable for residential and commercial interiors?',
      answer:
        'Yes. We supply premium granite slabs for cladding, flooring, and counters in homes and commercial spaces across Ethiopia.',
    },
    {
      question: 'Can granite be cut to project specifications?',
      answer:
        'We offer cut-to-size options based on architectural drawings. Share dimensions and finish preferences when requesting a quotation.',
    },
  ],
  doors: [
    {
      question: 'What types of doors does RIVET supply in Ethiopia?',
      answer:
        'We supply architectural and automatic door systems for lobbies, offices, and residential entries — request a quotation for the right specification.',
    },
  ],
  'office-furniture': [
    {
      question: 'Do you supply office furniture in Addis Ababa?',
      answer:
        'Yes. RIVET supplies desks, seating, and office systems for commercial fit-outs in Addis Ababa and across Ethiopia.',
    },
  ],
  chairs: [
    {
      question: 'Are your office chairs suitable for executive and open-plan spaces?',
      answer:
        'Our seating range covers executive lounge chairs and workplace seating. Request a quotation with quantity and preferred finishes.',
    },
  ],
};

const categories = [
  {
    name: 'Elevators',
    slug: 'elevators',
    order: 1,
    image: u('photo-1486406146926-c627a92ad1ab'),
    description: 'Premium passenger and commercial elevators for projects in Ethiopia.',
    faqs: categoryFaqs.elevators,
  },
  {
    name: 'Passenger Lifts',
    slug: 'passenger-lifts',
    order: 2,
    image: u('photo-1621905251189-08b45d6a269e'),
    description: 'Passenger lift systems engineered for comfort, safety, and efficiency.',
  },
  {
    name: 'Escalators',
    slug: 'escalators',
    order: 3,
    image: u('photo-1520333789090-1afc82db536a'),
    description: 'Commercial escalators for retail, transit, and public buildings.',
  },
  {
    name: 'Granite',
    slug: 'granite',
    order: 4,
    image: u('photo-1615529182904-14819c35db37'),
    description: 'Premium granite and stone finishes for architectural interiors in Ethiopia.',
    faqs: categoryFaqs.granite,
  },
  {
    name: 'Doors',
    slug: 'doors',
    order: 5,
    image: u('photo-1600585154340-be6161a56a0c'),
    description: 'Architectural and automatic door systems for commercial and residential projects.',
    faqs: categoryFaqs.doors,
  },
  {
    name: 'Chairs',
    slug: 'chairs',
    order: 6,
    image: u('photo-1567016432779-094069958ea5'),
    description: 'Ergonomic and executive seating for modern workplaces.',
    faqs: categoryFaqs.chairs,
  },
  {
    name: 'Office Furniture',
    slug: 'office-furniture',
    order: 7,
    image: u('photo-1524758631624-e2822e304c36'),
    description: 'Office furniture supplier solutions for commercial fit-outs in Addis Ababa.',
    faqs: categoryFaqs['office-furniture'],
  },
  {
    name: 'Sanitary Goods',
    slug: 'sanitary-goods',
    order: 8,
    image: u('photo-1584622650111-993a426fbf0a'),
    description: 'Premium sanitary ware and bathroom fittings for residential and hospitality projects.',
  },
  {
    name: 'Building Materials',
    slug: 'building-materials',
    order: 9,
    image: u('photo-1541888946425-d81bb19240f5'),
    description: 'Fine building materials including structural glass and architectural finishes.',
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
    shortDescription: 'Machine-room-less traction system with brushed-steel cabin finishing.',
    description:
      'The Meridian is a machine-room-less passenger elevator engineered for premium residential and commercial towers, combining energy-efficient gearless traction with a refined brushed-steel cabin.',
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
    shortDescription: 'Full-bleed veined granite, precision-cut for architectural surfaces.',
    description:
      'Premium full-slab granite with deep obsidian veining, precision-cut and polished for countertops, cladding and flooring in landmark interiors.',
    brand: 'RIVET Stone',
    countryOfOrigin: 'Italy',
    specs: [
      { label: 'Thickness', value: '20 mm / 30 mm' },
      { label: 'Finish', value: 'Polished / Honed' },
    ],
    features: ['Sealed surface', 'Custom cut-to-size'],
    featured: true,
    images: [u('photo-1615529182904-14819c35db37'), u('photo-1615971679758-627f40327060')],
  },
  {
    name: 'Atrium Glass Door System',
    slug: 'atrium-glass-door',
    categorySlug: 'doors',
    shortDescription: 'Frameless tempered glass entry with concealed automatic drive.',
    description:
      'Atrium is a frameless tempered-glass door system with a concealed automatic drive, designed for lobbies and showrooms that demand an uninterrupted visual plane.',
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
    shortDescription: 'Ergonomic seating in full-grain leather and cast aluminium.',
    description:
      'Sculpted lounge seating finished in full-grain leather over a cast-aluminium frame — designed for executive suites and private lounges.',
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
    shortDescription: 'Rimless ceramic ware with matte-gold precision fittings.',
    description:
      'A complete rimless ceramic sanitary suite paired with matte-gold fittings — quiet luxury for premium residential baths.',
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
    shortDescription: 'Commercial escalator with energy-saving VVVF drive.',
    description:
      'Horizon escalators deliver reliable vertical circulation for retail and transit environments, with regenerative VVVF drives and modular step construction.',
    brand: 'RIVET Vertical',
    countryOfOrigin: 'Germany',
    specs: [
      { label: 'Inclination', value: '30° / 35°' },
      { label: 'Speed', value: '0.5 m/s' },
    ],
    features: ['VVVF drive', 'LED lighting'],
    featured: false,
    images: [u('photo-1520333789090-1afc82db536a')],
  },
  {
    name: 'Nova Office Desk System',
    slug: 'nova-office-desk',
    categorySlug: 'office-furniture',
    shortDescription: 'Modular executive desk in oak veneer and steel.',
    description:
      'A modular desk system combining oak veneer surfaces with a powder-coated steel understructure — scalable from private offices to open-plan suites.',
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
    shortDescription: 'Laminated structural glass for façades and canopies.',
    description:
      'Atlas laminated structural glass panels engineered for façade glazing, canopies and balustrades — clear, low-iron, or tinted options.',
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
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@rivet.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
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
        description: c.description,
        faqs: c.faqs ?? undefined,
      },
      create: c,
    });
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
        'Sourcing certified premium products from world-class manufacturers. We manage logistics, customs, and quality verification end to end.',
      order: 1,
      faqs: [
        {
          question: 'Which product categories can RIVET import to Ethiopia?',
          answer:
            'We import elevators, granite, doors, sanitary ware, office furniture, and fine building materials — with end-to-end logistics and quality checks.',
        },
        {
          question: 'How do I start an import quotation?',
          answer:
            'Share product interest, quantities, and destination site details via Request a Quotation. Our team responds with sourcing options and timelines.',
        },
      ],
    },
    {
      title: 'Elevator Installation',
      slug: 'elevator-installation',
      icon: 'Wrench',
      narrative:
        'Precision installation engineered to international safety standards — from shaft preparation through commissioning and handover.',
      order: 2,
      faqs: [
        {
          question: 'Do you install elevators for new builds and renovations?',
          answer:
            'Yes. Our installation teams support new construction and retrofit projects across Ethiopia, following manufacturer and safety standards.',
        },
      ],
    },
    {
      title: 'Elevator Maintenance',
      slug: 'elevator-maintenance',
      icon: 'ShieldCheck',
      narrative:
        'Preventive maintenance programs that keep vertical transportation systems flawless and compliant.',
      order: 3,
      faqs: [
        {
          question: 'Can RIVET maintain elevators installed by other suppliers?',
          answer:
            'In many cases yes. Contact us with equipment details so we can confirm compatibility and propose a maintenance plan.',
        },
      ],
    },
    {
      title: 'Granite Supply',
      slug: 'granite-supply',
      icon: 'Layers',
      narrative:
        'Full-slab granite supply cut to architectural specification, with finishing options for cladding, flooring and counters.',
      order: 4,
      faqs: [
        {
          question: 'Do you supply granite for projects in Addis Ababa?',
          answer:
            'Yes. We supply premium granite and interior finishing stone for residential and commercial projects in Addis Ababa and nationwide.',
        },
      ],
    },
    {
      title: 'Building Material Supply',
      slug: 'building-material-supply',
      icon: 'Package',
      narrative:
        'Reliable supply of fine building materials at project scale — glass, stone, fittings and structural finishes.',
      order: 5,
    },
    {
      title: 'Construction Consultation',
      slug: 'construction-consultation',
      icon: 'Compass',
      narrative:
        'Engineering guidance from concept through commissioning, ensuring the right product for every detail.',
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

  const news = [
    {
      title: 'RIVET Opens Its Flagship Architectural Showroom',
      slug: 'rivet-flagship-showroom-opening',
      excerpt: 'A marble-floored gallery bringing imported engineering to the city center.',
      body: '<p>River Company (RIVET) has opened its flagship architectural showroom, a marble-floored gallery presenting the full portfolio of imported elevators, granite, doors and fine building materials.</p><p>Visitors can experience cabin finishes, stone samples and door systems in a curated environment designed to mirror a luxury retail gallery.</p>',
      category: 'Company',
      coverImage: u('photo-1541888946425-d81bb19240f5'),
    },
    {
      title: 'Introducing Next-Generation Traction Elevators',
      slug: 'new-generation-traction-elevators',
      excerpt: 'Energy-efficient drive systems now available across our portfolio.',
      body: '<p>RIVET Vertical has expanded its passenger elevator line with regenerative gearless traction systems that reduce energy consumption while delivering a quieter, smoother ride.</p>',
      category: 'Products',
      coverImage: u('photo-1503387762-592deb58ef4e'),
    },
    {
      title: 'Expanding Our Premium Granite Partnerships',
      slug: 'granite-partnership-expansion',
      excerpt: 'New quarry partnerships widen our selection of fine natural stone.',
      body: '<p>New quarry partnerships across Italy and Brazil expand RIVET Stone’s selection of full-slab granite for architectural cladding, flooring and counters.</p>',
      category: 'Supply',
      coverImage: u('photo-1486406146926-c627a92ad1ab'),
    },
  ];

  for (const n of news) {
    await prisma.newsArticle.upsert({
      where: { slug: n.slug },
      update: {
        title: n.title,
        excerpt: n.excerpt,
        body: n.body,
        category: n.category,
        coverImage: n.coverImage,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      create: {
        ...n,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  await prisma.companyInfo.upsert({
    where: { id: 'company' },
    update: {},
    create: {
      id: 'company',
      history:
        'Founded nearly two decades ago, River Company has grown into a leading importer of premium construction and architectural products — elevators, granite, doors, sanitary ware, furniture and fine building materials.',
      vision: "To be the region's most trusted name in imported engineering excellence.",
      mission: 'To supply and install world-class products with precision, reliability and care.',
      coreValues: ['Precision', 'Integrity', 'Craftsmanship', 'Reliability'],
      timeline: [
        { year: '2008', title: 'Founded', description: 'River Company established as a premium importer.' },
        { year: '2015', title: 'Elevator Division', description: 'Launched dedicated vertical-transportation division.' },
        { year: '2020', title: 'Regional Expansion', description: 'Extended supply partnerships across East Africa.' },
        { year: '2026', title: 'Flagship Showroom', description: 'Opened the flagship architectural gallery.' },
      ],
      achievements: ['640+ projects completed', '1200+ products imported', '18+ years of excellence'],
      certifications: ['ISO 9001', 'CE Certified Partners'],
    },
  });

  const team = [
    {
      id: 'team-general-manager',
      fullName: 'General Manager',
      position: 'General Manager',
      section: 'LEADERSHIP' as const,
      order: 1,
      bio: 'Leads River Company’s operations, client relationships, and long-term strategy — ensuring every import, installation, and partnership meets the standard our projects demand.',
      photo: u('photo-1560250097-0b93528c311a', 900),
    },
    {
      id: 'team-engineering-manager',
      fullName: 'Engineering Manager',
      position: 'Engineering Manager',
      section: 'ENGINEERING' as const,
      order: 1,
      bio: 'Directs technical specification, installation quality, and engineering support across elevators, stone, and architectural systems — from site survey through commissioning.',
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
      eyebrow: 'River Company · Premium Imports',
      headline: 'Engineering the architecture',
      headlineAccent: 'of ambition.',
      subheadline:
        'Elevators, granite, doors and fine building materials — imported with precision, installed with mastery.',
      heroImage: u('photo-1487958449943-2429e8be8625', 2400),
      introEyebrow: 'The River Company Standard',
      introTitle: 'A flagship of imported precision.',
      introBody:
        "For nearly two decades, RIVET has brought the world's finest construction and architectural products to landmark projects — from machine-room-less elevators to full-slab granite and engineered building materials.",
      introBodySecondary:
        'We operate the way we build: with restraint, precision, and an obsession for the details that others overlook.',
      introImage: u('photo-1503387762-592deb58ef4e', 1400),
      gmName: 'General Manager',
      gmPosition: 'General Manager',
      gmPhoto: u('photo-1560250097-0b93528c311a', 900),
      gmMessage:
        'Every project we take on is a commitment — to specification, to craft, and to the people who will live and work in the spaces we help build.',
      engName: 'Engineering Manager',
      engPosition: 'Engineering Manager',
      engPhoto: u('photo-1507003211169-0a1dd7228f2d', 900),
      engMessage:
        'Engineering is the quiet work behind a confident installation. We specify with care so that what arrives on site performs as promised.',
    },
  });

  await prisma.homePageContent.updateMany({
    where: { id: 'home', gmName: null },
    data: {
      gmName: 'General Manager',
      gmPosition: 'General Manager',
      gmPhoto: u('photo-1560250097-0b93528c311a', 900),
      gmMessage:
        'Every project we take on is a commitment — to specification, to craft, and to the people who will live and work in the spaces we help build.',
      engName: 'Engineering Manager',
      engPosition: 'Engineering Manager',
      engPhoto: u('photo-1507003211169-0a1dd7228f2d', 900),
      engMessage:
        'Engineering is the quiet work behind a confident installation. We specify with care so that what arrives on site performs as promised.',
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
        '<p>RIVET is hiring an Elevator Installation Technician to work on passenger and commercial lift installations across Ethiopia. You will read specifications, coordinate site work, and help deliver installations that match the drawings — not approximations.</p><p>The role sits between our engineering team and the project site. Precision, safety, and clear communication matter more than volume.</p>',
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
        '<p>A Sales Engineer at RIVET translates project requirements into the right imported specification — elevators, granite, doors, and building materials — then prepares quotations the site team can actually execute.</p><p>You will work with architects, contractors, and developers, and you will be expected to know the catalog well enough to recommend rather than simply list.</p>',
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
