'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { Droplets } from 'lucide-react'
import { BLUR_DATA_URL, isPhotograph } from '@/lib/images'
import { cn } from '@/lib/utils'

type PhotoProps = Omit<ImageProps, 'placeholder' | 'blurDataURL' | 'onError'>

/**
 * next/image with a blur-up placeholder, a graceful fallback, and honest alt text.
 *
 * Two things happen here that call sites should not have to think about.
 *
 * ALT TEXT. Call sites pass the alt text the *real* photograph deserves. Until
 * that photograph exists, `public/images/` holds a generated gradient, and
 * describing a gradient as "a technician servicing a reverse osmosis purifier"
 * is a false statement to a screen reader and to Google Images alike. So a
 * placeholder renders as decoration with no alt text; the sentence is kept at
 * the call site, ready, and switches back on the moment the key is listed in
 * PHOTOGRAPHIC_KEYS. See lib/images.ts.
 *
 * FAILURE. If a file 404s or the visitor is on a restricted network we render
 * an on-brand gradient panel rather than a broken image, so the layout never
 * collapses.
 */
export default function Photo({ className, alt, fill, src, ...rest }: PhotoProps) {
  const [failed, setFailed] = useState(false)

  // Empty alt = decorative. Assistive technology skips it instead of being
  // told about a photograph that is not there.
  const description = isPhotograph(src) ? alt : ''

  if (failed) {
    return (
      <div
        // A described image is still an image to a screen reader even when the
        // file is missing; an undescribed one is pure decoration and is skipped.
        role={description ? 'img' : 'presentation'}
        aria-label={description || undefined}
        className={cn(
          'grid place-items-center bg-gradient-to-br from-brand-200 via-aqua-200 to-brand-300',
          fill && 'absolute inset-0 h-full w-full',
          className,
        )}
      >
        <Droplets className="h-10 w-10 text-white/70" aria-hidden="true" />
      </div>
    )
  }

  return (
    <Image
      alt={description}
      src={src}
      fill={fill}
      className={className}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      onError={() => setFailed(true)}
      {...rest}
    />
  )
}
