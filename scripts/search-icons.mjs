import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

// Search the pinned icon package locally so agents need no browser or remote API.
const require = createRequire(import.meta.url)
const names = Object.keys(require('bootstrap-icons/font/bootstrap-icons.json'))
const keywords = JSON.parse(readFileSync(new URL('../docs/icon-keywords.json', import.meta.url), 'utf8'))
const query = process.argv.slice(2).join(' ').trim().toLowerCase()
if (!query) {
  console.log('Usage: npm run icons:search -- <English concept or icon name>')
  console.log('Examples: chat, payment, delete, truck, calendar')
  process.exit(0)
}
const synonyms = keywords[query] ?? []
const matches = names.filter(name => name.includes(query) || synonyms.some(term => name.includes(term)))
console.log(`${matches.length} Bootstrap Icons match "${query}". Showing the first 60:`)
for (const name of matches.slice(0, 60)) console.log(`  ${name.padEnd(30)} <UiBootstrapIcon name="${name}" />`)
if (matches.length > 60) console.log(`  ... ${matches.length - 60} more; narrow the query.`)
