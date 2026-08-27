export const companyNavLinks = [
  { href: '/company', label: 'About', exact: true },
  { href: '/company/certificate-portfolio', label: 'Certificate & Portfolio' },
  { href: '/company/team', label: 'Meet Our Team' },
  { href: '/company/gallery', label: 'Gallery' },
] as const;

export function isCompanyPath(pathname: string) {
  return pathname === '/company' || pathname.startsWith('/company/');
}
