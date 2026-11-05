import { PrismaClient, ContentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { resolveSeedAdmin } from '../src/bootstrap/seed-admin.js';
import {
  u,
  categories,
  elevatorGroups,
  services,
  COMPANY_INFO,
  HOME_CONTENT,
  OFFICE_ADDRESS,
  OFFICE_COORDS,
} from './seed-content.js';

const prisma = new PrismaClient();

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
      ...COMPANY_INFO,
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
      address: OFFICE_ADDRESS,
      phone: '+251 00 000 0000',
      email: 'info@rivet.com',
      whatsapp: '+251000000000',
      facebook: 'https://facebook.com',
      linkedin: 'https://linkedin.com',
      telegram: 'https://t.me/rivet',
      mapLat: OFFICE_COORDS.lat,
      mapLng: OFFICE_COORDS.lng,
    },
  });

  await prisma.homePageContent.upsert({
    where: { id: 'home' },
    update: {},
    create: {
      id: 'home',
      ...HOME_CONTENT,
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
