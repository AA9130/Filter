import {
  Wrench,
  Droplets,
  Home,
  Waves,
  Sun,
  Filter,
  ShieldCheck,
  LifeBuoy,
  Truck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { images } from './images'

/* -------------------------------------------------------------------------- */
/*  SERVICES                                                                  */
/* -------------------------------------------------------------------------- */

export type Service = {
  slug: string
  icon: LucideIcon
  title: string
  short: string
  description: string
  bullets: string[]
  highlight?: string
}

export const services: Service[] = [
  {
    slug: 'water-filter-installation',
    icon: Wrench,
    title: 'Water Filter Installation',
    short: 'Residential & commercial installation done right the first time.',
    description:
      'From a single under-sink cartridge unit in a Dubai Marina apartment to a full plant room for a Sharjah labour camp, our certified technicians size, plumb and commission your system to UAE plumbing code.',
    bullets: [
      'Free on-site water assessment (TDS + hardness test)',
      'Under-sink, countertop, wall-mounted and plant-room installs',
      'Neat, leak-tested plumbing with brand-new fittings',
      'Same-day installation available across most areas',
    ],
    highlight: 'Most popular',
  },
  {
    slug: 'ro-water-purifiers',
    icon: Droplets,
    title: 'RO Water Purifier Systems',
    short: '5, 6 & 7-stage reverse osmosis with mineral & alkaline options.',
    description:
      'Reverse osmosis removes up to 99% of dissolved solids — the single most effective answer to the high TDS of UAE tap and tanker water. We supply, install and service domestic and commercial RO systems.',
    bullets: [
      '5 / 6 / 7-stage domestic RO with mineral cartridge',
      'Commercial RO plants from 100 GPD to 10,000 GPD',
      'Pressure-boost pumps and storage tank integration',
      'TDS reading shown to you before and after',
    ],
  },
  {
    slug: 'whole-house-filtration',
    icon: Home,
    title: 'Whole House Filtration',
    short: 'Protect every tap, shower and appliance in the property.',
    description:
      'A point-of-entry system treats the water for the entire villa or building — no more chlorine smell in the shower, no more scale destroying your geyser, washing machine and taps.',
    bullets: [
      'Sediment, carbon and multimedia stages',
      'Villa, townhouse and apartment-block sizing',
      'Roof-tank and pump-room installation',
      'Reduces chlorine, sand, rust and bad odour',
    ],
  },
  {
    slug: 'water-softeners',
    icon: Waves,
    title: 'Water Softeners',
    short: 'End limescale, dry skin and appliance damage for good.',
    description:
      'UAE water is notoriously hard. Our automatic ion-exchange softeners cut hardness at the source, protecting your plumbing and making a visible difference to skin, hair and laundry.',
    bullets: [
      'Automatic timer & metered regeneration valves',
      'Correct resin volume calculated for your usage',
      'Salt supply and refill scheduling available',
      'Noticeably softer water within hours',
    ],
  },
  {
    slug: 'uv-sterilizer-systems',
    icon: Sun,
    title: 'UV / Ultraviolet Systems',
    short: 'Chemical-free sterilisation of bacteria and viruses.',
    description:
      'A UV chamber neutralises 99.99% of bacteria, viruses and cysts without adding a single chemical or changing the taste of your water. Ideal alongside RO or whole-house filtration.',
    bullets: [
      'Stainless steel chambers, 6 GPM to 60 GPM',
      'Annual lamp and quartz sleeve replacement',
      'Lamp-failure alarm options',
      'Perfect for villas on tanker-fed supply',
    ],
  },
  {
    slug: 'filter-replacement',
    icon: Filter,
    title: 'Filter Replacement & Spares',
    short: 'Genuine cartridges, membranes, pumps and fittings in stock.',
    description:
      'Filters have a life. Replacing them on time is the difference between clean water and a breeding ground. We stock genuine consumables for all major brands and fit them in under an hour.',
    bullets: [
      'Sediment, carbon block, CTO, GAC & mineral cartridges',
      'RO membranes, booster pumps, solenoids & housings',
      'All major brands supported',
      'Free reminder before your next due date',
    ],
  },
  {
    slug: 'amc-annual-maintenance',
    icon: ShieldCheck,
    title: 'Annual Maintenance Contracts',
    short: 'Fixed-price yearly plans — never think about it again.',
    description:
      'Our AMC plans bundle scheduled filter changes, sanitisation, priority call-outs and labour into one predictable annual fee. Most customers save 30–40% versus paying per visit.',
    bullets: [
      'Scheduled visits — we call you, not the other way around',
      'Labour, sanitisation and priority response included',
      'Residential, villa and commercial tiers',
      'Transferable if you move within the UAE',
    ],
    highlight: 'Best value',
  },
  {
    slug: 'repair-troubleshooting',
    icon: LifeBuoy,
    title: 'Repair & Troubleshooting',
    short: '24-hour emergency support for leaks and breakdowns.',
    description:
      'Leaking housing? No water flow? Strange taste or a humming pump that will not stop? Call us any hour — our emergency team diagnoses and repairs on the spot with parts on the van.',
    bullets: [
      'Leaks, low flow, noisy pumps, bad taste & odour',
      'Membrane, pump, valve and housing replacement',
      'Electrical and pressure-switch faults',
      'Transparent quote before any work starts',
    ],
    highlight: '24 hours',
  },
  {
    slug: 'system-relocation',
    icon: Truck,
    title: 'System Relocation',
    short: 'Moving home? Your filtration comes with you.',
    description:
      'We safely uninstall, transport, re-plumb and re-commission your existing system at your new address anywhere in the UAE — including flushing, sanitising and a full performance check.',
    bullets: [
      'Careful uninstall, capping and safe transport',
      'Re-installation and leak testing at the new property',
      'Full sanitisation and fresh cartridge option',
      'Emirate-to-emirate moves handled',
    ],
  },
  {
    slug: 'free-demo-consultation',
    icon: Sparkles,
    title: 'Free Demo & Consultation',
    short: 'See your own water tested before you spend a dirham.',
    description:
      'Book a no-obligation home or office visit. We test your TDS and hardness in front of you, explain the results in plain language and recommend only what you actually need.',
    bullets: [
      'Live TDS & hardness test at your property',
      'Honest recommendation — no pressure selling',
      'Written quotation in AED, valid 30 days',
      'Completely free, all 7 Emirates',
    ],
    highlight: 'Free',
  },
]

/* -------------------------------------------------------------------------- */
/*  WHY CHOOSE US                                                             */
/* -------------------------------------------------------------------------- */

export const reasons = [
  {
    icon: 'MapPin',
    title: 'UAE-Wide Coverage',
    body: 'Fully mobile teams operating in all 7 Emirates — from Dubai Marina to Fujairah city, we come to you.',
  },
  {
    icon: 'Clock',
    title: '24-Hour Emergency Support',
    body: 'Burst housing at midnight? Our emergency line is answered around the clock, every day of the year.',
  },
  {
    icon: 'BadgeCheck',
    title: 'Certified Technicians',
    body: 'Trained, background-checked, uniformed technicians who work to Dubai Municipality plumbing standards.',
  },
  {
    icon: 'PackageCheck',
    title: 'Genuine Spare Parts',
    body: 'Only original cartridges, membranes and pumps — never grey-market copies that fail in three months.',
  },
  {
    icon: 'Wallet',
    title: 'Affordable AMC Plans',
    body: 'Transparent annual contracts starting from AED 349 with no hidden labour or call-out charges.',
  },
  {
    icon: 'Zap',
    title: 'Same-Day Service',
    body: 'Call before 2 PM and we will usually be at your door the same day, parts already on the van.',
  },
] as const

/* -------------------------------------------------------------------------- */
/*  SERVICE AREAS                                                             */
/* -------------------------------------------------------------------------- */

export const emirates = [
  {
    name: 'Dubai',
    areas: ['Dubai Marina', 'JVC', 'Business Bay', 'Deira', 'Al Barsha', 'Mirdif', 'Jumeirah'],
    response: 'Same-day',
  },
  {
    name: 'Abu Dhabi',
    areas: ['Khalifa City', 'Al Reem Island', 'Mussafah', 'Yas Island', 'Al Bateen', 'Al Raha'],
    response: 'Same-day',
  },
  {
    name: 'Sharjah',
    areas: ['Al Nahda', 'Muweilah', 'Al Majaz', 'Al Khan', 'University City', 'Al Qasimia'],
    response: 'Same-day',
  },
  {
    name: 'Ajman',
    areas: ['Al Nuaimiya', 'Ajman Corniche', 'Al Rashidiya', 'Al Jurf', 'Emirates City'],
    response: 'Within 24 hrs',
  },
  {
    name: 'Ras Al Khaimah',
    areas: ['Al Nakheel', 'Al Hamra', 'Al Dhait', 'Mina Al Arab', 'Al Rams'],
    response: 'Within 24 hrs',
  },
  {
    name: 'Fujairah',
    areas: ['Fujairah City', 'Dibba', 'Al Faseel', 'Sakamkam', 'Merashid'],
    response: 'Within 48 hrs',
  },
  {
    name: 'Umm Al Quwain',
    areas: ['Al Salamah', 'Al Raas', 'Al Humrah', 'UAQ Marina', 'Al Riqqah'],
    response: 'Within 24 hrs',
  },
] as const

/* -------------------------------------------------------------------------- */
/*  PRODUCTS                                                                  */
/* -------------------------------------------------------------------------- */

export type Product = {
  slug: string
  name: string
  category: string
  image: string
  price: string
  blurb: string
  features: string[]
  badge?: string
}

export const products: Product[] = [
  {
    slug: 'ro-7-stage',
    name: '7-Stage RO Purifier with Mineral Boost',
    category: 'Reverse Osmosis',
    image: images.roSystem,
    price: 'From AED 749',
    blurb:
      'Our best-selling under-sink system for UAE apartments and villas. Removes up to 99% of TDS, then adds essential minerals back for great-tasting water.',
    features: [
      '7 filtration stages + mineral cartridge',
      '75–100 GPD membrane with booster pump',
      'Dedicated lead-free faucet included',
      '1-year warranty + free first service',
    ],
    badge: 'Best seller',
  },
  {
    slug: 'whole-house-triple',
    name: 'Whole House Triple-Stage System',
    category: 'Point of Entry',
    image: images.wholeHouse,
    price: 'From AED 1,850',
    blurb:
      'Big-blue 20" housings that treat every outlet in the property — sediment, chlorine, taste and odour handled before water reaches a single tap.',
    features: [
      'Sediment + carbon block + multimedia',
      'Sized for 2 to 7 bedroom villas',
      'Stainless mounting bracket & bypass valve',
      'Pressure gauges for easy monitoring',
    ],
  },
  {
    slug: 'water-softener-auto',
    name: 'Automatic Water Softener',
    category: 'Softening',
    image: images.softener,
    price: 'From AED 2,400',
    blurb:
      'Metered ion-exchange softener that ends limescale on taps, glass and appliances — and makes an immediate difference to skin and hair.',
    features: [
      'Automatic metered regeneration valve',
      'Food-grade resin, correctly sized',
      'Brine tank with safety float',
      'Salt refill scheduling available',
    ],
    badge: 'Villa favourite',
  },
  {
    slug: 'uv-sterilizer',
    name: 'UV Sterilizer Chamber',
    category: 'Sterilisation',
    image: images.uvSystem,
    price: 'From AED 690',
    blurb:
      'Chemical-free protection against bacteria, viruses and cysts. A must for properties on tanker-delivered or roof-tank water.',
    features: [
      '99.99% microbiological inactivation',
      'Stainless steel chamber, 6–60 GPM',
      'Quartz sleeve + annual lamp change',
      'Optional lamp-failure alarm',
    ],
  },
  {
    slug: 'filter-cartridges',
    name: 'Genuine Filter Cartridge Sets',
    category: 'Consumables',
    image: images.filterCartridge,
    price: 'From AED 120',
    blurb:
      'Complete replacement sets for every system we service, fitted by a technician with sanitisation and a full leak test included.',
    features: [
      'Sediment, GAC, CTO, carbon block & mineral',
      'RO membranes 75–400 GPD',
      'All major brands supported',
      'Free reminder before the next due date',
    ],
  },
  {
    slug: 'commercial-ro-plant',
    name: 'Commercial RO Plant',
    category: 'Commercial',
    image: images.commercial,
    price: 'Custom quote',
    blurb:
      'Turnkey plants for restaurants, cafeterias, labour accommodation, clinics, schools and factories — designed, installed and maintained by one team.',
    features: [
      '250 GPD to 10,000 GPD capacity',
      'FRP vessels, dosing & storage integration',
      'Water-quality logs for inspections',
      'Priority commercial AMC contracts',
    ],
    badge: 'B2B',
  },
]

/* -------------------------------------------------------------------------- */
/*  AMC PLANS                                                                 */
/* -------------------------------------------------------------------------- */

export const amcPlans = [
  {
    name: 'Basic',
    price: '349',
    period: '/ year',
    tagline: 'Apartments with a single under-sink or countertop unit.',
    features: [
      '2 scheduled service visits per year',
      'Sediment & carbon cartridge replacement',
      'System sanitisation & leak check',
      'Labour and call-out included',
      'Phone & WhatsApp support',
    ],
    excluded: ['RO membrane replacement', 'Emergency same-day priority'],
    featured: false,
  },
  {
    name: 'Standard',
    price: '649',
    period: '/ year',
    tagline: 'Families and villas running a full RO system.',
    features: [
      '4 scheduled service visits per year',
      'All cartridges included',
      'RO membrane checked & replaced when needed',
      'UV lamp inspection',
      'Priority 24-hour response',
      'Free TDS report every visit',
      '10% off any new equipment',
    ],
    excluded: [],
    featured: true,
  },
  {
    name: 'Premium',
    price: '1,290',
    period: '/ year',
    tagline: 'Large villas, offices and commercial kitchens.',
    features: [
      '6 scheduled service visits per year',
      'All consumables, membranes & UV lamps',
      'Softener resin check & salt top-up',
      'Whole-house system servicing',
      'Same-day emergency guarantee',
      'Dedicated account manager',
      'Free relocation once per contract',
      'Water-quality log for inspections',
    ],
    excluded: [],
    featured: false,
  },
] as const

/* -------------------------------------------------------------------------- */
/*  TESTIMONIALS                                                              */
/* -------------------------------------------------------------------------- */

export const testimonials = [
  {
    name: 'Fatima Al Suwaidi',
    location: 'Al Barsha, Dubai',
    role: 'Villa owner',
    rating: 5,
    quote:
      'They tested our water in front of us, explained the TDS reading honestly and did not try to upsell. The 7-stage RO was installed the same afternoon and the plumbing is spotless. Our kettle finally has no scale.',
  },
  {
    name: 'Rajesh Menon',
    location: 'Khalifa City, Abu Dhabi',
    role: 'AMC customer, 3 years',
    rating: 5,
    quote:
      'I am on the Standard AMC and I genuinely never think about my filters — they call me when the service is due. Reminder, visit, TDS report, done. Worth every dirham.',
  },
  {
    name: 'Sarah Thompson',
    location: 'Al Majaz, Sharjah',
    role: 'Apartment resident',
    rating: 5,
    quote:
      'Our under-sink filter started leaking at 10 PM on a Friday. I sent a WhatsApp message and a technician was at our door before midnight. He replaced the housing and refused to charge an emergency premium.',
  },
  {
    name: 'Ahmed Kareem',
    location: 'Mussafah, Abu Dhabi',
    role: 'Cafeteria owner',
    rating: 5,
    quote:
      'They installed and now maintain a commercial RO plant for our cafeteria. Municipality inspection went through without a single comment because they keep proper water-quality logs for us.',
  },
  {
    name: 'Priya Nair',
    location: 'Al Nahda, Ajman',
    role: 'Water softener customer',
    rating: 5,
    quote:
      'The softener changed our showers completely — no more dry skin and the bathroom glass stays clear. The technician came back after a week just to check the settings. No charge.',
  },
  {
    name: 'Mohammed Bin Hilal',
    location: 'Al Nakheel, Ras Al Khaimah',
    role: 'Relocation customer',
    rating: 5,
    quote:
      'We moved from RAK to Dubai and they uninstalled, transported and re-fitted our whole-house system in one day. Fresh cartridges, sanitised, tested. Excellent professionals.',
  },
] as const

/* -------------------------------------------------------------------------- */
/*  TRUST BADGES                                                              */
/* -------------------------------------------------------------------------- */

export const trustBadges = [
  { label: 'Dubai Municipality Compliant', sub: 'Plumbing standards' },
  { label: 'NSF / WQA Certified Media', sub: 'Filtration components' },
  { label: 'ESMA Approved Equipment', sub: 'UAE conformity' },
  { label: 'Fully Insured Technicians', sub: 'Third-party liability' },
  { label: 'Licensed UAE Business', sub: 'DED trade licence' },
  { label: 'Genuine Parts Only', sub: 'Manufacturer supplied' },
] as const

/* -------------------------------------------------------------------------- */
/*  PROCESS                                                                   */
/* -------------------------------------------------------------------------- */

export const processSteps = [
  {
    step: '01',
    title: 'Call or WhatsApp Us',
    body: 'Tell us your location and what you need. We answer in minutes, in English, Arabic, Hindi, Urdu or Malayalam.',
  },
  {
    step: '02',
    title: 'Free Water Test',
    body: 'A technician visits at a time you choose, tests your TDS and hardness on the spot and shows you the numbers.',
  },
  {
    step: '03',
    title: 'Clear Quote in AED',
    body: 'You get an honest written recommendation and a fixed price. No hidden call-out fees, no pressure to decide.',
  },
  {
    step: '04',
    title: 'Install & Aftercare',
    body: 'We install, leak-test and demonstrate the system — then remind you before every service is due.',
  },
] as const

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                       */
/* -------------------------------------------------------------------------- */

export const faqs = [
  {
    q: 'Is UAE tap water safe to drink without a filter?',
    a: 'Desalinated water leaves the plant to a high standard, but it travels through pipes and sits in building roof tanks before it reaches your tap. That journey can add sediment, rust, chlorine by-products and bacteria, and the water is also hard. A point-of-use filter is what guarantees the quality at the moment you drink it.',
  },
  {
    q: 'How often do water filter cartridges need replacing?',
    a: 'As a rule: sediment and carbon stages every 6 months, RO membranes every 2 to 3 years, and UV lamps every 12 months. UAE water is demanding, so we base the exact schedule on your measured TDS and daily usage rather than a generic guess.',
  },
  {
    q: 'How much does a water filter installation cost in the UAE?',
    a: 'A quality under-sink RO system installed starts from around AED 749. Whole-house filtration typically runs AED 1,850 and up, and softeners from AED 2,400 depending on capacity. Commercial plants are quoted after a site survey. Every quote is fixed and in writing before we start.',
  },
  {
    q: 'Do you cover all seven Emirates?',
    a: 'Yes. We operate across Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain. Dubai, Abu Dhabi and Sharjah usually get same-day service; the northern Emirates are typically within 24 to 48 hours.',
  },
  {
    q: 'What does an AMC actually include?',
    a: 'Scheduled visits, the consumables listed in your tier, sanitisation, leak testing, labour and call-out charges — all in one annual fee. We contact you when a service is due, so nothing is forgotten. Most customers pay 30 to 40% less than they would per visit.',
  },
  {
    q: 'Can you service a system another company installed?',
    a: 'Absolutely. We service and repair all major brands and stock genuine consumables for them. If your current system is beyond economical repair we will tell you honestly rather than keep charging for repairs.',
  },
  {
    q: 'Do you offer emergency repairs at night or on Fridays?',
    a: 'Yes — our emergency line is answered 24 hours a day, every day. Leaks and total loss of water flow are treated as priority call-outs.',
  },
  {
    q: 'Is the demo and water test really free?',
    a: 'Completely free with no obligation. We test your water in front of you, explain what the reading means and leave you a written quotation. Whether you buy is entirely up to you.',
  },
] as const
