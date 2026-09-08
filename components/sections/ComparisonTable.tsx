import type { Comparison } from '@/lib/content'
import { cn } from '@/lib/utils'

/**
 * A real `<table>` with a `<caption>` and scoped headers, wrapped in its own
 * horizontal scroll container.
 *
 * Two deliberate choices. The table is a table, not a grid of divs: a
 * comparison is tabular data, and the semantics are what let a screen reader
 * announce "RO purifier, removes dissolved solids, yes" instead of reading
 * eighteen disconnected strings. And the overflow lives on the wrapper, not the
 * page — a wide table must scroll inside itself rather than making the whole
 * document scroll sideways on a phone.
 */
export default function ComparisonTable({
  comparison,
  className,
}: {
  comparison: Comparison
  className?: string
}) {
  return (
    <div className={cn('-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
        <caption className="mb-4 text-left text-sm font-semibold text-ink-muted">
          {comparison.caption}
        </caption>
        <thead>
          <tr>
            <th scope="col" className="border-b border-slate-200 pb-3 pr-4 font-bold text-ink">
              <span className="sr-only">Property compared</span>
            </th>
            {comparison.columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="border-b border-slate-200 px-4 pb-3 font-bold text-brand-700"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparison.rows.map((row) => (
            <tr key={row.label} className="align-top">
              <th
                scope="row"
                className="border-b border-slate-100 py-3.5 pr-4 font-semibold text-ink"
              >
                {row.label}
              </th>
              {row.values.map((value, i) => (
                <td
                  key={`${row.label}-${comparison.columns[i]}`}
                  className="border-b border-slate-100 px-4 py-3.5 leading-relaxed text-ink-soft"
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
