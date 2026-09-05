/** Tiny classname joiner — keeps conditional Tailwind classes readable. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
