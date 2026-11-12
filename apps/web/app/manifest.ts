import type { MetadataRoute } from 'next';
import { DEFAULT_DESCRIPTION, SITE_NAME } from '@/lib/seo';

/**
 * Web app manifest: the icons Android and installed-app shortcuts use.
 * Browser-tab icons come from the app/ file conventions (favicon.ico,
 * icon1.png = 16 px, icon2.png = 32 px, apple-icon.png = 180 px).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'RIVET',
    description: DEFAULT_DESCRIPTION,
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
