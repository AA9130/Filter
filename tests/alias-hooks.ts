/**
 * Module hooks that teach plain `node --test` what the Next build already
 * knows: the `@/*` path alias, extensionless TypeScript imports, and bare JSON
 * imports (Next allows them via `resolveJsonModule`; Node ESM would demand an
 * import attribute).
 *
 * This file is the entire reason the test suite needs no bundler, no ts-node
 * and no new dependency. Node 24 strips the types, these hooks resolve the
 * imports, and `node --test` runs the real application modules — not copies.
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { resolve as resolvePath } from 'node:path'

const ROOT = resolvePath(import.meta.dirname, '..')
const EXTENSIONS = ['.ts', '.tsx', '.mts', '.js', '.mjs', '.json']

/** Extensionless specifier → the file that actually exists. */
function withExtension(absolutePath: string): string {
  if (existsSync(absolutePath) && !absolutePath.endsWith('/')) return absolutePath
  for (const ext of EXTENSIONS) {
    if (existsSync(absolutePath + ext)) return absolutePath + ext
  }
  for (const ext of EXTENSIONS) {
    const index = resolvePath(absolutePath, `index${ext}`)
    if (existsSync(index)) return index
  }
  return absolutePath
}

type NextResolve = (specifier: string, context: unknown) => unknown

export async function resolve(specifier: string, context: unknown, nextResolve: NextResolve) {
  if (specifier.startsWith('@/')) {
    const target = withExtension(resolvePath(ROOT, specifier.slice(2)))
    return nextResolve(pathToFileURL(target).href, context)
  }
  return nextResolve(specifier, context)
}

type NextLoad = (url: string, context: unknown) => Promise<{ format?: string; source?: unknown }>

export async function load(url: string, context: unknown, nextLoad: NextLoad) {
  // Hand JSON back as a module rather than as `format: 'json'`, which would
  // reinstate the import-attribute requirement we are working around.
  if (url.startsWith('file:') && url.endsWith('.json')) {
    const source = await readFile(fileURLToPath(url), 'utf8')
    return { format: 'module', shortCircuit: true, source: `export default ${source}` }
  }
  return nextLoad(url, context)
}
