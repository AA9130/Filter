/**
 * Image registry.
 *
 * Content files reference an image by KEY ("roSystem"); this module is the only
 * place that knows what a key points at. Resolution happens once, in the content
 * seam — components and pages always receive a usable path, never a key.
 *
 * These are locally generated brand placeholders, deliberately not remote:
 * a corporate firewall or an offline laptop must never be able to break the
 * site's images, and a placeholder CDN is not a dependency worth having.
 *
 * TO USE YOUR OWN PHOTOGRAPHY: drop files into public/images/ with these exact
 * names (any web format — update the extension below), or point a value at a
 * full https:// URL and add that hostname to `images.remotePatterns` in
 * next.config.mjs. Real photos of your technicians and installations convert
 * considerably better than any placeholder.
 */
export const images = {
  heroFamily: '/images/heroFamily.jpg',
  heroGlass: '/images/heroGlass.jpg',
  technician: '/images/technician.jpg',
  kitchenTap: '/images/kitchenTap.jpg',
  cleanWater: '/images/cleanWater.jpg',
  plumbingWork: '/images/plumbingWork.jpg',
  waterDrop: '/images/waterDrop.jpg',
  dubaiSkyline: '/images/dubaiSkyline.jpg',
  roSystem: '/images/roSystem.jpg',
  wholeHouse: '/images/wholeHouse.jpg',
  softener: '/images/softener.jpg',
  uvSystem: '/images/uvSystem.jpg',
  filterCartridge: '/images/filterCartridge.jpg',
  commercial: '/images/commercial.jpg',
  teamAbout: '/images/teamAbout.jpg',
  labTest: '/images/labTest.jpg',
} as const

export type ImageKey = keyof typeof images

export function isImageKey(value: unknown): value is ImageKey {
  return typeof value === 'string' && value in images
}

/**
 * Key → path. Accepts an already-resolved path or absolute URL unchanged, so
 * calling it twice is harmless and a CMS can return real URLs later.
 */
export function resolveImage(value: string, fallback: ImageKey = 'technician'): string {
  if (value.startsWith('/') || value.startsWith('http')) return value
  return isImageKey(value) ? images[value] : images[fallback]
}

/** Tiny blur placeholder shown while an image decodes. */
export const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4IDgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNkYmVlZmUiLz48L3N2Zz4='
