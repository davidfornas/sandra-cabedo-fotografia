import type { ImageMetadata } from 'astro';

export interface GalleryImage {
  src: ImageMetadata;
  alt: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
}
