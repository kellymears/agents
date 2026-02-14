import { readdir, readFile, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'

const outDir = join(import.meta.dirname, '..', 'out')

const htmlFiles = []
for (const entry of await readdir(outDir, { recursive: true })) {
  if (entry.endsWith('.html')) htmlFiles.push(join(outDir, entry))
}

let polyfillFile = null
const cssCache = new Map()

for (const file of htmlFiles) {
  let html = await readFile(file, 'utf-8')

  // Strip noModule polyfills
  const polyMatch = html.match(/<script[^>]+polyfills[^>]+noModule[^>]*><\/script>/)
  if (polyMatch) {
    if (!polyfillFile) {
      const src = polyMatch[0].match(/src="([^"]+)"/)?.[1]
      if (src) polyfillFile = join(outDir, src)
    }
    html = html.replace(polyMatch[0], '')
  }

  // Inline CSS to eliminate critical request chain
  const cssMatch = html.match(/<link rel="stylesheet" href="([^"]+)"[^>]*\/>/)
  if (cssMatch) {
    const cssPath = join(outDir, cssMatch[1])
    if (!cssCache.has(cssPath)) {
      cssCache.set(cssPath, await readFile(cssPath, 'utf-8'))
    }
    html = html.replace(cssMatch[0], `<style>${cssCache.get(cssPath)}</style>`)
  }

  await writeFile(file, html)
}

if (polyfillFile) {
  await rm(polyfillFile, { force: true })
}

console.log(`Optimized ${htmlFiles.length} HTML files (polyfills stripped, CSS inlined)`)
