import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

async function main() {
  const elevators = await prisma.category.findUnique({
    where: { slug: 'elevators' },
  });

  if (!elevators) {
    console.error('Elevators category not found in DB!');
    return;
  }

  console.log('Found Elevators category:', elevators.id);

  const groups = [
    {
      name: 'Passenger Elevators',
      slug: 'passenger-elevators',
      description:
        'Comfortable, quiet passenger elevators for residential buildings, offices and mixed-use developments.',
      image: u('photo-1758448511533-e1502259fff6'),
      order: 1,
      items: [
        {
          name: 'Standard Passenger Elevators',
          slug: 'standard-passenger-elevators',
          description:
            'Reliable traction and machine-room-less systems engineered for mid-rise residential and commercial buildings.',
          image: u('photo-1541888946425-d81bb19240f5'),
          order: 1,
        },
        {
          name: 'Premium Passenger Elevators',
          slug: 'premium-passenger-elevators',
          description:
            'Luxury cabin finishes, whisper-quiet drives, and smart destination-dispatch technology for high-end developments.',
          image: u('photo-1486406146926-c627a92ad1ab'),
          order: 2,
        },
        {
          name: 'Panoramic Elevators',
          slug: 'panoramic-elevators',
          description:
            'Glass-walled observation elevators that transform vertical transport into an architectural centrepiece.',
          image: u('photo-1758518731135-6d9af1849b25'),
          order: 3,
        },
      ],
    },
    {
      name: 'Commercial Elevators',
      slug: 'commercial-elevators',
      description:
        'High-capacity elevators for offices, hotels and shopping centres, built for heavy daily traffic.',
      image: u('photo-1758448721205-8465cebc26af'),
      order: 2,
      items: [
        {
          name: 'Office Building Elevators',
          slug: 'office-building-elevators',
          description:
            'High-traffic, energy-efficient elevator systems designed for peak-hour performance in commercial towers.',
          image: u('photo-1497366754035-f200968a6e72'),
          order: 1,
        },
        {
          name: 'Hotel Elevators',
          slug: 'hotel-elevators',
          description:
            'Elegant, ultra-quiet elevators with customisable interiors that complement five-star hospitality experiences.',
          image: u('photo-1759038086454-5644437ccf4c'),
          order: 2,
        },
        {
          name: 'Shopping Mall Elevators',
          slug: 'shopping-mall-elevators',
          description:
            'High-capacity passenger elevators engineered for constant foot traffic in retail and mixed-use environments.',
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
            'Durable, back-of-house elevators built for staff, housekeeping, and light cargo movement.',
          image: u('photo-1719463814218-52e17f720e8a'),
          order: 1,
        },
        {
          name: 'Freight Elevators',
          slug: 'freight-elevators',
          description:
            'Heavy-platform lifts with reinforced cabins and wide door openings for palletised goods and equipment.',
          image: u('photo-1586528116311-ad8dd3c8310d'),
          order: 2,
        },
        {
          name: 'Heavy-Duty Elevators',
          slug: 'heavy-duty-elevators',
          description:
            'Industrial-grade lifts rated for extreme payloads — ideal for warehouses, factories, and construction sites.',
          image: u('photo-1758024264451-5cbfa9bee420'),
          order: 3,
        },
      ],
    },
  ];

  for (const group of groups) {
    const parent = await prisma.category.upsert({
      where: { slug: group.slug },
      update: {
        name: group.name,
        parentId: elevators.id,
        order: group.order,
      },
      create: {
        name: group.name,
        slug: group.slug,
        parentId: elevators.id,
        order: group.order,
        description: group.description,
        image: group.image,
      },
    });

    console.log(`Upserted group ${group.name} (${parent.id})`);

    for (const item of group.items) {
      const child = await prisma.category.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          parentId: parent.id,
          description: item.description,
          image: item.image,
          order: item.order,
        },
        create: {
          name: item.name,
          slug: item.slug,
          parentId: parent.id,
          description: item.description,
          image: item.image,
          order: item.order,
        },
      });
      console.log(`  Upserted subcategory ${item.name} (${child.id})`);
    }
  }

  console.log('Seeding of elevator groups and subcategories completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
