import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

// CSS is bundled into dist/style.css. Emitted side-effect imports point at
// source-only files and break TypeScript consumers with skipLibCheck disabled.
for (const name of readdirSync('dist').filter(file => file.endsWith('.d.ts'))) {
  const file = `dist/${name}`
  const source = readFileSync(file, 'utf8')
  const cleaned = source.replace(/^import ['"]\.\/[^'"\n]+\.css['"];?\n/gm, '')
  if (cleaned !== source) writeFileSync(file, cleaned)
}
