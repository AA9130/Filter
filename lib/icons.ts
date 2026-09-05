import {
  Wrench, Droplets, Home, Waves, Sun, Filter, ShieldCheck, LifeBuoy, Truck,
  Sparkles, MapPin, Clock, BadgeCheck, PackageCheck, Wallet, Zap, Target,
  HeartHandshake, Users, Award, Gauge, ThermometerSun, Building2, Send,
  type LucideIcon,
} from 'lucide-react'

/**
 * String key → icon component.
 *
 * This registry is the reason content can be plain JSON. Content files name an
 * icon ("wrench"); only this module — which lives in the code layer — knows
 * what a React component is. Never move icon components back into content, or
 * content can no longer be serialized to a CMS, a database or an API response.
 */
const registry = {
  wrench: Wrench,
  droplets: Droplets,
  home: Home,
  waves: Waves,
  sun: Sun,
  filter: Filter,
  'shield-check': ShieldCheck,
  'life-buoy': LifeBuoy,
  truck: Truck,
  sparkles: Sparkles,
  'map-pin': MapPin,
  clock: Clock,
  'badge-check': BadgeCheck,
  'package-check': PackageCheck,
  wallet: Wallet,
  zap: Zap,
  target: Target,
  'heart-handshake': HeartHandshake,
  users: Users,
  award: Award,
  gauge: Gauge,
  'thermometer-sun': ThermometerSun,
  'building-2': Building2,
  send: Send,
} satisfies Record<string, LucideIcon>

export type IconKey = keyof typeof registry

export function isIconKey(value: unknown): value is IconKey {
  return typeof value === 'string' && value in registry
}

/** Resolve a content icon key. Falls back to a neutral mark rather than crashing. */
export function icon(key: string): LucideIcon {
  return isIconKey(key) ? registry[key] : Droplets
}

export const iconKeys = Object.keys(registry) as IconKey[]
