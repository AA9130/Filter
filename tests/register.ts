import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

register('./alias-hooks.ts', pathToFileURL(import.meta.filename))
