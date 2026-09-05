import Reveal from './Reveal'
import { cn } from '@/lib/utils'

type Props = {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  className?: string
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  tone = 'light',
  className,
}: Props) {
  const dark = tone === 'dark'

  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <span className={dark ? 'eyebrow-dark' : 'eyebrow'}>{eyebrow}</span>
        </Reveal>
      )}
      <Reveal delay={0.06}>
        <h2
          className={cn(
            'mt-5 text-3xl leading-[1.15] sm:text-4xl lg:text-[2.75rem]',
            dark && 'text-white',
          )}
        >
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal delay={0.12}>
          <p
            className={cn(
              'mt-4 text-base leading-relaxed sm:text-lg',
              dark ? 'text-brand-100/85' : 'text-ink-soft',
            )}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  )
}
