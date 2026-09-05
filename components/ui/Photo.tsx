'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { Droplets } from 'lucide-react'
import { BLUR_DATA_URL } from '@/lib/images'
import { cn } from '@/lib/utils'

type PhotoProps = Omit<ImageProps, 'placeholder' | 'blurDataURL' | 'onError'>

/**
 * next/image with a blur-up placeholder and a graceful fallback.
 *
 * The starter ships Unsplash placeholder URLs. If one of them ever fails to
 * load — the CDN is unreachable, the photo was removed, or the visitor is on a
 * restricted network — we render an on-brand gradient panel instead of a broken
 * image, so the layout never collapses. Replace the URLs in `lib/images.ts`
 * with your own photography and this fallback simply stops being used.
 */
export default function Photo({ className, alt, fill, ...rest }: PhotoProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
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
      alt={alt}
      fill={fill}
      className={className}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      onError={() => setFailed(true)}
      {...rest}
    />
  )
}
