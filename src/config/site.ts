export interface NavItem {
  label: string;
  path: string;
}

export interface WhatsAppConfig {
  phone: string;
  message: string;
}

export interface InstagramConfig {
  profileUrl: string;
  handle: string;
}

export interface BrandConfig {
  name: string;
  tagline: string;
  locationLabel: string;
}

export interface SiteConfig {
  brand: BrandConfig;
  nav: NavItem[];
  whatsapp: WhatsAppConfig;
  instagram: InstagramConfig;
}

export const site: SiteConfig = {
  brand: {
    name: 'Sandra Cabedo Fotografía',
    tagline: 'Fotografía familiar · Castellón',
    locationLabel: 'Castellón y alrededores',
  },
  nav: [
    { label: 'Inicio', path: '/' },
    { label: 'Newborn', path: '/newborn/' },
    { label: 'Familia', path: '/familia/' },
    { label: 'Crecer juntos', path: '/crecer-juntos/' },
    { label: 'Embarazo', path: '/embarazo/' },
    { label: 'Sobre mí', path: '/sobre-mi/' },
    { label: 'Contacto', path: '/contacto/' },
  ],
  whatsapp: {
    phone: '604895320',
    message:
      'Hola Sandra, he visto tu web y me gustaría informarme sobre una sesión de fotos.',
  },
  instagram: {
    profileUrl: 'https://www.instagram.com/sandracabedofotografia/',
    handle: '@sandracabedofotografia',
  },
};
