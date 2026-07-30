/**
 * Central asset manifest.
 *
 * Components reference SEMANTIC KEYS here, never raw paths. When the client
 * supplies official assets (logo, product photos, hero video), swap the value
 * in this file only — layouts never change because containers use fixed
 * aspect ratios.
 *
 * Current values are high-quality royalty-free placeholders (Unsplash) that
 * reflect construction, architecture, elevators and premium materials,
 * color-graded to sit within the Navy/Gold palette.
 */

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const assets = {
  hero: {
    // Replace with client hero video/image sequence of flagship installations.
    image: u('photo-1487958449943-2429e8be8625', 2400),
    poster: u('photo-1487958449943-2429e8be8625', 1200),
  },
  intro: {
    image: u('photo-1503387762-592deb58ef4e', 1400),
  },
  categories: {
    elevators: u('photo-1486406146926-c627a92ad1ab'),
    lifts: u('photo-1621905251189-08b45d6a269e'),
    escalators: u('photo-1520333789090-1afc82db536a'),
    granite: u('photo-1615529182904-14819c35db37'),
    doors: u('photo-1600585154340-be6161a56a0c'),
    chairs: u('photo-1567016432779-094069958ea5'),
    furniture: u('photo-1524758631624-e2822e304c36'),
    sanitary: u('photo-1584622650111-993a426fbf0a'),
    materials: u('photo-1541888946425-d81bb19240f5'),
  },
  products: {
    p1: u('photo-1621905252507-b35492cc74b4'),
    p2: u('photo-1615529182904-14819c35db37'),
    p3: u('photo-1600585154340-be6161a56a0c'),
    p4: u('photo-1567016432779-094069958ea5'),
    p5: u('photo-1584622650111-993a426fbf0a'),
    p6: u('photo-1503387762-592deb58ef4e'),
  },
  news: {
    n1: u('photo-1541888946425-d81bb19240f5'),
    n2: u('photo-1503387762-592deb58ef4e'),
    n3: u('photo-1486406146926-c627a92ad1ab'),
  },
} as const;
