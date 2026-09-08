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
import { existsSync, statSync } from 'node:fs'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { resolve as resolvePath, dirname } from 'node:path'

const ROOT = resolvePath(import.meta.dirname, '..')
const EXTENSIONS = ['.ts', '.tsx', '.mts', '.js', '.mjs', '.json']

/**
 * Extensionless specifier → the file that actually exists.
 *
 * A directory must fall through to its index file rather than being returned as
 * itself: `@/lib/content` is a real directory, and Node ESM refuses to import
 * one. That is the difference between this working and it working for every
 * module except the content seam.
 */
function withExtension(absolutePath: string): string {
  const isFile = existsSync(absolutePath) && statSync(absolutePath).isFile()
  if (isFile) return absolutePath

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

  // TypeScript source imports siblings without an extension (`./schema`), which
  // the bundler resolves and Node ESM does not. Resolve those the same way.
  if (specifier.startsWith('.')) {
    const parent = (context as { parentURL?: string })?.parentURL
    if (parent?.startsWith('file:')) {
      const target = withExtension(resolvePath(dirname(fileURLToPath(parent)), specifier))
      return nextResolve(pathToFileURL(target).href, context)
    }
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
