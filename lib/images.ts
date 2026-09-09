/**
 * Image registry.
 *
 * Content files reference an image by KEY ("roSystem"); this module is the only
 * place that knows what a key points at. Resolution happens once, in the content
 * seam — components and pages always receive a usable path, never a key.
 *
 * The registry holds two kinds of image, and PHOTOGRAPHIC_KEYS is the line
 * between them.
 *
 * The keys listed there are real equipment photographs. Everything else is a
 * locally generated brand gradient standing in for a photograph nobody has
 * taken yet — people, premises and interiors, for which there is no source.
 * Those are published as decoration with no alt text, because describing a
 * gradient as "a technician under a kitchen sink" is a false statement to a
 * screen reader and to Google Images alike.
 *
 * Nothing here is remote: a corporate firewall or an offline laptop must never
 * be able to break the site's images, and a placeholder CDN is not a dependency
 * worth having.
 *
 * TO USE YOUR OWN PHOTOGRAPHY: drop files into public/images/ with these exact
 * names (any web format — update the extension below), or point a value at a
 * full https:// URL and add that hostname to `images.remotePatterns` in
 * next.config.mjs, then add the key to PHOTOGRAPHIC_KEYS. Real photos of your
 * technicians and installations convert considerably better than any
 * placeholder.
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

  // Real equipment photography, composed from the supplier documentation in
  // Files/. See docs/EQUIPMENT-DATA.md for which document each came from and
  // which of them carry a manufacturer's mark on the product itself.
  villaPreFilter: '/images/villaPreFilter.jpg',
  filterElement: '/images/filterElement.jpg',
  villaHousings: '/images/villaHousings.jpg',
  underSinkRo: '/images/underSinkRo.jpg',
  tanklessRo: '/images/tanklessRo.jpg',
  modularRo: '/images/modularRo.jpg',
  disinfectionUnit: '/images/disinfectionUnit.jpg',
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

/**
 * Which registry keys hold a real photograph.
 *
 * The files currently in public/images/ are generated brand gradients — 1600x1000
 * blue washes produced by ffmpeg, around 16 KB each. `heroFamily.jpg` contains
 * no family. `technician.jpg` contains no technician.
 *
 * That matters for more than looks. Every call site passes descriptive alt text
 * ("Family pouring a glass of clean filtered drinking water in a modern UAE
 * kitchen"), and on a gradient that sentence is simply false — to a screen
 * reader, to Google Images, and to any AI system reading the page. It is the
 * same failure the claim registry exists to prevent, in a different medium, so
 * it is gated the same way: while a key is a placeholder its image is marked
 * decorative and asserts nothing. The gradient still renders; it just stops
 * claiming to be a photograph of this business.
 *
 * TO PUBLISH A REAL PHOTO: replace public/images/<key>.jpg with the photograph
 * and add the key here. The descriptive alt text is already written at every
 * call site and starts being used again with no other change.
 */
export const PHOTOGRAPHIC_KEYS: ReadonlySet<ImageKey> = new Set<ImageKey>([
  'villaPreFilter',
  'filterElement',
  'villaHousings',
  'underSinkRo',
  'tanklessRo',
  'modularRo',
  'disinfectionUnit',
])

/** Registry path -> key, so a literal `src` can be recognised as a placeholder. */
const PATH_TO_KEY: ReadonlyMap<string, ImageKey> = new Map(
  (Object.entries(images) as [ImageKey, string][]).map(([key, path]) => [path, key]),
)

/**
 * Does this `src` point at a real photograph?
 *
 * Anything the registry does not know about — an imported asset, a remote URL,
 * a path a CMS supplied later — is treated as deliberate and keeps its alt
 * text. Only the known placeholder files are demoted to decoration.
 */
export function isPhotograph(src: unknown): boolean {
  if (typeof src !== 'string') return true
  const key = PATH_TO_KEY.get(src)
  return key === undefined || PHOTOGRAPHIC_KEYS.has(key)
}

/** Tiny blur placeholder shown while an image decodes. */
export const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4IDgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNkYmVlZmUiLz48L3N2Zz4='
