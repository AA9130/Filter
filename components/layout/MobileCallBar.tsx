import { Phone, MessageCircle, CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import { site, whatsappLink } from '@/lib/site'

/**
 * Sticky bottom action bar — mobile only. Keeps the two conversion actions
 * within thumb reach on every screen and at every scroll position.
 * (`body` carries matching bottom padding in globals.css.)
 */
export default function MobileCallBar() {
  return (
    <div className="material-panel fixed bottom-0 left-0 right-0 z-50 border-t border-white/60 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_-12px_rgb(16_42_78/0.25)] md:hidden">
      <div className="grid grid-cols-3 gap-2 px-3 py-2.5">
        <a
          href={site.phone.href}
          data-analytics="call-click-mobilebar"
          className="press flex flex-col items-center gap-1 rounded-xl bg-cta-500 py-2.5 text-white active:bg-cta-600"
        >
          <Phone className="h-5 w-5" />
          <span className="text-[0.6875rem] font-bold uppercase tracking-wide">Call Now</span>
        </a>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noopener noreferrer"
          data-analytics="whatsapp-click-mobilebar"
          className="press flex flex-col items-center gap-1 rounded-xl bg-whatsapp py-2.5 text-white active:bg-whatsapp-dark"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-[0.6875rem] font-bold uppercase tracking-wide">WhatsApp</span>
        </a>
        <Link
          href="/contact#quote"
          className="press flex flex-col items-center gap-1 rounded-xl border border-brand-200 bg-brand-50 py-2.5 text-brand-800 active:bg-brand-100"
        >
          <CalendarCheck className="h-5 w-5" />
          <span className="text-[0.6875rem] font-bold uppercase tracking-wide">Free Demo</span>
        </Link>
      </div>
    </div>
  )
}
