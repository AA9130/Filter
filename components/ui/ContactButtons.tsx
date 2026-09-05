import { Phone, MessageCircle } from 'lucide-react'
import { site, whatsappLink } from '@/lib/site'
import { cn } from '@/lib/utils'

type Props = {
  /** Custom pre-filled WhatsApp message so you can attribute the lead source. */
  whatsappMessage?: string
  size?: 'md' | 'lg'
  className?: string
  callLabel?: string
  whatsappLabel?: string
}

/**
 * The primary conversion pair, reused everywhere. Both links work on desktop
 * (WhatsApp Web / softphone) and mobile (native dialer / WhatsApp app).
 */
export default function ContactButtons({
  whatsappMessage,
  size = 'md',
  className,
  callLabel,
  whatsappLabel = 'WhatsApp Us',
}: Props) {
  const big = size === 'lg'

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', className)}>
      <a
        href={site.phone.href}
        data-analytics="call-click"
        aria-label={`Call ${site.name} on ${site.phone.display}`}
        className={cn('btn-cta group', big && 'btn-lg')}
      >
        <Phone className={cn('transition-transform group-hover:rotate-12', big ? 'h-5 w-5' : 'h-4 w-4')} />
        {callLabel ?? (
          <span>
            Call Now <span className="hidden sm:inline">· {site.phone.display}</span>
          </span>
        )}
      </a>

      <a
        href={whatsappLink(whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        data-analytics="whatsapp-click"
        aria-label="Chat with us on WhatsApp"
        className={cn('btn-whatsapp group', big && 'btn-lg')}
      >
        <MessageCircle
          className={cn('transition-transform group-hover:scale-110', big ? 'h-5 w-5' : 'h-4 w-4')}
        />
        {whatsappLabel}
      </a>
    </div>
  )
}
